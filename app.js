const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");

let conversation = [];
let userName = "Cliente nuevo";

let conversationState = {
  servicio: null,
  fecha: null,
  whatsapp: null
};

function getBusiness() {
  return JSON.parse(localStorage.getItem("nexoraBusiness")) || {};
}

function scrollToChat() {
  document.getElementById("chat-section").scrollIntoView({ behavior: "smooth" });
}

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}-message`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateWelcomeMessage() {
  const business = getBusiness();
  const welcomeMessage = document.getElementById("welcomeMessage");

  if (!welcomeMessage) return;

  welcomeMessage.textContent = business.name
    ? `Hola 👋 Soy el empleado IA de ${business.name}. Puedo ayudarte con precios, servicios, horarios o contacto. ¿Qué necesitás?`
    : "Hola 👋 Soy el empleado IA de Nexora. ¿Cómo te llamás?";
}

function getLeads() {
  return JSON.parse(localStorage.getItem("nexoraLeads")) || [];
}

function saveLead(lead) {
  const leads = getLeads();

  const existingIndex = leads.findIndex(
    item => item.name === lead.name && item.need === lead.need
  );

  if (existingIndex !== -1) {
    leads[existingIndex] = {
      ...leads[existingIndex],
      ...lead,
      date: leads[existingIndex].date || new Date().toLocaleString()
    };
  } else {
    leads.unshift({
      ...lead,
      date: new Date().toLocaleString()
    });
  }

  localStorage.setItem("nexoraLeads", JSON.stringify(leads));

  showLeadNotification?.(lead);
  showVipLead?.(lead);
}

function showVipLead(lead) {

  if (lead.score < 95) return;

  const vipAlert =
    document.getElementById("vipLeadAlert");

  const vipText =
    document.getElementById("vipLeadText");

  if (!vipAlert) return;

  vipText.textContent =
    `${lead.name} llegó con score ${lead.score}/100`;

  vipAlert.classList.add("show");

  setTimeout(() => {

    vipAlert.classList.remove("show");

  }, 5000);
}

function detectName(message) {
  if (message.toLowerCase().includes("soy ")) {
    userName = message.split(/soy /i)[1] || userName;
  }

  if (message.toLowerCase().includes("me llamo ")) {
    userName = message.split(/me llamo /i)[1] || userName;
  }

  userName = userName.trim().slice(0, 24);
}

function calculateScore(message, status) {
  const text = message.toLowerCase();
  let score = 25;

  if (text.includes("necesito")) score += 20;
  if (text.includes("quiero")) score += 15;
  if (text.includes("precio") || text.includes("cuánto") || text.includes("cuanto") || text.includes("sale")) score += 10;
  if (text.includes("restaurante") || text.includes("barber") || text.includes("tienda")) score += 20;
  if (text.includes("turnos") || text.includes("reservas") || text.includes("menú") || text.includes("menu")) score += 15;
  if (status === "caliente") score += 15;
  if (status === "tibio") score += 5;

  return Math.min(score, 99);
}

function getAiSummaryByScore(score) {
  if (score >= 85) return "La IA detectó intención muy alta. Conviene responder rápido y ofrecer una demo personalizada.";
  if (score >= 65) return "La IA detectó interés real. Conviene pedir más detalles y enviar ejemplos relacionados.";
  return "La IA detectó una consulta inicial. Todavía falta conocer mejor la necesidad del cliente.";
}

function analyzeLead(message) {
  const text = message.toLowerCase();
  let need = "";
  let summary = "";
  let status = "frio";

  if (conversationState.servicio && conversationState.fecha && conversationState.whatsapp) {
    need = `Turno para ${conversationState.servicio}`;
    summary = `Quiere reservar ${conversationState.servicio} para ${conversationState.fecha}. WhatsApp: ${conversationState.whatsapp}.`;
    status = "caliente";
  } else if (text.includes("barber") || text.includes("peluquer")) {
    need = "Sistema para barbería";
    summary = "Está interesado en una web o sistema de turnos para barbería/peluquería.";
    status = "caliente";
  } else if (text.includes("restaurante") || text.includes("menu") || text.includes("menú") || text.includes("comida")) {
    need = "Menú digital / sistema para restaurante";
    summary = "Quiere una solución para restaurante, menú digital, pedidos o presencia online.";
    status = "caliente";
  } else if (text.includes("tienda") || text.includes("ropa") || text.includes("productos") || text.includes("catalogo") || text.includes("catálogo")) {
    need = "Catálogo online / tienda";
    summary = "Quiere mostrar productos, recibir pedidos o vender online.";
    status = "tibio";
  } else if (text.includes("web") || text.includes("pagina") || text.includes("página") || text.includes("sitio")) {
    need = "Página web";
    summary = "Está consultando por una página web o presencia online para su negocio.";
    status = "tibio";
  } else if (text.includes("precio") || text.includes("cuanto") || text.includes("cuánto") || text.includes("sale") || text.includes("costo")) {
    need = "Consulta de precios";
    summary = "Pidió información sobre precios.";
    status = "frio";
  } else {
    return null;
  }

  const score = calculateScore(message, status);

let phone = "";

const phoneMatch = message.match(/\d{8,15}/);

if (phoneMatch) {
  phone = phoneMatch[0];
}

  return {
    name: userName,
    need,
    summary,
    status,
    score,
    aiSummary: getAiSummaryByScore(score)
  };
}

function createLeadIfNeeded(message) {
  const lead = analyzeLead(message);
  if (!lead) return;

  const leads = getLeads();
  const alreadyExists = leads.some(item => item.name === lead.name && item.need === lead.need);

  if (!alreadyExists) saveLead(lead);
}

function getToneText(tone) {
  if (tone === "profesional") return "profesional";
  if (tone === "vendedor") return "vendedor y directo";
  if (tone === "premium") return "premium y elegante";
  return "cercano y amable";
}

function looksLikePhone(text) {
  const onlyNumbers = text.replace(/\D/g, "");
  return onlyNumbers.length >= 8;
}

function detectService(text, business) {
  const servicesText = (business.services || "").toLowerCase();

  if (text.includes("corte") || servicesText.includes("corte")) return "corte";
  if (text.includes("barba") || servicesText.includes("barba")) return "barba";
  if (text.includes("tinte") || servicesText.includes("tinte")) return "tinte";
  if (text.includes("color") || servicesText.includes("color")) return "color";

  return text;
}

function detectDay(text) {
  const days = ["lunes", "martes", "miércoles", "miercoles", "jueves", "viernes", "sábado", "sabado", "domingo"];
  return days.find(day => text.includes(day)) || null;
}

function generateConversationMemoryResponse(message) {
  const business = getBusiness();
  const businessName = business.name || "el negocio";
  const text = message.toLowerCase();

  if (text.includes("turno") || text.includes("reservar") || text.includes("reserva")) {
    return `Perfecto 👌 ¿Para qué servicio querés reservar en ${businessName}?`;
  }

  const service = detectService(text, business);
  const serviceKeywords = ["corte", "barba", "tinte", "color"];

  if (!conversationState.servicio && serviceKeywords.some(word => text.includes(word))) {
    conversationState.servicio = service;
    return `Excelente. ¿Qué día te gustaría para ${conversationState.servicio}?`;
  }

  const day = detectDay(text);

  if (conversationState.servicio && !conversationState.fecha && day) {
    conversationState.fecha = day;
    return `Perfecto. Tengo anotado ${conversationState.servicio} para el ${conversationState.fecha}. ¿Me dejás tu WhatsApp para confirmar?`;
  }

  if (conversationState.servicio && conversationState.fecha && !conversationState.whatsapp && looksLikePhone(text)) {
  const phone = message.replace(/\D/g, "");
  conversationState.whatsapp = phone;

  saveLead({
    name: userName,
    need: `Turno para ${conversationState.servicio}`,
    summary: `Quiere reservar ${conversationState.servicio} para ${conversationState.fecha}. WhatsApp: ${phone}.`,
    status: "caliente",
    score: 98,
    phone: phone,
    aiSummary: "La IA detectó una solicitud completa con servicio, día y WhatsApp. Lead listo para contactar."
  });

    return `✅ Solicitud registrada

