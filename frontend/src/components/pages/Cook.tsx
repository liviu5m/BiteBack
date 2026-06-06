import { ArrowLeft, BadgeIcon, Bookmark, CheckIcon, ChefHat, Sparkles, SquareCheck, Zap, ZapIcon } from "lucide-react"
import BodyLayout from "../layouts/BodyLayout"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getFoodByItems, getItemsByIds } from "@/api/item"
import { useAppContext } from "@/lib/AppProvider"
import type { FridgeItem } from "@/lib/Types"
import { useState } from "react"
import { motion } from "framer-motion";

const Cook = () => {
  const { checkedItems } = useAppContext();
  const [tab, setTab] = useState("selection")
  const [wasteMode, setWasteMode] = useState(false)
  const [secondaryTab, setSecondaryTab] = useState("all")
  const { data: items } = useQuery({
    queryKey: ["items-ids"],
    queryFn: () => getItemsByIds(Object.keys(checkedItems))
  })

  const { data: foods } = useQuery({
    queryKey: ["select-food"],
    queryFn: () => getFoodByItems(Object.keys(checkedItems))
  })

  console.log(foods);


  return (
    <BodyLayout>
      <div className="min-h-screen w-[calc(100vw-350px)] flex items-start gap-10 py-20 px-60 flex-col">
        <div className="flex gap-5">
          <Link to={"/dashboard"} className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow text-[#1E4D3B] flex items-center justify-center">
            <ArrowLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-[#1E4D3B] font-bold text-4xl">Save My Fridge</h1>
            <p className="text-gray-500 mt-2">{!items || items.length == 0 ? "Select some food in order to proceed" : `Using: ${items.map((item: FridgeItem) => item.name).join(', ')}`} </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-5 h-16">
          <div className="h-full bg-white px-2 py-2 rounded-xl border border-gray-200 shadow flex items-center justify-center list-none">
            <li
              className={`relative cursor-pointer flex items-center justify-center gap-4 w-[400px] px-5 py-3 rounded-xl transition-colors duration-200 ${tab === "selection" ? "text-white" : "text-[#1E4D3B]"
                }`}
              onClick={() => setTab("selection")}
            >
              {tab === "selection" && (
                <motion.div
                  layoutId="tab-active-bg"
                  className="absolute inset-0 bg-[#1E4D3B] rounded-xl z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-4">
                <ChefHat />
                <span className="font-semibold">From selection</span>
              </span>
            </li>

            <li
              className={`relative cursor-pointer flex items-center justify-center gap-4 w-[400px] px-5 py-3 rounded-xl transition-colors duration-200 ${tab === "surprise" ? "text-white" : "text-[#1E4D3B]"
                }`}
              onClick={() => setTab("surprise")}
            >
              {tab === "surprise" && (
                <motion.div
                  layoutId="tab-active-bg"
                  className="absolute inset-0 bg-[#1E4D3B] rounded-xl z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-4">
                <Sparkles />
                <span className="font-semibold">Surprise me</span>
              </span>
            </li>
          </div>
          <button className={`h-full w-40 px-10 py-3  border border-gray-200 shadow font-semibold rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:border hover:border-gray-300 ${wasteMode ? "text-white bg-red-500" : "text-[#1E3D3B] bg-white"}`} onClick={() => setWasteMode(!wasteMode)}>
            <Zap width={22} className="shrink-0" />
            <span className="whitespace-nowrap">Zero-Waste</span>
          </button>
        </div>
        <div className="w-full">
          <ul className="w-full border-b border-gray-300 flex ">
            <li className={`relative font-semibold cursor-pointer ${secondaryTab === "all" ? "text-gray-900" : "text-gray-500"}`} onClick={() => setSecondaryTab("all")}>
              {secondaryTab === "all" && (
                <motion.div
                  layoutId="border-dynamic"
                  className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-800 z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className="flex items-center justify-center px-5 py-4">
                <p className="inline-block ">All Matches <span className="font-bold text-gray-500">0</span></p>
              </div>
            </li>
            <li className={`relative font-semibold cursor-pointer ${secondaryTab === "now" ? "text-gray-900" : "text-gray-500"}`} onClick={() => setSecondaryTab("now")}>
              {secondaryTab === "now" && (
                <motion.div
                  layoutId="border-dynamic"
                  className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-800 z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className="flex items-center justify-center px-5 py-4">
                <SquareCheck className="w-10 text-green-500" />
                <p className="inline-block ">Make Now <span className="font-bold text-gray-500">0</span></p>
              </div>
            </li>
            <li className={`relative font-semibold cursor-pointer ${secondaryTab === "saved" ? "text-gray-900" : "text-gray-500"}`} onClick={() => setSecondaryTab("saved")}>
              {secondaryTab === "saved" && (
                <motion.div
                  layoutId="border-dynamic"
                  className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-800 z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className="flex items-center justify-center px-5 py-4">
                <Bookmark className="w-10" />
                <p className="inline-block ">Saved <span className="font-bold text-gray-500">0</span></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </BodyLayout >

  )
}

export default Cook
