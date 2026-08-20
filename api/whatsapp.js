export default async function handler(req, res) {
  // Meta webhook verification
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send("Verification failed");
  }

  // Receive WhatsApp webhook events
  if (req.method === "POST") {
    try {
      const body = req.body;

      console.log("WhatsApp webhook received:", JSON.stringify(body));

      const message =
        body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      // Ignore webhook events that don't contain a message
      if (!message) {
        return res.status(200).send("EVENT_RECEIVED");
      }

      const from = message.from;
      const messageType = message.type;

      // Only automatically reply to text messages for now
      if (messageType !== "text") {
        return res.status(200).send("EVENT_RECEIVED");
      }

      const incomingText = message.text?.body || "";

      console.log("Message from:", from);
      console.log("Message:", incomingText);

      const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
      const PHONE_NUMBER_ID = "110461721819240";

      const response = await fetch(
        `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: {
              body:
                "नमस्कार! 🙏\nजयविक, संपूर्ण आरोग्य स्टोअरमध्ये आपले स्वागत आहे. 🌿\n\nआपल्या संदेशाबद्दल धन्यवाद!",
            },
          }),
        }
      );

      const result = await response.text();

      console.log("WhatsApp API response:", result);

      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(200).send("EVENT_RECEIVED");
    }
  }

  return res.status(405).send("Method Not Allowed");
}
