const leadsList = document.getElementById("leadsList");

function getLeads() {
  return JSON.parse(localStorage.getItem("nexoraLeads")) || [];
}

function saveLeads(leads) {
  localStorage.setItem("nexoraLeads", JSON.stringify(leads));
}

function getLeadScore(lead) {
  if (lead.score) return lead.score;

  if (lead.status === "caliente") return 92;
  if (lead.status === "tibio") return 68;
  return 35;
}

function getAiSummary(lead) {
  if (lead.aiSummary) return lead.aiSummary;

  if (lead.status === "caliente") {
    return "La IA detectó intención clara de compra. Conviene responder rápido y ofrecer una demo personalizada.";
  }

  if (lead.status === "tibio") {
    return "La IA detectó interés medio. Conviene hacer seguimiento y pedir más información sobre el negocio.";
  }

  return "La IA detectó una consulta inicial. Todavía falta conocer mejor la necesidad del cliente.";
}

function renderTopLead(leads) {
  const topLeadName = document.getElementById("topLeadName");
  const topLeadNeed = document.getElementById("topLeadNeed");
  const topLeadScore = document.getElementById("topLeadScore");

  if (!leads || leads.length === 0) {
    topLeadName.textContent = "Sin leads todavía";
    topLeadNeed.textContent = "Cuando entre un lead fuerte, aparecerá acá.";
    topLeadScore.textContent = "0/100";
    return;
  }

  const topLead = leads.reduce((best, current) => {
    return getLeadScore(current) > getLeadScore(best) ? current : best;
  });

  topLeadName.textContent = topLead.name;
  topLeadNeed.textContent = topLead.need;
  topLeadScore.textContent = `${getLeadScore(topLead)}/100`;
}

function renderLeads() {
  const leads = getLeads();
  renderTopLead(leads);

  document.getElementById("totalLeads").textContent = leads.length;
  document.getElementById("hotLeads").textContent =
    leads.filter(lead => lead.status === "caliente").length;
  document.getElementById("warmLeads").textContent =
    leads.filter(lead => lead.status === "tibio").length;
  document.getElementById("coldLeads").textContent =
    leads.filter(lead => lead.status === "frio").length;

  leadsList.innerHTML = "";

  if (leads.length === 0) {
    leadsList.innerHTML = `
      <div class="empty-leads">
        Todavía no hay leads. Probá hablar con el chat o tocá “+ Lead demo”.
      </div>
    `;
    return;
  }

  leads.forEach(lead => {
    const score = getLeadScore(lead);
    const aiSummary = getAiSummary(lead);

    const card = document.createElement("div");
    card.className = "lead-card lead-card-pro";

    card.innerHTML = `
      <div>
        <div class="lead-name">${lead.name}</div>
        <div class="lead-need">${lead.need}</div>
        <div class="lead-date">${lead.date || "Sin fecha"}</div>
      </div>

      <div>
        <div class="lead-summary">${lead.summary}</div>

        <div class="ai-summary">
          <span>Resumen IA</span>
          <p>${aiSummary}</p>
        </div>
      </div>

      <div class="lead-right">
        <div class="score-box">
          <span>Lead Score</span>
          <strong>${score}/100</strong>
          <div class="score-bar">
            <div class="score-fill" style="width: ${score}%"></div>
          </div>
        </div>

${
  lead.phone
    ? `
      <a
        class="whatsapp-btn"
        target="_blank"
        href="https://wa.me/${lead.phone}?text=Hola%20${lead.name}%20👋%20Vi%20tu%20consulta%20y%20quiero%20ayudarte."
      >
        📱 WhatsApp
      </a>
    `
    : ""
}

        <div class="lead-status status-${lead.status}">
          ${getStatusLabel(lead.status)}
        </div>
      </div>
    `;

    leadsList.appendChild(card);
  });
}


function getStatusLabel(status) {
  if (status === "caliente") return "🟢 Caliente";
  if (status === "tibio") return "🟡 Tibio";
  return "🔵 Frío";
}

