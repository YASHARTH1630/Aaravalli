import { Container, SectionHeading, ImagePlaceholder, Eyebrow } from "../components/ui";

const points = [
  {
    title: "Agricultural and natural resources",
    body: "The Aravalli region supports a range of agricultural produce and locally available natural resources, forming the raw material base for the FPC's work.",
  },
  {
    title: "Proximity to key markets",
    body: "The region sits within reach of significant cities and consumption markets in and around Gujarat, giving locally produced goods a realistic path to buyers.",
  },
  {
    title: "A skilled, willing community",
    body: "Farmers and women across the region bring existing agricultural skill and a genuine interest in exploring processing and enterprise-based livelihoods.",
  },
  {
    title: "An opportunity to build, not just supply",
    body: "The task ahead is converting local potential — land, produce and people — into sustainable, ongoing economic opportunity, rather than one-off transactions.",
  },
];

export default function AboutAravalli() {
  return (
    <>
      <section className="border-b border-sand-400/50 bg-forest-900">
        <Container className="py-20 md:py-24">
          <Eyebrow>About Aravalli</Eyebrow>
          <h1 className="font-display mt-3 max-w-2xl text-4xl leading-tight text-cream-50 md:text-5xl">
            A region built on land, skill and proximity to market
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-100/80 md:text-lg">
            The Aravalli region of Gujarat combines agricultural and natural
            resources with a community ready to build on them. Our work starts
            from that foundation.
          </p>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container>
          <div className="grid gap-16 md:grid-cols-2 md:items-start">
            <ImagePlaceholder
              label="Photograph placeholder — Aravalli landscape"
              className="aspect-[4/5] w-full md:sticky md:top-28"
            />
            <div className="space-y-12">
              {points.map((p) => (
                <div key={p.title}>
                  <h2 className="font-display text-2xl text-forest-900">{p.title}</h2>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-charcoal-700">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-sand-400/50 bg-cream-100">
        <Container className="py-16 md:py-20">
          <SectionHeading
            align="center"
            title="From local potential to sustainable economic opportunity"
            lede="Our focus is on converting what the region already has — resources, skill and market proximity — into consistent, dependable value for producers and buyers alike."
          />
        </Container>
      </section>
    </>
  );
}
