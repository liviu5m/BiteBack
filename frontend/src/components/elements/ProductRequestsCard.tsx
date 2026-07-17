import { useState } from "react";

export default function ProductRequestsCard({
  productRequests = [],
  currentUserId,
  onUpdateStatus
}) {
  const [showCompleted, setShowCompleted] = useState(false);

  if (!productRequests || productRequests.length === 0) return null;

  // Split your active items and resolved items into two arrays
  const activeRequests = productRequests.filter(
    (r) => r.status !== "completed" && r.status !== "rejected" && r.status !== "cancelled"
  );

  const resolvedRequests = productRequests.filter(
    (r) => r.status === "completed" || r.status === "rejected" || r.status === "cancelled"
  );

  const statusThemes = {
    pending: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-800",
      badge: "bg-amber-100 text-amber-900 border-amber-300",
      label: "Pending Approval",
      subtext: "This user requested your item. Accept to proceed, or decline."
    },
    accepted: {
      bg: "bg-indigo-50 border-indigo-200",
      text: "text-indigo-800",
      badge: "bg-indigo-100 text-indigo-900 border-indigo-300",
      label: "Approved & Awaiting Pickup",
      subtext: "Coordinate meeting details. Click 'Confirm Handover' when done."
    },
    completed: {
      bg: "bg-emerald-50/60 border-emerald-200",
      text: "text-emerald-800",
      badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
      label: "Completed",
      subtext: "Handover successful!"
    },
    rejected: {
      bg: "bg-rose-50/60 border-rose-100",
      text: "text-rose-800",
      badge: "bg-rose-100 text-rose-900 border-rose-200",
      label: "Rejected",
      subtext: "This request was declined."
    },
    cancelled: {
      bg: "bg-gray-50 border-gray-200",
      text: "text-gray-600",
      badge: "bg-gray-100 text-gray-800 border-gray-300",
      label: "Cancelled",
      subtext: "This request has been closed."
    }
  };

  const renderRequestCard = (request) => {
    const isOwner = request.owner_id === currentUserId;
    const status = request.status;
    const theme = statusThemes[status] || statusThemes.pending;

    // Dynamically adjust subtext variations if they are a requester
    let displaySubtext = theme.subtext;
    if (!isOwner && status === "pending") displaySubtext = "Waiting for the owner to accept your request.";
    if (!isOwner && status === "accepted") displaySubtext = "Request approved! Coordinate collection with the owner.";

    return (
      <div
        key={request.id}
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 ${theme.bg}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center shrink-0 text-base">
            📦
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {isOwner ? "Your Listing" : "Requested Item"} (ID: {request.share_item_id})
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${theme.badge}`}>
                {theme.label}
              </span>
            </div>
            <p className={`text-xs font-medium mt-0.5 truncate ${theme.text}`}>
              {displaySubtext}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0">
          {/* STATUS: PENDING */}
          {status === "pending" && (
            <>
              {isOwner ? (
                <>
                  <button
                    onClick={() => onUpdateStatus({ id: request.id, status: "REJECTED" })}
                    className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => onUpdateStatus({ id: request.id, status: "ACCEPTED" })}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A4C38] hover:bg-[#083b2b] rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Accept
                  </button>
                </>
              ) : (
                <span className="text-xs text-amber-700 font-medium italic pr-1">
                  Awaiting response...
                </span>
              )}
            </>
          )}

          {/* STATUS: ACCEPTED */}
          {status === "accepted" && (
            <>
              {isOwner ? (
                <>
                  <button
                    onClick={() => onUpdateStatus({ id: request.id, status: "PENDING" })}
                    className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-white hover:bg-amber-50 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Send Back
                  </button>
                  <button
                    onClick={() => onUpdateStatus({ id: request.id, status: "COMPLETED" })}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A4C38] hover:bg-[#083b2b] rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Confirm Handover
                  </button>
                </>
              ) : (
                <span className="text-xs text-indigo-700 font-semibold bg-indigo-100/50 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                  Approved - Meet up
                </span>
              )}
            </>
          )}

          {/* STATUS: COMPLETED */}
          {status === "completed" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-100/50 px-2.5 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                ✓ Handover Completed
              </span>
              {isOwner && (
                <button
                  onClick={() => onUpdateStatus({ id: request.id, status: "PENDING" })}
                  className="px-2.5 py-1.5 text-[11px] font-medium text-amber-700 bg-white hover:bg-amber-50 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                >
                  Undo
                </button>
              )}
            </div>
          )}

          {/* STATUS: REJECTED */}
          {status === "rejected" && (
            <span className="text-xs text-rose-700 font-semibold bg-rose-100/40 px-2.5 py-1.5 rounded-lg border border-rose-100/70">
              Request Rejected
            </span>
          )}

          {/* STATUS: CANCELLED */}
          {status === "cancelled" && (
            <span className="text-xs text-gray-400 font-medium italic px-2.5 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
              Closed
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-6 mt-4 flex flex-col gap-3 shrink-0">

      {/* Active Scrollable Section */}
      {activeRequests.length > 0 && (
        <div className="max-h-[190px] overflow-y-auto pr-1 space-y-2 border border-dashed border-gray-200 rounded-xl p-2 bg-gray-50/30 custom-scrollbar">
          {activeRequests.map(renderRequestCard)}
        </div>
      )}

      {/* Resolved Collapsible Toggle Bar */}
      {resolvedRequests.length > 0 && (
        <div className="border border-gray-100 rounded-xl bg-white overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 flex items-center justify-between text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>History & Past Deals ({resolvedRequests.length})</span>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showCompleted ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCompleted && (
            <div className="p-3 border-t border-gray-100 space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
              {resolvedRequests.map(renderRequestCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
