import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Container, PrimaryButton } from "./ui";

const links = [
  { to: "/about-aravalli", label: "About Aravalli" },
  { to: "/about-fpc", label: "About the FPC" },
  { to: "/products", label: "Our Products" },
  { to: "/how-we-work", label: "How We Work" },
  { to: "/why-partner", label: "Why Partner With Us" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sand-400/50 bg-cream-50/95 backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-4">

        <Link 
          to="/" 
          className="flex shrink-0 items-center gap-3" 
          onClick={() => setOpen(false)}
        >
          <svg 
            width="30" 
            height="30" 
            viewBox="0 0 32 32" 
            aria-hidden="true" 
            className="shrink-0"
          >
            <rect width="32" height="32" rx="4" fill="#16281f" />
            <path d="M16 6 C 10 12, 10 20, 16 26 C 22 20, 22 12, 16 6 Z" fill="#b0873a" />
          </svg>

          <span className="font-display text-sm leading-tight text-forest-900 md:text-base">
            Aravalli Aadivasi Mahila
            <br className="hidden sm:block" /> 
            Grih Udyog FPC
          </span>
        </Link>


        <nav className="hidden items-center gap-3.5 lg:flex xl:gap-5 2xl:gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `inline-flex items-center whitespace-nowrap text-sm py-1 transition-colors ${
                  isActive 
                  ? "text-forest-900 font-medium" 
                  : "text-charcoal-700 hover:text-forest-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>


        <div className="hidden lg:flex items-center gap-2.5 shrink-0 ml-4 xl:ml-6">

          <PrimaryButton as={Link} to="/buyer-enquiry" className="px-4 py-2 text-sm whitespace-nowrap">
            Submit Business Enquiry
          </PrimaryButton>

          <Link
            to="/admin/login"
            className="inline-flex items-center whitespace-nowrap rounded-sm border border-forest-900 px-3.5 py-2 text-sm font-medium text-forest-900 transition-colors hover:bg-forest-900 hover:text-cream-50"
          >
            Admin Login
          </Link>

        </div>


        <button
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span 
            className={`h-px w-6 bg-forest-900 transition-transform ${
              open ? "translate-y-2 rotate-45" : ""
            }`} 
          />

          <span 
            className={`h-px w-6 bg-forest-900 transition-opacity ${
              open ? "opacity-0" : ""
            }`} 
          />

          <span 
            className={`h-px w-6 bg-forest-900 transition-transform ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`} 
          />

        </button>

      </Container>


      {open && (
        <div className="border-t border-sand-400/50 bg-cream-50 lg:hidden">

          <Container className="flex flex-col gap-1 py-4">

            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-sm px-3 py-2 text-sm ${
                    isActive 
                    ? "bg-sand-300/50 text-forest-900 font-medium" 
                    : "text-charcoal-700"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}


            <PrimaryButton 
              as={Link} 
              to="/buyer-enquiry" 
              className="mt-3 w-full justify-center py-2.5 text-sm" 
              onClick={() => setOpen(false)}
            >
              Submit Business Enquiry
            </PrimaryButton>


            <Link
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-full items-center justify-center rounded-sm border border-forest-900 px-4 py-2.5 text-sm font-medium text-forest-900 transition-colors hover:bg-forest-900 hover:text-cream-50"
            >
              Admin Login
            </Link>


          </Container>

        </div>
      )}

    </header>
  );
}