export default function handler(_req, res) {
  const liveChatUrl = String(
    process.env.HHF_LIVE_CHAT_URL || process.env.LIVE_CHAT_URL || ""
  )
    .trim()
    .replace(/\/+$/, "");

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  res.status(200).json({
    ok: true,
    liveChatUrl: liveChatUrl || null,
  });
}