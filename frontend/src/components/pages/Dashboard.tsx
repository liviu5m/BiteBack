import { useEffect, useState } from "react";
import BodyLayout from "../layouts/BodyLayout"
import type { FridgeItem, ItemCategory } from "../../lib/Types";
import { ItemRow } from "../elements/ItemRow";
import { ChefHat, Plus, PlusCircle, PlusIcon, Scan, ShieldAlert, ShieldCheck, Timer, X } from "lucide-react";
import { Modal } from "../elements/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addItemFunc, getItemsByUser, getPercentageSaved } from "@/api/item";
import { toast } from "react-toastify";
import { motion } from "framer-motion"
import { useAppContext } from "@/lib/AppProvider";
import { Link } from "react-router-dom";
const Dashboard = () => {
  const { checkedItems, setCheckedItems } = useAppContext()
  const queryClient = useQueryClient();
  const [isAddItemModalOpened, setIsAddModalOpened] = useState(false);
  const toggleCheck = (id: number) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const [itemData, setItemData] = useState<FridgeItem>({
    id: -1,
    name: "",
    weight: '',
    category: "produce",
    days: ''
  });
  const itemsChecked = Object.values(checkedItems).filter(el => el).length

  const formatCategory = (cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1);

  const { mutate: addItem } = useMutation({
    mutationKey: ['add-item'],
    mutationFn: () => addItemFunc(itemData),
    onSuccess: (data) => {
      console.log(data);
      setIsAddModalOpened(false)
      toast("Item added successfully")
      queryClient.invalidateQueries({ queryKey: ["items-user"] })
    },
    onError: (err) => {
      console.log(err);
    }
  })

  const { data: items } = useQuery({
    queryKey: ["items-user"],
    queryFn: () => getItemsByUser()
  })

  const actionRequired = items ? items.filter((item) => Number(item.days) <= 2) : [];
  const expiringSoon = items ? items.filter((item) => Number(item.days) >= 3 && Number(item.days) <= 5) : [];
  const safeStorage = items ? items.filter((item) => Number(item.days) > 5) : [];
  useEffect(() => {
    if (itemData.weight[0] == '0' && itemData.weight.length > 1) setItemData({ ...itemData, weight: itemData.weight.slice(1) })
    if (itemData.days[0] == '0' && itemData.days.length > 1) setItemData({ ...itemData, days: itemData.days.slice(1) })
  }, [itemData.weight, itemData.days]);

  useEffect(() => {
    setItemData({
      id: -1,
      name: "",
      weight: '',
      category: "produce",
      days: '',
    })
  }, [isAddItemModalOpened]);

  const { data: savedPercentage } = useQuery({
    queryKey: ["saved-percentage"],
    queryFn: () => getPercentageSaved()
  })

  return (
    <BodyLayout>
      <div className="min-h-screen w-[calc(100vw-350px)] p-6 flex justify-center items-start gap-10">
        <div className="bg-white p-10 rounded-2xl shadow w-80 flex flex-col items-center justify-center gap-10">
          <h1 className="text-[#1e4d3b] text-xl font-bold">Your Impact</h1>
          <div
            className="relative flex items-center justify-center rounded-full shadow-inner"
            style={{
              width: "160px",
              height: "160px",
              background: `conic-gradient(#10b981 ${savedPercentage}%, #f3f4f6 ${savedPercentage}% 100%)`
            }}
          >
            <div className="absolute w-[132px] h-[132px] bg-white rounded-full flex flex-col items-center justify-center select-none">
              <span className="text-3xl font-black text-emerald-900 leading-none">
                {savedPercentage}%
              </span>
              <span className="text-xs font-bold text-gray-400 tracking-wider mt-1">
                SAVED
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] w-full max-w-[700px] p-10 flex flex-col gap-8 h-[calc(100vh-100px)]">
          <div className="flex items-center justify-between border-b border-gray-50 pb-6">
            <h1 className="text-3xl font-bold text-[#1e4d3b] tracking-tight">
              Virtual Fridge
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  localStorage.removeItem("items")
                  setCheckedItems({})
                }}
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-500 rounded-xl text-sm font-semibold hover:bg-red-500 cursor-pointer hover:text-white shadow-sm transition-all"
              >
                <X size={16} />
                <span>Clear</span>
              </button>
              <button
                onClick={() => {
                  setIsAddModalOpened(true);
                }}
                type="button"
                className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-[#1e4d3b] text-white rounded-xl text-sm font-semibold hover:bg-[#153629] shadow-sm transition-all"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-8 overflow-y-scroll h-full">
            {items && items.length == 0 && <p className="text-xl font-semibold text-center">No Food in the Virtual Fridge</p>}
            {actionRequired.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider px-1">
                  <ShieldAlert size={14} />
                  <span>Action Required</span>
                </div>
                <ul className="flex flex-col gap-3">
                  {actionRequired.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      isChecked={!!checkedItems[item.id]}
                      onToggle={() => toggleCheck(item.id)}
                      badgeClass="bg-rose-500 text-white"
                      rowClass="border-rose-100 bg-rose-50/10 hover:bg-rose-50/20"
                      formatCategory={formatCategory}
                    />
                  ))}
                </ul>
              </div>
            )}

            {expiringSoon.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider px-1">
                  <Timer size={14} />
                  <span>Expiring Soon</span>
                </div>
                <ul className="flex flex-col gap-3">
                  {expiringSoon.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      isChecked={!!checkedItems[item.id]}
                      onToggle={() => toggleCheck(item.id)}
                      badgeClass="bg-amber-500 text-white"
                      rowClass="border-amber-100 bg-amber-50/10 hover:bg-amber-50/20"
                      formatCategory={formatCategory}
                    />
                  ))}
                </ul>
              </div>
            )}

            {safeStorage.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider px-1">
                  <ShieldCheck size={14} />
                  <span>Safe Storage</span>
                </div>
                <ul className="flex flex-col gap-3">
                  {safeStorage.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      isChecked={!!checkedItems[item.id]}
                      onToggle={() => toggleCheck(item.id)}
                      badgeClass="bg-emerald-100 text-emerald-800 font-semibold"
                      rowClass="border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50/20"
                      formatCategory={formatCategory}
                    />
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
        {isAddItemModalOpened && <Modal title={""} isOpen={isAddItemModalOpened} onClose={() => setIsAddModalOpened(false)} children={
          <div>
            <div className="flex items-center gap-5 mb-5">
              <div className="rounded-full h-12 w-12 text-2xl flex items-center justify-center bg-[#E9EDEB]" >
                <PlusIcon className=" text-[#1E4D3B] font-bold" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1E4D3B]">Add to fridge</h1>
                <p className="text-gray-400">We'll guess shelf life — adjust if you know better</p>
              </div>
            </div>
            <form className="flex flex-col gap-5 mt-10" onSubmit={(e) => {
              e.preventDefault()
              addItem()
            }}>
              <div className="flex flex-col gap-3">
                <label htmlFor="name" className="text-[#1E4D3B]">Item name</label>
                <input type="text" placeholder="e.g. Whole Milk" className="px-5 py-3 rounded-2xl bg-gray-100 border border-gray-100" value={itemData.name} onChange={(e) => setItemData({ ...itemData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-3 ">
                  <label htmlFor="name" className="text-[#1E4D3B]">Weight (g)</label>
                  <input type="number" className=" px-5 py-3 rounded-2xl bg-gray-100 border border-gray-100" min={0}
                    value={itemData.weight} onChange={(e) => setItemData({ ...itemData, weight: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-3 ">
                  <label htmlFor="name" className="text-[#1E4D3B]">Category</label>
                  <select className="px-5 py-3 rounded-2xl bg-gray-100 border border-gray-100" value={itemData.category} onChange={(e) => setItemData({ ...itemData, category: e.target.value as ItemCategory })} defaultValue={"produce"} >
                    <option value="produce" >Produce</option>
                    <option value="dairy">Dairy</option>
                    <option value="meat">Meat</option>
                    <option value="bakery">Bakery</option>
                    <option value="pantry">Pantry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="w-full">
                <label htmlFor="name" className="text-[#1E4D3B]">Days until expiry</label>
                <input type="number" placeholder="e.g. Whole Milk" className="mt-2 w-full px-5 py-3 rounded-2xl bg-gray-100 border border-gray-100" value={itemData.days} onChange={(e) => setItemData({ ...itemData, days: e.target.value })} />
              </div>
              <button className={`text-white flex items-center justify-center gap-4 ${itemData.name != "" && itemData.weight && itemData.days ? "bg-[#1E4D3B] cursor-pointer" : "bg-[#A5B9B1]"} rounded-2xl px-5 py-3 font-semibold text-xl`} disabled={itemData.name == "" || itemData.weight == '' || itemData.days == ''}>
                <PlusIcon />
                <span>Add to fridge</span>
              </button>
            </form>
          </div >
        }
        />
        }
        {
          itemsChecked > 0 && <motion.div
            initial={{ opacity: 0, y: 100, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 100, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 bottom-10 z-50 bg-[#1E4D3B] text-white px-8 py-5 rounded-xl flex items-center justify-between gap-30"
          >
            <div className="flex items-center justify-between gap-5">
              <div className="w-12 h-12 text-white flex items-center justify-center bg-gray-50/10 rounded-full">
                <ChefHat />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{itemsChecked} items selected</h2>
                <p className="text-sm text-gray-300">Ready to rescue</p>
              </div>
            </div>
            <div>
              <Link to={"/cook"} className="bg-white text-[#1E4D3B] font-semibold rounded-xl px-5 py-3 cursor-pointer">
                Find Recipes
              </Link>
            </div>
          </motion.div>
        }
      </div >
    </BodyLayout >
  )
}

export default Dashboard
