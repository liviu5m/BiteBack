import { createProductRequestFunc } from "@/api/productRequest";
import { useAppContext } from "@/lib/AppProvider";
import type { FoodItem, ProductRequestData } from "@/lib/Types";
import { fetchReadableAddress } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, MapPin, Scale, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

const ItemShareCard = ({ item, coordinates }: { item: FoodItem, coordinates: { lat: number, lng: number } }) => {
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

  const { mutate: createProductRequest } = useMutation({
    mutationKey: ['create-product-request'],
    mutationFn: (data: ProductRequestData) => createProductRequestFunc(data.itemId, data.userId),
    onSuccess: async (data) => {
      console.log(data);
      toast("Request sent successfully")
      await queryClient.invalidateQueries({ queryKey: ["share-items-filter"] });
    },
    onError: (err) => {
      console.log(err);
      toast("Error sending request")
    }
  })

  const handleClaimItem = (id: string) => {
    createProductRequest({ userId: user.id, itemId: Number(id) });
  };

  useEffect(() => {
    fetchReadableAddress(itemLat, itemLng, setAddress);
  }, [itemLat, itemLng]);

  return (
    <div
      className={`flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 bg-white ${isClaimed
        ? 'border-slate-200 opacity-60 shadow-none'
        : 'border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
        }`}
    >
      <div>
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className={`font-bold text-base text-slate-900 tracking-tight leading-snug ${isClaimed ? 'text-slate-400 line-through' : ''}`}>
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

      <button
        type="button"
        onClick={() => handleClaimItem(item.id)}
        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${isClaimed
          ? 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm'
          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
          }`}
      >
        {isClaimed ? (
          <>
            <Check className="h-3.5 w-3.5 stroke-[3]" />
            Claimed! Click to cancel
          </>
        ) : (
          'Claim listing'
        )}
      </button>
    </div>
  );
};

export default ItemShareCard;
