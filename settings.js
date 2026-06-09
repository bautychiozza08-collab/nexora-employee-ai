const fields = {
  name: document.getElementById("businessName"),
  type: document.getElementById("businessType"),
  services: document.getElementById("businessServices"),
  prices: document.getElementById("businessPrices"),
  hours: document.getElementById("businessHours"),
  whatsapp: document.getElementById("businessWhatsapp"),
  tone: document.getElementById("businessTone")
};

function getBusiness() {
  return JSON.parse(localStorage.getItem("nexoraBusiness")) || {};
}

function saveBusiness(event) {
  event.preventDefault();

  const business = {
    name: fields.name.value.trim(),
    type: fields.type.value.trim(),
    services: fields.services.value.trim(),
    prices: fields.prices.value.trim(),
    hours: fields.hours.value.trim(),
    whatsapp: fields.whatsapp.value.trim(),
    tone: fields.tone.value
  };

  localStorage.setItem("nexoraBusiness", JSON.stringify(business));

console.log("GUARDADO:", business);

updatePreview();

  alert("Negocio guardado ✅");
}

function loadBusiness() {
  const business = getBusiness();

  fields.name.value = business.name || "";
  fields.type.value = business.type || "";
  fields.services.value = business.services || "";
  fields.prices.value = business.prices || "";
  fields.hours.value = business.hours || "";
  fields.whatsapp.value = business.whatsapp || "";
  fields.tone.value = business.tone || "cercano";

  updatePreview();
}

function updatePreview() {
  const business = {
    name: fields.name.value.trim(),
    type: fields.type.value.trim(),
    services: fields.services.value.trim(),
    prices: fields.prices.value.trim(),
    hours: fields.hours.value.trim(),
    tone: fields.tone.value
  };

  document.getElementById("previewName").textContent =
    business.name || "Tu negocio";

  document.getElementById("previewType").textContent =
    business.type || "Rubro todavía no configurado.";

  let toneText = "cercano y amable";

  if (business.tone === "profesional") toneText = "profesional";
  if (business.tone === "vendedor") toneText = "vendedor y directo";
  if (business.tone === "premium") toneText = "premium y elegante";

  document.getElementById("previewText").textContent =
    `Hola 👋 Soy el empleado IA de ${business.name || "tu negocio"}. ` +
    `Puedo responder con un tono ${toneText}. ` +
    `${business.services ? "Conozco estos servicios: " + business.services + ". " : ""}` +
    `${business.prices ? "También puedo informar estos precios: " + business.prices + ". " : ""}` +
    `${business.hours ? "El horario de atención es: " + business.hours + "." : ""}`;
}

Object.values(fields).forEach(field => {
  field.addEventListener("input", updatePreview);
});

loadBusiness();