Servicio: ${conversationState.servicio}
Día: ${conversationState.fecha}
WhatsApp: ${conversationState.whatsapp}

En breve te van a contactar para confirmar el turno.`;
  }

  return null;
}

function playLeadSound() {
  const audio = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
  );

  audio.volume = 0.35;
  audio.play().catch(() => {});
if (lead && lead.score >= 95)
  audio.volume = 1;
}

function showLeadNotification(lead) {
  if (lead.status !== "caliente") return;

  const toast = document.getElementById("leadToast");
  if (!toast) return;

  toast.textContent = `🔔 Nuevo lead caliente detectado: ${lead.name} · Score ${lead.score}/100`;
  toast.classList.add("show");

  playLeadSound();

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

function generateBusinessMemoryResponse(message) {
  const business = getBusiness();
  const text = message.toLowerCase();

  if (!business.name) return null;

  const businessName = business.name;
  const services = business.services || "servicios todavía no cargados";
  const prices = business.prices || "";
  const hours = business.hours || "";
  const whatsapp = business.whatsapp || "";
  const tone = getToneText(business.tone);

  const memoryResponse = generateConversationMemoryResponse(message);
  if (memoryResponse) return memoryResponse;

  if (text.includes("hola") || text.includes("buenas") || text.includes("buen día") || text.includes("buen dia")) {
    return `Hola 👋 Soy el empleado IA de ${businessName}. Puedo ayudarte con servicios, precios, horarios o contacto. ¿Qué necesitás?`;
  }

  if (text.includes("precio") || text.includes("precios") || text.includes("cuánto") || text.includes("cuanto") || text.includes("sale") || text.includes("costo") || text.includes("vale")) {
    if (prices) {
      return `Hola 👋 En ${businessName}, estos son nuestros precios: ${prices}. También ofrecemos: ${services}. ¿Querés que te ayude a elegir una opción?`;
    }
    return `Hola 👋 En ${businessName} todavía no tengo precios cargados, pero puedo tomar tu consulta.`;
  }

  if (text.includes("servicio") || text.includes("servicios") || text.includes("hacen") || text.includes("ofrecen") || text.includes("tienen")) {
    return `En ${businessName} ofrecemos: ${services}. Te respondo con un tono ${tone}. ¿Sobre cuál servicio querés consultar?`;
  }

  if (text.includes("horario") || text.includes("abren") || text.includes("atienden") || text.includes("cerrado") || text.includes("abierto")) {
    if (hours) return `En ${businessName} atendemos en estos horarios: ${hours}. ¿Querés que te ayude a coordinar una consulta?`;
    return `Todavía no tengo los horarios cargados de ${businessName}, pero puedo tomar tu consulta.`;
  }

  if (text.includes("whatsapp") || text.includes("contacto") || text.includes("teléfono") || text.includes("telefono")) {
    if (whatsapp) return `Podés contactar a ${businessName} por WhatsApp acá: ${whatsapp}.`;
    return `Todavía no tengo un WhatsApp cargado para ${businessName}.`;
  }

  return `Entiendo 👍 Soy el empleado IA de ${businessName}. Puedo ayudarte con servicios, precios, horarios o contacto. También sé que ofrecemos: ${services}. ¿Qué querés saber?`;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  detectName(message);

  conversation.push({
    role: "user",
    content: message
  });

  const loadingMessage = document.createElement("div");
  loadingMessage.className = "message bot-message";
  loadingMessage.textContent = "Pensando...";
  chatMessages.appendChild(loadingMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  let response = "";

  try {
    const aiRes = await fetch("https://nexora-employee-ai.vercel.app/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
    body: JSON.stringify({
  message: message,
  business: getBusiness(),
  conversation: conversation.slice(-8)
})
    });

    const data = await aiRes.json();

    response =
      data.reply ||
      generateBusinessMemoryResponse(message) ||
      "Entiendo 👍 Contame un poco más.";

  } catch (error) {
    response =
      generateBusinessMemoryResponse(message) ||
      "Entiendo 👍 Contame un poco más.";
  }

  loadingMessage.remove();

  addMessage(response, "bot");

  conversation.push({
    role: "assistant",
    content: response
  });

  createLeadIfNeeded(message);
}
userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") sendMessage();
});

updateWelcomeMessage();