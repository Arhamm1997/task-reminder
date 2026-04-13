import { Router } from "express";

const router = Router();

router.post("/send-whatsapp", async (req, res) => {
  const { phone, apikey, message } = req.body as {
    phone?: string;
    apikey?: string;
    message?: string;
  };

  if (!phone || !apikey || !message) {
    res.status(400).json({ ok: false, error: "phone, apikey, and message are required" });
    return;
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apikey)}`;
    const response = await fetch(url);
    const text = await response.text();
    req.log.info({ status: response.status }, "CallMeBot response");
    res.json({ ok: response.ok, status: response.status, body: text });
  } catch (err) {
    req.log.error({ err }, "WhatsApp send failed");
    res.status(500).json({ ok: false, error: "Failed to contact CallMeBot API" });
  }
});

export default router;
