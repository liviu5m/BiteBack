import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getItemsByIds, getItemsByUser } from '@/api/item';
import SmallLoader from './SmallLoader';
import { differenceInDays, parseISO } from 'date-fns';
import { useAppContext } from '@/lib/AppProvider';
import { addShareItemFunc } from '@/api/shareItem';
import type { ShareItemData } from '@/lib/Types';
import { toast } from 'react-toastify';
import { fetchReadableAddress } from '@/lib/utils';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14);
  }, [center, map]);
  return null;
}

export default function ShareWithNeighborsForm({ onClose }: { onClose: () => void }) {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState<'fridge' | 'custom'>('fridge');
  const [selectedFridgeItem, setSelectedFridgeItem] = useState<number | null>(null);

  const [customItemName, setCustomItemName] = useState('');
  const [customExpires, setCustomExpires] = useState('3');
  const [customWeight, setCustomWeight] = useState('');
  const [notes, setNotes] = useState('');

  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const [readableAddress, setReadableAddress] = useState<string>('Fetching address...');

  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const queryClient = useQueryClient();
  const { data: items, isLoading: isItemsLoading } = useQuery({
    queryKey: ["items-user"],
    queryFn: () => getItemsByUser()
  })

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates({ lat, lng });
          fetchReadableAddress(lat, lng, setReadableAddress);
        },
        () => {
          setReadableAddress("Location denied. Please select on map.");
        }
      );
    }
  }, []);

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setCoordinates({ lat: newLat, lng: newLng });

        setReadableAddress(data[0].display_name.split(',').slice(0, 2).join(','));
      } else {
        setSearchError('Location not found.');
      }
    } catch {
      setSearchError('Error searching.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleMapClickUpdate = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setReadableAddress("Loading address...");
    fetchReadableAddress(lat, lng, setReadableAddress);
  };

  const { mutate: addShareItem } = useMutation({
    mutationKey: ['add-share-item'],
    mutationFn: (data: ShareItemData) => addShareItemFunc(data),
    onSuccess: async (data) => {
      console.log(data);
      toast("Item added successfully")
      await queryClient.invalidateQueries({ queryKey: ["share-items-filter"] });
      onClose()
    },
    onError: (err) => {
      console.log(err);
      toast("Error adding item")
    }
  })

  const handlePostListing = () => {
    const selectedItem = activeTab === 'fridge'
      ? items.find((item: any) => item.id === selectedFridgeItem)
      : null;

    const finalPayload = {
      location: JSON.stringify(coordinates),
      notes,
      name: activeTab === 'fridge' ? selectedItem?.name : customItemName,
      expiryDate: activeTab === 'fridge' ? selectedItem?.expiryDate : customExpires,
      weight: activeTab === 'fridge' ? selectedItem?.weight : customWeight,
      userId: user.id
    };
    addShareItem(finalPayload);
  };

  return isItemsLoading ? <div className='w-full h-full min-h-[200px] flex items-center justify-center p-4'>
    <SmallLoader />
  </div> : (
    <div className="w-full flex flex-col font-sans text-left text-slate-800 max-w-full overflow-x-hidden">

      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-emerald-950 leading-tight">Share with neighbors</h2>
          <p className="text-xs sm:text-sm text-gray-500">List food you won't get to in time</p>
        </div>
      </div>

      <div className="w-full flex p-1 bg-gray-50 rounded-xl mb-5 border border-gray-100">
        <button
          type="button"
          onClick={() => setActiveTab('fridge')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'fridge'
            ? 'bg-emerald-900 text-white shadow-sm'
            : 'text-gray-600 hover:text-emerald-900'
            }`}
        >
          From my fridge
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'custom'
            ? 'bg-emerald-900 text-white shadow-sm'
            : 'text-gray-600 hover:text-emerald-900'
            }`}
        >
          Something else
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 mb-5 text-xs text-slate-600">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span>
              📍 Uses your current geo location:{' '}
              <strong className="text-emerald-800">
                {readableAddress}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setIsChangingLocation(!isChangingLocation)}
              className="text-emerald-700 font-bold underline hover:text-emerald-900 transition-colors cursor-pointer"
            >
              {isChangingLocation ? 'Hide map view' : 'click here to change it'}
            </button>
          </div>

          {isChangingLocation && coordinates && (
            <div className="w-full mt-2 flex flex-col gap-2">
              <form onSubmit={handleSearchAddress} className="flex flex-col sm:flex-row gap-1.5 items-stretch sm:items-center w-full">
                <input
                  type="text"
                  placeholder="Search city, street, or zip code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-700 bg-white min-w-0"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="bg-emerald-800 text-white font-semibold px-3 py-2 rounded-lg hover:bg-emerald-950 transition-colors disabled:bg-emerald-800/40 w-full sm:w-auto shrink-0"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {searchError && <p className="text-rose-600 font-medium scale-95 origin-left">{searchError}</p>}

              <p className="text-stone-400 font-medium my-0.5">👉 Or click directly on the map to pinpoint a position:</p>

              <div className="h-[160px] sm:h-[200px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <MapContainer
                  center={[coordinates.lat, coordinates.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[coordinates.lat, coordinates.lng]} />
                  <MapClickHandler onMapClick={handleMapClickUpdate} />
                  <ChangeMapView center={[coordinates.lat, coordinates.lng]} />
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'fridge' ? (
        <div className="flex flex-col gap-3 max-h-[200px] sm:max-h-[260px] overflow-y-auto pr-1 mb-4 sm:mb-5">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedFridgeItem(item.id)}
              className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${selectedFridgeItem === item.id
                ? 'border-emerald-700 bg-emerald-50/40 ring-1 ring-emerald-700'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 leading-tight">{item.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.weight} <span className="mx-1">•</span> {differenceInDays(parseISO(item.expiryDate), new Date())
                  } {differenceInDays(parseISO(item.expiryDate), new Date()) === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-emerald-950">Item name</label>
            <input
              type="text"
              placeholder="e.g. Sourdough loaf"
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-slate-800 placeholder-gray-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-emerald-950">Expiry Date</label>
            <input
              type="date"
              value={customExpires}
              onChange={(e) => setCustomExpires(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-slate-800 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-emerald-950">Item weight (g)</label>
            <input
              type="number"
              value={customWeight}
              onChange={(e) => setCustomWeight(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-slate-800 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
            />
          </div>
        </div>
      )
      }

      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-sm font-semibold text-gray-500">Notes (optional)</label>
        <textarea
          rows={3}
          placeholder="Pickup details, condition, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-stone-50/30 px-4 py-3 text-base text-slate-800 placeholder-gray-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 resize-none"
        />
      </div>

      <button
        type="button"
        onClick={handlePostListing}
        disabled={activeTab === 'fridge' ? selectedFridgeItem === null : !customItemName}
        className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-sm ${(activeTab === 'fridge' ? selectedFridgeItem !== null : customItemName)
          ? 'bg-emerald-700/50 hover:bg-emerald-700 text-slate-900 cursor-pointer'
          : 'bg-stone-300 text-white cursor-not-allowed opacity-70'
          }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        Post listing
      </button>
    </div >
  );
}
