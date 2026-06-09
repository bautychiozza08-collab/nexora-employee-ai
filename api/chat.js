export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  const { message, business } = req.body;

  try {
    const prompt = `
Sos el empleado virtual de este negocio:

Nombre: ${business.name}
Servicios: ${business.services}
Precios: ${business.prices}
Horarios: ${business.hours}
WhatsApp: ${business.whatsapp}
Tono: ${business.tone}

Cliente:
${message}

Respondé como un empleado humano real.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
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