
export default function ProductRequestsCard({
  productRequests = [],
  currentUserId,
  onUpdateStatus
}) {
  if (!productRequests || productRequests.length === 0) return null;

  return (
    <div className="mx-6 mt-4 space-y-3">
      {productRequests.map((request) => {
        const isOwner = request.owner_id === currentUserId;
        const status = request.status;

        // Theme and status descriptions mapping
        const statusThemes = {
          pending: {
            bg: "bg-amber-50 border-amber-200",
            text: "text-amber-800",
            badge: "bg-amber-100 text-amber-900 border-amber-300",
            label: "Pending Approval",
            subtext: isOwner
              ? "This user requested your item. Accept to proceed, or decline."
              : "Waiting for the owner to accept your request."
          },
          accepted: {
            bg: "bg-indigo-50 border-indigo-200",
            text: "text-indigo-800",
            badge: "bg-indigo-100 text-indigo-900 border-indigo-300",
            label: "Approved & Awaiting Pickup",
            subtext: isOwner
              ? "Coordinate meeting details. Click 'Confirm Handover' when done, or 'Send Back' to reset."
              : "Request approved! Coordinate collection with the owner."
          },
          completed: {
            bg: "bg-emerald-50 border-emerald-200",
            text: "text-emerald-800",
            badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
            label: "Completed",
            subtext: "Handover successful! You can still cancel this back to pending if needed."
          },
          rejected: {
            bg: "bg-rose-50 border-rose-200",
            text: "text-rose-800",
            badge: "bg-rose-100 text-rose-900 border-rose-300",
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

        const theme = statusThemes[status] || statusThemes.pending;

        return (
          <div
            key={request.id}
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${theme.bg}`}
          >
            {/* Left: Metadata */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center shrink-0 text-lg">
                📦
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {isOwner ? "Your Listing" : "Requested Item"} (ID: {request.share_item_id})
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${theme.badge}`}>
                    {theme.label}
                  </span>
                </div>
                <p className={`text-sm font-medium mt-0.5 ${theme.text}`}>
                  {theme.subtext}
                </p>
              </div>
            </div>

            {/* Right: Custom Action Workflows */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">

              {/* STATUS: PENDING */}
              {status === "pending" && (
                <>
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => onUpdateStatus(request.id, "rejected")}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onUpdateStatus(request.id, "accepted")}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0A4C38] hover:bg-[#083b2b] rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Accept
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-amber-700 font-medium italic">
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
                        onClick={() => onUpdateStatus(request.id, "pending")}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-white hover:bg-amber-50 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Send Back to Pending
                      </button>
                      <button
                        onClick={() => onUpdateStatus(request.id, "completed")}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0A4C38] hover:bg-[#083b2b] rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Confirm Handover
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-indigo-700 font-semibold bg-indigo-100/50 px-3 py-1.5 rounded-lg border border-indigo-100">
                      Approved - Meet up
                    </span>
                  )}
                </>
              )}

              {/* STATUS: COMPLETED */}
              {status === "completed" && (
                <>
                  {isOwner ? (
                    <button
                      onClick={() => onUpdateStatus(request.id, "pending")}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-white hover:bg-amber-50 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel & Send back to Pending
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-100/50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                      ✓ Handover Completed
                    </span>
                  )}
                </>
              )}

              {/* STATUS: REJECTED */}
              {status === "rejected" && (
                <span className="text-xs text-rose-700 font-semibold bg-rose-100/50 px-3 py-1.5 rounded-lg border border-rose-100">
                  Request Rejected
                </span>
              )}

              {/* STATUS: CANCELLED */}
              {status === "cancelled" && (
                <span className="text-xs text-gray-400 font-medium italic px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
                  Closed
                </span>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}
