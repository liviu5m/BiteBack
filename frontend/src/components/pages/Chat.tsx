import { fetchUserRooms, fetchMessageHistory, requestProduct, markRoomAsRead } from "@/api/chatRoom";
import { useAppContext } from "@/lib/AppProvider";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import BodyLayout from "../layouts/BodyLayout";
import { deleteProductRequestFunc, getProductRequestsByOwnerIdFunc, updateProductRequestFunc } from "@/api/productRequest";
import ProductRequestsCard from "@/components/elements/ProductRequestsCard";
import { toast } from "react-toastify";

export default function ChatContainer() {
  const { user } = useAppContext();
  const queryClient = useQueryClient();

  const [activeChat, setActiveChat] = useState(null);
  const [typedMessage, setTypedMessage] = useState("");

  const socketRef = useRef(null);

  const { data: chats = [], isLoading: loadingRooms } = useQuery({
    queryKey: ["chat-rooms", user?.id],
    queryFn: () => fetchUserRooms(user.id),
    staleTime: 1000 * 60 * 15,
    enabled: !!user?.id,
  });
  const containerRef = useRef(null);
  const {
    data: infiniteMessagesData,
    fetchPreviousPage: fetchOlderMessages,
    hasPreviousPage: hasOlderMessages,
    isFetchingPreviousPage: loadingOlderMessages,
    isLoading: loadingMessages,
  } = useInfiniteQuery({
    queryKey: ["messages", activeChat?.id],
    queryFn: ({ pageParam = 0 }) => fetchMessageHistory(activeChat.id, pageParam),
    initialPageParam: 0,

    getPreviousPageParam: (firstPage, allPages) => {
      if (firstPage && firstPage.length < 10) return undefined;

      const currentOffset = allPages.reduce((total, page) => total + page.length, 0);
      return currentOffset;
    },
    getNextPageParam: () => undefined,
    enabled: !!activeChat?.id,
    staleTime: 1000 * 60 * 5,
  });

  const messages = infiniteMessagesData ? infiniteMessagesData.pages.flat() : [];

  const { data: productRequests = [], isLoading: isProductRequestsLoading } = useQuery({
    queryKey: ["product-requests", activeChat?.id],
    queryFn: () =>
      getProductRequestsByOwnerIdFunc(
        activeChat?.user_one_id === user?.id
          ? activeChat?.user_two_id
          : activeChat?.user_one_id,
        user?.id
      ),

    enabled: !!activeChat?.id && !!user?.id,
  });

  const { mutate: updateRequestStatus } = useMutation({
    mutationKey: ['update-product-request'],
    mutationFn: (data: { id: number, status: string, shareItemId: number, requesterId: number }) => updateProductRequestFunc(data.id, data.status, data.shareItemId, data.requesterId),
    onSuccess: async (data) => {
      console.log(data);
      toast("Request status updated successfully")

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            action: "update_status",
          })
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["product-requests", activeChat?.id] });
    },
    onError: (err) => {
      console.log(err);
      toast("Error updating request status")
    }
  })

  const { mutate: deleteRequest } = useMutation({
    mutationKey: ['delete-product-request'],
    mutationFn: (data: { id: number, shareItemId: number, requesterId: number }) => deleteProductRequestFunc(data.id, data.shareItemId, data.requesterId),
    onSuccess: (data) => {
      console.log(data);
      toast("Request declined successfully")
      queryClient.invalidateQueries({ queryKey: ["product-requests"] });
    },
    onError: (err) => {
      console.log(err);
      toast("Error deleting request")
    }
  })

  useEffect(() => {
    if (chats && chats.length > 0 && !activeChat) {
      setActiveChat(chats[0]);
    }
  }, [chats, activeChat]);

  useEffect(() => {
    if (!activeChat?.id || !user?.id) return;

    const baseUrl = import.meta.env.VITE_WS_API_URL || "localhost:8000";
    const wsUrl = `ws://${baseUrl}/api/chat-room/ws/${activeChat.id}/${user.id}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      console.log(payload);

      if (payload.type === "status_update") {
        queryClient.invalidateQueries({ queryKey: ["chat-rooms", user.id] });
        queryClient.invalidateQueries({ queryKey: ["product-requests", activeChat?.id] });
      } else {

        queryClient.setQueryData(["messages", activeChat.id], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page, index) => {
              if (index === oldData.pages.length - 1) {
                if (page.some((m) => m.id === payload.id)) return page;
                return [...page, payload];
              }
              return page;
            }),
          };
        });
        queryClient.invalidateQueries({ queryKey: ["chat-rooms", user.id] });
      }
    };

    ws.onerror = (err) => console.error("WebSocket Error: ", err);

    return () => {
      ws.close();
    };
  }, [activeChat?.id, user?.id, queryClient]);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;

    if (scrollTop < 15 && hasOlderMessages && !loadingOlderMessages) {
      const previousScrollHeight = e.currentTarget.scrollHeight;

      fetchOlderMessages().then(() => {
        if (containerRef.current) {
          const newScrollHeight = containerRef.current.scrollHeight;
          containerRef.current.scrollTop = newScrollHeight - previousScrollHeight;
        }
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !socketRef.current) return;
    console.log(typedMessage);

    socketRef.current.send(
      JSON.stringify({
        action: "send_message",
        text: typedMessage,
      })
    );

    setTypedMessage("");
  };

  const { mutate: clearUnreads } = useMutation({
    mutationFn: (roomId: number) => markRoomAsRead(roomId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeChat?.id] });
      queryClient.invalidateQueries({ queryKey: ["chat-rooms", user?.id] });
    },
    onError: (err) => {
      console.log(err);
    }
  });

  useEffect(() => {
    if (activeChat?.id) {
      clearUnreads(activeChat.id);
    }
  }, [activeChat?.id]);

  const hasScrolledToBottom = useRef(false);

  useEffect(() => {
    hasScrolledToBottom.current = false;
  }, [activeChat?.id]);

  useEffect(() => {
    const container = containerRef.current;

    if (container && activeChat?.id && !loadingMessages && messages.length > 0) {
      if (hasScrolledToBottom.current) return;

      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
        hasScrolledToBottom.current = true;
      }, 50);
    }
  }, [activeChat?.id, loadingMessages, messages.length]);

  if (loadingRooms) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 font-semibold">
        Loading your Inbox...
      </div>
    );
  }

  return (
    <BodyLayout>
      <div className="flex w-[calc(100vw-350px)] h-screen bg-white border border-gray-100 overflow-hidden shadow-sm">

        <section className="w-80 border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-5 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
            <p className="text-xs text-gray-400 mt-1">Coordinate food share collections</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {chats.map((chat) => {
              const hasUnread = chat.unread_count > 0;

              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full p-4 flex gap-3 cursor-pointer text-left transition-colors hover:bg-gray-50/70 ${activeChat?.id === chat.id ? "bg-[#F0F5F2]" : ""
                    }`}
                >
                  <div className="w-11 h-11 rounded-full bg-[#D1E5DC] text-[#0A4C38] flex items-center justify-center font-bold text-sm shrink-0 relative">
                    {chat.user_one_id === user?.id ? "O" : "R"}

                    {/* Subtle dot on the avatar ring if there are unreads */}
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 block h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-gray-900 truncate ${hasUnread ? "font-bold" : "font-semibold"}`}>
                        {chat.user_one_username === user?.username
                          ? chat.user_two_username
                          : chat.user_one_username}
                      </span>

                      {/* ─── UNREAD COUNT BADGE (handles 9+) ─── */}
                      {hasUnread && (
                        <span className="bg-rose-500 text-white font-bold text-[10px] h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center shadow-sm shrink-0 select-none animate-in fade-in zoom-in-95 duration-150">
                          {chat.unread_count > 9 ? "9+" : chat.unread_count}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs truncate mt-0.5 ${hasUnread ? "text-rose-600 font-semibold" : "text-[#0A4C38] font-medium"}`}>
                      {hasUnread ? "New messages waiting" : "Click to view chat"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex-1 flex flex-col bg-[#F9FAFA]">
          {activeChat ? (
            <>
              <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-gray-950 text-base">
                  Active Discussion (
                  {activeChat.user_one_username === user?.username
                    ? activeChat.user_two_username
                    : activeChat.user_one_username}
                  )
                </h3>
              </header>

              <div className="bg-[#E6F2ED] border-b border-[#D1E5DC] px-6 py-2.5 text-center text-xs text-[#0A4C38] font-medium flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-[#0A4C38]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Connection Secure. Coordinate your pickup safely.
              </div>
              <ProductRequestsCard productRequests={productRequests} currentUserId={user?.id} onUpdateStatus={updateRequestStatus} deleteRequest={deleteRequest} />
              <div className="flex-1 overflow-y-auto p-6 space-y-4"
                ref={containerRef}
                onScroll={handleScroll}
              >
                {loadingOlderMessages && (
                  <p className="text-center text-xs text-gray-400 py-2 animate-pulse">
                    Loading historical messages...
                  </p>
                )}
                {loadingMessages ? (
                  <p className="text-center text-xs text-gray-400">Loading messages...</p>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender_id === user?.id;

                    const isUnreadByMe = !isMe && !msg.is_read;
                    const isFirstUnread = isUnreadByMe && (index === 0 || messages[index - 1].is_read || messages[index - 1].sender_id === user?.id);

                    return (
                      <div key={msg.id} className="w-full space-y-4">
                        {isFirstUnread && (
                          <div className="flex items-center py-2 select-none">
                            <div className="flex-1 border-t-2 border-rose-200/70" />
                            <span className="mx-4 text-[10px] font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 shadow-sm">
                              New Messages
                            </span>
                            <div className="flex-1 border-t-2 border-rose-200/70" />
                          </div>
                        )}

                        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[70%]">
                            <div
                              className={`p-4 rounded-2xl shadow-sm ${isMe
                                ? "bg-[#0A4C38] text-white rounded-tr-none"
                                : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                }`}
                            >
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                            <span className={`text-[10px] text-gray-400 block mt-1 ${isMe ? "text-right" : "text-left"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 shrink-0 flex gap-3">
                <input
                  type="text"
                  placeholder="Type your reply here..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-sm"
                />
                <button
                  type="submit"
                  className="bg-[#111E30] hover:bg-[#1a2e4a] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start chatting!
            </div>
          )}
        </section>

      </div>
    </BodyLayout>
  );
}
