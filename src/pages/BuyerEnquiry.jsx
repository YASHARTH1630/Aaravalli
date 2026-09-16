import { Container, Eyebrow } from "../components/ui";
import BuyerEnquiryForm from "../components/BuyerEnquiryForm";

export default function BuyerEnquiry() {
  return (
    <>
      <section className="border-b border-sand-400/50 bg-forest-900">
        <Container className="py-20 md:py-24">
          <Eyebrow>Buyer / bulk enquiry</Eyebrow>
          <h1 className="font-display mt-3 max-w-2xl text-4xl leading-tight text-cream-50 md:text-5xl">
            Tell us about your requirement
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-100/80 md:text-lg">
            Whether you're exploring a one-time order, seasonal sourcing or a
            regular supply relationship, share the details below and our team
            will respond directly.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container className="max-w-3xl">
          <BuyerEnquiryForm />
        </Container>
      </section>
    </>
  );
}
