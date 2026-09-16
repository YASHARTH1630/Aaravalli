import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { submitBuyerEnquiry, validateBuyerEnquiry } from "../services/enquiryService";
import { useProducts } from "../hooks/useProducts";
import { PrimaryButton, SecondaryButton } from "./ui";

const emptyForm = {
  fullName: "",
  organisation: "",
  email: "",
  phone: "",
  location: "",
  product: "",
  quantity: "",
  requirementType: "One-time",
  procurementTimeline: "",
  deliveryLocation: "",
  message: "",
};

function Field({ label, htmlFor, required, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-charcoal-900">
        {label}
        {required && <span className="text-gold-600"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full border border-sand-400 bg-cream-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-500/60 focus:border-forest-700";

export default function BuyerEnquiryForm() {
  const [searchParams] = useSearchParams();
  const prefilledProduct = searchParams.get("product") || "";

  const { products } = useProducts();
  const [form, setForm] = useState({ ...emptyForm, product: prefilledProduct });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | offline | error
  const [errors, setErrors] = useState({});
  const [serverErrorMessage, setServerErrorMessage] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear field-specific error upon editing
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerErrorMessage("");

    const validation = validateBuyerEnquiry(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setStatus("submitting");

    const result = await submitBuyerEnquiry(form);

    if (result.success) {
      setStatus("success");
      setForm(emptyForm);
      setErrors({});
    } else if (result.isDbOffline) {
      setStatus("offline");
    } else if (result.isValidationError) {
      setStatus("idle");
      setServerErrorMessage(result.message);
    } else {
      setStatus("error");
      setServerErrorMessage(
        result.message ||
          "Something went wrong while submitting your enquiry. Please try again, or contact us directly."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="border border-forest-700 bg-forest-800/5 p-8 text-center md:p-12">
        <h3 className="font-display text-2xl text-forest-900">Thank you — your enquiry has been received</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal-700">
          A member of our team will review your requirement and get in touch with you
          directly. For urgent requirements, you're welcome to reach us using the
          contact details on our Contact page.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setForm(emptyForm);
          }}
          className="mt-6 text-sm font-medium text-forest-800 underline underline-offset-4"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {status === "offline" && (
        <div className="border border-gold-500/80 bg-gold-50/60 p-6 md:p-7">
          <h4 className="font-display text-lg text-forest-900">Enquiry System Notice</h4>
          <p className="mt-2 text-sm leading-relaxed text-charcoal-800">
            Thank you for your interest. Our enquiry system is temporarily unavailable. Please contact us directly through the contact details provided.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <PrimaryButton as={Link} to="/contact" className="text-sm">
              View Direct Contact Details
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => setStatus("idle")} className="text-sm">
              Return to Form
            </SecondaryButton>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Full name" htmlFor="fullName" required>
          <input
            id="fullName"
            className={inputClass}
            value={form.fullName}
            disabled={status === "submitting"}
            onChange={(e) => update("fullName", e.target.value)}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-700">{errors.fullName}</p>}
        </Field>

        <Field label="Organisation name" htmlFor="organisation" required>
          <input
            id="organisation"
            className={inputClass}
            value={form.organisation}
            disabled={status === "submitting"}
            onChange={(e) => update("organisation", e.target.value)}
          />
          {errors.organisation && <p className="mt-1 text-xs text-red-700">{errors.organisation}</p>}
        </Field>

        <Field label="Email" htmlFor="email" required>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={form.email}
            disabled={status === "submitting"}
            onChange={(e) => update("email", e.target.value)}
          />
          {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
        </Field>

        <Field label="Phone number" htmlFor="phone" required>
          <input
            id="phone"
            type="tel"
            className={inputClass}
            value={form.phone}
            disabled={status === "submitting"}
            onChange={(e) => update("phone", e.target.value)}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
        </Field>

        <Field label="Location" htmlFor="location">
          <input
            id="location"
            className={inputClass}
            placeholder="City, state / country"
            value={form.location}
            disabled={status === "submitting"}
            onChange={(e) => update("location", e.target.value)}
          />
        </Field>

        <Field label="Product interested in" htmlFor="product" required>
          <input
            id="product"
            list="product-options"
            className={inputClass}
            value={form.product}
            disabled={status === "submitting"}
            onChange={(e) => update("product", e.target.value)}
          />
          <datalist id="product-options">
            {products.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
          {errors.product && <p className="mt-1 text-xs text-red-700">{errors.product}</p>}
        </Field>

        <Field label="Expected quantity" htmlFor="quantity">
          <input
            id="quantity"
            className={inputClass}
            placeholder="e.g. 200 kg / month"
            value={form.quantity}
            disabled={status === "submitting"}
            onChange={(e) => update("quantity", e.target.value)}
          />
        </Field>

        <Field label="Purchase requirement" htmlFor="requirementType">
          <select
            id="requirementType"
            className={inputClass}
            value={form.requirementType}
            disabled={status === "submitting"}
            onChange={(e) => update("requirementType", e.target.value)}
          >
            <option>One-time</option>
            <option>Seasonal</option>
            <option>Regular / Recurring</option>
          </select>
        </Field>

        <Field label="Expected procurement timeline" htmlFor="procurementTimeline">
          <input
            id="procurementTimeline"
            className={inputClass}
            placeholder="e.g. Immediate, Within 15-30 days, Next harvest"
            value={form.procurementTimeline}
            disabled={status === "submitting"}
            onChange={(e) => update("procurementTimeline", e.target.value)}
          />
        </Field>

        <Field label="Preferred delivery location" htmlFor="deliveryLocation">
          <input
            id="deliveryLocation"
            className={inputClass}
            placeholder="e.g. Ahmedabad, Mumbai, or Farm Gate pick-up"
            value={form.deliveryLocation}
            disabled={status === "submitting"}
            onChange={(e) => update("deliveryLocation", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Message / requirement" htmlFor="message">
        <textarea
          id="message"
          rows={5}
          className={inputClass}
          placeholder="Tell us a bit about your requirement, timelines, or anything else that would help us respond well."
          value={form.message}
          disabled={status === "submitting"}
          onChange={(e) => update("message", e.target.value)}
        />
      </Field>

      {status === "error" && (
        <p className="text-sm text-red-700">
          {serverErrorMessage ||
            "Something went wrong while submitting your enquiry. Please try again, or contact us directly using the details on our Contact page."}
        </p>
      )}

      {serverErrorMessage && status !== "error" && status !== "offline" && (
        <p className="text-sm text-red-700">{serverErrorMessage}</p>
      )}

      <PrimaryButton type="submit" disabled={status === "submitting"} className="w-full md:w-auto">
        {status === "submitting" ? "Submitting…" : "Submit Business Enquiry"}
      </PrimaryButton>
    </form>
  );
}
