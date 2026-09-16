export function Container({ className = "", children }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }) {
  return (
    <p className="text-sm font-medium tracking-wide text-gold-600">
      {children}
    </p>
  );
}

export function SectionHeading({ eyebrow, title, lede, align = "left" }) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignClass}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-display mt-2 text-3xl leading-tight text-forest-900 md:text-4xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-4 text-base leading-relaxed text-charcoal-700 md:text-lg">
          {lede}
        </p>
      )}
    </div>
  );
}

export function PrimaryButton({ as: As = "button", className = "", children, ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 rounded-sm bg-forest-800 px-6 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-forest-700 ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export function SecondaryButton({ as: As = "button", className = "", children, ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 rounded-sm border border-forest-800 px-6 py-3 text-sm font-medium text-forest-800 transition-colors hover:bg-forest-800 hover:text-cream-50 ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

// A simple, editorial placeholder for imagery that hasn't been supplied yet.
// Swap the parent element's background/children for a real <img> once
// photography is available — search for PLACEHOLDER_IMAGE to find these.
export function ImagePlaceholder({ label, className = "" }) {
  return (
    <div
      className={`flex items-center justify-center border border-sand-400/60 bg-sand-300/40 text-center ${className}`}
    >
      <span className="px-4 text-xs font-medium text-charcoal-500">
        {label || "Image placeholder"}
      </span>
    </div>
  );
}
