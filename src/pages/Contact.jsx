import { useState } from "react";
import { Container, Eyebrow, PrimaryButton } from "../components/ui";
import { submitEnquiry } from "../lib/enquiries";

const inputClass =
  "w-full border border-sand-400 bg-cream-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-500/60 focus:border-forest-700";

function ContactDetail({ label, value, href }) {
  return (
    <div className="border-t border-cream-100/15 py-4 first:border-t-0">
      <p className="text-xs text-cream-100/60">{label}</p>
      {href ? (
        <a href={href} className="mt-1 block text-base text-cream-50 hover:text-gold-500">
          {value}
        </a>
      ) : (
        <p className="mt-1 text-base text-cream-50">{value}</p>
      )}
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus("submitting");
    try {
      await submitEnquiry({ ...form, type: "general-contact" });
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <section className="border-b border-sand-400/50 bg-forest-900">
        <Container className="py-20 md:py-24">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="font-display mt-3 max-w-2xl text-4xl leading-tight text-cream-50 md:text-5xl">
            Get in touch
          </h1>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container className="grid gap-14 md:grid-cols-[1fr_1.3fr]">
          <div className="bg-forest-900 p-8 text-cream-50 md:p-10">
            <h2 className="font-display text-xl">Contact details</h2>
            <p className="mt-1 text-xs text-cream-100/60">
              Real contact details to be added — shown as placeholders below.
            </p>
            <div className="mt-4">
              <ContactDetail label="Location" value="Aravalli region, Gujarat — [full address placeholder]" />
              <ContactDetail label="Email" value="[email address placeholder]" href="mailto:info@example.org" />
              <ContactDetail label="Phone" value="[phone number placeholder]" />
              <ContactDetail label="WhatsApp" value="[WhatsApp number placeholder]" />
            </div>
            <a
              href="https://wa.me/000000000000"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 border border-gold-500 px-5 py-2.5 text-sm font-medium text-gold-500 transition-colors hover:bg-gold-500 hover:text-forest-950"
            >
              Message us on WhatsApp
            </a>
          </div>

          <div>
            <h2 className="font-display text-2xl text-forest-900">Send us a message</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-charcoal-700">
              For bulk or business sourcing requirements, please use our{" "}
              <a href="/buyer-enquiry" className="text-forest-800 underline underline-offset-4">
                Buyer / Bulk Enquiry form
              </a>{" "}
              instead — it captures the details we need to respond well.
            </p>

            {status === "success" ? (
              <div className="mt-8 border border-forest-700 bg-forest-800/5 p-6">
                <p className="text-sm text-forest-900">
                  Thank you — your message has been received. We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-charcoal-900">Name</label>
                  <input
                    id="name"
                    className={`${inputClass} mt-1.5`}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="c-email" className="block text-sm font-medium text-charcoal-900">Email</label>
                  <input
                    id="c-email"
                    type="email"
                    className={`${inputClass} mt-1.5`}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="c-message" className="block text-sm font-medium text-charcoal-900">Message</label>
                  <textarea
                    id="c-message"
                    rows={5}
                    className={`${inputClass} mt-1.5`}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <PrimaryButton type="submit" disabled={status === "submitting"}>
                  {status === "submitting" ? "Sending…" : "Send message"}
                </PrimaryButton>
              </form>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
