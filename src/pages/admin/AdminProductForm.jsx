import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import adminProductService from "../../services/adminProductService.js";
import { PrimaryButton, SecondaryButton } from "../../components/ui.jsx";

const AVAILABILITY_OPTIONS = [
  "Available on Enquiry",
  "Seasonal Product",
  "Bulk Supply Enquiry",
  "Currently Unavailable",
];

const CATEGORY_SUGGESTIONS = [
  "Spices",
  "Value-added",
  "Forest Produce",
  "Agricultural Produce",
  "Herbal & Medicinal",
];

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Spices");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [availableForms, setAvailableForms] = useState([]);
  const [formInput, setFormInput] = useState("");
  const [packagingOptions, setPackagingOptions] = useState([]);
  const [packagingInput, setPackagingInput] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("Available on Enquiry");
  const [isPublished, setIsPublished] = useState(true);

  // Status & Error states
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Load product if editing
  useEffect(() => {
    if (!isEditing) return;

    async function loadProduct() {
      setInitialLoading(true);
      const result = await adminProductService.getProductById(id);
      if (result.success && result.product) {
        const p = result.product;
        setName(p.name || "");
        setCategory(p.category || "Spices");
        setDescription(p.description || "");
        setImage(p.image || "");
        setAvailableForms(Array.isArray(p.availableForms) ? p.availableForms : []);

        if (Array.isArray(p.packagingOptions)) {
          setPackagingOptions(p.packagingOptions);
        } else if (typeof p.packagingOptions === "string" && p.packagingOptions.trim()) {
          setPackagingOptions(
            p.packagingOptions.split(",").map((s) => s.trim()).filter(Boolean)
          );
        } else {
          setPackagingOptions([]);
        }

        setAvailabilityStatus(p.availabilityStatus || "Available on Enquiry");
        setIsPublished(p.isPublished !== undefined ? p.isPublished : true);
      } else {
        setErrorMessage(result.message || "Failed to load product details.");
      }
      setInitialLoading(false);
    }

    loadProduct();
  }, [id, isEditing]);

  // Form tag add/remove
  function handleAddForm(e) {
    if (e) e.preventDefault();
    const clean = formInput.trim();
    if (!clean) return;
    if (!availableForms.includes(clean)) {
      setAvailableForms([...availableForms, clean]);
    }
    setFormInput("");
  }

  function handleRemoveForm(indexToRemove) {
    setAvailableForms(availableForms.filter((_, idx) => idx !== indexToRemove));
  }

  // Packaging tag add/remove
  function handleAddPackaging(e) {
    if (e) e.preventDefault();
    const clean = packagingInput.trim();
    if (!clean) return;
    if (!packagingOptions.includes(clean)) {
      setPackagingOptions([...packagingOptions, clean]);
    }
    setPackagingInput("");
  }

  function handleRemovePackaging(indexToRemove) {
    setPackagingOptions(packagingOptions.filter((_, idx) => idx !== indexToRemove));
  }

  function validate() {
    const errors = {};
    if (!name.trim()) errors.name = "Product name is required.";
    if (!category.trim()) errors.category = "Category is required.";
    if (!description.trim()) errors.description = "Product description is required.";
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      image: image.trim() || null,
      availableForms,
      packagingOptions,
      availabilityStatus,
      isPublished,
    };

    let result;
    if (isEditing) {
      result = await adminProductService.updateProduct(id, payload);
    } else {
      result = await adminProductService.createProduct(payload);
    }

    if (result.success) {
      navigate("/admin/products");
    } else {
      setErrorMessage(
        result.message || "Failed to save product. Please verify form details."
      );
    }

    setSubmitting(false);
  }

  const inputClass =
    "w-full border border-sand-400 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-500/50 focus:border-forest-700 focus:outline-none";

  if (initialLoading) {
    return (
      <div className="border border-sand-400/60 bg-cream-50 p-12 text-center text-sm text-charcoal-600">
        Loading product information…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sand-400/50 pb-4">
        <div>
          <h1 className="font-display text-2xl text-forest-900">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="mt-1 text-xs text-charcoal-700">
            {isEditing
              ? "Update product details. Changes will automatically reflect on the public catalogue."
              : "Fill in the details below to add a new product to the FPC catalogue."}
          </p>
        </div>

        <Link
          to="/admin/products"
          className="text-xs font-medium text-forest-800 hover:text-forest-950 underline underline-offset-4"
        >
          ← Back to Products
        </Link>
      </div>

      {errorMessage && (
        <div className="border-l-4 border-red-600 bg-red-50 p-4 text-xs text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="border border-sand-400/60 bg-cream-50 p-6 md:p-8 space-y-6 shadow-sm">
        {/* Product Name */}
        <div>
          <label htmlFor="p-name" className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
            Product Name <span className="text-gold-600">*</span>
          </label>
          <input
            id="p-name"
            type="text"
            placeholder="e.g. Turmeric, Jamun Seed Powder"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} mt-1.5`}
          />
          {fieldErrors.name && (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="p-category" className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
            Category <span className="text-gold-600">*</span>
          </label>
          <div className="mt-1.5 flex flex-wrap gap-2 mb-2">
            {CATEGORY_SUGGESTIONS.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-2.5 py-1 border transition-colors ${
                  category === cat
                    ? "bg-forest-900 text-cream-50 border-forest-900 font-medium"
                    : "bg-white text-charcoal-700 border-sand-400 hover:bg-cream-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            id="p-category"
            type="text"
            placeholder="Or type custom category…"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          />
          {fieldErrors.category && (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.category}</p>
          )}
        </div>

        {/* Short Description */}
        <div>
          <label htmlFor="p-desc" className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
            Short Description <span className="text-gold-600">*</span>
          </label>
          <textarea
            id="p-desc"
            rows={4}
            placeholder="Brief overview of produce origin, quality, and processing for business buyers…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} mt-1.5`}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.description}</p>
          )}
        </div>

        {/* Available Forms - Non-technical Tag Builder */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
            Available Forms
          </label>
          <p className="text-xs text-charcoal-500 mt-0.5">
            e.g. Whole (dried finger), Powder, Fresh, Dried Slices
          </p>

          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Type a form (e.g. Whole, Powder) and click Add"
              value={formInput}
              onChange={(e) => setFormInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddForm();
                }
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleAddForm}
              className="bg-forest-800 px-4 py-2 text-xs font-medium text-cream-50 hover:bg-forest-900 transition-colors shrink-0"
            >
              + Add Form
            </button>
          </div>

          {availableForms.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 p-3 bg-white border border-sand-300">
              {availableForms.map((form, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-sand-200 text-charcoal-900 px-2.5 py-1 text-xs font-medium rounded"
                >
                  {form}
                  <button
                    type="button"
                    onClick={() => handleRemoveForm(idx)}
                    className="text-charcoal-500 hover:text-red-700 font-bold ml-1"
                    title="Remove form"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Packaging Options - Non-technical List Builder */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
            Packaging Options
          </label>
          <p className="text-xs text-charcoal-500 mt-0.5">
            e.g. 100g, 250g, 500g, Bulk Sacks (25kg), Bulk Supply Enquiry
          </p>

          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Type a packaging option (e.g. 25kg Sacks) and click Add"
              value={packagingInput}
              onChange={(e) => setPackagingInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPackaging();
                }
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleAddPackaging}
              className="bg-forest-800 px-4 py-2 text-xs font-medium text-cream-50 hover:bg-forest-900 transition-colors shrink-0"
            >
              + Add Packaging
            </button>
          </div>

          {packagingOptions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 p-3 bg-white border border-sand-300">
              {packagingOptions.map((pkg, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-sand-200 text-charcoal-900 px-2.5 py-1 text-xs font-medium rounded"
                >
                  {pkg}
                  <button
                    type="button"
                    onClick={() => handleRemovePackaging(idx)}
                    className="text-charcoal-500 hover:text-red-700 font-bold ml-1"
                    title="Remove packaging"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Availability Status */}
        <div>
          <label htmlFor="p-status" className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
            Availability Status
          </label>
          <select
            id="p-status"
            value={availabilityStatus}
            onChange={(e) => setAvailabilityStatus(e.target.value)}
            className={`${inputClass} mt-1.5`}
          >
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Product Image URL */}
        <div>
          <label htmlFor="p-image" className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
            Product Image URL (Optional)
          </label>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Leave blank to use the standard placeholder photography.
          </p>
          <input
            id="p-image"
            type="url"
            placeholder="https://example.com/photos/turmeric.jpg"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={`${inputClass} mt-1.5`}
          />

          {image && (
            <div className="mt-3">
              <p className="text-[11px] text-charcoal-600 mb-1">Image Preview:</p>
              <img
                src={image}
                alt="Product preview"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
                className="h-28 w-40 object-cover border border-sand-400 bg-white"
              />
            </div>
          )}
        </div>

        {/* Published Toggle */}
        <div className="border-t border-sand-400/40 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 text-forest-800 focus:ring-forest-700 border-sand-400 rounded"
            />
            <div>
              <span className="text-sm font-medium text-charcoal-900 block">
                Publish on public website
              </span>
              <span className="text-xs text-charcoal-500 block">
                When checked, this product will immediately be visible on the public product catalogue.
              </span>
            </div>
          </label>
        </div>

        {/* Form Actions */}
        <div className="border-t border-sand-400/40 pt-6 flex items-center justify-end gap-3">
          <SecondaryButton as={Link} to="/admin/products" type="button" disabled={submitting}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Saving Product…" : isEditing ? "Update Product" : "Save & Publish"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
