import { Link } from "react-router-dom";
import { Container, Eyebrow, PrimaryButton } from "../components/ui";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

export default function Products() {
  const { products } = useProducts();

  return (
    <>
      <section className="border-b border-sand-400/50 bg-forest-900">
        <Container className="py-20 md:py-24">
          <Eyebrow>Our products</Eyebrow>
          <h1 className="font-display mt-3 max-w-2xl text-4xl leading-tight text-cream-50 md:text-5xl">
            Local produce, processed and prepared for business supply
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-100/80 md:text-lg">
            Our catalogue is growing alongside our processing capability. Every
            product below is available on an enquiry basis — reach out and our
            team will confirm current availability, packaging and quantities for
            your requirement.
          </p>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-sand-400/50 bg-cream-100">
        <Container className="flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <div>
            <h2 className="font-display text-2xl text-forest-900 md:text-3xl">
              Looking for a product not listed here?
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-charcoal-700 md:text-base">
              We're steadily expanding what we can source and process. Let us know
              your requirement and we'll tell you honestly what we can support.
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
