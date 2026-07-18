import React, { useState } from "react";
import { Scale, Calendar, FileText, Tag, Loader2 } from "lucide-react";
import { Modal } from "./Modal"; // Adjust this path to where your Modal is located
import type { FoodItem } from "@/lib/Types";

interface EditShareItemModalProps {
  item: FoodItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: Partial<FoodItem>) => void;
  isPending: boolean;
}

export default function EditShareItemModal({
  item,
  isOpen,
  onClose,
  onSave,
  isPending,
}: EditShareItemModalProps) {
  const [name, setName] = useState(item.name);
  const [weight, setWeight] = useState(item.weight);
  const [expiryDate, setExpiryDate] = useState(item.expiryDate);
  const [notes, setNotes] = useState(item.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(Number(item.id), {
      name,
      weight,
      expiryDate,
      notes,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Share Item">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-left font-sans">

        {/* Header Title inside the modal body */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Update Share Item</h3>
          <p className="text-xs text-slate-400 mt-0.5">Modify your custom listing details below.</p>
        </div>

        {/* Item Name */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            Item Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Savory Bananas"
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all"
          />
        </div>

        {/* Weight and Expiry Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weight */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Scale className="h-3.5 w-3.5 text-slate-400" />
              Weight (grams)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 500"
              required
              min="1"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            Description & Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide pickup instructions, dietary guidelines, or item details..."
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
          />
        </div>

        {/* Actions Button Footer */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer w-full sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-cyan-650/10 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
