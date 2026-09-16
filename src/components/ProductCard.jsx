import { Link } from "react-router-dom";
import { ImagePlaceholder } from "./ui";

export default function ProductCard({ product }) {
  return (
    <article className="group flex flex-col border border-sand-400/60 bg-cream-100/60">
      <ImagePlaceholder label={`${product.name} — photo placeholder`} className="aspect-[4/3] w-full" />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-forest-900">{product.name}</h3>
          <span className="mt-1 whitespace-nowrap text-xs font-medium text-gold-600">
            {product.availabilityLabel}
          </span>
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-charcoal-700">
          {product.description}
        </p>

        <dl className="mt-5 space-y-2 border-t border-sand-400/60 pt-4 text-sm">
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-charcoal-500">Available form</dt>
            <dd className="text-charcoal-900">{product.forms.join(", ")}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-charcoal-500">Packaging</dt>
            <dd className="text-charcoal-900">{product.packaging}</dd>
          </div>
        </dl>

        <Link
          to={`/buyer-enquiry?product=${encodeURIComponent(product.name)}`}
          className="mt-6 inline-flex items-center justify-center border border-forest-800 px-5 py-2.5 text-sm font-medium text-forest-800 transition-colors hover:bg-forest-800 hover:text-cream-50"
        >
          Enquire now
        </Link>
      </div>
    </article>
  );
}
