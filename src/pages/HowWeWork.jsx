import { Container, SectionHeading, Eyebrow, ImagePlaceholder } from "../components/ui";
import ProcessFlow from "../components/ProcessFlow";

const stages = [
  {
    title: "Local producers",
    description: "Farmers and gatherers across the Aravalli region grow and collect agricultural and forest produce.",
  },
  {
    title: "Aggregation",
    description: "The FPC pools produce from multiple producers, giving buyers a single, reliable point of supply.",
  },
  {
    title: "Processing & value addition",
    description: "Women-led processing units clean, process and convert raw produce into market-ready forms.",
  },
  {
    title: "Quality & packaging",
    description: "Products are checked and packed to standards suited to bulk and business buyers.",
  },
  {
    title: "Market access",
    description: "Finished products reach buyers, retailers, restaurants and institutions through the FPC.",
  },
];

export default function HowWeWork() {
  return (
    <>
      <section className="border-b border-sand-400/50 bg-forest-900">
        <Container className="py-20 md:py-24">
          <Eyebrow>How we work</Eyebrow>
          <h1 className="font-display mt-3 max-w-2xl text-4xl leading-tight text-cream-50 md:text-5xl">
            The bridge between local producers and markets
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-100/80 md:text-lg">
            The FPC's role is to make each step — from field to buyer — reliable,
            consistent and easy to work with.
          </p>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <div className="overflow-x-auto">
            <div className="min-w-[900px] md:min-w-0">
              <ProcessFlow stages={stages} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-sand-400/50 bg-cream-100">
        <Container className="grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <SectionHeading
              eyebrow="Why this matters for buyers"
              title="One point of contact, consistent supply"
              lede="Because the FPC aggregates across many producers and manages processing and packaging in-house, buyers deal with a single, accountable organisation rather than negotiating individually with many small producers."
            />
          </div>
          <ImagePlaceholder
            label="Photograph placeholder — aggregation / quality check"
            className="aspect-[4/3] w-full"
          />
        </Container>
      </section>
    </>
  );
}
