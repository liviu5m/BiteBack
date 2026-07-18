import { Plus } from "lucide-react"
import BodyLayout from "../layouts/BodyLayout"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getDistance } from 'geolib';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useState } from "react";
import { Modal } from "../elements/Modal";
import ShareWithNeighborsForm from "../elements/ShareWithNeighborsFrom";
import NeighborFoodDiscovery from "../elements/NeighborFoodDiscovery";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


const Share = () => {

  const [listItemModal, setListItemModal] = useState(false);

  return (
    <BodyLayout>
      <div className="min-h-screen w-full lg:w-[calc(100vw-350px)] p-3 sm:p-4 md:p-6 lg:p-10 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 md:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-emerald-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2 md:mt-5">Community Share</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-0.5 sm:mt-1">Rescue food from neighbors nearby.</p>
          </div>
          <button className="bg-emerald-900 text-white font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 sm:gap-3 cursor-pointer hover:bg-emerald-800 w-full sm:w-auto shrink-0 text-sm sm:text-base" onClick={() => setListItemModal(true)}>
            <Plus />
            <span>List Item</span>
          </button>
          <Modal isOpen={listItemModal} onClose={() => setListItemModal(false)} title="List Item">
            <ShareWithNeighborsForm onClose={() => setListItemModal(false)} />
          </Modal>
        </div>
        <NeighborFoodDiscovery />
      </div>
    </BodyLayout >
  )
}

export default Share
