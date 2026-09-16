import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import adminProductService from "../../services/adminProductService.js";
import { PrimaryButton, SecondaryButton } from "../../components/ui.jsx";

export default function AdminProductsList() {
  const { dbOffline } = useOutletContext() || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'published' | 'draft'
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  async function confirmDelete() {
    if (!productToDelete) return;
    setDeleteLoading(true);
    const result = await adminProductService.deleteProduct(productToDelete._id);
    if (result.success) {
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      setFeedbackMessage(result.message);
      setProductToDelete(null);
    } else {
      setFeedbackMessage(result.message || "Failed to delete product");
    }
    setDeleteLoading(false);
  }

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "published") return product.isPublished;
    if (filterStatus === "draft") return !product.isPublished;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand-400/50 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-forest-900">
            Product Management
          </h1>
          <p className="mt-1 text-sm text-charcoal-700">
            Add, update, publish or unpublish products shown on the public FPC catalog.
          </p>
        </div>

        <PrimaryButton as={Link} to="/admin/products/new">
          + Add New Product
        </PrimaryButton>
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-sand-400/60 bg-cream-50 p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search products by name or category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-sand-400 bg-white px-3.5 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-500/60 focus:border-forest-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-charcoal-600">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-sand-400 bg-white px-3 py-2 text-sm text-charcoal-800 focus:border-forest-700 focus:outline-none"
          >
            <option value="all">All Products ({products.length})</option>
            <option value="published">
              Published ({products.filter((p) => p.isPublished).length})
            </option>
            <option value="draft">
              Drafts ({products.filter((p) => !p.isPublished).length})
            </option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-sand-400/60 bg-cream-50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-charcoal-600">
            Loading products catalog…
          </div>
        ) : dbOffline ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-amber-900">
              Product management is temporarily unavailable because the database connection is not available.
            </p>
            <p className="mt-1 text-xs text-charcoal-600">
              Please ensure MongoDB is running and MONGODB_URI is correctly configured.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-charcoal-700">
              {searchQuery || filterStatus !== "all"
                ? "No products match your filter criteria."
                : "No products in database yet."}
            </p>
            {(!searchQuery && filterStatus === "all") && (
              <div className="mt-4">
                <PrimaryButton as={Link} to="/admin/products/new">
                  + Create First Product
                </PrimaryButton>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal-800">
              <thead className="bg-sand-400/20 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Forms & Packaging</th>
                  <th className="px-6 py-3.5">Availability</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-400/30">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-cream-100/50">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-forest-900 block">
                          {product.name}
                        </span>
                        <span className="text-xs text-charcoal-600 line-clamp-1 mt-0.5">
                          {product.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-charcoal-700">
                      {product.category}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        {product.availableForms && product.availableForms.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.availableForms.map((form, i) => (
                              <span
                                key={i}
                                className="inline-block bg-sand-200/70 text-charcoal-800 px-1.5 py-0.5 rounded text-[11px]"
                              >
                                {form}
                              </span>
                            ))}
                          </div>
                        )}
                        {product.packagingOptions && (
                          <p className="text-[11px] text-charcoal-600">
                            Pkg:{" "}
                            {Array.isArray(product.packagingOptions)
                              ? product.packagingOptions.join(", ")
                              : product.packagingOptions}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-charcoal-700">
                      {product.availabilityStatus}
                    </td>
                    <td className="px-6 py-4">
                      {product.isPublished ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ● Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sand-200 text-charcoal-600 border border-sand-400">
                          ○ Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleTogglePublish(product._id, product.isPublished)}
                          disabled={actionLoading === product._id}
                          className="text-xs font-medium text-forest-800 hover:text-forest-950 underline underline-offset-2"
                        >
                          {actionLoading === product._id
                            ? "…"
                            : product.isPublished
                            ? "Unpublish"
                            : "Publish"}
                        </button>
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="text-xs font-medium text-forest-800 hover:text-forest-950 underline underline-offset-2"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="text-xs font-medium text-red-700 hover:text-red-900 underline underline-offset-2"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-sand-400 bg-cream-50 p-6 shadow-lg">
            <h3 className="font-display text-lg text-forest-900">
              Confirm Delete Product
            </h3>
            <p className="mt-2 text-sm text-charcoal-700">
              Are you sure you want to delete{" "}
              <strong className="text-forest-950">"{productToDelete.name}"</strong>?
              This action removes the product from the catalog and cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <SecondaryButton
                type="button"
                disabled={deleteLoading}
                onClick={() => setProductToDelete(null)}
              >
                Cancel
              </SecondaryButton>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDelete}
                className="bg-red-700 text-white px-4 py-2 text-sm font-medium hover:bg-red-800 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting…" : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
