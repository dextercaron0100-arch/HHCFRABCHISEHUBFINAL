const normalizeBaseUrl = (value = "") => value.toString().trim().replace(/\/+$/, "");

const safeJsonParse = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }

  const backendBaseUrl = normalizeBaseUrl(
    process.env.INQUIRY_BACKEND_URL || process.env.BACKEND_URL || ""
  );

  if (!backendBaseUrl) {
    return res.status(500).json({
      ok: false,
      message:
        "Inquiry API is not configured. Set INQUIRY_BACKEND_URL in your Vercel project settings.",
    });
  }

  const upstreamUrl = `${backendBaseUrl}/api/inquiry`;
  const payload = safeJsonParse(req.body) || req.body || {};

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = upstreamResponse.headers.get("content-type") || "";
    const rawBody = await upstreamResponse.text();

    res.status(upstreamResponse.status);

    if (contentType.includes("application/json")) {
      res.setHeader("Content-Type", "application/json");
      return res.send(rawBody || "{}");
    }

    return res.json({
      ok: upstreamResponse.ok,
      message: rawBody || "Inquiry request failed.",
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      message: "Unable to reach inquiry backend.",
      detail: error?.message || "Unknown proxy error",
    });
  }
}
