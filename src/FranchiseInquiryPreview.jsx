import { useState } from "react";

const inquiryApiUrl = import.meta.env.VITE_INQUIRY_API_URL || "/api/inquiry";

export default function InquirySectionPreview() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus("");
    setError(false);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    if (!payload.comment && payload.message) {
      payload.comment = payload.message;
    }
    const launchTimeline = (payload.target_launch || "").toString().trim();
    if (launchTimeline) {
      payload.comment = `${payload.comment || ""}\nTarget launch: ${launchTimeline}`.trim();
    }
    payload.source = "Boss Siomai Inquiry Section";
    payload.franchise_interest = "Boss Siomai";

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
    } catch (err) {
      setError(true);
      setStatus(err.message || "Something went wrong while sending your inquiry.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 md:p-10">
      <section className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <div className="relative p-8 md:p-12 lg:p-14 bg-slate-900 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_45%)]" />
            <div className="relative">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-amber-400">
                Talk to the team
              </p>

              <h2 className="mt-4 text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                Plan Your <span className="text-amber-400">Boss Siomai</span>
                <br className="hidden sm:block" /> Franchise Setup
              </h2>

              <p className="mt-5 max-w-xl text-sm md:text-base leading-7 text-slate-300">
                Share your target location, budget range, and launch timeline. Our
                team will recommend the best package and rollout plan for your area.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  ["Package Matching", "Get the right setup for your budget and goals."],
                  ["Location Review", "Assess visibility, foot traffic, and fit."],
                  ["Budget Guidance", "Compare startup cost and estimated payback."],
                  ["Fast Response", "Expect a reply within 1 business day."],
                ].map(([title, desc]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="index.html#franchises"
                  className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow hover:brightness-95 transition"
                >
                  View Packages
                </a>
                <a
                  href="#master-franchise"
                  className="rounded-xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white hover:bg-white/5 transition"
                >
                  Compare Options
                </a>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 lg:p-12 bg-white">
            <div className="mx-auto max-w-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  Send an Inquiry
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  We usually reply within 1 business day.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <input
                      type="text"
                      name="name"
                      placeholder="Juan Dela Cruz"
                      className={inputClass}
                      required
                    />
                  </Field>

                  <Field label="Phone">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+63 9XX XXX XXXX"
                      className={inputClass}
                      required
                    />
                  </Field>
                </div>

                <Field label="Email (optional)">
                  <input
                    type="email"
                    name="email"
                    placeholder="you@email.com"
                    className={inputClass}
                  />
                </Field>

                <Field label="Preferred Location">
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g., Caloocan / Quezon City"
                    className={inputClass}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Budget Range">
                    <select className={inputClass} name="budget" defaultValue="">
                      <option value="" disabled>
                        Select budget
                      </option>
                      <option>₱4,999 (Reseller Package)</option>
                      <option>₱39,999 (Food Cart Package)</option>
                      <option>₱65,000 (Bike Cart Package)</option>
                      <option>₱99,000 (Kiosk Package)</option>
                      <option>₱100,000+ (Multiple Units / Expansion)</option>
                    </select>
                  </Field>

                  <Field label="Target Launch">
                    <select className={inputClass} name="target_launch" defaultValue="">
                      <option value="" disabled>
                        Select timeline
                      </option>
                      <option>Within 30 days</option>
                      <option>1–3 months</option>
                      <option>3–6 months</option>
                    </select>
                  </Field>
                </div>

                <Field label="Comment">
                  <textarea
                    rows={5}
                    name="comment"
                    placeholder="Tell us your target city, budget, and preferred package..."
                    className={`${inputClass} resize-none`}
                    required
                  />
                </Field>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send Inquiry"}
                </button>

                {status ? (
                  <p
                    className={`text-center text-xs leading-5 ${
                      error ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {status}
                  </p>
                ) : null}

                <p className="text-center text-xs leading-5 text-slate-500">
                  By sending this form, you agree to the processing of your personal
                  data.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100";
