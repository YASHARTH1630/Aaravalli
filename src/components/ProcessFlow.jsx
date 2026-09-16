// Renders a sequence of stages connected by arrows. Used for the
// "how value moves from producers to markets" story on the Home page
// and in full detail on the How We Work page.
export default function ProcessFlow({ stages, variant = "light" }) {
  const isDark = variant === "dark";
  return (
    <ol className="grid gap-0 md:grid-cols-[repeat(var(--n),1fr)]" style={{ "--n": stages.length }}>
      {stages.map((stage, i) => (
        <li key={stage.title} className="relative flex flex-col">
          <div className="flex items-center">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${
                isDark
                  ? "border-gold-500/60 text-gold-500"
                  : "border-forest-700 text-forest-800"
              }`}
            >
              {i + 1}
            </div>
            {i < stages.length - 1 && (
              <div
                className={`hidden h-px flex-1 md:block ${isDark ? "bg-gold-500/30" : "bg-forest-700/25"}`}
              />
            )}
          </div>
          <div className="mt-4 pr-4 md:pr-8">
            <h3 className={`font-display text-lg ${isDark ? "text-cream-50" : "text-forest-900"}`}>
              {stage.title}
            </h3>
            {stage.description && (
              <p className={`mt-1.5 text-sm leading-relaxed ${isDark ? "text-cream-100/70" : "text-charcoal-700"}`}>
                {stage.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
