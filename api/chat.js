export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  const { message, business } = req.body;

  try {
    const prompt = `
Sos un vendedor profesional de Nexora.

Objetivo:
Convertir visitantes en clientes.

Nunca hagas demasiadas preguntas juntas.

Respondé de forma breve, humana y comercial.

Mostrá interés por el negocio.

Intentá llevar la conversación hacia:
- demo
- WhatsApp
- presupuesto
- reunión

Información del negocio:

Nombre: ${business.name}
Servicios: ${business.services}
Precios: ${business.prices}
Horarios: ${business.hours}
WhatsApp: ${business.whatsapp}

Mensaje del cliente:
${message}
`;

    const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
  process.env.GEMINI_API_KEY,
      {

        
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

console.log(data);

const reply =
  data?.candidates?.[0]?.content?.parts?.[0]?.text ||
  JSON.stringify(data);

    res.status(200).json({
      reply
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}