import { fetchUserRooms, fetchMessageHistory, requestProduct } from "@/api/chatRoom";
import { useAppContext } from "@/lib/AppProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import BodyLayout from "../layouts/BodyLayout";
import { getProductRequestsByOwnerIdFunc, updateProductRequestFunc } from "@/api/productRequest";
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

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", activeChat?.id],
    queryFn: () => fetchMessageHistory(activeChat.id),
    enabled: !!activeChat?.id,
    staleTime: 1000 * 60 * 5,
  });

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
  console.log(activeChat);

  console.log(productRequests);

  const { mutate: updateRequestStatus } = useMutation({
    mutationKey: ['update-product-request'],
    mutationFn: (data: { id: number, status: string }) => updateProductRequestFunc(data.id, data.status),
    onSuccess: async (data) => {
      console.log(data);
      toast("Request status updated successfully")
      await queryClient.invalidateQueries({ queryKey: ["product-requests", activeChat?.id] });
    },
    onError: (err) => {
      console.log(err);
      toast("Error updating request status")
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

      if (payload.type === "status_update") {
        queryClient.invalidateQueries({ queryKey: ["chat-rooms", user.id] });
      } else {
        // Direct mutation of React Query's message cache for real-time appending
        // queryClient.setQueryData(["messages", activeChat.id], (oldMessages = []) => {
        //   if (oldMessages.some((m) => m.id === payload.id)) return oldMessages;
        //   return [...oldMessages, payload];
        // });

        // Pull updated preview messages on the sidebar list
        queryClient.invalidateQueries({ queryKey: ["chat-rooms", user.id] });
      }
    };

    ws.onerror = (err) => console.error("WebSocket Error: ", err);

    return () => {
      ws.close();
    };
  }, [activeChat?.id, user?.id, queryClient]);

  // 4. Send Message Handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        action: "send_message",
        text: typedMessage,
      })
    );

    setTypedMessage("");
  };

  // 5. Confirm handover state change
  const handleConfirmHandover = () => {
    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          action: "confirm_handover",
        })
      );
    }
  };

  // 6. Manual action to request a product
  const handleRequestItem = async (itemId) => {
    if (!user?.id) return;
    try {
      const result = await requestProduct({ itemId, currentUserId: user.id });
      await queryClient.invalidateQueries({ queryKey: ["chat-rooms", user.id] });

      const updatedRooms = queryClient.getQueryData(["chat-rooms", user.id]) || [];
      const targetRoom = updatedRooms.find((r) => r.id === result.chat_room_id);
      if (targetRoom) {
        setActiveChat(targetRoom);
      }
    } catch (err) {
      console.error("Failed to request product:", err);
    }
  };

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

        {/* SIDEBAR */}
        <section className="w-80 border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-5 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
            <p className="text-xs text-gray-400 mt-1">Coordinate food share collections</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full p-4 flex gap-3 text-left transition-colors hover:bg-gray-50/70 ${activeChat?.id === chat.id ? "bg-[#F0F5F2]" : ""
                  }`}
              >
                <div className="w-11 h-11 rounded-full bg-[#D1E5DC] text-[#0A4C38] flex items-center justify-center font-bold text-sm shrink-0">
                  {chat.user_one_id === user?.id ? "O" : "R"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 truncate">
                      {chat.user_one_username === user?.username
                        ? chat.user_two_username
                        : chat.user_one_username}
                    </span>
                  </div>
                  <p className="text-xs text-[#0A4C38] font-medium truncate mt-0.5">
                    Click to view chat
                  </p>
                </div>
              </button>
            ))}
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
              <ProductRequestsCard productRequests={productRequests} currentUserId={user?.id} onUpdateStatus={updateRequestStatus} />
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <p className="text-center text-xs text-gray-400">Loading messages...</p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
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
                    );
                  })
                )}
              </div>

              {/* INPUT BAR */}
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
