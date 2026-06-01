import {
  Calendar,
  ChefHat,
  Home,
  MessageCircle,
  ShoppingBag,
  LogOut,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "../../api/user";
import { useNavigate } from "react-router-dom";

const MENU_ITEMS = [
  { id: "fridge", label: "Fridge", icon: Home },
  { id: "cook", label: "Cook", icon: ChefHat },
  { id: "plan", label: "Plan", icon: Calendar },
  { id: "share", label: "Share", icon: ShoppingBag },
  { id: "chat", label: "Chat", icon: MessageCircle },
] as const;

type TabId = (typeof MENU_ITEMS)[number]["id"];

interface SidebarProps {
  activeTab?: TabId;
  onTabChange?: (id: TabId) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [internalActive, setInternalActive] = useState<TabId>("fridge");
  const navigate = useNavigate();
  const active = activeTab ?? internalActive;
  const handleTabClick = (id: TabId) => {
    if (onTabChange) onTabChange(id);
    else setInternalActive(id);
  };

  const { mutate: logout } = useMutation({
    mutationKey: ["logout-user"],
    mutationFn: () => logoutUser(),
    onSuccess: (data) => {
      console.log(data);
      navigate("/auth/login")
    },
    onError: (err) => {
      console.log(err);
    }
  })

  return (
    <div className="fixed bg-white border-r border-gray-200 w-[350px] h-screen flex flex-col justify-between p-10 select-none shadow-sm">

      <div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-[#e8edeb] text-[#1e4d3b] rounded-full w-10 h-10 font-bold text-2xl shadow-inner shrink-0">
            B
          </div>
          <h1 className="text-3xl text-[#1e4d3b] font-semibold tracking-tight">
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
                className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl text-lg font-medium cursor-pointer transition-colors duration-200 ${isActive
                  ? "text-[#1e4d3b]"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
                onClick={() => handleTabClick(item.id)}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-[#e8edeb] rounded-2xl z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-3 w-full">
                  <Icon
                    size={22}
                    className={isActive ? "text-[#1e4d3b]" : "text-slate-400"}
                  />
                  <span>{item.label}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-gray-100 pt-5 flex flex-col gap-1">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl text-lg font-medium text-rose-500/80 hover:text-rose-600 cursor-pointer transition-colors" onClick={() => logout()}>
          <LogOut size={22} />
          <span>Sign Out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
