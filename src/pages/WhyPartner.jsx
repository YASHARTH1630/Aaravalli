import { Link } from "react-router-dom";
import { Container, Eyebrow, PrimaryButton } from "../components/ui";

const reasons = [
  {
    title: "Direct connection with local producers",
    body: "Work with the source — farmers and gatherers across the Aravalli region — through one organised point of contact.",
  },
  {
    title: "Collective supply through the FPC",
    body: "Aggregated volume from multiple producers, rather than fragmented small-lot sourcing.",
  },
  {
    title: "Value-added local products",
    body: "Produce that has already been cleaned, processed and prepared for business use, not raw unsorted material.",
  },
  {
    title: "Women-led processing and enterprise participation",
    body: "Processing and value addition carried out by women's units within the FPC's operations.",
  },
  {
    title: "Opportunity for long-term sourcing partnerships",
    body: "We are set up to build ongoing supply relationships, not one-off transactions.",
  },
  {
    title: "Growing capability for product development",
    body: "Our processing and product range is expanding — we're open to discussing new product requirements with serious buyers.",
  },
];

export default function WhyPartner() {
  return (
    <>
      <section className="border-b border-sand-400/50 bg-forest-900">
        <Container className="py-20 md:py-24">
          <Eyebrow>Why partner with us</Eyebrow>
          <h1 className="font-display mt-3 max-w-2xl text-4xl leading-tight text-cream-50 md:text-5xl">
            Reasons buyers work with the FPC
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-100/80 md:text-lg">
            We aim to be a dependable, professional supply partner — not a one-time
            transaction. Here's what that means in practice.
          </p>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container>
          <div className="grid gap-x-10 gap-y-14 md:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.title} className="border-t border-forest-800 pt-5">
                <h2 className="font-display text-xl text-forest-900 md:text-2xl">{r.title}</h2>
                <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-charcoal-700 md:text-base">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-sand-400/50 bg-cream-100">
        <Container className="flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <div>
            <h2 className="font-display text-2xl text-forest-900 md:text-3xl">
              Ready to explore a partnership?
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-charcoal-700 md:text-base">
              Tell us about your business and requirement, and we'll follow up
              directly.
            </p>
          </div>
          <PrimaryButton as={Link} to="/buyer-enquiry" className="shrink-0">
            Submit Business Enquiry
          </PrimaryButton>
        </Container>
      </section>
    </>
  );
}
