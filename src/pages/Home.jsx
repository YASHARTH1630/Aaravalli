import { Link } from "react-router-dom";
import { Container, SectionHeading, PrimaryButton, SecondaryButton, ImagePlaceholder, Eyebrow } from "../components/ui";
import ProcessFlow from "../components/ProcessFlow";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

const journeyStages = [
  { title: "Aravalli region", description: "Agricultural land and forest resources across the Aravalli belt of Gujarat." },
  { title: "Local farmers & women", description: "Producer communities with established skills and a willingness to build livelihoods." },
  { title: "Local resources", description: "Turmeric, ginger, jamun and other regionally grown or gathered produce." },
  { title: "FPC aggregation & value addition", description: "Produce is pooled, cleaned, processed and prepared for market." },
  { title: "Quality products", description: "Consistent, market-ready products in bulk and business quantities." },
  { title: "Market connections", description: "Reliable supply relationships with buyers, retailers and institutions." },
];

const whyPoints = [
  "Direct connection with local producers",
  "Collective supply through the FPC",
  "Value-added local products",
  "Women-led processing and enterprise participation",
];

export default function Home() {
  const { products } = useProducts();

  return (
    <>
      {/* Hero */}
      <section className="texture-veil border-b border-sand-400/50 bg-forest-900">
        <Container className="grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <Eyebrow>Aravalli Aadivasi Mahila Grih Udyog FPC</Eyebrow>
            <h1 className="font-display mt-3 text-4xl leading-[1.1] text-cream-50 md:text-5xl">
              From Aravalli's local resources to meaningful markets
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-cream-100/80 md:text-lg">
              We are a farmer producer company working with local farmers and women
              across the Aravalli region of Gujarat — aggregating agricultural and
              forest resources, adding value through processing, and building
              reliable supply relationships with buyers, retailers and institutions.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <PrimaryButton as={Link} to="/buyer-enquiry" className="bg-gold-500 text-forest-950 hover:bg-gold-600">
                Submit a Business Enquiry
              </PrimaryButton>
              <SecondaryButton as={Link} to="/products" className="border-cream-100/40 text-cream-50 hover:bg-cream-50 hover:text-forest-900">
                View our products
              </SecondaryButton>
            </div>
          </div>
          <ImagePlaceholder
            label="Hero photograph placeholder — Aravalli landscape / producers at work"
            className="aspect-[4/3] w-full border-cream-100/20 bg-forest-800 text-cream-100/70"
          />
        </Container>
      </section>

      {/* Region → Market narrative */}
      <section className="py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="How local potential becomes market value"
            title="A region with real capability, and a market access gap worth closing"
            lede="Aravalli has agricultural land, forest resources and a skilled, willing workforce. What producers most need is a dependable way to reach markets. The FPC exists to close that gap."
          />
          <div className="mt-14 overflow-x-auto">
            <div className="min-w-[900px] md:min-w-0">
              <ProcessFlow stages={journeyStages} />
            </div>
          </div>
        </Container>
      </section>

      {/* About FPC snapshot */}
      <section className="border-y border-sand-400/50 bg-cream-100">
        <Container className="grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-24">
          <ImagePlaceholder
            label="Photograph placeholder — women's processing unit"
            className="aspect-[4/3] w-full order-last md:order-first"
          />
          <div>
            <SectionHeading
              eyebrow="About the FPC"
              title="A collective platform for producers and processors"
              lede="The FPC helps local farmers and women capture greater value from agricultural and locally available resources through aggregation, processing, value addition and market linkage — moving from individual selling toward collective, professional market access."
            />
            <SecondaryButton as={Link} to="/about-fpc" className="mt-8">
              More about the FPC
            </SecondaryButton>
          </div>
        </Container>
      </section>

      {/* Product highlights */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Our products"
              title="A growing catalogue of local produce and value-added products"
              lede="Products are aggregated and processed to consistent quality standards, with more added as our capability grows."
            />
            <SecondaryButton as={Link} to="/products">
              View full catalogue
            </SecondaryButton>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* Why partner condensed */}
      <section className="bg-forest-900">
        <Container className="py-20 md:py-24">
          <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-start">
            <div>
              <Eyebrow>Why partner with us</Eyebrow>
              <h2 className="font-display mt-2 text-3xl leading-tight text-cream-50 md:text-4xl">
                Built for long-term sourcing relationships
              </h2>
              <SecondaryButton
                as={Link}
                to="/why-partner"
                className="mt-8 border-cream-100/40 text-cream-50 hover:bg-cream-50 hover:text-forest-900"
              >
                See all reasons to partner
              </SecondaryButton>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2">
              {whyPoints.map((point) => (
                <li key={point} className="border-l-2 border-gold-500 pl-4 text-cream-100/85">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="py-20 md:py-24">
        <Container className="flex flex-col items-start gap-6 border border-sand-400 bg-cream-100 p-10 md:flex-row md:items-center md:justify-between md:p-14">
          <div>
            <h2 className="font-display text-2xl text-forest-900 md:text-3xl">
              Exploring a sourcing or partnership opportunity?
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-charcoal-700 md:text-base">
              Tell us about your requirement and our team will get back to you
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
