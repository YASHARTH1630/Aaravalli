import { useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import adminEnquiryService from "../../services/adminEnquiryService.js";
import { PrimaryButton, SecondaryButton } from "../../components/ui.jsx";

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Negotiating",
  "Converted",
  "Closed",
];

const STATUS_PILLS = [
  { label: "All Enquiries", value: "all" },
  { label: "New", value: "New" },
  { label: "Contacted", value: "Contacted" },
  { label: "Negotiating", value: "Negotiating" },
  { label: "Converted", value: "Converted" },
  { label: "Closed", value: "Closed" },
];

function getStatusBadgeClass(status) {
  switch (status) {
    case "New":
      return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
    case "Contacted":
      return "bg-blue-100 text-blue-900 border-blue-300";
    case "Negotiating":
    case "Negotiation":
    case "Sample / Discussion":
      return "bg-purple-100 text-purple-900 border-purple-300";
    case "Converted":
    case "Order Confirmed":
      return "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold";
    case "Closed":
      return "bg-sand-200 text-charcoal-700 border-sand-400";
    default:
      return "bg-cream-100 text-charcoal-800 border-sand-300";
  }
}

export default function AdminEnquiries() {
  const { dbOffline } = useOutletContext() || {};
  const [searchParams, setSearchParams] = useSearchParams();

  const urlStatus = searchParams.get("status");
  const [activeFilter, setActiveFilter] = useState(urlStatus || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Selected enquiry for detail view modal
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [statusDraft, setStatusDraft] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Note addition state
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Fetch enquiries when filter or search changes
  useEffect(() => {
    let mounted = true;

    adminEnquiryService
      .getEnquiries({
        status: activeFilter,
        search: searchQuery,
      })
      .then((result) => {
        if (mounted) {
          if (result.success) {
            setEnquiries(result.enquiries);
          }
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeFilter, searchQuery]);

  // Support opening modal by query parameter id (e.g. from Dashboard click)
  useEffect(() => {
    const enquiryId = searchParams.get("id");
    if (enquiryId && enquiries.length > 0) {
      const match = enquiries.find((e) => e._id === enquiryId);
      if (match && selectedEnquiry?._id !== match._id) {
        queueMicrotask(() => {
          setSelectedEnquiry(match);
          setStatusDraft(match.status);
        });
      }
    }
  }, [searchParams, enquiries, selectedEnquiry]);

  function handleFilterChange(statusVal) {
    setLoading(true);
    setActiveFilter(statusVal);
    const newParams = new URLSearchParams(searchParams);
    if (statusVal === "all") {
      newParams.delete("status");
    } else {
      newParams.set("status", statusVal);
    }
    setSearchParams(newParams, { replace: true });
  }

  function handleSearchChange(e) {
    setLoading(true);
    setSearchQuery(e.target.value);
  }

  // Open detail modal
  function handleOpenDetail(enquiry) {
    setSelectedEnquiry(enquiry);
    setStatusDraft(enquiry.status);
    setNoteText("");
  }

  // Update Status
  async function handleUpdateStatus() {
    if (!selectedEnquiry || !statusDraft) return;
    setUpdatingStatus(true);
    setFeedbackMessage("");

    const result = await adminEnquiryService.updateEnquiryStatus(
      selectedEnquiry._id,
      statusDraft
    );

    if (result.success && result.enquiry) {
      setSelectedEnquiry(result.enquiry);
      setEnquiries((prev) =>
        prev.map((e) => (e._id === result.enquiry._id ? result.enquiry : e))
      );
      setFeedbackMessage(`Status updated to "${statusDraft}" successfully`);
    } else {
      setFeedbackMessage(result.message || "Failed to update status");
    }

    setUpdatingStatus(false);
  }

  // Add Internal Follow-up Note
  async function handleAddNote(e) {
    e.preventDefault();
    if (!selectedEnquiry || !noteText.trim()) return;

    setAddingNote(true);
    setFeedbackMessage("");

    const result = await adminEnquiryService.addEnquiryNote(
      selectedEnquiry._id,
      noteText.trim()
    );

    if (result.success && result.enquiry) {
      setSelectedEnquiry(result.enquiry);
      setEnquiries((prev) =>
        prev.map((enq) => (enq._id === result.enquiry._id ? result.enquiry : enq))
      );
      setNoteText("");
      setFeedbackMessage("Internal note saved successfully");
    } else {
      setFeedbackMessage(result.message || "Failed to save note");
    }

    setAddingNote(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand-400/50 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-forest-900">
            Buyer Enquiries & Leads
          </h1>
          <p className="mt-1 text-sm text-charcoal-700">
            Review incoming business requirements, track pipeline status, and record internal follow-up notes.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-600 block">
            Total Leads
          </span>
          <span className="text-2xl font-display text-forest-900">
            {enquiries.length}
          </span>
        </div>
      </div>

      {feedbackMessage && (
        <div className="border border-forest-700 bg-forest-50/80 px-4 py-3 text-sm text-forest-900 flex justify-between items-center">
          <span>{feedbackMessage}</span>
          <button
            onClick={() => setFeedbackMessage("")}
            className="text-forest-900 font-bold ml-4 hover:opacity-75"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="border border-sand-400/60 bg-cream-50 p-4 space-y-4 shadow-sm">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-600 mr-1">
            Status:
          </span>
          {STATUS_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => handleFilterChange(pill.value)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                activeFilter === pill.value
                  ? "bg-forest-900 text-cream-50 font-semibold"
                  : "bg-white text-charcoal-700 border border-sand-400 hover:bg-cream-100"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by buyer name, company, email, product, or location…"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border border-sand-400 bg-white px-3.5 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-500/60 focus:border-forest-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="border border-sand-400/60 bg-cream-50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-charcoal-600">
            Loading buyer enquiries…
          </div>
        ) : dbOffline ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-amber-900">
              Enquiry management is temporarily unavailable because the database connection is not available.
            </p>
            <p className="mt-1 text-xs text-charcoal-600">
              Please verify your server and database connection.
            </p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-charcoal-700">
              {searchQuery || activeFilter !== "all"
                ? "No buyer enquiries match your filter or search criteria."
                : "No buyer enquiries received yet."}
            </p>
            <p className="mt-1 text-xs text-charcoal-500">
              New submissions from the public website will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal-800">
              <thead className="bg-sand-400/20 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                <tr>
                  <th className="px-6 py-3.5">Buyer / Organisation</th>
                  <th className="px-6 py-3.5">Product & Requirement</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-400/30">
                {enquiries.map((enquiry) => (
                  <tr
                    key={enquiry._id}
                    className="hover:bg-cream-100/60 cursor-pointer transition-colors"
                    onClick={() => handleOpenDetail(enquiry)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-forest-900 block">
                          {enquiry.buyerName}
                        </span>
                        {enquiry.organisationName ? (
                          <span className="text-xs text-charcoal-600 block">
                            {enquiry.organisationName}
                          </span>
                        ) : (
                          <span className="text-xs text-charcoal-400 italic block">
                            Individual Buyer
                          </span>
                        )}
                        <span className="text-[11px] text-charcoal-500 mt-0.5 block">
                          {enquiry.email} • {enquiry.phone}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-forest-900 block">
                        {enquiry.product}
                      </span>
                      <span className="text-xs text-charcoal-600 block">
                        Type: {enquiry.purchaseRequirement || "One-time"}
                      </span>
                      {enquiry.location && (
                        <span className="text-[11px] text-charcoal-500 block">
                          📍 {enquiry.location}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-charcoal-800">
                      {enquiry.expectedQuantity || "Not specified"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getStatusBadgeClass(
                          enquiry.status
                        )}`}
                      >
                        {enquiry.status}
                      </span>
                      {enquiry.notes && enquiry.notes.length > 0 && (
                        <span className="text-[10px] text-charcoal-500 block mt-1">
                          📝 {enquiry.notes.length} note{enquiry.notes.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-charcoal-600 whitespace-nowrap">
                      {new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(enquiry);
                        }}
                        className="bg-forest-900 text-cream-50 px-3 py-1.5 text-xs font-medium hover:bg-forest-800 transition-colors"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl border border-sand-400 bg-cream-50 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-sand-400/60 bg-forest-900 px-6 py-4 text-cream-50">
              <div>
                <span className="text-xs uppercase tracking-wider text-gold-500 font-semibold block">
                  Enquiry Details
                </span>
                <h2 className="font-display text-lg text-cream-50">
                  {selectedEnquiry.buyerName}{" "}
                  {selectedEnquiry.organisationName ? `(${selectedEnquiry.organisationName})` : ""}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-cream-100 hover:text-cream-50 text-2xl font-bold leading-none"
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Buyer Information */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-900 border-b border-sand-300 pb-1 mb-3">
                  Buyer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-charcoal-500 block">Buyer Name</span>
                    <span className="font-medium text-charcoal-900">{selectedEnquiry.buyerName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-charcoal-500 block">Organisation</span>
                    <span className="font-medium text-charcoal-900">
                      {selectedEnquiry.organisationName || "Not specified (Individual)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-charcoal-500 block">Email Address</span>
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="text-forest-800 underline underline-offset-2"
                    >
                      {selectedEnquiry.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-charcoal-500 block">Phone / Mobile</span>
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      className="text-forest-800 underline underline-offset-2"
                    >
                      {selectedEnquiry.phone}
                    </a>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-charcoal-500 block">Location</span>
                    <span className="text-charcoal-900">{selectedEnquiry.location || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Purchase Requirement */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-900 border-b border-sand-300 pb-1 mb-3">
                  Purchase Requirement
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-charcoal-500 block">Product Interested In</span>
                    <span className="font-semibold text-forest-900">{selectedEnquiry.product}</span>
                  </div>
                  <div>
                    <span className="text-xs text-charcoal-500 block">Expected Quantity</span>
                    <span className="font-medium text-charcoal-900">
                      {selectedEnquiry.expectedQuantity || "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-charcoal-500 block">Requirement Type</span>
                    <span className="text-charcoal-900 font-medium">
                      {selectedEnquiry.purchaseRequirement || "One-time"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-charcoal-500 block">Expected Procurement Timeline</span>
                    <span className="font-medium text-forest-900">
                      {selectedEnquiry.procurementTimeline || "Not specified"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-charcoal-500 block">Preferred Delivery Location</span>
                    <span className="text-charcoal-900">
                      {selectedEnquiry.deliveryLocation || "Same as buyer location / Not specified"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-charcoal-500 block">Message / Note from Buyer</span>
                    <p className="mt-1 p-3 bg-white border border-sand-300 text-sm text-charcoal-800 whitespace-pre-wrap">
                      {selectedEnquiry.message || "No specific message provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Status Management */}
              <div className="bg-cream-100 p-4 border border-sand-300">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-900 mb-2">
                  Lead Status Management
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <select
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                      className="w-full border border-sand-400 bg-white px-3 py-2 text-sm text-charcoal-900 focus:border-forest-700 focus:outline-none"
                    >
                      {Array.from(new Set([selectedEnquiry?.status, ...STATUS_OPTIONS].filter(Boolean))).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <PrimaryButton
                    type="button"
                    disabled={updatingStatus || statusDraft === selectedEnquiry.status}
                    onClick={handleUpdateStatus}
                    className="shrink-0 text-xs py-2"
                  >
                    {updatingStatus ? "Updating…" : "Update Status"}
                  </PrimaryButton>
                </div>
                <p className="text-[11px] text-charcoal-500 mt-2">
                  Current status: <strong className="text-forest-900">{selectedEnquiry.status}</strong>
                </p>
              </div>

              {/* Section 4: Internal Follow-up Notes */}
              <div>
                <div className="flex items-center justify-between border-b border-sand-300 pb-1 mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-900">
                    Internal Follow-Up Notes
                  </h3>
                  <span className="text-[11px] text-charcoal-500 italic">
                    🔒 Private — Not visible to buyers
                  </span>
                </div>

                {/* Existing Notes Timeline */}
                {selectedEnquiry.notes && selectedEnquiry.notes.length > 0 ? (
                  <div className="space-y-2.5 mb-4">
                    {selectedEnquiry.notes.map((note, index) => (
                      <div
                        key={index}
                        className="bg-white border-l-2 border-forest-800 p-3 shadow-xs"
                      >
                        <p className="text-xs text-charcoal-800 whitespace-pre-wrap">{note.text}</p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-charcoal-500">
                          <span>By: {note.createdBy || "Admin"}</span>
                          <span>
                            {new Date(note.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-charcoal-500 italic mb-4">
                    No follow-up notes recorded yet.
                  </p>
                )}

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Add an internal follow-up note (e.g. Called buyer on 15 Sept. Sample sent)..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full border border-sand-400 bg-white p-2.5 text-xs text-charcoal-900 placeholder:text-charcoal-500/60 focus:border-forest-700 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={addingNote || !noteText.trim()}
                      className="bg-forest-800 text-cream-50 px-3 py-1.5 text-xs font-medium hover:bg-forest-900 transition-colors disabled:opacity-50"
                    >
                      {addingNote ? "Adding Note…" : "+ Add Internal Note"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-sand-400/50 bg-cream-100/50 px-6 py-3 flex justify-end">
              <SecondaryButton
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="text-xs"
              >
                Close Details
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
