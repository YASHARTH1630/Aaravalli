import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import adminProductService from "../../services/adminProductService.js";
import adminEnquiryService from "../../services/adminEnquiryService.js";
import { PrimaryButton } from "../../components/ui.jsx";

function getStatusBadgeClass(status) {
  switch (status) {
    case "New":
      return "bg-amber-100 text-amber-900 border-amber-300 font-semibold";
    case "Contacted":
      return "bg-blue-100 text-blue-900 border-blue-300";
    case "Negotiating":
    case "Negotiation":
    case "Sample / Discussion":
      return "bg-purple-100 text-purple-900 border-purple-300";
    case "Converted":
    case "Order Confirmed":
      return "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold";
    case "Closed":
      return "bg-sand-200 text-charcoal-700 border-sand-400";
    default:
      return "bg-cream-100 text-charcoal-800 border-sand-300";
  }
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { dbOffline } = useOutletContext() || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Enquiry & Lead Metrics State (Real MongoDB queries)
  const [enquiryStats, setEnquiryStats] = useState({
    total: 0,
    new: 0,
    activeLeads: 0,
    converted: 0,
    closed: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);

  // Demand Insights State (Phase 1D - Real MongoDB aggregation)
  const [demandInsights, setDemandInsights] = useState({
    summary: {
      totalDemandEnquiries: 0,
      recurringRequirements: 0,
      seasonalRequirements: 0,
      oneTimeRequirements: 0,
    },
    products: [],
    recentDemand: [],
  });
  const [demandLoading, setDemandLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    adminProductService.getAllProducts().then((result) => {
      if (mounted) {
        if (result.success) {
          setProducts(result.products);
        }
        setLoading(false);
      }
    });

    adminEnquiryService.getEnquiryStats().then((result) => {
      if (mounted && result.success) {
        setEnquiryStats(result.stats);
      }
    });

    adminEnquiryService.getEnquiries().then((result) => {
      if (mounted) {
        if (result.success) {
          setRecentEnquiries(result.enquiries.slice(0, 5));
        }
        setEnquiriesLoading(false);
      }
    });

    adminEnquiryService.getDemandInsights().then((result) => {
      if (mounted) {
        if (result.success && result.data) {
          setDemandInsights(result.data);
        }
        setDemandLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleTogglePublish(id, currentStatus) {
    setActionLoading(id);
    setFeedbackMessage("");
    const result = await adminProductService.togglePublish(id, !currentStatus);
    if (result.success) {
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isPublished: !currentStatus } : p))
      );
      setFeedbackMessage(result.message);
    } else {
      setFeedbackMessage(result.message || "Failed to update publish state");
    }
    setActionLoading(null);
  }

  const totalCount = products.length;
  const publishedCount = products.filter((p) => p.isPublished).length;
  const draftCount = totalCount - publishedCount;

  return (
    <div className="space-y-10">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand-400/50 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-forest-900">
            Welcome back, {user?.name || "Administrator"}
          </h1>
          <p className="mt-1 text-sm text-charcoal-700">
            FPC Administration Portal — Enquiries, Buyer Leads, and Product Catalog.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PrimaryButton as={Link} to="/admin/enquiries" className="text-xs">
            Manage Enquiries
          </PrimaryButton>
          <PrimaryButton as={Link} to="/admin/products/new" className="text-xs">
            + Add Product
          </PrimaryButton>
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

      {/* SECTION 1: Buyer Enquiries & Lead Pipeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg md:text-xl text-forest-900">
              Buyer Enquiries & Lead Pipeline
            </h2>
            <p className="text-xs text-charcoal-600">
              Live statistics from MongoDB based on incoming buyer submissions.
            </p>
          </div>
          <Link
            to="/admin/enquiries"
            className="text-xs font-semibold text-forest-800 hover:text-forest-950 underline underline-offset-4"
          >
            View All Enquiries ({enquiryStats.total}) →
          </Link>
        </div>

        {/* 4 Explicit CRM Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Enquiries */}
          <Link
            to="/admin/enquiries"
            className="border border-sand-400/60 bg-cream-50 p-5 shadow-xs hover:border-forest-700 transition-colors block"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                Total Enquiries
              </p>
              <span className="text-xs text-charcoal-400">All</span>
            </div>
            <p className="mt-2 text-3xl font-display text-forest-900">{enquiryStats.total}</p>
            <p className="mt-1 text-xs text-charcoal-600">All enquiries received</p>
          </Link>

          {/* New Enquiries */}
          <Link
            to="/admin/enquiries?status=New"
            className="border border-amber-300 bg-amber-50/50 p-5 shadow-xs hover:border-amber-500 transition-colors block"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                New Enquiries
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                Needs Review
              </span>
            </div>
            <p className="mt-2 text-3xl font-display text-amber-950">{enquiryStats.new}</p>
            <p className="mt-1 text-xs text-amber-800">Status "New" — awaiting contact</p>
          </Link>

          {/* Active Leads */}
          <Link
            to="/admin/enquiries?status=Negotiating"
            className="border border-purple-200 bg-purple-50/40 p-5 shadow-xs hover:border-purple-400 transition-colors block"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-900">
                Active Leads
              </p>
              <span className="text-[10px] text-purple-700 font-medium">In Pipeline</span>
            </div>
            <p className="mt-2 text-3xl font-display text-purple-950">{enquiryStats.activeLeads}</p>
            <p className="mt-1 text-xs text-purple-800">Contacted + Negotiating</p>
          </Link>

          {/* Converted */}
          <Link
            to="/admin/enquiries?status=Converted"
            className="border border-emerald-300 bg-emerald-50/40 p-5 shadow-xs hover:border-emerald-500 transition-colors block"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                Converted
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">Won</span>
            </div>
            <p className="mt-2 text-3xl font-display text-emerald-950">{enquiryStats.converted}</p>
            <p className="mt-1 text-xs text-emerald-800">Status "Converted"</p>
          </Link>
        </div>

        {/* Recent Enquiries Overview */}
        <div className="border border-sand-400/60 bg-cream-50 shadow-sm overflow-hidden mt-4">
          <div className="px-6 py-4 border-b border-sand-400/40 flex items-center justify-between">
            <h3 className="font-display text-base text-forest-900">
              Recent Buyer Enquiries
            </h3>
            <Link
              to="/admin/enquiries"
              className="text-xs font-medium text-forest-800 hover:text-forest-950 underline underline-offset-4"
            >
              Open Lead Manager →
            </Link>
          </div>

          {enquiriesLoading ? (
            <div className="p-6 text-center text-sm text-charcoal-600">
              Loading recent enquiries…
            </div>
          ) : dbOffline ? (
            <div className="p-6 text-center text-sm text-amber-900">
              Database offline. Enquiries are currently unavailable.
            </div>
          ) : recentEnquiries.length === 0 ? (
            <div className="p-6 text-center text-sm text-charcoal-600">
              No buyer enquiries received yet. Submissions from the public website will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-charcoal-800">
                <thead className="bg-sand-400/20 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                  <tr>
                    <th className="px-6 py-3">Buyer / Company</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-400/30">
                  {recentEnquiries.map((enq) => (
                    <tr key={enq._id} className="hover:bg-cream-100/50">
                      <td className="px-6 py-3.5">
                        <span className="font-medium text-forest-900 block">{enq.buyerName}</span>
                        <span className="text-xs text-charcoal-600 block">
                          {enq.organisationName || "Individual"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-forest-900">{enq.product}</td>
                      <td className="px-6 py-3.5 text-xs text-charcoal-700">
                        {enq.expectedQuantity || "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${getStatusBadgeClass(
                            enq.status
                          )}`}
                        >
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-charcoal-600 whitespace-nowrap">
                        {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          to={`/admin/enquiries?id=${enq._id}`}
                          className="text-xs font-semibold text-forest-800 hover:text-forest-950 underline"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 1.5: Buyer Demand & Procurement Discovery (Phase 1D) */}
      <section className="space-y-4 pt-4 border-t border-sand-400/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-display text-lg md:text-xl text-forest-900">
              Buyer Demand & Procurement Discovery
            </h2>
            <p className="text-xs text-charcoal-600">
              Structured market demand visibility to guide FPC production and aggregation planning.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-forest-900 text-cream-50">
              {demandInsights.summary.recurringRequirements} Recurring Buyer Requirement{demandInsights.summary.recurringRequirements === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Demand Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-sand-400/60 bg-cream-50 p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
              Total Demand Inquiries
            </p>
            <p className="mt-2 text-3xl font-display text-forest-900">
              {demandInsights.summary.totalDemandEnquiries}
            </p>
            <p className="mt-1 text-xs text-charcoal-600">
              Procurement requests recorded
            </p>
          </div>

          <div className="border border-forest-800/40 bg-forest-50/60 p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-900">
              Regular / Recurring Demand
            </p>
            <p className="mt-2 text-3xl font-display text-forest-900">
              {demandInsights.summary.recurringRequirements}
            </p>
            <p className="mt-1 text-xs text-forest-800">
              High-value recurring buyer contracts
            </p>
          </div>

          <div className="border border-sand-400/60 bg-cream-50 p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
              Seasonal & One-Time Demand
            </p>
            <p className="mt-2 text-3xl font-display text-charcoal-800">
              {demandInsights.summary.seasonalRequirements + demandInsights.summary.oneTimeRequirements}
            </p>
            <p className="mt-1 text-xs text-charcoal-600">
              {demandInsights.summary.seasonalRequirements} Seasonal • {demandInsights.summary.oneTimeRequirements} One-time
            </p>
          </div>
        </div>

        {/* Product Demand Breakdown Table */}
        <div className="border border-sand-400/60 bg-cream-50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-sand-400/40 flex items-center justify-between">
            <h3 className="font-display text-base text-forest-900">
              Product Demand Summary
            </h3>
            <span className="text-xs text-charcoal-600">
              Demand records aggregated by produce
            </span>
          </div>

          {demandLoading ? (
            <div className="p-6 text-center text-sm text-charcoal-600">
              Loading buyer demand patterns…
            </div>
          ) : demandInsights.products.length === 0 ? (
            <div className="p-6 text-center text-sm text-charcoal-600">
              No demand patterns detected yet. Submissions will populate here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-charcoal-800">
                <thead className="bg-sand-400/20 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                  <tr>
                    <th className="px-6 py-3">Product Name</th>
                    <th className="px-6 py-3 text-center">Total Enquiries</th>
                    <th className="px-6 py-3 text-center">Recurring Demand</th>
                    <th className="px-6 py-3 text-center">Seasonal / Spot</th>
                    <th className="px-6 py-3 text-right">Latest Inquiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-400/30">
                  {demandInsights.products.map((item) => (
                    <tr key={item.productName} className="hover:bg-cream-100/50">
                      <td className="px-6 py-3.5 font-medium text-forest-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-3.5 text-center font-display text-base text-forest-900">
                        {item.totalEnquiries}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {item.recurringCount > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            {item.recurringCount} recurring
                          </span>
                        ) : (
                          <span className="text-xs text-charcoal-400">0</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center text-xs text-charcoal-600">
                        {item.seasonalCount} seasonal • {item.oneTimeCount} one-time
                      </td>
                      <td className="px-6 py-3.5 text-xs text-charcoal-600 text-right whitespace-nowrap">
                        {item.latestEnquiryDate
                          ? new Date(item.latestEnquiryDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: Product Catalog Overview (Preserved Phase 1B) */}
      <section className="space-y-4 pt-4 border-t border-sand-400/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg md:text-xl text-forest-900">
              Product Catalog
            </h2>
            <p className="text-xs text-charcoal-600">
              Manage items shown on the public product catalogue.
            </p>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-semibold text-forest-800 hover:text-forest-950 underline underline-offset-4"
          >
            View Full Catalog ({totalCount}) →
          </Link>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border border-sand-400/60 bg-cream-50 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Total Products
            </p>
            <p className="mt-2 text-3xl font-display text-forest-900">{totalCount}</p>
            <p className="mt-1 text-xs text-charcoal-600">Registered in system</p>
          </div>

          <div className="border border-forest-800/30 bg-forest-900/5 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-800">
              Published Products
            </p>
            <p className="mt-2 text-3xl font-display text-forest-900">{publishedCount}</p>
            <p className="mt-1 text-xs text-forest-700">Visible on public catalog</p>
          </div>

          <div className="border border-sand-400/60 bg-cream-50 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
              Draft / Unpublished
            </p>
            <p className="mt-2 text-3xl font-display text-charcoal-800">{draftCount}</p>
            <p className="mt-1 text-xs text-charcoal-600">Hidden from public view</p>
          </div>
        </div>

      {/* Recent Products Overview */}
      <div className="border border-sand-400/60 bg-cream-50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-sand-400/40 flex items-center justify-between">
          <h2 className="font-display text-lg text-forest-900">
            Catalog Products ({products.length})
          </h2>
          <Link
            to="/admin/products"
            className="text-xs font-medium text-forest-800 hover:text-forest-950 underline underline-offset-4"
          >
            View Full List →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-charcoal-600">
            Loading product data…
          </div>
        ) : dbOffline ? (
          <div className="p-8 text-center">
            <p className="text-sm text-amber-900 font-medium">
              Product management is temporarily unavailable because the database connection is not available.
            </p>
            <p className="mt-1 text-xs text-charcoal-600">
              The public website continues safely serving fallback static products.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-charcoal-700">No products found in the database.</p>
            <p className="mt-1 text-xs text-charcoal-500">
              Get started by adding your first product to the FPC catalogue.
            </p>
            <div className="mt-4">
              <PrimaryButton as={Link} to="/admin/products/new">
                + Create Product
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal-800">
              <thead className="bg-sand-400/20 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Availability</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-400/30">
                {products.slice(0, 5).map((product) => (
                  <tr key={product._id} className="hover:bg-cream-100/50">
                    <td className="px-6 py-4 font-medium text-forest-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-charcoal-600">{product.category}</td>
                    <td className="px-6 py-4 text-xs text-charcoal-700">
                      {product.availabilityStatus}
                    </td>
                    <td className="px-6 py-4">
                      {product.isPublished ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sand-200 text-charcoal-700 border border-sand-300">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleTogglePublish(product._id, product.isPublished)}
                        disabled={actionLoading === product._id}
                        className="text-xs font-medium text-forest-800 hover:text-forest-950 underline mr-2"
                      >
                        {actionLoading === product._id
                          ? "…"
                          : product.isPublished
                          ? "Unpublish"
                          : "Publish"}
                      </button>
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="text-xs font-medium text-forest-800 hover:text-forest-950 underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </section>
    </div>
  );
}
