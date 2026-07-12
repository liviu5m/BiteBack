import React, { useEffect, useState } from 'react';
import { Search, MapPin, Scale, Calendar, Check, HelpCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getShareItemsFunc } from '@/api/shareItem';
import { fetchReadableAddress } from '@/lib/utils';
import ItemShareCard from './ItemShareCard';
import type { FoodItem } from '@/lib/Types';

export default function NeighborFoodDiscovery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(16);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

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

  const { data: shareItems = [], isLoading } = useQuery<FoodItem[]>({
    queryKey: ["share-items-filter", searchTerm, maxDistanceKm, coordinates?.lat, coordinates?.lng],
    queryFn: () => getShareItemsFunc(searchTerm, maxDistanceKm, coordinates!),
    enabled: !!coordinates,
  });


  return (
    <div className="w-full max-w-7xl mx-auto p-2 text-left font-sans mt-10">
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

      {isLoading ? (
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
          {shareItems.map((item) => <ItemShareCard key={item.id} item={item} coordinates={coordinates} />)}
        </div>
      )}
    </div>
  );
}
