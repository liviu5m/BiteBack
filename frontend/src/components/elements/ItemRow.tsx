import { Edit, Edit2Icon, Edit3Icon, PlusIcon, Trash } from "lucide-react";
import type { FridgeItem, ItemCategory } from "../../lib/Types";
import { useState } from "react";
import { Modal } from "./Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteItemByid, updateItemById } from "@/api/item";
import { toast } from "react-toastify";
import { parseISO, differenceInDays } from 'date-fns';

interface ItemRowProps {
  item: FridgeItem;
  isChecked: boolean;
  onToggle: () => void;
  badgeClass: string;
  rowClass: string;
  formatCategory: (cat: string) => string;
}

export const ItemRow = ({
  item,
  isChecked,
  onToggle,
  badgeClass,
  rowClass,
  formatCategory,
}: ItemRowProps) => {
  const queryClient = useQueryClient();
  const [editItemId, setEditItemId] = useState(-1);
  const [itemData, setItemData] = useState<FridgeItem>({
    id: item.id,
    name: item.name,
    weight: item.weight,
    category: item.category,
    expiryDate: item.expiryDate
  });

  const { mutate: updateItem } = useMutation({
    mutationKey: ["update-item"],
    mutationFn: () => updateItemById(itemData, item.id),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["items-user"] })
      setEditItemId(-1);
      toast("Item updated successfully")
    },
    onError: (err) => {
      console.log(err);
    }
  })

  const { mutate: deleteItem } = useMutation({
    mutationKey: ["delete-item"],
    mutationFn: () => deleteItemByid(item.id),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["items-user"] })
      toast("Item deleted successfully")
    },
    onError: (err) => {
      console.log(err);
    }
  })

  const daysTillExpiry = differenceInDays(parseISO(item.expiryDate), new Date())

  return (
    <li
      className={`flex items-center justify-between border p-4 rounded-2xl select-none transition-all duration-200 ${rowClass}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onToggle}
            className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-lg cursor-pointer bg-white checked:bg-[#1e4d3b] checked:border-[#1e4d3b] transition-all"
          />
          {isChecked && (
            <svg
              className="absolute w-3.5 h-3.5 text-white pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>

        <div className="flex flex-col leading-tight">
          <span className={`text-lg font-bold text-slate-800 ${isChecked ? "line-through text-slate-400" : ""}`}>
            {item.name}
          </span>
          <span className="text-sm text-slate-400 font-medium mt-0.5">
            {item.weight}g <span className="mx-1">•</span> {formatCategory(item.category)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="p-1 cursor-pointer" onClick={() => {
          setEditItemId(item.id)
        }} >
          <Edit className="text-green-500" />
        </div>
        <div className="p-1 cursor-pointer" onClick={() => {
          deleteItem()
        }}>
          <Trash className="text-red-500" />
        </div>
      </div>
      <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap min-w-[70px] text-center shadow-sm ${badgeClass}`}>
        {daysTillExpiry} {daysTillExpiry === 1 ? "day" : "days"} </span>
      {
        editItemId != -1 && <Modal title={""} isOpen={editItemId != -1} onClose={() => setEditItemId(-1)} children={
          <div>
            <div className="flex items-center gap-5 mb-5">
              <div className="rounded-full h-12 w-12 text-2xl flex items-center justify-center bg-[#E9EDEB]" >
                <Edit2Icon className=" text-[#1E4D3B] font-bold" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1E4D3B]">Edit Item</h1>
                <p className="text-gray-400">We'll guess shelf life — adjust if you know better</p>
              </div>
            </div>
            <form className="flex flex-col gap-5 mt-10" onSubmit={(e) => {
              e.preventDefault()
              updateItem()
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
                <label htmlFor="name" className="text-[#1E4D3B]">Expirty Date</label>
                <input type="date" className="mt-2 w-full px-5 py-3 rounded-2xl bg-gray-100 border border-gray-100" value={itemData.expiryDate} onChange={(e) => setItemData({ ...itemData, expiryDate: e.target.value })} />
              </div>
              <button className={`text-white flex items-center justify-center gap-4 ${itemData.name != "" && itemData.weight && itemData.expiryDate ? "bg-[#1E4D3B] cursor-pointer" : "bg-[#A5B9B1]"} rounded-2xl px-5 py-3 font-semibold text-xl`} disabled={itemData.name == "" || itemData.weight == '' || itemData.expiryDate == ''}>
                <Edit3Icon />
                <span>Update the fridge</span>
              </button>
            </form>
          </div >
        }
        />

      }
    </li >
  );
};