function renderEmployeeStatus() {

  const business =
    JSON.parse(localStorage.getItem("nexoraBusiness")) || {};

  const services =
    business.services
      ? business.services.split(/[,+]/).filter(x => x.trim() !== "")
      : [];

  const prices =
    business.prices
      ? business.prices.split(/[,+]/).filter(x => x.trim() !== "")
      : [];

  let level = 0;

  if (business.name) level += 20;
  if (business.type) level += 20;
  if (business.services) level += 20;
  if (business.prices) level += 20;
  if (business.hours) level += 10;
  if (business.whatsapp) level += 10;

  const employeeBusiness =
    document.getElementById("employeeBusiness");

  const servicesCount =
    document.getElementById("servicesCount");

  const pricesCount =
    document.getElementById("pricesCount");

  const trainingLevel =
    document.getElementById("trainingLevel");

  const employeeState =
    document.getElementById("employeeState");

  const employeeStatusText =
    document.getElementById("employeeStatusText");

  if (
    !employeeBusiness ||
    !servicesCount ||
    !pricesCount ||
    !trainingLevel ||
    !employeeState ||
    !employeeStatusText
  ) {
    return;
  }

  employeeBusiness.textContent =
    business.name || "Sin negocio configurado";

  servicesCount.textContent =
    services.length;

  pricesCount.textContent =
    prices.length;

  trainingLevel.textContent =
    `${level}%`;

  if (level >= 80) {

    employeeState.textContent =
      "🟢 Activo";

    employeeStatusText.textContent =
      "Tu empleado IA está listo para atender clientes.";

  } else if (level >= 50) {

    employeeState.textContent =
      "🟡 Entrenando";

    employeeStatusText.textContent =
      "Todavía faltan algunos datos para mejorar las respuestas.";

  } else {

    employeeState.textContent =
      "🔴 Inactivo";

    employeeStatusText.textContent =
      "Completá la configuración para activar el empleado IA.";
  }
}

function createDemoLead() {
  const demoLeads = [
    {
      name: "Restaurante El Patio",
      need: "Menú digital con QR",
      summary: "Quiere recibir pedidos online y mostrar platos desde un QR.",
      status: "caliente",
      score: 94,
      aiSummary: "Cliente con intención alta. Ya tiene una necesidad clara y el servicio encaja perfecto con un plan para restaurantes."
    },
    {
      name: "Barbería Black Cut",
      need: "Sistema de turnos",
      summary: "Busca organizar reservas y responder consultas por WhatsApp.",
      status: "caliente",
      score: 91,
      aiSummary: "Lead muy fuerte. El negocio tiene un problema concreto: ordenar turnos y reducir mensajes repetidos."
    },
    {
      name: "Perfumería Aroma",
      need: "Catálogo online",
      summary: "Le interesa mostrar productos y recibir pedidos por mensaje.",
      status: "tibio",
      score: 72,
      aiSummary: "Hay interés, pero todavía falta confirmar presupuesto, cantidad de productos y urgencia del proyecto."
    },
    {
      name: "Consulta general",
      need: "Información de precios",
      summary: "Pidió información pero todavía no explicó su negocio.",
      status: "frio",
      score: 38,
      aiSummary: "Consulta inicial. Conviene preguntar qué tipo de negocio tiene y qué problema quiere resolver."
    }
  ];

function renderEmployeeStatus() {
  const business = JSON.parse(localStorage.getItem("nexoraBusiness")) || {};

  const services = business.services
    ? business.services.split(/[,+]/).filter(x => x.trim() !== "")
    : [];

  const prices = business.prices
    ? business.prices.split(/[,+]/).filter(x => x.trim() !== "")
    : [];

  let level = 0;

  if (business.name) level += 20;
  if (business.type) level += 20;
  if (business.services) level += 20;
  if (business.prices) level += 20;
  if (business.hours) level += 10;
  if (business.whatsapp) level += 10;

  document.getElementById("employeeBusiness").textContent =
    business.name || "Sin negocio configurado";

  document.getElementById("servicesCount").textContent = services.length;
  document.getElementById("pricesCount").textContent = prices.length;
  document.getElementById("trainingLevel").textContent = `${level}%`;

  if (level >= 80) {
    document.getElementById("employeeState").textContent = "🟢 Activo";
    document.getElementById("employeeStatusText").textContent =
      "Tu empleado IA está listo para atender clientes.";
  } else if (level >= 50) {
    document.getElementById("employeeState").textContent = "🟡 Entrenando";
    document.getElementById("employeeStatusText").textContent =
      "Todavía faltan algunos datos para mejorar las respuestas.";
  } else {
    document.getElementById("employeeState").textContent = "🔴 Inactivo";
    document.getElementById("employeeStatusText").textContent =
      "Completá la configuración para activar el empleado IA.";
  }
}

  const leads = getLeads();
  const randomLead = demoLeads[Math.floor(Math.random() * demoLeads.length)];

  leads.unshift({
    ...randomLead,
    date: new Date().toLocaleString()
  });

  saveLeads(leads);
  renderLeads();
}

function clearLeads() {
  localStorage.removeItem("nexoraLeads");
  renderLeads();
}

renderEmployeeStatus();
renderLeads();