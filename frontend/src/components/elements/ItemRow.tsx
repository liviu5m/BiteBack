import type { FridgeItem } from "../../lib/Types";

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
  return (
    <li
      className={`flex items-center justify-between border p-4 rounded-2xl select-none transition-all duration-200 ${rowClass}`}
    >
      <div className="flex items-center gap-4">
        {/* Custom Stylized Checkbox element */}
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

        {/* Item Metadata */}
        <div className="flex flex-col leading-tight">
          <span className={`text-lg font-bold text-slate-800 ${isChecked ? "line-through text-slate-400" : ""}`}>
            {item.name}
          </span>
          <span className="text-sm text-slate-400 font-medium mt-0.5">
            {item.weight}g <span className="mx-1">•</span> {formatCategory(item.category)}
          </span>
        </div>
      </div>

      {/* Expiry Counter Pill */}
      <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap min-w-[70px] text-center shadow-sm ${badgeClass}`}>
        {item.daysUntilExpiry} {item.daysUntilExpiry === 1 ? "day" : "days"}
      </span>
    </li>
  );
};

