# Aravalli Aadivasi Mahila Grih Udyog FPC — Website (Phase 1 / MVP)

A professional, B2B-facing website for the FPC, built with React, React Router
and Tailwind CSS (v4).

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

Requires Node.js 18+.

## Project structure

```
src/
  components/       Reusable UI: Navbar, Footer, Layout, ProcessFlow,
                     ProductCard, BuyerEnquiryForm, ui.jsx (small primitives)
  pages/             One file per route (Home, AboutAravalli, AboutFPC,
                     Products, HowWeWork, WhyPartner, BuyerEnquiry, Contact)
  data/
    products.js      Product catalogue — edit this file to add, remove or
                      change products. No component code needs to change.
  lib/
    enquiries.js      Enquiry submission logic. Currently stores submissions
                      in the browser's localStorage; see the comments in
                      this file for drop-in examples of connecting it to
                      Google Sheets, a REST API / MongoDB backend, a CRM,
                      or email.
  App.jsx             Route definitions
  index.css           Tailwind import + design tokens (colours, fonts)
```

## Adding or editing products

Open `src/data/products.js` and add a new object to the `products` array:

```js
{
  id: "unique-id",
  name: "Product name",
  category: "Spices", // or "Value-added", etc.
  description: "One or two sentences.",
  forms: ["Whole", "Powder"],
  availability: "seasonal", // or "year-round"
  availabilityLabel: "Seasonal Product", // shown on the card
  packaging: "Packaging options available on enquiry",
  image: null, // see below
}
```

The product catalogue page and the homepage's product highlights both read
from this file automatically.

## Replacing image placeholders

Every image on the site is currently an `ImagePlaceholder` component (see
`src/components/ui.jsx`) rather than a real photo, so the site can be
reviewed and deployed before photography is ready. To replace one:

1. Add the real image file to `src/assets/` (create subfolders as useful,
   e.g. `src/assets/products/turmeric.jpg`).
2. Import it and swap the `ImagePlaceholder` for a standard `<img>` tag with
   the same `className` for sizing, e.g.:

   ```jsx
   import turmericImg from "../assets/products/turmeric.jpg";
   // ...
   <img src={turmericImg} alt="Turmeric" className="aspect-[4/3] w-full object-cover" />
   ```

## Connecting the enquiry form to a real backend

Buyer enquiries (from the Buyer / Bulk Enquiry page) and general contact
messages both go through `submitEnquiry()` in `src/lib/enquiries.js`. Right
now this saves submissions to `localStorage` so the form is fully functional
without any backend. To connect a real destination (Google Sheets, a REST
API backed by MongoDB, a CRM, or email), replace the body of
`submitEnquiry()` — the function's signature (takes a plain object, returns
a Promise) is designed so nothing in the form components needs to change.
Commented examples for each option are included directly in that file.

## Colours & type

Defined as design tokens in `src/index.css` under `@theme`:

- `forest-*` — deep forest green (primary brand colour)
- `cream-*` / `sand-*` — warm, neutral backgrounds
- `gold-*` — muted gold accent, used sparingly for emphasis
- Display type: **Fraunces** (headings) · Body type: **Inter**

## Notes on content

All contact details, addresses and phone/WhatsApp numbers on the site are
clearly marked placeholders (e.g. "[phone number placeholder]") and should
be replaced with real information before launch. No prices, inventory
figures, certifications or statistics have been invented — product cards
intentionally use availability language ("Available on Enquiry", "Seasonal
Product", "Bulk Supply Enquiry") instead.

## Next steps beyond Phase 1 (not built here, by design)

- Real backend for enquiry storage/notification (see `lib/enquiries.js`)
- Real photography throughout
- CMS or simple admin flow for updating products without touching code
- Analytics
