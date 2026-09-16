// Product catalogue data.
// To add a new product, add a new object to this array — no component
// changes are required. `image` should point to a file placed in
// /src/assets/products/ (or a full URL once real photography is ready).

export const products = [
  {
    id: "turmeric",
    name: "Turmeric",
    category: "Spices",
    description:
      "Turmeric grown by farmers in the Aravalli belt, cleaned and processed for whole and powdered supply.",
    forms: ["Whole (dried finger)", "Powder"],
    availability: "seasonal", // "seasonal" | "year-round"
    availabilityLabel: "Seasonal Product",
    packaging: "Packaging options available on enquiry (bulk sacks, bags)",
    image: null,
  },
  {
    id: "ginger",
    name: "Ginger",
    category: "Spices",
    description:
      "Fresh and dried ginger aggregated from local growers, suitable for kitchens, processors and distributors.",
    forms: ["Fresh", "Dried"],
    availability: "seasonal",
    availabilityLabel: "Seasonal Product",
    packaging: "Packaging options available on enquiry",
    image: null,
  },
  {
    id: "jamun",
    name: "Jamun-based Products",
    category: "Value-added",
    description:
      "Jamun (Indian blackberry) sourced from local trees, processed by our women's units into value-added forms.",
    forms: ["Pulp", "Powder / seed powder", "Preserves"],
    availability: "seasonal",
    availabilityLabel: "Seasonal Product",
    packaging: "Bulk Supply Enquiry",
    image: null,
  },
  {
    id: "other-value-added",
    name: "Other Value-Added Products",
    category: "Value-added",
    description:
      "We are steadily developing additional value-added products from local agricultural and forest resources. Reach out to discuss what you're looking for.",
    forms: ["Varies by product"],
    availability: "year-round",
    availabilityLabel: "Available on Enquiry",
    packaging: "Bulk Supply Enquiry",
    image: null,
  },
];
