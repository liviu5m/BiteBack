import React, { useEffect, useState } from 'react';
import { Search, MapPin, Scale, Calendar, Check, HelpCircle, Loader2, Compass, Tag, Layers, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteShareItemFunc, getMyListingsFunc, getMyRequestsFunc, getShareItemsFunc, updateShareItemFunc } from '@/api/shareItem';
import ItemShareCard from './ItemShareCard';
import type { FoodItem, RequestedItemWithStatus } from '@/lib/Types';
import { useAppContext } from "@/lib/AppProvider";
import EditShareItemModal from './EditShareItemForm';
import { deleteProductRequestFunc, updateProductRequestFunc } from '@/api/productRequest';
import Swal from 'sweetalert2';

type TabOption = 'discover' | 'my-listings' | 'my-requests';

export default function NeighborFoodDiscovery() {
  const { user } = useAppContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabOption>('discover');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(16);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error(error);
          setCoordinates({ lat: 45.9000, lng: 28.1900 });
        }
      );
    } else {
      setCoordinates({ lat: 45.9000, lng: 28.1900 });
    }
  }, []);

  const { data: shareItems = [], isLoading: isLoadingDiscover } = useQuery<FoodItem[]>({
    queryKey: ["share-items-filter", searchTerm, maxDistanceKm, coordinates?.lat, coordinates?.lng],
    queryFn: () => getShareItemsFunc(searchTerm, maxDistanceKm, coordinates!),
    enabled: !!coordinates,
  });

  const { data: myListings = [], isLoading: isLoadingMyListings } = useQuery<FoodItem[]>({
    queryKey: ["my-listings", user?.id],
    queryFn: () => getMyListingsFunc(),
    enabled: !!user?.id,
  });

  const { data: myRequests = [], isLoading: isLoadingMyRequests } = useQuery<RequestedItemWithStatus[]>({
    queryKey: ["my-requests", user?.id],
    queryFn: () => getMyRequestsFunc(),
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      accepted: "bg-indigo-100 text-indigo-800 border-indigo-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      rejected: "bg-rose-100 text-rose-800 border-rose-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold capitalize ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  const { mutate: deleteRequest } = useMutation({
    mutationKey: ["request-product-request-status"],
    mutationFn: (id: number) => deleteProductRequestFunc(id),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["share-items-filter"] });
    },
    onError: (err) => {
      console.log(err);
    }
  })

  const { mutate: deleteMutation } = useMutation({
    mutationKey: ["delete-item"],
    mutationFn: (id: number) => deleteShareItemFunc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["share-items-filter"] });
    },
    onError: (err) => {
      alert("Failed to delete item. Please try again.");
    }
  });

  const { mutate: updateMutation, isPending: isUpdatingItem } = useMutation({
    mutationKey: ["update-item"],
    mutationFn: ({ id, data }: { id: number; data: Partial<FoodItem> }) => updateShareItemFunc(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["share-items-filter"] });
      setEditingItem(null);
    },
    onError: (err) => {
      alert("Failed to update item.");
    }
  });
  return (
    <div className="w-full max-w-7xl mx-auto p-4 text-left font-sans mt-10">

      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'discover'
            ? 'border-emerald-800 text-emerald-800'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Compass className="h-4 w-4" />
          Discover Food
        </button>
        <button
          onClick={() => setActiveTab('my-listings')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'my-listings'
            ? 'border-emerald-800 text-emerald-800'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Layers className="h-4 w-4" />
          My Listings ({myListings.length})
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'my-requests'
            ? 'border-emerald-800 text-emerald-800'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Tag className="h-4 w-4" />
          My Requests ({myRequests.length})
        </button>
      </div>

      {activeTab === 'discover' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm mb-6">
            <div className="relative md:col-span-8 flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search food name, tags, street..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800/20"
              />
            </div>

            <div className="md:col-span-4 flex flex-col px-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>Distance Range</span>
                <span className="text-emerald-800 font-bold">{maxDistanceKm} km radius</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-800 focus:outline-none"
              />
            </div>
          </div>

          {isLoadingDiscover ? (
            <div className="w-full text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-800" />
              <p className="text-xs font-medium text-slate-400">Finding delicious meals near you...</p>
            </div>
          ) : shareItems.length === 0 ? (
            <div className="w-full text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
              <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">No food items found matching your criteria nearby.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shareItems.map((item) => (
                <ItemShareCard key={item.id} item={item} coordinates={coordinates} />
              ))}
            </div>
          )}
        </>
      )}
      {activeTab === 'my-listings' && (
        <>
          {isLoadingMyListings ? (
            <div className="w-full text-center py-16 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-800" />
              <p className="text-xs font-medium text-slate-400">Loading your listings...</p>
            </div>
          ) : myListings.length === 0 ? (
            <div className="w-full text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">You haven't listed any share items yet.</p>
              <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myListings.map((item, index) => (
                <ItemShareCard
                  key={item.id}
                  item={item}
                  index={index}
                  coordinates={coordinates}
                  isOwner={true}
                  onEdit={(itemToEdit) => setEditingItem(itemToEdit)}
                  onDelete={(id) => deleteMutation(id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'my-requests' && (
        <>
          {isLoadingMyRequests ? (
            <div className="w-full text-center py-16 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-800" />
              <p className="text-xs font-medium text-slate-400">Loading requests...</p>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="w-full text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
              <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">You haven't made any food requests yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myRequests.map(({ share_item, request }) => (
                <div
                  key={request.id}
                  className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                      🍔
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{share_item.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> {share_item.weight}g</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Expiry: {share_item.expiryDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center justify-center gap-4'>
                    <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                      <div className="text-right hidden xs:block">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Requested on</p>
                        <p className="text-xs font-medium text-slate-600">
                          {new Date(request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div>
                      <X className="h-6 w-6 text-red-500 cursor-pointer hover:rotate-180 hover:scale-110" onClick={() => {
                        Swal.fire({
                          title: "Are you sure?",
                          text: "",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#be123c",
                          cancelButtonColor: "#64748b",
                          confirmButtonText: "Yes, delete it!",
                          cancelButtonText: "Cancel",
                          background: "#ffffff",
                          customClass: {
                            popup: "rounded-2xl border border-slate-100 font-sans",
                            title: "text-slate-800 font-bold text-lg",
                            htmlContainer: "text-slate-500 text-sm",
                            confirmButton: "rounded-lg text-sm font-semibold px-4 py-2 cursor-pointer",
                            cancelButton: "rounded-lg text-sm font-semibold px-4 py-2 cursor-pointer"
                          }
                        }).then((result) => {
                          if (result.isConfirmed) {
                            deleteRequest(request.id)
                          }
                        })
                      }
                      } />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {editingItem && (
        <EditShareItemModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          isPending={isUpdatingItem}
          onSave={(id, data) => {
            updateMutation({ id, data });
          }}
        />
      )}
    </div>
  );
}
