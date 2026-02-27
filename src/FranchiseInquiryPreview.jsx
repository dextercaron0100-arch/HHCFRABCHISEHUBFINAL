import { useState } from "react";

const inquiryApiUrl =
  import.meta.env.VITE_INQUIRY_API_URL || "http://localhost:5000/api/inquiry";

export default function FranchiseInquiryPreview() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus("");

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch(inquiryApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to send inquiry.");
      }

      const leadText = data.leadId ? ` Reference: ${data.leadId}.` : "";
      const autoReplyText = data.autoReplySent
        ? " A confirmation email was sent to your email address."
        : "";
      setStatus(`Inquiry sent successfully.${leadText}${autoReplyText}`);
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error.message || "Something went wrong while sending your inquiry.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-6 md:p-10 flex items-center justify-center">
      <section className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-br from-[#2b0703] via-[#1f0603] to-[#3a0b05] p-5 md:p-8 shadow-2xl">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="pt-1">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">
              Talk to the Team
            </p>

            <h2 className="max-w-[15ch] text-3xl font-bold leading-tight text-[#f8f3eb] md:text-4xl">
              Discuss Your <span className="text-amber-300">Boss Siomai</span> Franchise Plan
            </h2>

            <p className="mt-4 max-w-[48ch] text-sm leading-7 text-[#d4c4b4] md:text-base">
              Share your preferred location, budget range, and target launch date. Our team
              will help you choose the right stall package and rollout plan for your area.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {["Package Matching", "Location Assessment", "Budget Planning"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-amber-200/15 bg-white/5 px-3 py-2 text-xs md:text-sm text-[#f3e8db] backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="index.html#franchises"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-4 text-sm font-semibold text-[#23160f] shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
              >
                View All Franchises
              </a>
              <a
                href="#package"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-amber-300/35 bg-white/5 px-4 text-sm font-semibold text-[#f8f3eb] transition hover:bg-white/10"
              >
                Compare Packages
              </a>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-amber-300/25 bg-white/[0.03] p-4 md:p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#f8f3eb]">Send an Inquiry</h3>
                <p className="mt-1 text-sm text-[#d4c4b4]">We usually reply within 1 business day.</p>
              </div>

              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="inquiry-name" className="mb-1.5 block text-xs font-medium text-[#f3e8db]">
                      Name
                    </label>
                    <input
                      id="inquiry-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Juan Dela Cruz"
                      className="h-11 w-full rounded-xl border border-transparent bg-[#efe6d8] px-3 text-sm text-[#3a2418] outline-none ring-0 placeholder:text-[#8f7c6e] focus:border-amber-300 focus:shadow-[0_0_0_3px_rgba(247,197,106,0.18)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="inquiry-phone" className="mb-1.5 block text-xs font-medium text-[#f3e8db]">
                      Phone
                    </label>
                    <input
                      id="inquiry-phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+63 9XX XXX XXXX"
                      className="h-11 w-full rounded-xl border border-transparent bg-[#efe6d8] px-3 text-sm text-[#3a2418] outline-none ring-0 placeholder:text-[#8f7c6e] focus:border-amber-300 focus:shadow-[0_0_0_3px_rgba(247,197,106,0.18)]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="inquiry-email" className="mb-1.5 block text-xs font-medium text-[#f3e8db]">
                    Email (optional)
                  </label>
                  <input
                    id="inquiry-email"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    className="h-11 w-full rounded-xl border border-transparent bg-[#efe6d8] px-3 text-sm text-[#3a2418] outline-none ring-0 placeholder:text-[#8f7c6e] focus:border-amber-300 focus:shadow-[0_0_0_3px_rgba(247,197,106,0.18)]"
                  />
                </div>

                <div>
                  <label htmlFor="inquiry-comment" className="mb-1.5 block text-xs font-medium text-[#f3e8db]">
                    Comment
                  </label>
                  <textarea
                    id="inquiry-comment"
                    name="comment"
                    rows={5}
                    required
                    placeholder="Tell us your target city, budget range, and preferred package..."
                    className="w-full rounded-xl border border-transparent bg-[#efe6d8] px-3 py-2.5 text-sm text-[#3a2418] outline-none ring-0 placeholder:text-[#8f7c6e] focus:border-amber-300 focus:shadow-[0_0_0_3px_rgba(247,197,106,0.18)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-1 h-12 w-full rounded-full border border-amber-300/50 bg-gradient-to-b from-[#8f2a08] to-[#6f1d06] text-sm font-semibold text-[#fff7eb] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {sending ? "Sending..." : "Send Inquiry"}
                </button>

                {status && (
                  <p className="px-1 text-center text-[11px] leading-4 text-[#f1e0cd]">
                    {status}
                  </p>
                )}

                <p className="px-1 text-center text-[11px] leading-4 text-[#f1e0cd]/80">
                  By sending this form, you agree to the processing of your personal data.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
