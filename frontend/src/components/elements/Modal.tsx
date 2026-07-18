import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3 md:p-4 lg:p-6 overflow-y-auto no-scrollbar">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative w-full sm:max-w-md md:max-w-lg max-h-[92vh] sm:max-h-[90vh] md:max-h-[85vh] overflow-y-auto transform rounded-t-2xl sm:rounded-xl md:rounded-2xl bg-white p-4 sm:p-5 md:p-6 text-left shadow-xl transition-all sm:my-4 md:my-8 flex flex-col no-scrollbar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          type="button"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer transition-transform duration-200 hover:rotate-180 hover:scale-110 z-10"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Added pr-1 to prevent the system scrollbar from overlapping your form inputs */}
        <div className="mt-2 pr-1">{children}</div>
      </div>
    </div>
  );
}
