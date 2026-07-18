import {
  Calendar,
  ChefHat,
  Home,
  MessageCircle,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../../api/user";
import { Link, useLocation, useNavigate } from "react-router-dom";

const MENU_ITEMS = [
  { id: "fridge", label: "Fridge", icon: Home, url: "/dashboard" },
  { id: "cook", label: "Cook", icon: ChefHat, url: "/cook" },
  { id: "share", label: "Share", icon: ShoppingBag, url: "/share" },
  { id: "chat", label: "Chat", icon: MessageCircle, url: "/chat" },
] as const;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient()
  const { mutate: logout } = useMutation({
    mutationKey: ["logout-user"],
    mutationFn: () => logoutUser(),
    onSuccess: (data) => {
      console.log(data);
      queryClient.clear();
      localStorage.removeItem("items")
      window.location.reload()
      navigate("/auth/login");
    },
    onError: (err) => {
      console.log(err);
    }
  })

  return (
    <div className="fixed inset-x-0 bottom-0 lg:inset-x-auto lg:top-0 lg:left-0 lg:bottom-auto bg-white border-t lg:border-t-0 lg:border-r border-gray-200 w-full lg:w-[280px] xl:w-[350px] h-auto lg:h-screen flex flex-row lg:flex-col justify-around lg:justify-between p-1.5 sm:p-2 md:p-3 lg:p-8 xl:p-10 select-none shadow-sm z-40">

      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center justify-center bg-[#e8edeb] text-[#1e4d3b] rounded-full w-10 h-10 font-bold text-2xl shadow-inner shrink-0">
          B
        </div>
        <h1 className="text-2xl xl:text-3xl text-[#1e4d3b] font-semibold tracking-tight">
          Bite Back
        </h1>
      </div>

      <ul className="flex flex-row lg:flex-col gap-0 lg:gap-3 lg:mt-10 w-full lg:w-auto justify-around lg:justify-start flex-1 lg:flex-none">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname == item.url;
          const Icon = item.icon;

          return (
            <Link
              to={item.url}
              key={item.id}
              className={`relative flex flex-col lg:flex-row items-center gap-0.5 lg:gap-2 xl:gap-3 px-1.5 sm:px-2 md:px-3 lg:px-4 xl:px-5 py-1.5 sm:py-2 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl text-[9px] sm:text-[10px] md:text-xs lg:text-base xl:text-lg font-medium cursor-pointer transition-colors duration-200 ${isActive
                ? "text-[#1e4d3b]"
                : "text-slate-400 hover:text-slate-600"
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-[#e8edeb] rounded-xl lg:rounded-2xl z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <span className="relative z-10 flex flex-col lg:flex-row items-center gap-0.5 lg:gap-3 w-full">
                <Icon
                  size={22}
                  className={`w-5 h-5 lg:w-[22px] lg:h-[22px] shrink-0 ${isActive ? "text-[#1e4d3b]" : "text-slate-400"}`}
                />
                <span className="truncate">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </ul>

      <div className="flex lg:hidden flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-[10px] sm:text-xs font-medium text-rose-500/80 hover:text-rose-600 cursor-pointer transition-colors" onClick={() => logout()}>
        <LogOut size={20} className="shrink-0" />
        <span>Out</span>
      </div>

      <div className="hidden lg:flex border-t border-gray-100 pt-5 flex-col gap-1">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl text-lg font-medium text-rose-500/80 hover:text-rose-600 cursor-pointer transition-colors" onClick={() => logout()}>
          <LogOut size={22} />
          <span>Sign Out</span>
        </div>
      </div>
    </div >
  );
};

export default Sidebar;
