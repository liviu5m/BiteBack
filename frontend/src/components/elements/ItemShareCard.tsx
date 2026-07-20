import { createProductRequestFunc } from "@/api/productRequest";
import { useAppContext } from "@/lib/AppProvider";
import type { FoodItem, ProductRequestData } from "@/lib/Types";
import { fetchReadableAddress } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, MapPin, Pencil, Scale, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
interface ItemShareCardProps {
  item: FoodItem;
  index?: number;
  coordinates: { lat: number; lng: number } | null;
  isOwner?: boolean;
  onEdit?: (itemToEdit: FoodItem) => void;
  onDelete?: (id: number) => void;
}

export default function ItemShareCard({
  item,
  index,
  coordinates,
  isOwner = false,
  onEdit,
  onDelete
}: ItemShareCardProps) {
  const [address, setAddress] = useState<string>('Nearby');
  const { user } = useAppContext();
  let itemLat = 0;
  let itemLng = 0;
  try {
    if (item.location) {
      const parsedLoc = JSON.parse(item.location.replace(/'/g, '"'));
      itemLat = parsedLoc.lat;
      itemLng = parsedLoc.lng;
    }
  } catch (err) {
    console.error(err);
  }

  const distance = coordinates
    ? calculateHaversineDistance(coordinates.lat, coordinates.lng, itemLat, itemLng)
    : 0;

  const isClaimed = !!item.claimedBy;
  const queryClient = useQueryClient();

  const { mutate: createProductRequest, isPending: isRequestPending } = useMutation({
    mutationKey: ['create-product-request'],
    mutationFn: (data: ProductRequestData) => createProductRequestFunc(data.itemId, data.userId, data.ownerId, data.itemName),
    onSuccess: async (data) => {
      console.log(data);
      toast("Request sent successfully")
      await queryClient.invalidateQueries({ queryKey: ["share-items-filter"] });
      await queryClient.invalidateQueries({ queryKey: ["my-requests", user?.id] });
    },
    onError: (err) => {
      console.log(err);
      toast("Error sending request")
    }
  })

  const handleClaimItem = (id: string) => {
    createProductRequest({ userId: user.id, itemId: Number(id), ownerId: item.owner_id, itemName: item.name });
  };

  useEffect(() => {
    fetchReadableAddress(itemLat, itemLng, setAddress);
  }, [itemLat, itemLng]);

  return (
    <div
      className={`flex flex-col justify-between p-4 sm:p-5 rounded-xl border transition-all duration-200 bg-white ${isClaimed
        ? 'border-slate-200 opacity-60 shadow-none'
        : 'border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
        }`}
    >
      <div>
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className={`font-bold text-sm sm:text-base text-slate-900 tracking-tight leading-snug ${isClaimed ? 'text-slate-400 line-through' : ''}`}>
            {item.name}
          </h3>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100/50 shrink-0">
            {distance.toFixed(1)} km away
          </span>
        </div>

        {item.notes && (
          <p className="text-xs text-slate-500 mb-4 line-clamp-2 italic leading-relaxed">
            "{item.notes}"
          </p>
        )}

        <div className="flex flex-col gap-2 text-xs text-slate-600 mb-5 border-t border-slate-50 pt-3">
          {item.owner_username && (
            <div className="flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Shared by: <strong className="font-semibold text-slate-700">{item.owner_username}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Expires: <strong className="font-semibold text-slate-700">{item.expiryDate}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Scale className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Weight: <strong className="font-semibold text-slate-700">{item.weight}g</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-500">{address}</span>
          </div>
        </div>
      </div>
      {isOwner ? (
        <div className="border-t border-slate-100 bg-slate-50/50 px-3 sm:px-4 py-2.5 sm:py-3 flex gap-2">
          <button
            onClick={() => onEdit && onEdit(item)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-500" />
            Edit
          </button>
          <button
            onClick={() => {
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
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
                  onDelete && onDelete(Number(item.id));
                }
              });
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-rose-200 bg-rose-50/30 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            Delete
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isRequestPending}
          onClick={() => handleClaimItem(item.id)}
          className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-1.5 transition-all 
    ${isRequestPending ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} 
    bg-slate-900 hover:bg-slate-800 text-white shadow-sm`}
        >
          {isRequestPending && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isRequestPending ? "Sending request..." : "Claim listing"}
        </button>
      )
      }
    </div >
  );
};

