import {
  Calendar,
  ChefHat,
  Home,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const MENU_ITEMS = [
  { id: "fridge", label: "Fridge", icon: Home },
  { id: "cook", label: "Cook", icon: ChefHat },
  { id: "plan", label: "Plan", icon: Calendar },
  { id: "share", label: "Share", icon: ShoppingBag },
  { id: "chat", label: "Chat", icon: MessageCircle },
];

const Sidebar = () => {
  const [active, setActive] = useState("fridge");

  return (
    <div className="bg-white p-10 border border-gray-200 shadow w-[350px] h-screen">
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center justify-center bg-[#e8edeb] text-[#1e4d3b] rounded-full w-10 h-10 font-bold text-2xl mb-5 shadow-inner">
          B
        </div>
        <h1 className="text-3xl text-[#1e4d3b] font-semibold text-center">
          Bite Back
        </h1>
      </div>

      <ul className="mt-10 flex flex-col gap-3">
        {MENU_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;

          return (
            <li
              key={item.id}
              className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl text-lg font-medium cursor-pointer transition-colors duration-200 select-none ${
                isActive
                  ? "text-[#1e4d3b]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => setActive(item.id)}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-[#e8edeb] rounded-2xl z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-3 w-full">
                <Icon size={22} />
                <span>{item.label}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
