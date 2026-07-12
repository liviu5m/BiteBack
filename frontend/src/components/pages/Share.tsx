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
      <div className="min-h-screen w-[calc(100vw-350px)] p-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-emerald-900 text-4xl font-bold mt-5">Community Share</h1>
            <p className="text-lg text-gray-600">Rescue food from neighbors nearby.</p>
          </div>
          <button className="bg-emerald-900 text-white font-semibold px-5 py-3 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:bg-emerald-800" onClick={() => setListItemModal(true)}>
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
