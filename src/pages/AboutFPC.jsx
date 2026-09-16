import { Link } from "react-router-dom";
import { Container, SectionHeading, ImagePlaceholder, Eyebrow, PrimaryButton } from "../components/ui";

const roles = [
  {
    title: "Farmers",
    body: "Connect and aggregate as a group, gaining collective bargaining strength that individual producers typically don't have on their own.",
  },
  {
    title: "Women",
    body: "Participate directly in processing and value addition, building enterprise skills alongside agricultural ones.",
  },
  {
    title: "Local products",
    body: "Reach markets more effectively through consistent aggregation, processing and quality practices.",
  },
  {
    title: "Producers, collectively",
    body: "Move from individual, informal selling toward organised, collective market access under one FPC structure.",
  },
];

export default function AboutFPC() {
  return (
    <>
      <section className="border-b border-sand-400/50 bg-forest-900">
        <Container className="grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <Eyebrow>About the FPC</Eyebrow>
            <h1 className="font-display mt-3 text-4xl leading-tight text-cream-50 md:text-5xl">
              A collective platform for producers and processors
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-cream-100/80 md:text-lg">
              Aravalli Aadivasi Mahila Grih Udyog FPC is a farmer producer company
              that helps local farmers and women capture greater value from
              agricultural and locally available resources — through aggregation,
              processing, value addition and market linkage.
            </p>
          </div>
          <ImagePlaceholder
            label="Photograph placeholder — FPC members / processing unit"
            className="aspect-[4/3] w-full border-cream-100/20 bg-forest-800 text-cream-100/70"
          />
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="What the FPC does"
            title="One structure, four connected roles"
            lede="The FPC brings farmers, women processors, local products and market access together under a single, professionally run structure."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {roles.map((r, i) => (
              <div key={r.title} className="border-t border-forest-800 pt-5">
                <span className="text-sm text-gold-600">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display mt-1 text-xl text-forest-900">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-700">{r.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-sand-400/50 bg-cream-100">
        <Container className="grid gap-10 py-20 md:grid-cols-[1.3fr_1fr] md:items-center md:py-24">
          <div>
            <h2 className="font-display text-2xl text-forest-900 md:text-3xl">
              Built for long-term commercial sustainability
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-charcoal-700">
              Our approach is grounded in professionalism and consistency —
              aggregating supply reliably, maintaining quality practices, and
              building relationships with buyers that can grow over time.
            </p>
          </div>
          <PrimaryButton as={Link} to="/how-we-work" className="md:justify-self-end">
            See how we work
          </PrimaryButton>
        </Container>
      </section>
    </>
  );
}
