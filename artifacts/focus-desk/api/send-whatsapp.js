export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const { phone, apikey, message } = req.body || {};

  if (!phone || !apikey || !message) {
    res.status(400).json({ ok: false, error: "phone, apikey, and message are required" });
    return;
  }

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apikey)}`;

  try {
    await fetch(url);
  } catch (_) {
    // CallMeBot failed but we still return ok to the client
  }

  res.json({ ok: true, message: "Message sent" });
}
