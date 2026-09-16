import { Link } from "react-router-dom";
import { Container } from "./ui";

export default function Footer() {
  return (
    <footer className="border-t border-forest-800 bg-forest-900 text-cream-100">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <span className="font-display text-lg">Aravalli Aadivasi Mahila Grih Udyog FPC</span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream-100/70">
            A farmer producer company connecting Aravalli's local resources and
            producer communities with sustainable market opportunities.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gold-500">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-cream-100/80">
            <li><Link to="/about-aravalli" className="hover:text-cream-50">About Aravalli</Link></li>
            <li><Link to="/about-fpc" className="hover:text-cream-50">About the FPC</Link></li>
            <li><Link to="/products" className="hover:text-cream-50">Our Products</Link></li>
            <li><Link to="/how-we-work" className="hover:text-cream-50">How We Work</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-gold-500">Business</p>
          <ul className="mt-3 space-y-2 text-sm text-cream-100/80">
            <li><Link to="/why-partner" className="hover:text-cream-50">Why Partner With Us</Link></li>
            <li><Link to="/buyer-enquiry" className="hover:text-cream-50">Buyer / Bulk Enquiry</Link></li>
            <li><Link to="/contact" className="hover:text-cream-50">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-gold-500">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-cream-100/80">
            <li>Aravalli region, Gujarat <span className="text-cream-100/50">(location placeholder)</span></li>
            <li>[Email address placeholder]</li>
            <li>[Phone / WhatsApp placeholder]</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-cream-100/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-cream-100/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Aravalli Aadivasi Mahila Grih Udyog FPC. All rights reserved.</p>
          <p>Farmer Producer Company · Aravalli region, Gujarat</p>
        </Container>
      </div>
    </footer>
  );
}
