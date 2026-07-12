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
            const isActive = location.pathname == item.url;
            const Icon = item.icon;

            return (
              <Link
                to={item.url}
                key={item.id}
                className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl text-lg font-medium cursor-pointer transition-colors duration-200 ${isActive
                  ? "text-[#1e4d3b]"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
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
              </Link>
            );
          })}
        </ul>
      </div >

      <div className="border-t border-gray-100 pt-5 flex flex-col gap-1">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl text-lg font-medium text-rose-500/80 hover:text-rose-600 cursor-pointer transition-colors" onClick={() => logout()}>
          <LogOut size={22} />
          <span>Sign Out</span>
        </div>
      </div>
    </div >
  );
};

export default Sidebar;
