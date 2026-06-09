export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { message, business } = req.body;

    const prompt = `
Sos un empleado virtual de este negocio.

NEGOCIO:
${business?.name || "No definido"}

RUBRO:
${business?.type || "No definido"}

SERVICIOS:
${business?.services || "No definidos"}

PRECIOS:
${business?.prices || "No definidos"}

HORARIOS:
${business?.hours || "No definidos"}

WHATSAPP:
${business?.whatsapp || "No definido"}

TONO:
${business?.tone || "cercano"}

Reglas:
- Respondé como empleado del negocio.
- No digas que sos ChatGPT.
- Sé breve, claro y vendedor.
- Si el cliente muestra interés, intentá pedir WhatsApp.
- Si pide turno, guiá la reserva.

Cliente:
${message}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Perdón, no pude responder ahora.";

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Error conectando con Gemini" });
  }
}