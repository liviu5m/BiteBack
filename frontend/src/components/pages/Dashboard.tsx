import { useEffect, useState } from "react";
import BodyLayout from "../layouts/BodyLayout"
import type { FridgeItem, ItemCategory } from "../../lib/Types";
import { ItemRow } from "../elements/ItemRow";
import { Plus, PlusCircle, PlusIcon, Scan, ShieldAlert, ShieldCheck, Timer } from "lucide-react";
import { Modal } from "../elements/Modal";
import { useMutation } from "@tanstack/react-query";
import { addItemFunc } from "@/api/item";
const Dashboard = () => {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [isAddItemModalOpened, setIsAddModalOpened] = useState(false);
  const toggleCheck = (id: number) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const [itemData, setItemData] = useState<FridgeItem>({
    id: -1,
    name: "",
    weight: 0,
    category: "produce",
    days: 0
  });
  const actionRequired = items.filter((item) => item.days <= 2);
  const expiringSoon = items.filter((item) => item.days >= 3 && item.days <= 5);
  const safeStorage = items.filter((item) => item.days > 5);

  const formatCategory = (cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1);

  const { mutate: addItem } = useMutation({
    mutationKey: ['add-item'],
    mutationFn: () => addItemFunc(itemData),
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (err) => {
      console.log(err);
    }
  })

  useEffect(() => {
    setItemData({
      id: -1,
      name: "",
      weight: 0,
      category: "produce",
      days: 0,
    })
  }, [isAddItemModalOpened]);

  return (
    <BodyLayout>
      <div className="min-h-screen w-[calc(100vw-350px)] p-6 flex justify-center items-start">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] w-full max-w-[700px] p-10 flex flex-col gap-8">

          <div className="flex items-center justify-between border-b border-gray-50 pb-6">
            <h1 className="text-3xl font-bold text-[#1e4d3b] tracking-tight">
              Virtual Fridge
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsAddModalOpened(true);
                }}
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1e4d3b] text-white rounded-xl text-sm font-semibold hover:bg-[#153629] shadow-sm transition-all"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-8">

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
                    value={itemData.weight} onChange={(e) => setItemData({ ...itemData, weight: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-3 ">
                  <label htmlFor="name" className="text-[#1E4D3B]">Category</label>
                  <select className=" px-5 py-3 rounded-2xl bg-gray-100 border border-gray-100" value={itemData.category} onChange={(e) => setItemData({ ...itemData, category: e.target.value as ItemCategory })} defaultValue={"produce"} >
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
                <input type="number" placeholder="e.g. Whole Milk" className="mt-2 w-full px-5 py-3 rounded-2xl bg-gray-100 border border-gray-100" value={itemData.days} onChange={(e) => setItemData({ ...itemData, days: Number(e.target.value) })} />
              </div>
              <button className={`text-white flex items-center justify-center gap-4 ${itemData.name != "" && itemData.weight != 0 && itemData.days != 0 ? "bg-[#1E4D3B] cursor-pointer" : "bg-[#A5B9B1]"}  rounded-2xl px-5 py-3 font-semibold text-xl`} disabled={itemData.name == "" || itemData.weight == 0 || itemData.days == 0}>
                <PlusIcon />
                <span>Add to fridge</span>
              </button>
            </form>
          </div >
        }
        />
        }
      </div >
    </BodyLayout >
  )
}

export default Dashboard
