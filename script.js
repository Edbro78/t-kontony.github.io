// Global app state
let __nextId = 1;
function genId() { return __nextId++; }

const AppState = {
  assets: [
    { id: genId(), name: "LIKVIDER", amount: 2000000, locked: true },
    { id: genId(), name: "FAST EIENDOM", amount: 15000000, locked: true },
    { id: genId(), name: "INVESTERINGER", amount: 8000000, locked: true }
  ],
  debts: [
    { id: genId(), name: "BOLIGLÅN", amount: 10000000, debtParams: { type: "Annuitetslån", years: 25, rate: 0.04 } }
  ],
  incomes: [
    { id: genId(), name: "LØNNSINNTEKT", amount: 1500000 },
    { id: genId(), name: "UTBYTTER", amount: 0 },
    { id: genId(), name: "ANDRE INNTEKTER", amount: 0 },
    { id: genId(), name: "ÅRLIG SKATT", amount: 0 },
    { id: genId(), name: "ÅRLIGE KOSTNADER", amount: 0 }
  ],
  debtParams: { type: "Annuitetslån", years: 25, rate: 0.04 }, // Fallback for bakoverkompatibilitet
  expectations: { likvider: 4, fastEiendom: 5, investeringer: 8, andreEiendeler: 0, kpi: 2.5 }
};

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const sectionTitle = document.getElementById("sectionTitle");
  const moduleRoot = document.getElementById("module-root");
  const stepperList = document.getElementById("stepper-list");
  // Output UI
  initOutputUI();

  // Nullstill-knapp
  const resetBtn = document.getElementById("reset-all");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      // Nullstill alle beløp i app-state
      (AppState.assets || []).forEach(a => a.amount = 0);
      (AppState.debts || []).forEach(d => d.amount = 0);
      (AppState.incomes || []).forEach(i => i.amount = 0);
      // Re-render gjeldende fane
      const current = document.querySelector(".nav-item.is-active");
      const section = current && (current.getAttribute("data-section") || current.textContent || "");
      if (moduleRoot) {
        if (section === "Forside") renderForsideModule(moduleRoot);
        else if (section === "Eiendeler") renderAssetsModule(moduleRoot);
        else if (section === "Gjeld") renderDebtModule(moduleRoot);
        else if (section === "Inntekter") renderIncomeModule(moduleRoot);
        else if (section === "Analyse") renderAnalysisModule(moduleRoot);
        else if (section === "TBE" || section === "Tapsbærende evne") renderTbeModule(moduleRoot);
        else if (section === "Forventet avkastning") renderExpectationsModule(moduleRoot);
        else if (section === "T-Konto") renderGraphicsModule(moduleRoot);
        else if (section === "Kontantstrøm") renderWaterfallModule(moduleRoot);
        else if (section === "Fremtidig utvikling") renderFutureModule(moduleRoot);
        else moduleRoot.innerHTML = "";
      }
      updateTopSummaries();
    });
  }

  // Bygg stepper
  const steps = [
    { key: "Forside" },
    { key: "Eiendeler" },
    { key: "Gjeld" },
    { key: "Inntekter" },
    { key: "Kontantstrøm" },
    { key: "TBE" },
    { key: "T-Konto" },
    { key: "Analyse" }
  ];
  function renderStepper(currentKey) {
    if (!stepperList) return;
    stepperList.innerHTML = "";
    // Sett dynamisk kolonneantall
    stepperList.style.setProperty("--step-count", String(steps.length));
    steps.forEach((s, idx) => {
      const li = document.createElement("li");
      li.className = "step";
      const dot = document.createElement("span");
      dot.className = "step-dot";
      const label = document.createElement("span");
      label.className = "step-label";
      label.textContent = s.key;
      li.appendChild(dot); li.appendChild(label);
      const currentIndex = steps.findIndex(x => x.key === currentKey);
      if (idx <= currentIndex) li.classList.add("is-reached");
      if (idx === currentIndex) li.classList.add("is-current");
      stepperList.appendChild(li);
    });
  }

  // Mapping mellom data-section og display navn for stepper/sectionTitle
  const sectionDisplayMap = {
    "Tapsbærende evne": "TBE",  // I stepperen skal det stå "TBE"
    "T-Konto": "T-Konto"
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const currentlyActive = document.querySelector(".nav-item.is-active");
      if (currentlyActive) currentlyActive.classList.remove("is-active");

      item.classList.add("is-active");

      const title = item.getAttribute("data-section") || item.textContent || "";
      const displayTitle = sectionDisplayMap[title] || title;
      let stepperKey = displayTitle;

      if (title === "Forside") {
        stepperKey = "Forside";
        if (sectionTitle) sectionTitle.textContent = "Forside";
      } else {
        if (sectionTitle) sectionTitle.textContent = title === "Tapsbærende evne" ? "Tapsbærende evne" : displayTitle;
      }

      renderStepper(stepperKey);

      if (!moduleRoot) return;
      if (title === "Forside") {
        renderForsideModule(moduleRoot);
      } else if (title === "Eiendeler") {
        renderAssetsModule(moduleRoot);
      } else if (title === "Gjeld") {
        renderDebtModule(moduleRoot);
      } else if (title === "Inntekter") {
        renderIncomeModule(moduleRoot);
      } else if (title === "Analyse") {
        renderAnalysisModule(moduleRoot);
      } else if (title === "TBE" || title === "Tapsbærende evne") {
        renderTbeModule(moduleRoot);
      } else if (title === "Forventet avkastning") {
        renderExpectationsModule(moduleRoot);
      } else if (title === "Kontantstrøm") {
        renderWaterfallModule(moduleRoot);
      } else if (title === "T-Konto") {
        renderFutureModule(moduleRoot);
      } else {
        moduleRoot.innerHTML = "";
      }
    });
  });

  // Last inn Forside (kopi av Eiendeler) som startvisning
  if (moduleRoot) {
    renderForsideModule(moduleRoot);
  }
  if (sectionTitle) sectionTitle.textContent = "Forside";
  // Oppdater summer i topp-boksene
  updateTopSummaries();
  // Init stepper
  renderStepper("Forside");
});


// --- Forside modul (blank panel) ---
function renderForsideModule(root) {
  root.innerHTML = "";
  const panel = document.createElement("div");
  panel.className = "panel panel-forside";

  const grid = document.createElement("div");
  grid.className = "forside-grid";

  const iconMarkup = {
    assets: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 11.5L12 4l8 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 11v9h11v-9" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 20v-4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    debt: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 3h10l4 4v14H6V3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16 3v5h4" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 15h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 19h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    income: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="9" cy="9" rx="4" ry="2" stroke="currentColor" stroke-width="2"/><path d="M5 9v3c0 1.1 1.8 2 4 2s4-.9 4-2V9" stroke="currentColor" stroke-width="2"/><path d="M5 12v3c0 1.1 1.8 2 4 2s4-.9 4-2v-3" stroke="currentColor" stroke-width="2"/><ellipse cx="15" cy="13" rx="4" ry="2" stroke="currentColor" stroke-width="2"/><path d="M11 13v3c0 1.1 1.8 2 4 2s4-.9 4-2v-3" stroke="currentColor" stroke-width="2"/><path d="M11 16v1.5c0 1.1 1.8 2 4 2s4-.9 4-2V16" stroke="currentColor" stroke-width="2"/><path d="M9 7.5c.5.3 1.1.5 2 .5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 11.5c.5.3 1.1.5 2 .5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    cashflow: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 9H4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 9c2.2-3 5.3-5 9-5 4.5 0 7.5 3 7.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 15h3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 15c-2.2 3-5.3 5-9 5-4.5 0-7.5-3-7.5-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10.5 12c.4-.5 1-.8 1.5-.8.8 0 1.5.6 1.5 1.4s-.7 1.4-1.5 1.4c-.5 0-1.1-.3-1.5-.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    tbe: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l8 3v6c0 4.4-3 8.4-8 9-5-0.6-8-4.6-8-9V6l8-3Z" stroke="currentColor" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    analysis: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 20V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 20v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 20v-9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  const cards = [
    { key: "assets", title: "Eiendeler", subtitle: "Totaloversikt over alle eiendeler" },
    { key: "debt", title: "Gjeld", subtitle: "Total gjeld, avdragsprofil og rentekostnader" },
    { key: "income", title: "Inntekter", subtitle: "Inntekter, utbytter, forbruk og skatt" },
    { key: "cashflow", title: "Kontantstrøm", subtitle: "Netto årlig kontantstrøm" },
    { key: "tbe", title: "Tapsbærende evne", subtitle: "Økonomisk evne til å tåle tap av verdier" },
    { key: "analysis", title: "Analyse", subtitle: "Nøkkeltall og anbefalinger" }
  ];

  cards.forEach(({ key, title, subtitle }) => {
    const card = document.createElement("div");
    card.className = `forside-card forside-card-${key}`;

    const icon = document.createElement("div");
    icon.className = "forside-card-illustration";
    icon.innerHTML = iconMarkup[key] || "";
    card.appendChild(icon);

    const label = document.createElement("div");
    label.className = "forside-card-title";
    label.textContent = title;
    card.appendChild(label);

    const sub = document.createElement("div");
    sub.className = "forside-card-text";
    sub.id = `forside-card-subtitle-${key}`;
    sub.textContent = subtitle;
    card.appendChild(sub);

    grid.appendChild(card);
  });

  panel.appendChild(grid);

  const ctaWrap = document.createElement("div");
  ctaWrap.className = "forside-cta-wrap";
  const ctaBtn = document.createElement("button");
  ctaBtn.type = "button";
  ctaBtn.className = "forside-cta";
  ctaBtn.textContent = "Start kartlegging";
  ctaBtn.addEventListener("click", () => {
    const target = document.querySelector('.nav-item[data-section="Eiendeler"]');
    if (target) target.click();
  });
  ctaWrap.appendChild(ctaBtn);
  panel.appendChild(ctaWrap);

  root.appendChild(panel);
  updateTopSummaries();
  updateForsideCards(getFinancialSnapshot(), true);
}

// --- Eiendeler modul ---
function renderAssetsModule(root) {
  root.innerHTML = "";

  const panel = document.createElement("div");
  panel.className = "panel";

  const heading = document.createElement("h3");
  heading.textContent = "Eiendeler";
  panel.appendChild(heading);

  const list = document.createElement("div");
  list.className = "assets";
  panel.appendChild(list);

  AppState.assets.forEach((item) => list.appendChild(createItemRow("assets", item)));

  const addBtn = document.createElement("button");
  addBtn.className = "btn-add";
  addBtn.textContent = "Legg til eiendel";
  addBtn.addEventListener("click", () => {
    const newItem = { id: genId(), name: "NY EIENDEL", amount: 0 };
    AppState.assets.push(newItem);
    list.appendChild(createItemRow("assets", newItem));
  });
  panel.appendChild(addBtn);

  root.appendChild(panel);
  updateTopSummaries();
}
// --- Forventninger modul ---
function renderExpectationsModule(root) {
  root.innerHTML = "";
  const panel = document.createElement("div");
  panel.className = "panel";
  const heading = document.createElement("h3");
  heading.textContent = "Forventet avkastning";
  panel.appendChild(heading);

  const list = document.createElement("div");
  list.className = "assets";
  panel.appendChild(list);

  const items = [
    { key: "likvider", label: "LIKVIDER", min: 0, max: 12, step: 1 },
    { key: "fastEiendom", label: "FAST EIENDOM", min: 0, max: 12, step: 1 },
    { key: "investeringer", label: "INVESTERINGER", min: 0, max: 12, step: 1 },
    { key: "andreEiendeler", label: "ANDRE EIENDELER", min: 0, max: 12, step: 1 },
    { key: "kpi", label: "KPI", min: 0, max: 5, step: 0.1 }
  ];

  items.forEach(({ key, label, min, max, step }) => {
    const row = document.createElement("div");
    row.className = "asset-row";

    const col = document.createElement("div");
    col.className = "asset-col";

    const top = document.createElement("div");
    top.className = "asset-top";

    const name = document.createElement("input");
    name.className = "asset-name";
    name.type = "text";
    name.value = label;
    name.addEventListener("input", () => { /* kan redigeres ved behov */ });

    const spacer = document.createElement("div");
    spacer.style.width = "28px"; // plassholder der delete-knapp pleier å være

    top.appendChild(name);
    top.appendChild(spacer);

    const range = document.createElement("input");
    range.className = "asset-range";
    range.type = "range";
    range.min = String(min ?? 0);
    range.max = String(max ?? 12);
    range.step = String(step ?? 1);
    range.value = String(AppState.expectations[key] || 0);

    const out = document.createElement("div");
    out.className = "asset-amount";
    out.textContent = `${Number(range.value).toFixed(1).replace('.', ',')} %`;

    range.addEventListener("input", () => {
      const v = Number(range.value);
      AppState.expectations[key] = v;
      out.textContent = `${v.toFixed(1).replace('.', ',')} %`;
    });

    col.appendChild(top);
    col.appendChild(range);
    row.appendChild(col);
    row.appendChild(out);
    list.appendChild(row);
  });
  root.appendChild(panel);
  updateTopSummaries();
}

// --- Felles hjelpefunksjoner for projeksjon av eiendeler ---
function computeAssetProjection(yearVal) {
  const assets = AppState.assets || [];
  const exp = AppState.expectations || { likvider: 0, fastEiendom: 0, investeringer: 0, andreEiendeler: 0, kpi: 0 };
  const yearsFromStart = Math.max(0, Number(yearVal) - 2025);
  const rLikv = (exp.likvider || 0) / 100;
  const rEiend = (exp.fastEiendom || 0) / 100;
  const rInv = (exp.investeringer || 0) / 100;
  const rOther = (exp.andreEiendeler || 0) / 100;
  const blueScale = ["#2A4D80", "#355F9E", "#60A5FA", "#00A9E0", "#294269", "#203554"];
  return assets.map((a, idx) => {
    const name = String(a.name || `Eiendel ${idx + 1}`);
    const base = a.amount || 0;
    let rate = rOther;
    const U = name.toUpperCase();
    if (/LIKVIDER/.test(U)) rate = rLikv;
    else if (/FAST|EIENDOM/.test(U)) rate = rEiend;
    else if (/INVEST/.test(U)) rate = rInv;
    const value = base * Math.pow(1 + rate, yearsFromStart);
    return { key: name, value, color: blueScale[idx % blueScale.length] };
  });
}

// --- Grafikk modul ---
function renderGraphicsModule(root) {
  root.innerHTML = "";

  // Bruk faktiske eiendelsnavn (identiske med Eiendeler-fanen)
  const assets = AppState.assets || [];
  const debts = AppState.debts || [];
  // Lys blåskala for lys tema
  const blueScale = ["#C8DBFF", "#A9C6FF", "#7FAAF6", "#5A94FF", "#E0EDFF", "#F0F6FF"];
  const assetCategories = assets.map((a, idx) => ({
    key: String(a.name || `Eiendel ${idx + 1}`),
    value: a.amount || 0,
    color: blueScale[idx % blueScale.length]
  }));

  const totalAssets = assetCategories.reduce((s, x) => s + x.value, 0);
  const totalDebtRaw = debts.reduce((s, d) => s + (d.amount || 0), 0);
  const debtVal = Math.min(totalDebtRaw, totalAssets);
  const equityVal = Math.max(0, totalAssets - debtVal);

  // Del opp gjeld i separate segmenter hvis det er flere gjeldsposter
  const financingParts = [];
  if (debts.length === 1) {
    // Hvis kun én gjeldspost, bruk samme struktur som før
    financingParts.push({ key: "Gjeld", value: debtVal, color: "#FCA5A5" });
  } else if (debts.length > 1) {
    // Hvis flere gjeldsposter, lag et segment for hver
    const debtScale = ["#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C"]; // Mildere rødskala
    debts.forEach((debt, idx) => {
      const debtAmount = Math.min(debt.amount || 0, debtVal);
      if (debtAmount > 0) {
        financingParts.push({
          key: String(debt.name || `Gjeld ${idx + 1}`),
          value: debtAmount,
          color: debtScale[idx % debtScale.length]
        });
      }
    });
  }
  financingParts.push({ key: "Egenkapital", value: equityVal, color: "#86EFAC" });

  // Wrapper for å kunne legge til knapp
  const graphWrap = document.createElement("div");
  graphWrap.style.position = "relative";
  root.appendChild(graphWrap);

  // Bygg SVG iht. krav (uten ekstra ramme rundt)
  const svg = buildFinanceSVG(assetCategories, financingParts, totalAssets);
  graphWrap.appendChild(svg);

  // Trigger-knapp for Finansiering-grafikk oppe til høyre
  const financingBtn = document.createElement("button");
  financingBtn.className = "gi-trigger";
  financingBtn.style.cssText = "left: auto !important; right: 200px !important;"; // Plasser lenger mot venstre fra høyre kant
  financingBtn.setAttribute("aria-haspopup", "dialog");
  financingBtn.setAttribute("aria-controls", "financing-modal");
  financingBtn.setAttribute("title", "Åpne finansieringsutvikling");
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.innerHTML = '<rect x="3" y="3" width="7" height="7" rx="2" fill="#335D9E"/><rect x="14" y="3" width="7" height="7" rx="2" fill="#335D9E"/><rect x="3" y="14" width="7" height="7" rx="2" fill="#335D9E"/><rect x="14" y="14" width="7" height="7" rx="2" fill="#335D9E"/>';
  financingBtn.appendChild(icon);
  financingBtn.addEventListener("click", () => openFinancingModal());
  graphWrap.appendChild(financingBtn);

  // Rerender ved resize for å holde tooltip-posisjonering korrekt
  const onResize = () => {
    const current = document.getElementById("sectionTitle");
    if (current && current.textContent === "Grafikk") {
      renderGraphicsModule(root);
    } else {
      window.removeEventListener("resize", onResize);
    }
  };
  window.addEventListener("resize", onResize);
}

function buildFinanceSVG(assetCategories, financingParts, totalAssets) {
  const vbW = 1200; const vbH = 700;
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Eiendeler og hvordan de er finansiert");
  svg.style.width = "100%";
  svg.style.maxWidth = "100%";
  svg.style.height = "auto";
  svg.style.display = "block";

  // Styles inside SVG
  const style = document.createElementNS(svgNS, "style");
  style.textContent = `
    .t-title { font: 900 28px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #1C2A3A; }
    .t-sub { font: 500 14px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #8A98A7; }
    .t-panel { font: 700 20px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #1C2A3A; }
    .t-label { font: 500 14px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #1C2A3A; }
    .t-value { font: 700 13px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #677788; }
    .t-legend { font: 500 13px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #677788; }
    .sum-text { font: 700 14px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #677788; display: none; }
  `;
  svg.appendChild(style);

  // Background removed - let page background show through

  // Defs: shadow and clip
  const defs = document.createElementNS(svgNS, "defs");
  const shadow = document.createElementNS(svgNS, "filter");
  shadow.setAttribute("id", "cardShadow");
  shadow.setAttribute("x", "-10%"); shadow.setAttribute("y", "-10%");
  shadow.setAttribute("width", "120%"); shadow.setAttribute("height", "120%");
  const feDrop = document.createElementNS(svgNS, "feDropShadow");
  feDrop.setAttribute("dx", "0"); feDrop.setAttribute("dy", "1");
  feDrop.setAttribute("stdDeviation", "4");
  feDrop.setAttribute("flood-color", "#000000");
  feDrop.setAttribute("flood-opacity", "0.08");
  shadow.appendChild(feDrop);
  defs.appendChild(shadow);

  const clipBarLeft = document.createElementNS(svgNS, "clipPath");
  clipBarLeft.setAttribute("id", "clipBarLeft");
  const clipRectL = document.createElementNS(svgNS, "rect");
  clipRectL.setAttribute("rx", "8"); clipRectL.setAttribute("ry", "8");
  const clipBarRight = document.createElementNS(svgNS, "clipPath");
  clipBarRight.setAttribute("id", "clipBarRight");
  const clipRectR = document.createElementNS(svgNS, "rect");
  clipRectR.setAttribute("rx", "8"); clipRectR.setAttribute("ry", "8");
  clipBarLeft.appendChild(clipRectL);
  clipBarRight.appendChild(clipRectR);
  defs.appendChild(clipBarLeft);
  defs.appendChild(clipBarRight);

  svg.appendChild(defs);

  // Grid and panels
  const pad = 4; const gutter = 24;
  const innerW = vbW - pad * 2;
  // Two equal columns that always fill the available width (fluid)
  const colW = (innerW - gutter) / 2;
  const panelW = colW;
  const leftX = pad;
  const rightX = pad + panelW + gutter;

  // Title removed per design preference
  // Fjernet undertekst for et renere uttrykk

  // Panels top Y (bring content closer to match spacing under tom ramme)
  const panelsTopY = 0;

  // Card sizes
  const cardR = 12;
  const cardStroke = "#E8EBF3";

  // Estimate card height to fit bar and texts (may approach bottom)
  const cardHeight = Math.min(700 - panelsTopY - 32 - 24, 560); // heuristic to keep legend room

  // Cards
  const leftCard = document.createElementNS(svgNS, "rect");
  leftCard.setAttribute("x", String(leftX));
  leftCard.setAttribute("y", String(panelsTopY));
  leftCard.setAttribute("width", String(panelW));
  leftCard.setAttribute("height", String(cardHeight));
  leftCard.setAttribute("rx", String(cardR)); leftCard.setAttribute("ry", String(cardR));
  leftCard.setAttribute("fill", "#FFFFFF");
  leftCard.setAttribute("stroke", cardStroke);
  leftCard.setAttribute("filter", "url(#cardShadow)");
  leftCard.setAttribute("aria-label", "Eiendeler");
  leftCard.setAttribute("role", "img");
  svg.appendChild(leftCard);

  const rightCard = document.createElementNS(svgNS, "rect");
  rightCard.setAttribute("x", String(rightX));
  rightCard.setAttribute("y", String(panelsTopY));
  rightCard.setAttribute("width", String(panelW));
  rightCard.setAttribute("height", String(cardHeight));
  rightCard.setAttribute("rx", String(cardR)); rightCard.setAttribute("ry", String(cardR));
  rightCard.setAttribute("fill", "#FFFFFF");
  rightCard.setAttribute("stroke", cardStroke);
  rightCard.setAttribute("filter", "url(#cardShadow)");
  rightCard.setAttribute("aria-label", "Finansiering");
  rightCard.setAttribute("role", "img");
  svg.appendChild(rightCard);

  // Panel headings
  const lHead = document.createElementNS(svgNS, "text");
  lHead.setAttribute("x", String(Math.round(leftX + panelW / 2)));
  lHead.setAttribute("y", String(Math.round(panelsTopY + 24 + 20))); // padding-top 24 + 20 baseline
  lHead.setAttribute("text-anchor", "middle");
  lHead.setAttribute("class", "t-panel");
  lHead.textContent = "Eiendeler";
  svg.appendChild(lHead);

  const rHead = document.createElementNS(svgNS, "text");
  rHead.setAttribute("x", String(Math.round(rightX + panelW / 2)));
  rHead.setAttribute("y", String(Math.round(panelsTopY + 24 + 20)));
  rHead.setAttribute("text-anchor", "middle");
  rHead.setAttribute("class", "t-panel");
  rHead.textContent = "Finansiering";
  svg.appendChild(rHead);

  // Bars placement og dynamisk høyde slik at bunnmarg == toppmarg
  const barWidth = 187; // stolpebredde (+20%)
  const gapHeadToBar = 24;
  const barTopY = Math.round(panelsTopY + 24 + 26 + gapHeadToBar);
  const topSpace = barTopY - panelsTopY;
  const barHeight = Math.max(200, cardHeight - topSpace * 2) + 40; // Økt høyde for å utnytte ledig plass
  const barCenterLX = Math.round(leftX + panelW / 2);
  const barCenterRX = Math.round(rightX + panelW / 2);
  const barLeftX = barCenterLX - Math.round(barWidth / 2);
  const barRightX = barCenterRX - Math.round(barWidth / 2);

  // Update clip rects
  clipRectL.setAttribute("x", String(barLeftX));
  clipRectL.setAttribute("y", String(barTopY));
  clipRectL.setAttribute("width", String(barWidth));
  clipRectL.setAttribute("height", String(barHeight));
  clipRectR.setAttribute("x", String(barRightX));
  clipRectR.setAttribute("y", String(barTopY));
  clipRectR.setAttribute("width", String(barWidth));
  clipRectR.setAttribute("height", String(barHeight));

  // Groups to hold segments
  const gLeft = document.createElementNS(svgNS, "g");
  gLeft.setAttribute("clip-path", "url(#clipBarLeft)");
  const gRight = document.createElementNS(svgNS, "g");
  gRight.setAttribute("clip-path", "url(#clipBarRight)");
  svg.appendChild(gLeft); svg.appendChild(gRight);

  // Helpers
  function darken(hex, factor = 0.8) {
    const v = hex.replace('#','');
    const r = parseInt(v.substring(0,2),16);
    const g = parseInt(v.substring(2,4),16);
    const b = parseInt(v.substring(4,6),16);
    const d = (x)=> Math.max(0, Math.min(255, Math.round(x*factor)));
    return `#${d(r).toString(16).padStart(2,'0')}${d(g).toString(16).padStart(2,'0')}${d(b).toString(16).padStart(2,'0')}`;
  }

  function pct(value, total) {
    if (total <= 0) return "0,0 %";
    const p = (value * 100) / total;
    return `${p.toFixed(1).replace('.', ',')} %`;
  }

  // Left stacked segments (bottom-up): Anleggsmidler, Varelager, Fordringer, Kontanter
  let cursorY = barTopY + barHeight;
  const leftSeparators = [];
  assetCategories.forEach((seg, idx) => {
    if (seg.value <= 0) return; // hopp over null-segmenter
    const h = Math.max(0, Math.round((seg.value / (totalAssets || 1)) * barHeight));
    const y = cursorY - h;
    cursorY = y;

    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", String(barLeftX));
    rect.setAttribute("y", String(y));
    rect.setAttribute("width", String(barWidth));
    rect.setAttribute("height", String(h));
    rect.setAttribute("fill", seg.color);
    rect.setAttribute("fill-opacity", "0.9");
    rect.setAttribute("stroke", darken(seg.color, 0.8));
    rect.setAttribute("stroke-width", "1.5");
    rect.setAttribute("role", "img");
    rect.setAttribute("aria-label", `${seg.key}: ${formatNOK(seg.value)}, ${pct(seg.value, totalAssets)}`);
    gLeft.appendChild(rect);

    // Separator (overlay) except at very top
    if (idx < assetCategories.length - 1) {
      leftSeparators.push(Math.round(y));
    }

    // Labels: always show, clamp within bar for very small segment heights
    {
      let cy = y + Math.round(h / 2);
      if (h < 24) {
        cy = Math.min(Math.max(y + 12, barTopY + 12), barTopY + barHeight - 12);
      }
      const labL = document.createElementNS(svgNS, "text");
      labL.setAttribute("x", String(barLeftX - 12));
      labL.setAttribute("y", String(cy + 4));
      labL.setAttribute("text-anchor", "end");
      labL.setAttribute("class", "t-label");
      labL.textContent = seg.key;
      svg.appendChild(labL);

      const labR = document.createElementNS(svgNS, "text");
      labR.setAttribute("x", String(barLeftX + barWidth + 12));
      labR.setAttribute("y", String(cy + 4));
      labR.setAttribute("text-anchor", "start");
      labR.setAttribute("class", "t-value");
      labR.textContent = `${formatNOK(seg.value)} · ${pct(seg.value, totalAssets)}`;
      svg.appendChild(labR);
    }

    attachTooltip(svg, rect, seg.key, seg.value, pct(seg.value, totalAssets));
  });

  // Draw separators over the bar
  leftSeparators.forEach((y) => {
    const sep = document.createElementNS(svgNS, "rect");
    sep.setAttribute("x", String(barLeftX));
    sep.setAttribute("y", String(Math.max(barTopY, y - 1)));
    sep.setAttribute("width", String(barWidth));
    sep.setAttribute("height", "2");
    sep.setAttribute("fill", "#FFFFFF");
    sep.setAttribute("fill-opacity", "0.6");
    gLeft.appendChild(sep);
  });

  // Outline of full left bar
  const leftOutline = document.createElementNS(svgNS, "rect");
  leftOutline.setAttribute("x", String(barLeftX));
  leftOutline.setAttribute("y", String(barTopY));
  leftOutline.setAttribute("width", String(barWidth));
  leftOutline.setAttribute("height", String(barHeight));
  leftOutline.setAttribute("rx", "8"); leftOutline.setAttribute("ry", "8");
  leftOutline.setAttribute("fill", "none");
  leftOutline.setAttribute("stroke", "#E8EBF3");
  leftOutline.setAttribute("stroke-width", "1.5");
  svg.appendChild(leftOutline);

  // Right financing bar (gjeld-segmenter nederst, Egenkapital øverst)
  const totalFin = financingParts.reduce((s, x) => s + x.value, 0);
  let cursorYR = barTopY + barHeight;
  const rightSeparators = [];
  
  // Sorter slik at alle gjeld-segmenter kommer først (nederst), deretter Egenkapital (øverst)
  const debtParts = financingParts.filter(x => x.key !== "Egenkapital");
  const equityPart = financingParts.find(x => x.key === "Egenkapital") || { key: "Egenkapital", value: 0, color: "#86EFAC" };
  const orderRight = [...debtParts, equityPart];
  
  orderRight.forEach((seg, idx) => {
    const h = totalFin > 0 ? Math.max(0, Math.round((seg.value / totalFin) * barHeight)) : 0;
    if (h <= 0) return; // ikke tegn eller label segmenter uten høyde (unngå overlapp ved 0)
    const y = cursorYR - h;
    cursorYR = y;

    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", String(barRightX));
    rect.setAttribute("y", String(y));
    rect.setAttribute("width", String(barWidth));
    rect.setAttribute("height", String(h));
    rect.setAttribute("fill", seg.color);
    rect.setAttribute("fill-opacity", "0.9");
    rect.setAttribute("stroke", darken(seg.color, 0.8));
    rect.setAttribute("stroke-width", "1.5");
    rect.setAttribute("role", "img");
    rect.setAttribute("aria-label", `${seg.key}: ${formatNOK(seg.value)}, ${pct(seg.value, totalFin)}`);
    gRight.appendChild(rect);

    // Separator mellom gjeld-segmenter (ikke etter siste gjeld eller før Egenkapital)
    if (seg.key !== "Egenkapital" && idx < debtParts.length - 1) {
      rightSeparators.push(Math.round(y));
    }

    if (h >= 24) {
      const cy = y + Math.round(h / 2);
      const labL = document.createElementNS(svgNS, "text");
      labL.setAttribute("x", String(barRightX - 12));
      labL.setAttribute("y", String(cy + 4));
      labL.setAttribute("text-anchor", "end");
      labL.setAttribute("class", "t-label");
      labL.textContent = seg.key;
      svg.appendChild(labL);

      const labR = document.createElementNS(svgNS, "text");
      labR.setAttribute("x", String(barRightX + barWidth + 12));
      labR.setAttribute("y", String(cy + 4));
      labR.setAttribute("text-anchor", "start");
      labR.setAttribute("class", "t-value");
      labR.textContent = `${formatNOK(seg.value)} · ${pct(seg.value, totalFin)}`;
      svg.appendChild(labR);
    } else if (h > 0) {
      // For svært små segmenter: plasser label utenfor, men på segmentets midtpunkt for å unngå overlapp
      const cy = y + Math.round(h / 2);
      const labL = document.createElementNS(svgNS, "text");
      labL.setAttribute("x", String(barRightX - 12));
      labL.setAttribute("y", String(cy + 4));
      labL.setAttribute("text-anchor", "end");
      labL.setAttribute("class", "t-label");
      labL.textContent = seg.key;
      svg.appendChild(labL);

      const labR = document.createElementNS(svgNS, "text");
      labR.setAttribute("x", String(barRightX + barWidth + 12));
      labR.setAttribute("y", String(cy + 4));
      labR.setAttribute("text-anchor", "start");
      labR.setAttribute("class", "t-value");
      labR.textContent = `${formatNOK(seg.value)} · ${pct(seg.value, totalFin)}`;
      svg.appendChild(labR);
    }

    attachTooltip(svg, rect, seg.key, seg.value, pct(seg.value, totalFin));
  });

  // Draw separators over the right bar (mellom gjeld-segmenter)
  rightSeparators.forEach((y) => {
    const sep = document.createElementNS(svgNS, "rect");
    sep.setAttribute("x", String(barRightX));
    sep.setAttribute("y", String(Math.max(barTopY, y - 1)));
    sep.setAttribute("width", String(barWidth));
    sep.setAttribute("height", "2");
    sep.setAttribute("fill", "#FFFFFF");
    sep.setAttribute("fill-opacity", "0.6");
    gRight.appendChild(sep);
  });

  const rightOutline = document.createElementNS(svgNS, "rect");
  rightOutline.setAttribute("x", String(barRightX));
  rightOutline.setAttribute("y", String(barTopY));
  rightOutline.setAttribute("width", String(barWidth));
  rightOutline.setAttribute("height", String(barHeight));
  rightOutline.setAttribute("rx", "8"); rightOutline.setAttribute("ry", "8");
  rightOutline.setAttribute("fill", "none");
  rightOutline.setAttribute("stroke", "#E8EBF3"); // subtle contour
  rightOutline.setAttribute("stroke-width", "1");
  svg.appendChild(rightOutline);

  // Sum texts
  const sumY = Math.round(barTopY + barHeight + 16 + 12);
  const sumL = document.createElementNS(svgNS, "text");
  sumL.setAttribute("x", String(Math.round(leftX + panelW / 2)));
  sumL.setAttribute("y", String(sumY));
  sumL.setAttribute("text-anchor", "middle");
  sumL.setAttribute("class", "sum-text");
  sumL.textContent = `Sum eiendeler: ${formatNOK(totalAssets)}`;
  svg.appendChild(sumL);

  const sumR = document.createElementNS(svgNS, "text");
  sumR.setAttribute("x", String(Math.round(rightX + panelW / 2)));
  sumR.setAttribute("y", String(sumY));
  sumR.setAttribute("text-anchor", "middle");
  sumR.setAttribute("class", "sum-text");
  sumR.textContent = `Sum finansiering: ${formatNOK(totalAssets)}`;
  svg.appendChild(sumR);

  // Equality indicator between bars
  const eqX = Math.round((leftX + panelW + rightX) / 2);
  const eqY = Math.round(barTopY + barHeight / 2);
  const eqPlate = document.createElementNS(svgNS, "rect");
  eqPlate.setAttribute("x", String(eqX - 16));
  eqPlate.setAttribute("y", String(eqY - 16));
  eqPlate.setAttribute("width", "32");
  eqPlate.setAttribute("height", "32");
  eqPlate.setAttribute("rx", "8");
  eqPlate.setAttribute("fill", "#FFFFFF");
  eqPlate.setAttribute("stroke", "#E8EBF3");
  eqPlate.setAttribute("filter", "url(#cardShadow)");
  svg.appendChild(eqPlate);

  const eqText = document.createElementNS(svgNS, "text");
  eqText.setAttribute("x", String(eqX));
  eqText.setAttribute("y", String(eqY + 8));
  eqText.setAttribute("text-anchor", "middle");
  eqText.setAttribute("class", "t-label");
  eqText.setAttribute("fill", "#0A5EDC");
  eqText.textContent = "=";
  svg.appendChild(eqText);

  // Legend (approximate centering, computed after items are appended)
  const legendItems = [
    { key: "Anleggsmidler", color: "#8CB2FF" },
    { key: "Varelager", color: "#5A94FF" },
    { key: "Fordringer", color: "#0A5EDC" },
    { key: "Kontanter", color: "#B6CCFF" },
    { key: "Egenkapital", color: "#0C8F4A" },
    { key: "Gjeld", color: "#912018" }
  ];
  const legendGroup = document.createElementNS(svgNS, "g");
  const legendY = Math.min(vbH - 32, sumY + 24 + 16); // place under sums
  svg.appendChild(legendGroup);
  // Hide legend/categories under the graphic per request
  legendGroup.setAttribute("display", "none");

  let xCursor = pad; const spacing = 16; const mark = 12; const gap = 4;
  const tempItems = [];
  legendItems.forEach((li) => {
    const g = document.createElementNS(svgNS, "g");
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", "0"); rect.setAttribute("y", String(legendY - mark + 2));
    rect.setAttribute("width", String(mark)); rect.setAttribute("height", String(mark));
    rect.setAttribute("rx", "3"); rect.setAttribute("fill", li.color);
    rect.setAttribute("fill-opacity", "0.9");
    rect.setAttribute("stroke", darken(li.color, 0.8)); rect.setAttribute("stroke-width", "1.5");
    g.appendChild(rect);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", String(mark + gap));
    text.setAttribute("y", String(legendY + 2));
    text.setAttribute("class", "t-legend");
    text.textContent = li.key;
    g.appendChild(text);
    legendGroup.appendChild(g);
    tempItems.push({ g, text });
  });

  // Measure and center
  const widths = tempItems.map(({ g, text }) => {
    const bb = text.getBBox();
    return mark + gap + bb.width;
  });
  const totalLegendWidth = widths.reduce((s, w) => s + w, 0) + spacing * (legendItems.length - 1);
  let startX = Math.round((vbW - totalLegendWidth) / 2);
  tempItems.forEach((item, idx) => {
    const g = item.g; const w = widths[idx];
    g.setAttribute("transform", `translate(${startX},0)`);
    startX += w + spacing;
  });

  return svg;
}

// --- Waterfall (Grafikk III) ---
function renderWaterfallModule(root) {
  root.innerHTML = "";

  // Sample period selector (Month/Quarter/Year)
  const controls = document.createElement("div");
  controls.style.display = "none"; // make invisible as requested
  const select = document.createElement("select");
  ["Måned", "Kvartal", "År"].forEach((t) => { const o = document.createElement("option"); o.value = t; o.textContent = t; select.appendChild(o); });
  controls.appendChild(select);
  root.appendChild(controls);

  const svgNS = "http://www.w3.org/2000/svg";
  const vbW = 1200, vbH = 560;
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
  svg.style.width = "100%"; svg.style.height = "auto"; svg.style.display = "block";

  const style = document.createElementNS(svgNS, "style");
  style.textContent = `
    .wf-title { font: 900 24px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #1C2A3A; }
    .wf-label { font: 600 13px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #677788; }
    .wf-value { font: 700 13px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #1C2A3A; }
  `;
  svg.appendChild(style);

  const bg = document.createElementNS(svgNS, "rect");
  bg.setAttribute("x", "0"); bg.setAttribute("y", "0");
  bg.setAttribute("width", String(vbW)); bg.setAttribute("height", String(vbH));
  bg.setAttribute("fill", "#F2F4F7");
  svg.appendChild(bg);

  const panel = document.createElementNS(svgNS, "rect");
  panel.setAttribute("x", "12"); panel.setAttribute("y", "12");
  panel.setAttribute("width", String(vbW - 24)); panel.setAttribute("height", String(vbH - 24));
  panel.setAttribute("rx", "12"); panel.setAttribute("fill", "#FFFFFF"); panel.setAttribute("stroke", "#E8EBF3");
  svg.appendChild(panel);

  const container = document.createElement("div");
  container.className = "waterfall-canvas";
  container.appendChild(svg);

  const quickBtn = document.createElement("button");
  quickBtn.type = "button";
  quickBtn.className = "waterfall-quick-action";
  quickBtn.setAttribute("aria-label", "Åpne hurtigmeny for kontantstrøm");
  quickBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="4" height="4" rx="1.2" /><rect x="15" y="5" width="4" height="4" rx="1.2" /><rect x="5" y="15" width="4" height="4" rx="1.2" /><rect x="15" y="15" width="4" height="4" rx="1.2" /></svg>';
  quickBtn.addEventListener("click", openCashflowForecastModal);
  container.appendChild(quickBtn);

  // Data synthesis from AppState with fixed categories
  function getData() {
    const incomeItems = AppState.incomes || [];
    const upper = (s) => String(s || "").toUpperCase();

    // Income categories
    const wage = incomeItems.filter(x => /L[ØO]NN/.test(upper(x.name))).reduce((s,x)=> s + (x.amount || 0), 0);
    const dividends = incomeItems.filter(x => /UTBYT/.test(upper(x.name))).reduce((s,x)=> s + (x.amount || 0), 0);
    const otherIncome = incomeItems.filter(x => /ANDRE/.test(upper(x.name))).reduce((s,x)=> s + (x.amount || 0), 0);
    const totalIncome = wage + dividends + otherIncome;

    // Explicit cost categories from inputs
    const annualTax = incomeItems.filter(x => /SKATT/.test(upper(x.name))).reduce((s,x)=> s + Math.abs(x.amount || 0), 0);
    const annualCosts = incomeItems.filter(x => /KOSTNAD/.test(upper(x.name))).reduce((s,x)=> s + Math.abs(x.amount || 0), 0);

    // Debt-derived costs: interest and principal (beregnet per gjeldspost)
    const debts = AppState.debts || [];
    const totalDebt = debts.reduce((s,d)=> s + (d.amount || 0), 0);
    const annualPayment = calculateTotalAnnualDebtPayment(debts);
    const interestCost = calculateTotalAnnualInterest(debts);
    const principalCost = Math.max(0, annualPayment - interestCost);

    const costs = [
      { key: "Årlig skatt", value: annualTax },
      { key: "Årlige kostnader", value: annualCosts },
      { key: "Rentekostnader", value: interestCost },
      { key: "Avdrag", value: principalCost }
    ].filter(c => c.value > 0 || c.key === "Avdrag");

    const net = totalIncome - costs.reduce((s,c)=> s + c.value, 0);
    return { totalIncome, costs, net, wage, dividends, otherIncome };
  }

  function draw() {
    // Clear dynamic content except styles/panel (first three nodes: style, bg, panel)
    while (svg.childNodes.length > 3) svg.removeChild(svg.lastChild);

    const { totalIncome, costs, net, wage, dividends, otherIncome } = getData();

    const padX = 80; const padTop = 70; const padBottom = net < 0 ? 96 : 64; // ekstra plass under baseline ved negativ netto
    const chartW = vbW - padX * 2; const chartH = vbH - padTop - padBottom;

    // Bygg trinn, utelat nullverdier
    const steps = [];
    if (wage > 0) steps.push({ type: "up", key: "Lønnsinntekt", value: wage });
    if (dividends > 0) steps.push({ type: "up", key: "Utbytter", value: dividends });
    if (otherIncome > 0) steps.push({ type: "up", key: "Andre inntekter", value: otherIncome });
    costs.forEach(c => { if (c.value > 0) steps.push({ type: "down", key: c.key, value: -c.value }); });
    steps.push({ type: "end", key: "Årlig kontantstrøm", value: net });

    // Skaler etter hele spennvidden i den kumulative serien (topp til bunn)
    const tempSteps = [];
    if (wage > 0) tempSteps.push({ type: "up", value: wage, key: "Lønnsinntekt" });
    if (dividends > 0) tempSteps.push({ type: "up", value: dividends, key: "Utbytter" });
    if (otherIncome > 0) tempSteps.push({ type: "up", value: otherIncome, key: "Andre inntekter" });
    (costs || []).forEach(c => { if (c.value > 0) tempSteps.push({ type: "down", value: -c.value, key: c.key }); });
    let lvl = 0; const levels = [0];
    tempSteps.forEach(s => { lvl += s.value; levels.push(lvl); });
    levels.push(net); // inkluder netto nivå
    const minLevel = Math.min(0, ...levels);
    const maxLevel = Math.max(0, ...levels);
    const levelRange = Math.max(1, maxLevel - minLevel);
    const levelToY = (L) => padTop + chartH - ((L - minLevel) / levelRange) * chartH;
    const barGeom = (fromLevel, toLevel) => {
      const y1 = levelToY(fromLevel); const y2 = levelToY(toLevel);
      const yTop = Math.min(y1, y2);
      const hRaw = Math.abs(y2 - y1);
      return { yTop, h: Math.max(2, hRaw) };
    };

    // Farger
    const cashflowPositive = (getComputedStyle(document.documentElement).getPropertyValue('--BLUE_200') || '#E0EDFF').trim();
    const blue = "#0A5EDC";
    // Rødfarger for kostnadssøyler i lys tema
    const redPalette = ["#F5B5B1", "#F1998F", "#EC7E73", "#E36258", "#D84F47"]; // lys -> dyp
    const redEnd = "#D84F47"; // sluttstolpe ved negativ kontantstrøm
    // Grønnpalett for inntekter
    const greenPalette = ["#B5ECD0", "#7AD9A9", "#34C185", "#0C8F4A"]; // varierte grønntoner
    // Egen farge for Årlig kontantstrøm (uavhengig av tegn)
    const netBarColor = (getComputedStyle(document.documentElement).getPropertyValue('--WF_NET_COLOR') || '#DBEAFE').trim();

    const colW = Math.max(60, Math.floor(chartW / steps.length) - 10);
    let cursorX = padX;
    let running = 0;
    let downIndex = 0; let upIndex = 0;
    steps.forEach((s, idx) => {
      if (!s || !isFinite(s.value)) return; // hopp over nulltrinn, men behold 0 for Avdrag
      let h, y, fill;
      let labelText;
      if (s.type === "up") {
        const from = running;
        const to = running + s.value;
        const geom = barGeom(from, to);
        h = geom.h; y = geom.yTop;
        running = to;
        fill = greenPalette[upIndex % greenPalette.length];
        upIndex++;
        labelText = formatNOK(Math.round(Math.abs(s.value)));
      } else if (s.type === "down") {
        const from = running;
        const to = running + s.value; // s.value is negative
        const geom = barGeom(from, to);
        h = geom.h; y = geom.yTop;
        running = to;
        fill = redPalette[downIndex % redPalette.length];
        downIndex++;
        labelText = formatNOK(Math.round(s.value)); // vis alltid minus for kostnader
      } else { // end (netto)
        const from = 0;
        const to = s.value;
        const geom = barGeom(from, to);
        h = geom.h; y = geom.yTop;
        // Fast definert farge for netto-kolonnen
        fill = netBarColor;
        labelText = formatNOK(Math.round(s.value)); // signert
      }

      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", String(cursorX));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(colW));
      rect.setAttribute("height", String(Math.max(2, h)));
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", fill);
      rect.setAttribute("fill-opacity", "0.9");
      rect.setAttribute("stroke", "#E8EBF3");
      rect.setAttribute("stroke-opacity", "1");
      svg.appendChild(rect);

      const lab = document.createElementNS(svgNS, "text");
      lab.setAttribute("class", "wf-label");
      lab.setAttribute("x", String(cursorX + colW / 2));
      const labelY = Math.min(vbH - 8, y + Math.max(2, h) + 14); // plasser under nederste kant
      lab.setAttribute("y", String(labelY));
      lab.setAttribute("text-anchor", "middle");
      lab.textContent = s.key;
      svg.appendChild(lab);

      const val = document.createElementNS(svgNS, "text");
      val.setAttribute("class", "wf-value");
      val.setAttribute("x", String(cursorX + colW / 2));
      val.setAttribute("y", String(y - 8));
      val.setAttribute("text-anchor", "middle");
      val.textContent = labelText;
      svg.appendChild(val);

      cursorX += colW + 10;
    });

    // Title
    const title = document.createElementNS(svgNS, "text");
    title.setAttribute("class", "wf-title");
    title.setAttribute("x", String(vbW / 2));
    title.setAttribute("y", "44");
    title.setAttribute("text-anchor", "middle");
    title.textContent = "Waterfall";
    svg.appendChild(title);
  }

  select.addEventListener("change", draw);
  draw();
  root.appendChild(container);
}

function aggregateCashflowBase() {
  const incomeItems = AppState.incomes || [];
  const upper = (s) => String(s || "").toUpperCase();

  let incomeTotal = 0;
  let wage = 0;
  let dividends = 0;
  let otherIncome = 0;
  let annualTax = 0;
  let annualCosts = 0;

  incomeItems.forEach((item) => {
    const amount = Number(item.amount) || 0;
    if (!amount) return;
    const name = upper(item.name);
    if (/SKATT/.test(name)) {
      annualTax += amount;
    } else if (/KOSTNAD/.test(name)) {
      annualCosts += amount;
    } else {
      incomeTotal += amount;
      if (/L[ØO]NN/.test(name)) wage += amount;
      else if (/UTBYT/.test(name)) dividends += amount;
      else otherIncome += amount;
    }
  });

  return {
    wage,
    dividends,
    otherIncome,
    incomeTotal,
    annualTax,
    annualCosts,
    costTotal: annualTax + annualCosts
  };
}

function projectDebtYear(debt, yearIndex) {
  const amount = Number(debt && debt.amount) || 0;
  if (amount <= 0) {
    return { interest: 0, principal: 0, payment: 0, remaining: 0 };
  }
  const params = debt.debtParams || AppState.debtParams || {};
  const type = params.type || "Annuitetslån";
  const rate = Number(params.rate) || 0;
  const years = Math.max(1, Number(params.years) || 1);
  const idx = Math.max(0, Math.floor(yearIndex));

  if (/Avdragsfrihet/.test(type)) {
    const years = Math.max(1, Number(params.years) || 1);
    const match = /(\d+)\s*år/i.exec(type);
    const graceYears = match ? Number(match[1]) : years;
    const interestOnlyYears = type === "Avdragsfrihet" ? years : Math.min(graceYears, years);
    const amortYears = type === "Avdragsfrihet" ? 0 : years;
    const totalDuration = interestOnlyYears + amortYears;

    if (idx >= totalDuration) {
      return { interest: 0, principal: 0, payment: 0, remaining: 0 };
    }

    if (idx < interestOnlyYears) {
      const interest = amount * rate;
      return { interest, principal: 0, payment: interest, remaining: amount };
    }

    if (amortYears <= 0) {
      return { interest: 0, principal: 0, payment: 0, remaining: amount };
    }

    const n = idx - interestOnlyYears;

    if (rate === 0) {
      const principal = amount / amortYears;
      if (n >= amortYears) return { interest: 0, principal: 0, payment: 0, remaining: 0 };
      const remainingBefore = Math.max(0, amount - principal * n);
      const remaining = Math.max(0, remainingBefore - principal);
      return { interest: 0, principal, payment: principal, remaining };
    }

    if (n >= amortYears) return { interest: 0, principal: 0, payment: 0, remaining: 0 };
    const annuity = amount * (rate / (1 - Math.pow(1 + rate, -amortYears)));
    const remainingBefore = amount * Math.pow(1 + rate, n) - annuity * ((Math.pow(1 + rate, n) - 1) / rate);
    const interest = remainingBefore * rate;
    const rawPrincipal = annuity - interest;
    const principal = Math.min(Math.max(0, rawPrincipal), Math.max(0, remainingBefore));
    const remaining = Math.max(0, remainingBefore - principal);
    return { interest, principal, payment: annuity, remaining };
  }

  if (idx >= years) {
    return { interest: 0, principal: 0, payment: 0, remaining: 0 };
  }

  if (type === "Serielån") {
    const principalPortion = amount / years;
    const remainingBefore = Math.max(0, amount - principalPortion * idx);
    const interest = remainingBefore * rate;
    const principal = Math.min(principalPortion, remainingBefore);
    const payment = interest + principal;
    const remaining = Math.max(0, remainingBefore - principal);
    return { interest, principal, payment, remaining };
  }

  // Annuitetslån (default)
  if (rate === 0) {
    const principal = amount / years;
    const remainingBefore = Math.max(0, amount - principal * idx);
    const remaining = Math.max(0, remainingBefore - principal);
    return { interest: 0, principal, payment: principal, remaining };
  }

  const annuity = amount * (rate / (1 - Math.pow(1 + rate, -years)));
  const remainingBefore = amount * Math.pow(1 + rate, idx) - annuity * ((Math.pow(1 + rate, idx) - 1) / rate);
  const interest = remainingBefore * rate;
  const rawPrincipal = annuity - interest;
  const principal = Math.min(Math.max(0, rawPrincipal), Math.max(0, remainingBefore));
  const remaining = Math.max(0, remainingBefore - principal);
  return { interest, principal, payment: annuity, remaining };
}

function computeCashflowForecastSeries(startYear, yearsCount) {
  const { incomeTotal, costTotal } = aggregateCashflowBase();
  const debts = AppState.debts || [];
  const kpiRate = Number(AppState.expectations && AppState.expectations.kpi) || 0;
  const inflation = Math.max(0, kpiRate) / 100;

  const series = [];
  for (let i = 0; i < yearsCount; i++) {
    const factor = Math.pow(1 + inflation, i);
    const income = incomeTotal * factor;
    const costs = costTotal * factor;
    const debtAgg = debts.reduce(
      (acc, debt) => {
        const detail = projectDebtYear(debt, i);
        acc.interest += detail.interest;
        acc.principal += detail.principal;
        return acc;
      },
      { interest: 0, principal: 0 }
    );
    const net = income - costs - debtAgg.interest - debtAgg.principal;
    series.push({
      year: startYear + i,
      net,
      income,
      costs,
      interest: debtAgg.interest,
      principal: debtAgg.principal
    });
  }

  return { series, inflation };
}

function buildCashflowForecastSVG(startYear, yearsCount) {
  const { series, inflation } = computeCashflowForecastSeries(startYear, yearsCount);
  const svgNS = "http://www.w3.org/2000/svg";
  const vbW = 1180;
  const vbH = 540;
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.display = "block";

  const style = document.createElementNS(svgNS, "style");
  style.textContent = `
    .cf-title { font: 900 24px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #1C2A3A; }
    .cf-meta { font: 500 13px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #64748B; }
    .cf-label { font: 600 10.4px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #1C2A3A; }
    .cf-year { font: 600 13px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #475569; }
  `;
  svg.appendChild(style);

  const bg = document.createElementNS(svgNS, "rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", String(vbW));
  bg.setAttribute("height", String(vbH));
  bg.setAttribute("fill", "#F2F4F7");
  svg.appendChild(bg);

  const padL = 80;
  const padR = 24;
  const padT = 72;
  const padB = 96;
  const plotW = vbW - padL - padR;
  const plotH = vbH - padT - padB;

  const maxVal = Math.max(0, ...series.map((d) => d.net));
  const minVal = Math.min(0, ...series.map((d) => d.net));
  const range = Math.max(1, maxVal - minVal);

  const scale = (value) => padT + ((maxVal - value) / range) * plotH;
  const zeroY = scale(0);

  const gridTicks = 5;
  for (let i = 0; i <= gridTicks; i++) {
    const ratio = i / gridTicks;
    const val = maxVal - ratio * range;
    const y = padT + ratio * plotH;
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", String(padL));
    line.setAttribute("x2", String(padL + plotW));
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    line.setAttribute("stroke", i === gridTicks ? "#CBD5F1" : "#E8EBF3");
    svg.appendChild(line);

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", String(padL - 10));
    label.setAttribute("y", String(y + 4));
    label.setAttribute("text-anchor", "end");
    label.setAttribute("fill", "#64748B");
    label.setAttribute("font-size", "14");
    label.textContent = formatAxisValue(val);
    svg.appendChild(label);
  }

  const zeroLine = document.createElementNS(svgNS, "line");
  zeroLine.setAttribute("x1", String(padL));
  zeroLine.setAttribute("x2", String(padL + plotW));
  zeroLine.setAttribute("y1", String(zeroY));
  zeroLine.setAttribute("y2", String(zeroY));
  zeroLine.setAttribute("stroke", "#CBD5F1");
  zeroLine.setAttribute("stroke-width", "1.5");
  svg.appendChild(zeroLine);

  const netBarColor = (getComputedStyle(document.documentElement).getPropertyValue("--WF_NET_COLOR") || "#DBEAFE").trim() || "#DBEAFE";
  const barGap = 12;
  const barCount = series.length;
  const barWidth = Math.max(26, Math.floor((plotW - barGap * (barCount - 1)) / barCount));
  let cursorX = padL;

  series.forEach((entry) => {
    const value = entry.net;
    const scaled = scale(value);
    const height = Math.abs(zeroY - scaled);
    const barHeight = Math.max(2, height);
    const y = value >= 0 ? scaled : zeroY;

    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", String(cursorX));
    rect.setAttribute("y", String(y));
    rect.setAttribute("width", String(barWidth));
    rect.setAttribute("height", String(barHeight));
    rect.setAttribute("rx", "8");
    rect.setAttribute("fill", netBarColor || "#DBEAFE");
    rect.setAttribute("stroke", "rgba(37, 99, 235, 0.25)");
    rect.setAttribute("stroke-width", "1");
    svg.appendChild(rect);

    const valueLabel = document.createElementNS(svgNS, "text");
    valueLabel.setAttribute("class", "cf-label");
    valueLabel.setAttribute("x", String(cursorX + barWidth / 2));
    if (value >= 0) {
      valueLabel.setAttribute("y", String(y - 10));
    } else {
      valueLabel.setAttribute("y", String(y + barHeight + 18));
    }
    valueLabel.setAttribute("text-anchor", "middle");
    valueLabel.textContent = formatNOKPlain(Math.round(value));
    svg.appendChild(valueLabel);

    const yearLabel = document.createElementNS(svgNS, "text");
    yearLabel.setAttribute("class", "cf-year");
    yearLabel.setAttribute("x", String(cursorX + barWidth / 2));
    yearLabel.setAttribute("y", String(padT + plotH + 32));
    yearLabel.setAttribute("text-anchor", "middle");
    yearLabel.textContent = String(entry.year);
    svg.appendChild(yearLabel);

    cursorX += barWidth + barGap;
  });

  const title = document.createElementNS(svgNS, "text");
  title.setAttribute("class", "cf-title");
  title.setAttribute("x", String(vbW / 2));
  title.setAttribute("y", "44");
  title.setAttribute("text-anchor", "middle");
  title.textContent = "Netto årlig kontantstrøm";
  svg.appendChild(title);

  const meta = document.createElementNS(svgNS, "text");
  meta.setAttribute("class", "cf-meta");
  meta.setAttribute("x", String(vbW / 2));
  meta.setAttribute("y", "62");
  meta.setAttribute("text-anchor", "middle");
  meta.textContent = `KPI: ${(inflation * 100).toFixed(1).replace(".", ",")} % · Inntekter og kostnader inflasjonsjustert`;
  svg.appendChild(meta);

  return svg;
}

function openCashflowForecastModal() {
  const modal = document.getElementById("cashflow-forecast-modal");
  const chartRoot = document.getElementById("cashflow-forecast-chart");
  if (!modal || !chartRoot) return;
  chartRoot.innerHTML = "";
  try {
    chartRoot.appendChild(buildCashflowForecastSVG(2025, 15));
  } catch (e) {
    const p = document.createElement("p");
    p.textContent = `Kunne ikke bygge kontantstrømsgraf: ${String((e && e.message) || e)}`;
    chartRoot.appendChild(p);
  }
  modal.removeAttribute("hidden");
  const onKey = (ev) => {
    if (ev.key === "Escape") {
      closeCashflowForecastModal();
    }
  };
  document.addEventListener("keydown", onKey, { once: true });
  modal.addEventListener(
    "click",
    (e) => {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "true") {
        closeCashflowForecastModal();
      }
    },
    { once: true }
  );
}

function closeCashflowForecastModal() {
  const modal = document.getElementById("cashflow-forecast-modal");
  if (modal) modal.setAttribute("hidden", "");
}
// --- Fremtiden modul ---
function renderFutureModule(root) {
  root.innerHTML = "";
  const assets = AppState.assets || [];
  const debts = AppState.debts || [];
  const blueScale = ["#2A4D80", "#355F9E", "#60A5FA", "#00A9E0", "#294269", "#203554"];

  const graphWrap = document.createElement("div");
  graphWrap.style.position = "relative";
  root.appendChild(graphWrap);

  function remainingDebtForYear(yearVal) {
    return debts.reduce((total, debt) => {
      const elapsed = Math.max(0, Number(yearVal) - 2025);
      return total + remainingBalanceAfterYears(debt, elapsed);
    }, 0);
  }

  // Trigger-knapp (ikon) oppe til høyre - lag først så den ikke blir slettet
  const btn = document.createElement("button");
  btn.className = "gi-trigger";
  btn.style.cssText = "left: calc(50% - 60px) !important; right: auto !important;"; // Flyttet litt mot venstre
  btn.setAttribute("aria-haspopup", "dialog");
  btn.setAttribute("aria-controls", "gi-modal");
  btn.setAttribute("title", "Åpne verdigutvikling");
  // Fallback ikon (kan byttes ut med brukerens ikon via <img src="...">)
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.innerHTML = '<rect x="3" y="3" width="7" height="7" rx="2" fill="#335D9E"/><rect x="14" y="3" width="7" height="7" rx="2" fill="#335D9E"/><rect x="3" y="14" width="7" height="7" rx="2" fill="#335D9E"/><rect x="14" y="14" width="7" height="7" rx="2" fill="#335D9E"/>';
  btn.appendChild(icon);
  btn.addEventListener("click", () => openGiModal());

  // Trigger-knapp for Finansiering-grafikk oppe til høyre
  const financingBtn = document.createElement("button");
  financingBtn.className = "gi-trigger";
  financingBtn.style.left = "auto"; // Fjern standard left-posisjon
  financingBtn.style.right = "12px"; // Plasser i høyre hjørne av høyre halvdel
  financingBtn.setAttribute("aria-haspopup", "dialog");
  financingBtn.setAttribute("aria-controls", "financing-modal");
  financingBtn.setAttribute("title", "Åpne finansieringsutvikling");
  const financingIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  financingIcon.setAttribute("viewBox", "0 0 24 24");
  financingIcon.innerHTML = '<rect x="3" y="3" width="7" height="7" rx="2" fill="#335D9E"/><rect x="14" y="3" width="7" height="7" rx="2" fill="#335D9E"/><rect x="3" y="14" width="7" height="7" rx="2" fill="#335D9E"/><rect x="14" y="14" width="7" height="7" rx="2" fill="#335D9E"/>';
  financingBtn.appendChild(financingIcon);
  financingBtn.addEventListener("click", () => openFinancingModal());

  function draw(yearVal) {
    const assetCategories = computeAssetProjection(yearVal);
    const totalAssets = assetCategories.reduce((s, x) => s + x.value, 0);
    const remDebt = remainingDebtForYear(yearVal);
    const debtVal = Math.min(remDebt, totalAssets);
    const equityVal = Math.max(0, totalAssets - debtVal);
    
    // Del opp gjeld i separate segmenter hvis det er flere gjeldsposter
    const financingParts = [];
    if (debts.length === 1) {
      // Hvis kun én gjeldspost, bruk samme struktur som før
      financingParts.push({ key: "Gjeld", value: debtVal, color: "#FCA5A5" });
    } else if (debts.length > 1) {
      // Hvis flere gjeldsposter, beregn andel for hver gjeldspost basert på gjeldende år
      const debtScale = ["#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C"]; // Mildere rødskala
      const totalDebtRaw = debts.reduce((s, d) => s + (d.amount || 0), 0);
      debts.forEach((debt, idx) => {
        if (totalDebtRaw > 0) {
          const debtProportion = (debt.amount || 0) / totalDebtRaw;
          const debtAmount = Math.min(debtVal * debtProportion, debtVal);
          if (debtAmount > 0) {
            financingParts.push({
              key: String(debt.name || `Gjeld ${idx + 1}`),
              value: debtAmount,
              color: debtScale[idx % debtScale.length]
            });
          }
        }
      });
    }
    financingParts.push({ key: "Egenkapital", value: equityVal, color: "#86EFAC" });
    graphWrap.innerHTML = "";
    graphWrap.appendChild(buildFinanceSVG(assetCategories, financingParts, totalAssets));
    // Legg til begge knappene på nytt etter hvert draw-kall
    graphWrap.appendChild(btn);
    graphWrap.appendChild(financingBtn);

    // Oppdater toppbokser med projiserte tall
    const elA = document.getElementById("sum-assets");
    if (elA) elA.textContent = formatNOK(Math.round(totalAssets));
    const elD = document.getElementById("sum-debts");
    if (elD) elD.textContent = formatNOK(Math.round(remDebt));
    const elE = document.getElementById("sum-equity");
    if (elE) elE.textContent = formatNOK(Math.round(totalAssets - remDebt));
  }

  // Initial draw at 2025
  draw(2025);

  // År-slider under grafikken
  const wrap = document.createElement("div");
  wrap.className = "year-slider-card";

  const yearLabel = document.createElement("div");
  yearLabel.className = "year-display";
  yearLabel.textContent = "2025";
  wrap.appendChild(yearLabel);

  const year = document.createElement("input");
  year.type = "range";
  year.min = "2025"; year.max = "2050"; year.step = "1"; year.value = "2025";
  year.className = "year-range";
  year.addEventListener("input", () => { yearLabel.textContent = year.value; draw(Number(year.value)); });
  wrap.appendChild(year);
  root.appendChild(wrap);
  
  // Sikre at slideren er synlig
  wrap.style.display = "flex";
  wrap.style.visibility = "visible";
}

function attachTooltip(svg, target, title, value, percentText) {
  const svgNS = "http://www.w3.org/2000/svg";
  let tip;
  function ensureTip() {
    if (tip) return tip;
    tip = document.createElementNS(svgNS, "g");
    tip.setAttribute("visibility", "hidden");
    tip.setAttribute("pointer-events", "none");
    const bg = document.createElementNS(svgNS, "rect");
    bg.setAttribute("rx", "12"); bg.setAttribute("ry", "12");
    bg.setAttribute("fill", "#FFFFFF");
    bg.setAttribute("stroke", "#E2E8F0");
    bg.setAttribute("filter", "url(#cardShadow)");
    const t1 = document.createElementNS(svgNS, "text"); 
    t1.setAttribute("fill", "#334155"); 
    t1.setAttribute("font-size", "14");
    t1.setAttribute("font-weight", "400");
    t1.setAttribute("font-family", "Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif");
    const t2 = document.createElementNS(svgNS, "text"); 
    t2.setAttribute("fill", "#677788");
    t2.setAttribute("font-size", "14");
    t2.setAttribute("font-weight", "400");
    t2.setAttribute("font-family", "Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif");
    const t3 = document.createElementNS(svgNS, "text"); 
    t3.setAttribute("fill", "#677788");
    t3.setAttribute("font-size", "14");
    t3.setAttribute("font-weight", "400");
    t3.setAttribute("font-family", "Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif");
    tip.appendChild(bg); tip.appendChild(t1); tip.appendChild(t2); tip.appendChild(t3);
    svg.appendChild(tip);
    tip.bg = bg; tip.t1 = t1; tip.t2 = t2; tip.t3 = t3;
    return tip;
  }
  function show(e) {
    const t = ensureTip();
    t.t1.textContent = title;
    t.t2.textContent = `Verdi: ${formatNOK(value)}`;
    t.t3.textContent = `Andel: ${percentText} av total`;
    t.setAttribute("visibility", "visible");
    position(e);
  }
  function hide() { if (tip) tip.setAttribute("visibility", "hidden"); }
  function position(e) {
    const rect = svg.getBoundingClientRect();
    const vb = (svg.getAttribute("viewBox") || "").split(/\s+/).map(Number);
    const vbW = vb.length === 4 ? vb[2] : 1200;
    const vbH = vb.length === 4 ? vb[3] : 700;
    const scaleX = vbW / rect.width;
    const scaleY = vbH / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const padding = 12;
    const t = ensureTip();
    // layout texts
    const baseY = y - 8;
    t.t1.setAttribute("x", String(x + padding)); t.t1.setAttribute("y", String(baseY));
    t.t2.setAttribute("x", String(x + padding)); t.t2.setAttribute("y", String(baseY + 18));
    t.t3.setAttribute("x", String(x + padding)); t.t3.setAttribute("y", String(baseY + 34));
    // measure
    const w = Math.max(t.t1.getBBox().width, t.t2.getBBox().width, t.t3.getBBox().width) + padding * 2;
    const h = 12 + 34 + padding; // approx
    t.bg.setAttribute("x", String(x));
    t.bg.setAttribute("y", String(baseY - 22));
    t.bg.setAttribute("width", String(w));
    t.bg.setAttribute("height", String(44));
  }
  target.addEventListener("mouseenter", show);
  target.addEventListener("mousemove", position);
  target.addEventListener("mouseleave", hide);
}

// --- Grafikk I: Modal og utviklingsdiagram ---
function openGiModal() {
  const modal = document.getElementById("gi-modal");
  const chartRoot = document.getElementById("gi-chart");
  if (!modal || !chartRoot) return;
  chartRoot.innerHTML = "";
  try {
    chartRoot.appendChild(buildAssetsGrowthSVG(2025, 10));
  } catch (e) {
    const p = document.createElement("p");
    p.textContent = `Kunne ikke bygge graf: ${String(e && e.message || e)}`;
    chartRoot.appendChild(p);
  }
  modal.removeAttribute("hidden");
  const onKey = (ev) => { if (ev.key === "Escape") { closeGiModal(); } };
  document.addEventListener("keydown", onKey, { once: true });
  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-close") === "true") {
      closeGiModal();
    }
  }, { once: true });
}
function closeGiModal() {
  const modal = document.getElementById("gi-modal");
  if (modal) modal.setAttribute("hidden", "");
}

// --- Finansiering Modal ---
function openFinancingModal() {
  const modal = document.getElementById("financing-modal");
  const chartRoot = document.getElementById("financing-chart");
  if (!modal || !chartRoot) return;
  chartRoot.innerHTML = "";
  try {
    chartRoot.appendChild(buildFinancingGrowthSVG(2025, 10));
  } catch (e) {
    const p = document.createElement("p");
    p.textContent = `Kunne ikke bygge graf: ${String(e && e.message || e)}`;
    chartRoot.appendChild(p);
  }
  modal.removeAttribute("hidden");
  const onKey = (ev) => { if (ev.key === "Escape") { closeFinancingModal(); } };
  document.addEventListener("keydown", onKey, { once: true });
  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-close") === "true") {
      closeFinancingModal();
    }
  }, { once: true });
}
function closeFinancingModal() {
  const modal = document.getElementById("financing-modal");
  if (modal) modal.setAttribute("hidden", "");
}
function buildAssetsGrowthSVG(startYear, yearsCount) {
  const years = Array.from({ length: yearsCount }, (_, i) => startYear + i);
  const svgNS = "http://www.w3.org/2000/svg";
  const vbW = 1180, vbH = 520;
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.display = "block";

  // Styles for tooltip and other text elements
  const style = document.createElementNS(svgNS, "style");
  style.textContent = `
    .t-label { font-family: Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-weight: 500; font-size: 14px; fill: #334155; }
    .t-value { font-family: Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-weight: 700; font-size: 13px; fill: #677788; }
  `;
  svg.appendChild(style);

  // Bg
  const bg = document.createElementNS(svgNS, "rect");
  bg.setAttribute("x", "0"); bg.setAttribute("y", "0");
  bg.setAttribute("width", String(vbW)); bg.setAttribute("height", String(vbH));
  bg.setAttribute("fill", "#F2F4F7");
  svg.appendChild(bg);

  // Padding/plot area
  const padL = 80, padR = 24, padT = 24, padB = 84; // ekstra bunnplass til forklaring
  const plotW = vbW - padL - padR;
  const plotH = vbH - padT - padB;

  // Gather data
  const perYear = years.map((y) => computeAssetProjection(y));
  const totals = perYear.map((arr) => arr.reduce((s, x) => s + (x.value || 0), 0));
  const maxTotal = Math.max(1, ...totals);

  // Axis grid (5 ticks)
  const ticks = 5;
  for (let i = 0; i <= ticks; i++) {
    const y = padT + plotH - (i / ticks) * plotH;
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", String(padL));
    line.setAttribute("x2", String(padL + plotW));
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    line.setAttribute("stroke", "#E8EBF3");
    svg.appendChild(line);
    const val = (maxTotal * (i / ticks));
    const lab = document.createElementNS(svgNS, "text");
    lab.setAttribute("x", String(padL - 10));
    lab.setAttribute("y", String(y + 4));
    lab.setAttribute("text-anchor", "end");
    lab.setAttribute("fill", "#677788");
    lab.setAttribute("font-size", "16");
    lab.textContent = formatAxisValue(val);
    svg.appendChild(lab);
  }
  // Fjernet y-aksenheten (MNOK) for å gi mer plass øverst

  // Bars
  const count = years.length;
  const gap = 12;
  const barW = Math.max(24, Math.floor((plotW - gap * (count - 1)) / count));
  const xAt = (i) => padL + i * (barW + gap);
  const isDark = (hex) => {
    const v = hex.replace('#','');
    const r = parseInt(v.substring(0,2),16);
    const g = parseInt(v.substring(2,4),16);
    const b = parseInt(v.substring(4,6),16);
    // relative luminance
    const L = (0.2126*r + 0.7152*g + 0.0722*b) / 255;
    return L < 0.5;
  };
  const shortName = (s) => {
    const t = String(s || "").toUpperCase();
    if (t.length <= 10) return t;
    return t.slice(0, 9) + "…";
  };
  perYear.forEach((segments, i) => {
    const total = totals[i] || 1;
    let cursorY = padT + plotH;
    // draw each asset segment bottom-up, keep same order as assets array
    segments.forEach((seg) => {
      const h = total > 0 ? Math.max(1, Math.round((seg.value / maxTotal) * plotH)) : 1;
      const y = cursorY - h;
      cursorY = y;
      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", String(xAt(i)));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(barW));
      rect.setAttribute("height", String(h));
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", seg.color);
      rect.setAttribute("fill-opacity", "0.9");
      rect.setAttribute("stroke", "#E8EBF3");
      rect.setAttribute("stroke-width", "1");
      svg.appendChild(rect);
      const pct = `${((seg.value / total) * 100).toFixed(1).replace('.', ',')} %`;
      attachTooltip(svg, rect, seg.key, Math.round(seg.value), pct);

      // Tekst inne i søyle-segmentet: kun prosent - alltid midtstilt i søylen
      const textColor = isDark(seg.color) ? "#ffffff" : "#0f172a";
      const cx = xAt(i) + barW / 2;
      const cyMid = y + Math.round(h / 2);
      const t = document.createElementNS(svgNS, "text");
      t.setAttribute("x", String(cx));
      t.setAttribute("y", String(cyMid + 4));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", textColor);
      
      // Juster skriftstørrelse basert på antall eiendeler og segmenthøyde
      const numAssets = segments.length;
      let fontSize = 11;
      if (numAssets > 4 || h < 15) {
        fontSize = 9; // Mindre skrift når det er mange eiendeler eller liten høyde
      } else if (h < 22) {
        fontSize = 10; // Litt mindre for mellomstore segmenter
      }
      
      t.setAttribute("font-size", String(fontSize));
      t.setAttribute("font-weight", "700");
      t.textContent = pct.replace(' %','%');
      svg.appendChild(t);
    });
    // x-axis year label
    const xl = document.createElementNS(svgNS, "text");
    xl.setAttribute("x", String(xAt(i) + barW / 2));
    xl.setAttribute("y", String(padT + plotH + 18));
    xl.setAttribute("text-anchor", "middle");
    xl.setAttribute("fill", "#677788");
    xl.setAttribute("font-size", "16");
    xl.textContent = String(years[i]);
    svg.appendChild(xl);
  });

  // Forklaringsvariabler (legend) horisontalt under grafikken
  const legendItems = (perYear[0] || []).map(s => ({ key: s.key, color: s.color }));
  if (legendItems.length > 0) {
    const g = document.createElementNS(svgNS, "g");
    svg.appendChild(g);
    const mark = 12, gapInner = 10;
    // Pre-build items
    const temp = legendItems.map(li => {
      const group = document.createElementNS(svgNS, "g");
      const r = document.createElementNS(svgNS, "rect");
      r.setAttribute("x", "0"); r.setAttribute("y", String(vbH - 30));
      r.setAttribute("width", String(mark)); r.setAttribute("height", String(mark));
      r.setAttribute("rx", "3");
      r.setAttribute("fill", li.color);
      r.setAttribute("fill-opacity", "0.9");
      r.setAttribute("stroke", "#E8EBF3");
      group.appendChild(r);
      const t = document.createElementNS(svgNS, "text");
      t.setAttribute("x", String(mark + gapInner));
      t.setAttribute("y", String(vbH - 20));
      t.setAttribute("fill", "#334155");
      t.setAttribute("font-size", "12");
      t.setAttribute("font-weight", "600");
      t.textContent = li.key;
      group.appendChild(t);
      g.appendChild(group);
      const width = group.getBBox().width;
      return { group, width };
    });
    // Grid layout with centered cells and tighter spacing
    const availW = vbW - padL - padR;
    const maxItemW = Math.max(...temp.map(it => it.width));
    // compute a compact column width that still fits the widest item + padding
    const minColW = Math.max(90, Math.ceil(maxItemW + 16)); // roughly half the previous spacing
    let cols = Math.max(1, Math.floor(availW / minColW));
    cols = Math.min(cols, legendItems.length);
    const rowsCount = Math.ceil(legendItems.length / cols);
    const colW = availW / cols;
    const rowHeight = 26; // slightly tighter vertically
    // center the entire grid area under the plot
    const gridLeft = padL + Math.round((availW - Math.floor(colW) * cols) / 2);
    // Position items in a grid centered within each cell
    temp.forEach((it, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const cellX = gridLeft + Math.round(col * colW);
      const tx = cellX + Math.round((colW - it.width) / 2);
      const dy = -((rowsCount - 1 - row) * rowHeight);
      it.group.setAttribute("transform", `translate(${tx},${dy})`);
    });
  }
  return svg;
}

function formatAxisValue(v) {
  const mnok = v / 1_000_000;
  if (Math.abs(mnok) < 1e-4) return "0 M";
  const opts = {
    minimumFractionDigits: Math.abs(mnok) < 1 ? 1 : 0,
    maximumFractionDigits: Math.abs(mnok) < 10 ? 1 : 0
  };
  const formatted = new Intl.NumberFormat("nb-NO", opts).format(mnok);
  return `${formatted} M`;
}

// --- Finansiering utvikling grafikk ---
function buildFinancingGrowthSVG(startYear, yearsCount) {
  const years = Array.from({ length: yearsCount }, (_, i) => startYear + i);
  const svgNS = "http://www.w3.org/2000/svg";
  const vbW = 1180, vbH = 520;
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.display = "block";

  // Styles for tooltip and other text elements
  const style = document.createElementNS(svgNS, "style");
  style.textContent = `
    .t-label { font-family: Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-weight: 500; font-size: 14px; fill: #334155; }
    .t-value { font-family: Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-weight: 700; font-size: 13px; fill: #677788; }
  `;
  svg.appendChild(style);

  // Bg
  const bg = document.createElementNS(svgNS, "rect");
  bg.setAttribute("x", "0"); bg.setAttribute("y", "0");
  bg.setAttribute("width", String(vbW)); bg.setAttribute("height", String(vbH));
  bg.setAttribute("fill", "#F2F4F7");
  svg.appendChild(bg);

  // Padding/plot area
  const padL = 80, padR = 24, padT = 24, padB = 84;
  const plotW = vbW - padL - padR;
  const plotH = vbH - padT - padB;

  // Gather data - beregn Egenkapital og Gjeld for hvert år
  const assets = AppState.assets || [];
  const debts = AppState.debts || [];
  
  function remainingDebtForYear(yearVal) {
    return debts.reduce((total, debt) => {
      const elapsed = Math.max(0, Number(yearVal) - 2025);
      return total + remainingBalanceAfterYears(debt, elapsed);
    }, 0);
  }

  // Hjelpefunksjon for å beregne gjenværende gjeld for en spesifikk gjeldspost
  function remainingDebtForDebt(debt, yearVal) {
    const elapsed = Math.max(0, Number(yearVal) - 2025);
    return remainingBalanceAfterYears(debt, elapsed);
  }

  const perYear = years.map((y) => {
    const assetCategories = computeAssetProjection(y);
    const totalAssets = assetCategories.reduce((s, x) => s + (x.value || 0), 0);
    const totalRemDebt = remainingDebtForYear(y);
    const totalDebtVal = Math.min(totalRemDebt, totalAssets);
    const equityVal = Math.max(0, totalAssets - totalDebtVal);
    
    // Del opp gjeld i separate segmenter hvis det er flere gjeldsposter
    const segments = [];
    if (debts.length === 1) {
      // Hvis kun én gjeldspost, bruk samme struktur som før
      segments.push({ key: "Gjeld", value: totalDebtVal, color: "#FCA5A5" });
    } else if (debts.length > 1) {
      // Hvis flere gjeldsposter, beregn andel for hver gjeldspost basert på gjeldende år
      const debtScale = ["#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C"]; // Mildere rødskala
      debts.forEach((debt, idx) => {
        const remDebtForThisDebt = remainingDebtForDebt(debt, y);
        if (totalRemDebt > 0) {
          const debtProportion = remDebtForThisDebt / totalRemDebt;
          const debtAmount = Math.min(totalDebtVal * debtProportion, totalDebtVal);
          if (debtAmount > 0) {
            segments.push({
              key: String(debt.name || `Gjeld ${idx + 1}`),
              value: debtAmount,
              color: debtScale[idx % debtScale.length]
            });
          }
        }
      });
    }
    segments.push({ key: "Egenkapital", value: equityVal, color: "#86EFAC" });
    return segments;
  });
  
  const totals = perYear.map((arr) => arr.reduce((s, x) => s + (x.value || 0), 0));
  const maxTotal = Math.max(1, ...totals);

  // Axis grid (5 ticks)
  const ticks = 5;
  for (let i = 0; i <= ticks; i++) {
    const y = padT + plotH - (i / ticks) * plotH;
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", String(padL));
    line.setAttribute("x2", String(padL + plotW));
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    line.setAttribute("stroke", "#E8EBF3");
    svg.appendChild(line);
    const val = (maxTotal * (i / ticks));
    const lab = document.createElementNS(svgNS, "text");
    lab.setAttribute("x", String(padL - 10));
    lab.setAttribute("y", String(y + 4));
    lab.setAttribute("text-anchor", "end");
    lab.setAttribute("fill", "#677788");
    lab.setAttribute("font-size", "16");
    lab.textContent = formatAxisValue(val);
    svg.appendChild(lab);
  }

  // Bars
  const count = years.length;
  const gap = 12;
  const barW = Math.max(24, Math.floor((plotW - gap * (count - 1)) / count));
  const xAt = (i) => padL + i * (barW + gap);
  const isDark = (hex) => {
    const v = hex.replace('#','');
    const r = parseInt(v.substring(0,2),16);
    const g = parseInt(v.substring(2,4),16);
    const b = parseInt(v.substring(4,6),16);
    const L = (0.2126*r + 0.7152*g + 0.0722*b) / 255;
    return L < 0.5;
  };

  perYear.forEach((segments, i) => {
    const total = totals[i] || 1;
    let cursorY = padT + plotH;
    // Tegn segmenter fra bunn til topp: Gjeld nederst, Egenkapital øverst
    segments.forEach((seg) => {
      const h = total > 0 ? Math.max(1, Math.round((seg.value / maxTotal) * plotH)) : 1;
      const y = cursorY - h;
      cursorY = y;
      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", String(xAt(i)));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(barW));
      rect.setAttribute("height", String(h));
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", seg.color);
      rect.setAttribute("fill-opacity", "0.9");
      rect.setAttribute("stroke", "#E8EBF3");
      rect.setAttribute("stroke-width", "1");
      svg.appendChild(rect);
      const pct = `${((seg.value / total) * 100).toFixed(1).replace('.', ',')} %`;
      attachTooltip(svg, rect, seg.key, Math.round(seg.value), pct);

      // Tekst inne i søyle-segmentet: kun prosent - alltid midtstilt i søylen
      const textColor = isDark(seg.color) ? "#ffffff" : "#0f172a";
      const cx = xAt(i) + barW / 2;
      const cyMid = y + Math.round(h / 2);
      const t = document.createElementNS(svgNS, "text");
      t.setAttribute("x", String(cx));
      t.setAttribute("y", String(cyMid + 4));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", textColor);
      
      // Juster skriftstørrelse basert på segmenthøyde
      let fontSize = 11;
      if (h < 15) {
        fontSize = 9;
      } else if (h < 22) {
        fontSize = 10;
      }
      
      t.setAttribute("font-size", String(fontSize));
      t.setAttribute("font-weight", "700");
      t.textContent = pct.replace(' %','%');
      svg.appendChild(t);
    });
    // x-axis year label
    const xl = document.createElementNS(svgNS, "text");
    xl.setAttribute("x", String(xAt(i) + barW / 2));
    xl.setAttribute("y", String(padT + plotH + 18));
    xl.setAttribute("text-anchor", "middle");
    xl.setAttribute("fill", "#677788");
    xl.setAttribute("font-size", "16");
    xl.textContent = String(years[i]);
    svg.appendChild(xl);
  });

  // Forklaringsvariabler (legend) horisontalt under grafikken
  const legendItems = [];
  // Legg til alle gjeldsposter i legend
  if (debts.length === 1) {
    legendItems.push({ key: "Gjeld", color: "#FCA5A5" });
  } else if (debts.length > 1) {
    const debtScale = ["#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C"];
    debts.forEach((debt, idx) => {
      legendItems.push({
        key: String(debt.name || `Gjeld ${idx + 1}`),
        color: debtScale[idx % debtScale.length]
      });
    });
  }
  legendItems.push({ key: "Egenkapital", color: "#86EFAC" });
  if (legendItems.length > 0) {
    const g = document.createElementNS(svgNS, "g");
    svg.appendChild(g);
    const mark = 12, gapInner = 10;
    const temp = legendItems.map(li => {
      const group = document.createElementNS(svgNS, "g");
      const r = document.createElementNS(svgNS, "rect");
      r.setAttribute("x", "0"); r.setAttribute("y", String(vbH - 30));
      r.setAttribute("width", String(mark)); r.setAttribute("height", String(mark));
      r.setAttribute("rx", "3");
      r.setAttribute("fill", li.color);
      r.setAttribute("fill-opacity", "0.9");
      r.setAttribute("stroke", "#E8EBF3");
      group.appendChild(r);
      const t = document.createElementNS(svgNS, "text");
      t.setAttribute("x", String(mark + gapInner));
      t.setAttribute("y", String(vbH - 20));
      t.setAttribute("fill", "#334155");
      t.setAttribute("font-size", "12");
      t.setAttribute("font-weight", "600");
      t.textContent = li.key;
      group.appendChild(t);
      g.appendChild(group);
      const width = group.getBBox().width;
      return { group, width };
    });
    const availW = vbW - padL - padR;
    const maxItemW = Math.max(...temp.map(it => it.width));
    const minColW = Math.max(90, Math.ceil(maxItemW + 16));
    let cols = Math.max(1, Math.floor(availW / minColW));
    cols = Math.min(cols, legendItems.length);
    const rowsCount = Math.ceil(legendItems.length / cols);
    const colW = availW / cols;
    const rowHeight = 26;
    const gridLeft = padL + Math.round((availW - Math.floor(colW) * cols) / 2);
    temp.forEach((it, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const cellX = gridLeft + Math.round(col * colW);
      const tx = cellX + Math.round((colW - it.width) / 2);
      const dy = -((rowsCount - 1 - row) * rowHeight);
      it.group.setAttribute("transform", `translate(${tx},${dy})`);
    });
  }
  return svg;
}

function makeBlock(title, amountText, variant, grow, heightPx) {
  const b = document.createElement("div");
  b.className = `viz-block ${variant || ''}`.trim();
  if (heightPx !== undefined) {
    b.style.height = `${Math.max(56, Math.round(heightPx))}px`;
  }
  const t = document.createElement("div");
  t.style.fontWeight = "700";
  t.style.marginBottom = "8px";
  t.textContent = title;
  const a = document.createElement("div");
  a.className = "value";
  a.textContent = amountText;
  b.appendChild(t);
  b.appendChild(a);
  return b;
}

function createItemRow(collectionName, item) {
  const row = document.createElement("div");
  row.className = "asset-row";

  // Kostnadsrader (inntekter med SKATT/KOSTNAD) markeres
  const markCostIfNeeded = (label) => {
    if (collectionName === "incomes") {
      const U = String(label || "").toUpperCase();
      if (/SKATT|KOSTNAD/.test(U)) row.classList.add("is-cost");
      else row.classList.remove("is-cost");
    }
  };
  markCostIfNeeded(item && item.name);

  const col = document.createElement("div");
  col.className = "asset-col";

  const top = document.createElement("div");
  top.className = "asset-top";

  const name = document.createElement("input");
  name.className = "asset-name";
  name.type = "text";
  name.value = item.name || "";
  name.setAttribute("aria-label", `Navn på ${collectionName.slice(0, -1)}`);
  if (item.locked) {
    name.readOnly = true;
  } else {
    name.addEventListener("input", () => { item.name = name.value; markCostIfNeeded(name.value); setRangeBounds(); });
  }

  const del = document.createElement("button");
  del.className = "asset-delete";
  del.setAttribute("aria-label", `Slett ${collectionName.slice(0, -1)}`);
  del.textContent = "×";
  if (item.locked) {
    del.disabled = true;
    del.style.opacity = "0.5";
    del.style.cursor = "not-allowed";
  } else {
    del.addEventListener("click", () => {
      const list = AppState[collectionName];
      const idx = list.findIndex((x) => x.id === item.id);
      if (idx >= 0) list.splice(idx, 1);
      row.remove();
      updateTopSummaries();
    });
  }

  top.appendChild(name);
  top.appendChild(del);

  const range = document.createElement("input");
  range.className = "asset-range";
  range.type = "range";
  range.min = "0";
  range.max = "50000000"; // 50 mill.
  range.step = "50000";
  range.value = String(item.amount || 0);

  // Juster maksgrense for lønn til 10 MNOK
  function setRangeBounds() {
    if (collectionName === "incomes") {
      const label = String(item.name || name.value || "").toUpperCase();
      // Lønn, Skatt, Utbytter, Andre inntekter, Kostnader: maks 10 MNOK
      if (/L[ØO]NN|SKATT|UTBYT|ANDRE|KOSTNAD/.test(label)) {
        range.max = "10000000";
      } else {
        range.max = "50000000";
      }
      if (Number(range.value) > Number(range.max)) {
        range.value = range.max;
        amount.textContent = formatNOK(Number(range.value));
      }
    }
  }

  const amount = document.createElement("div");
  amount.className = "asset-amount";
  amount.textContent = formatNOK(Number(range.value));
  setRangeBounds();

  range.addEventListener("input", () => {
    const v = Number(range.value);
    item.amount = v;
    amount.textContent = formatNOK(v);
    updateTopSummaries();
  });

  col.appendChild(top);
  col.appendChild(range);

  row.appendChild(col);
  row.appendChild(amount);

  return row;
}

function formatNOK(value) {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(value);
}

function formatNOKPlain(value) {
  return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 }).format(value);
}

function remainingBalanceAfterYears(debt, elapsedYears) {
  const amount = Number(debt && debt.amount) || 0;
  if (amount <= 0) return 0;
  const params = debt.debtParams || AppState.debtParams || {};
  const type = params.type || "Annuitetslån";
  const rate = Number(params.rate) || 0;
  const years = Math.max(1, Number(params.years) || 1);
  const t = Math.max(0, elapsedYears);

  if (/Avdragsfrihet/.test(type)) {
    const match = /(\d+)\s*år/i.exec(type);
    const interestOnlyYears = type === "Avdragsfrihet" ? years : Math.min(match ? Number(match[1]) : years, years);
    const amortYears = type === "Avdragsfrihet" ? 0 : years;
    const totalDuration = interestOnlyYears + amortYears;
    const clampedT = Math.min(t, totalDuration);
    if (clampedT <= interestOnlyYears) return amount;
    if (amortYears <= 0) return amount;
    const n = Math.min(amortYears, clampedT - interestOnlyYears);
    if (rate === 0) {
      const principal = amount / amortYears;
      return Math.max(0, amount - principal * n);
    }
    const annuity = amount * (rate / (1 - Math.pow(1 + rate, -amortYears)));
    const balance = amount * Math.pow(1 + rate, n) - annuity * ((Math.pow(1 + rate, n) - 1) / rate);
    return Math.max(0, balance);
  }

  if (type === "Serielån") {
    const clampedT = Math.min(t, years);
    const principalPortion = amount / years;
    return Math.max(0, amount - principalPortion * clampedT);
  }

  const clampedT = Math.min(t, years);
  if (rate === 0) {
    return Math.max(0, amount * (1 - clampedT / years));
  }
  const annuity = amount * (rate / (1 - Math.pow(1 + rate, -years)));
  const balance = amount * Math.pow(1 + rate, clampedT) - annuity * ((Math.pow(1 + rate, clampedT) - 1) / rate);
  return Math.max(0, balance);
}

// Hjelpefunksjoner for gjeld-beregninger med individuelle debtParams
function calculateAnnualDebtPayment(debt) {
  const P = debt.amount || 0;
  if (P <= 0) return 0;
  
  const debtParams = debt.debtParams || AppState.debtParams;
  const r = debtParams.rate || 0;
  const n = Math.max(1, debtParams.years || 1);
  const type = debtParams.type || "Annuitetslån";
  
  if (/Avdragsfrihet/.test(type)) {
    return P * r; // Kun renter
  } else if (type === "Serielån") {
    return P / n + (P * r) / 2; // Gjennomsnittlig avdrag + gjennomsnittlig renter
  } else {
    // Annuitetslån
    if (r === 0) return P / n;
    return P * (r / (1 - Math.pow(1 + r, -n)));
  }
}

function calculateTotalAnnualDebtPayment(debts) {
  return (debts || AppState.debts || []).reduce((sum, debt) => sum + calculateAnnualDebtPayment(debt), 0);
}

function calculateTotalAnnualInterest(debts) {
  return (debts || AppState.debts || []).reduce((sum, debt) => {
    const P = debt.amount || 0;
    if (P <= 0) return sum;
    const debtParams = debt.debtParams || AppState.debtParams;
    return sum + (P * (debtParams.rate || 0));
  }, 0);
}

// --- Gjeld modul ---
function createDebtRow(debt) {
  // Sørg for at gjeldsposten har debtParams
  if (!debt.debtParams) {
    debt.debtParams = {
      type: AppState.debtParams.type || "Annuitetslån",
      years: AppState.debtParams.years || 25,
      rate: AppState.debtParams.rate || 0.04
    };
  }

  const container = document.createElement("div");
  container.style.marginBottom = "32px";

  // Navn og beløp-rad
  const nameRow = createItemRow("debts", debt);
  container.appendChild(nameRow);

  // Lånetype for denne gjeldsposten
  const typeLabel = document.createElement("div");
  typeLabel.className = "section-label";
  typeLabel.textContent = "Lånetype";
  typeLabel.style.marginTop = "16px";
  container.appendChild(typeLabel);

  const typeWrap = document.createElement("div");
  typeWrap.className = "select";
  const select = document.createElement("select");
  ["Annuitetslån", "Serielån", "Avdragsfrihet", "Avdragsfrihet 3 år", "Avdragsfrihet 5 år", "Avdragsfrihet 10 år"].forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t.toUpperCase();
    select.appendChild(opt);
  });
  select.value = debt.debtParams.type;
  select.addEventListener("change", () => {
    debt.debtParams.type = select.value;
    updateTopSummaries();
  });
  typeWrap.appendChild(select);
  container.appendChild(typeWrap);

  // Lånetid (år) for denne gjeldsposten
  const yearsLabel = document.createElement("div");
  yearsLabel.className = "section-label";
  yearsLabel.textContent = "Lånetid (år)";
  yearsLabel.style.marginTop = "16px";
  container.appendChild(yearsLabel);

  const yearsRow = document.createElement("div");
  yearsRow.className = "asset-row";
  const yearsCol = document.createElement("div");
  yearsCol.className = "asset-col";
  const yearsRange = document.createElement("input");
  yearsRange.type = "range";
  yearsRange.className = "asset-range";
  yearsRange.min = "1"; yearsRange.max = "30"; yearsRange.step = "1";
  if (debt.debtParams.years > 30) debt.debtParams.years = 30;
  yearsRange.value = String(debt.debtParams.years);
  const yearsOut = document.createElement("div");
  yearsOut.className = "asset-amount";
  yearsOut.textContent = `${debt.debtParams.years} år`;
  yearsRange.addEventListener("input", () => {
    debt.debtParams.years = Number(yearsRange.value);
    yearsOut.textContent = `${yearsRange.value} år`;
    updateTopSummaries();
  });
  yearsCol.appendChild(yearsRange);
  yearsRow.appendChild(yearsCol);
  yearsRow.appendChild(yearsOut);
  container.appendChild(yearsRow);

  // Rentekostnader (%) for denne gjeldsposten
  const rateLabel = document.createElement("div");
  rateLabel.className = "section-label";
  rateLabel.textContent = "Rentekostnader (%)";
  rateLabel.style.marginTop = "16px";
  container.appendChild(rateLabel);

  const rateRow = document.createElement("div");
  rateRow.className = "asset-row";
  const rateCol = document.createElement("div");
  rateCol.className = "asset-col";
  const rateRange = document.createElement("input");
  rateRange.type = "range";
  rateRange.className = "asset-range";
  rateRange.min = "0"; rateRange.max = "20"; rateRange.step = "0.1";
  rateRange.value = String(debt.debtParams.rate * 100);
  const rateOut = document.createElement("div");
  rateOut.className = "asset-amount";
  rateOut.textContent = `${(debt.debtParams.rate * 100).toFixed(1).replace('.', ',')} %`;
  rateRange.addEventListener("input", () => {
    debt.debtParams.rate = Number(rateRange.value) / 100;
    rateOut.textContent = `${Number(rateRange.value).toFixed(1).replace('.', ',')} %`;
    updateTopSummaries();
  });
  rateCol.appendChild(rateRange);
  rateRow.appendChild(rateCol);
  rateRow.appendChild(rateOut);
  container.appendChild(rateRow);

  return container;
}

function renderDebtModule(root) {
  root.innerHTML = "";

  const panel = document.createElement("div");
  panel.className = "panel debt";

  const heading = document.createElement("h3");
  heading.textContent = "Gjeld";
  panel.appendChild(heading);

  const list = document.createElement("div");
  list.className = "assets";
  panel.appendChild(list);

  AppState.debts.forEach((item) => list.appendChild(createDebtRow(item)));

  const addBtn = document.createElement("button");
  addBtn.className = "btn-add";
  addBtn.textContent = "Legg til gjeld";
  addBtn.addEventListener("click", () => {
    const newItem = {
      id: genId(),
      name: "NY GJELD",
      amount: 0,
      debtParams: {
        type: AppState.debtParams.type || "Annuitetslån",
        years: AppState.debtParams.years || 25,
        rate: AppState.debtParams.rate || 0.04
      }
    };
    AppState.debts.push(newItem);
    list.appendChild(createDebtRow(newItem));
  });
  panel.appendChild(addBtn);

  root.appendChild(panel);
  updateTopSummaries();
}

// --- Inntekter modul ---
function renderIncomeModule(root) {
  root.innerHTML = "";

  const panel = document.createElement("div");
  panel.className = "panel";

  const heading = document.createElement("h3");
  heading.textContent = "Inntekt";
  panel.appendChild(heading);

  const list = document.createElement("div");
  list.className = "assets";
  panel.appendChild(list);

  AppState.incomes.forEach((item) => list.appendChild(createItemRow("incomes", item)));

  const addBtn = document.createElement("button");
  addBtn.className = "btn-add";
  addBtn.textContent = "Legg til inntekt";
  addBtn.addEventListener("click", () => {
    const newItem = { id: genId(), name: "NY INNTEKT", amount: 0 };
    AppState.incomes.push(newItem);
    list.appendChild(createItemRow("incomes", newItem));
  });
  panel.appendChild(addBtn);

  root.appendChild(panel);
  updateTopSummaries();
}

// --- Analyse modul ---
function renderAnalysisModule(root) {
  root.innerHTML = "";

  const panel = document.createElement("div");
  panel.className = "panel";

  const heading = document.createElement("h3");
  heading.textContent = "Nøkkeltall og anbefalinger";
  panel.appendChild(heading);

  // Aggregates
  const totalAssets = AppState.assets.reduce((s, x) => s + (x.amount || 0), 0);
  const totalDebt = AppState.debts.reduce((s, x) => s + (x.amount || 0), 0);
  const upper = (s) => String(s || "").toUpperCase();
  const incomeItems = AppState.incomes;
  const annualCosts = incomeItems
    .filter((x) => /SKATT|KOSTNAD/.test(upper(x.name)))
    .reduce((s, x) => s + (x.amount || 0), 0);
  const totalIncome = incomeItems
    .filter((x) => !/SKATT|KOSTNAD/.test(upper(x.name)))
    .reduce((s, x) => s + (x.amount || 0), 0);

  // Debt service per year (beregnet per gjeldspost)
  const annualDebtPayment = calculateTotalAnnualDebtPayment(AppState.debts);

  const cashflow = totalIncome - annualCosts - annualDebtPayment;
  // Din verdi: default 0 kr
  const bufferCurrent = 0;
  // Anbefalt buffer: (årlig total inntekt / 12) x 3
  const bufferRecommended = (totalIncome / 12) * 3; // 3 mnd av inntekt

  // Ratios
  const incomeToDebt = totalDebt > 0 ? totalIncome / totalDebt : 0;
  const debtServiceToIncome = totalIncome > 0 ? annualDebtPayment / totalIncome : 0;
  const debtToIncome = totalIncome > 0 ? totalDebt / totalIncome : 0;
  const equity = totalAssets - totalDebt;
  const leverage = equity > 0 ? totalDebt / equity : Infinity;

  function statusSpan(ok) {
    const span = document.createElement("span");
    span.className = `status ${ok ? "ok" : "warn"}`;
    span.textContent = ok ? "OK" : "SJEKK";
    return span;
  }

  function recCell(text, ok) {
    const wrap = document.createElement("span");
    const rec = document.createElement("span");
    rec.textContent = text;
    rec.style.marginRight = "8px";
    wrap.appendChild(rec);
    wrap.appendChild(statusSpan(ok));
    return wrap;
  }

  function tr(label, valueEl, recEl) {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td"); td1.textContent = label; td1.className = "muted";
    const td2 = document.createElement("td"); td2.appendChild(valueEl);
    const td3 = document.createElement("td"); if (recEl) td3.appendChild(recEl); else td3.textContent = "-"; td3.className = recEl ? "" : "muted";
    tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
    return tr;
  }

  function textNode(txt) { const s = document.createElement("span"); s.textContent = txt; return s; }

  const table = document.createElement("table");
  table.className = "kpi-table";
  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>Indikator</th><th>Din verdi</th><th>Anbefaling</th></tr>";
  const tbody = document.createElement("tbody");

  tbody.appendChild(tr("Sum inntekter", textNode(formatNOK(totalIncome))));
  const costsRow = tr("Årlige kostnader", textNode(formatNOK(annualCosts)));
  costsRow.classList.add("is-cost");
  tbody.appendChild(costsRow);
  const debtSvcRow = tr("Renter og avdrag per år", textNode(formatNOK(Math.round(annualDebtPayment))));
  debtSvcRow.classList.add("is-cost");
  tbody.appendChild(debtSvcRow);

  const cashRow = tr("Kontantstrøm per år", textNode(formatNOK(Math.round(cashflow))));
  if (cashflow < 0) cashRow.classList.add("is-cost");
  tbody.appendChild(cashRow);
  tbody.appendChild(tr(
    "Anbefalt bufferkonto / Likviditetsfond",
    textNode(formatNOK(Math.round(bufferCurrent))),
    textNode(formatNOK(Math.round(bufferRecommended)))
  ));

  // Thresholds
  const incomeDebtOk = incomeToDebt >= 0.2; // >=20%
  const dsIncomeOk = debtServiceToIncome <= 0.3; // <=30%
  const debtIncomeOk = debtToIncome <= 5; // <=5x
  const leverageOk = leverage <= 2.5; // <=2.5x

  tbody.appendChild(
    tr("Sum Inntekter / Gjeld", textNode(`${incomeToDebt.toFixed(2)}x`), recCell("> 20%", incomeDebtOk))
  );

  tbody.appendChild(
    tr("Renter og avdrag / Sum inntekter", textNode(`${(debtServiceToIncome*100).toFixed(1)}%`), recCell("< 30%", dsIncomeOk))
  );

  tbody.appendChild(
    tr("Gjeld / Sum inntekter", textNode(`${debtToIncome.toFixed(2)}x`), recCell("< 5x", debtIncomeOk))
  );

  tbody.appendChild(
    tr(
      "Gjeldsgrad (gjeld / egenkapital)",
      textNode(`${isFinite(leverage) ? leverage.toFixed(2) + 'x' : '∞'}`),
      recCell("< 2.5x", leverageOk)
    )
  );

  table.appendChild(thead);
  table.appendChild(tbody);
  panel.appendChild(table);
  root.appendChild(panel);
  updateTopSummaries();
}

// --- Tapsbærende Evne (TBE) ---
function renderTbeModule(root) {
  root.innerHTML = "";

  const panel = document.createElement("div");
  panel.className = "panel";

  const heading = document.createElement("h3");
  heading.textContent = "Tapsbærende evne (TBE)";
  panel.appendChild(heading);

  // Hent grunnlag
  const totalAssets = (AppState.assets || []).reduce((s, x) => s + (x.amount || 0), 0);
  const totalDebt = (AppState.debts || []).reduce((s, x) => s + (x.amount || 0), 0);

  const incomeItems = AppState.incomes || [];
  const upper = (s) => String(s || "").toUpperCase();
  const annualCosts = incomeItems.filter((x) => /SKATT|KOSTNAD/.test(upper(x.name))).reduce((s, x) => s + (x.amount || 0), 0);
  const totalIncome = incomeItems.filter((x) => !/SKATT|KOSTNAD/.test(upper(x.name))).reduce((s, x) => s + (x.amount || 0), 0);

  // Gjeldsforpliktelser (per år) - beregnet per gjeldspost
  const annualDebtPayment = calculateTotalAnnualDebtPayment(AppState.debts);

  // Nøkler
  const equity = totalAssets - totalDebt;
  const disposableCashflow = totalIncome - annualCosts; // etter skatt/utgifter, før renter/avdrag

  const debtToIncome = totalIncome > 0 ? totalDebt / totalIncome : 0; // Gjeldsgrad
  const equityPct = totalAssets > 0 ? (equity / totalAssets) * 100 : 0; // EK%
  const cashToDebt = totalDebt > 0 ? (disposableCashflow + annualDebtPayment) / totalDebt : 0; // (Kontantstrøm + renter og avdrag) / Gjeld

  // Klassifisering iht. kriterier
  // Justert terskler (mindre strenge) iht. spesifikasjonen
  // Gjeld/inntekt: Bra < 3x, Ok 3–5x, Dårlig > 5x
  function scoreDebtToIncome(v) { if (v < 3.0) return "high"; if (v <= 5.0) return "mid"; return "low"; }
  // EK-andel: Bra >= 35%, Ok 20–35%, Dårlig < 20%
  function scoreEquityPct(v) { if (v >= 35) return "high"; if (v >= 20) return "mid"; return "low"; }
  // Kontantstrøm/gjeld: Bra >= 25%, Ok 10–25%, Dårlig < 10%
  function scoreCashToDebt(v) { if (v >= 0.25) return "high"; if (v >= 0.10) return "mid"; return "low"; }

  const s1 = scoreDebtToIncome(debtToIncome);
  const s2 = scoreEquityPct(equityPct);
  const s3 = scoreCashToDebt(cashToDebt);

  const scoreMap = { low: 1, mid: 2, high: 3 };
  const totalScore = (scoreMap[s1] || 0) + (scoreMap[s2] || 0) + (scoreMap[s3] || 0);
  let overall = totalScore <= 4 ? "low" : totalScore <= 6 ? "mid" : "high";

  function statusLabel(s) { return s === "high" ? "HØY" : s === "mid" ? "MIDDELS" : "LAV"; }
  function statusClass(s) { return s === "high" ? "ok" : s === "mid" ? "mid" : "warn"; }
  function fmtX(x) { return `${x.toFixed(2).replace('.', ',')}x`; }
  function fmtPct(p) { return `${p.toFixed(1).replace('.', ',')} %`; }

  // Tabell
  const table = document.createElement("table");
  table.className = "kpi-table";
  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>Nøkkeltall</th><th>Resultat</th><th>Vurdering</th><th>Formel</th><th>Måler</th></tr>";
  const tbody = document.createElement("tbody");

  function trRow(name, resultText, score, formula, measure) {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td"); td1.textContent = name; td1.className = "muted";
    const td2 = document.createElement("td"); td2.textContent = resultText;
    const td3 = document.createElement("td"); const wrap = document.createElement("span"); wrap.className = `status ${statusClass(score)}`; wrap.textContent = statusLabel(score); td3.appendChild(wrap);
    const td4 = document.createElement("td"); td4.textContent = formula; td4.className = "muted";
    const td5 = document.createElement("td"); td5.textContent = measure; td5.className = "muted";
    tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tr.appendChild(td4); tr.appendChild(td5);
    return tr;
  }

  tbody.appendChild(trRow("Gjeldsgrad", fmtX(debtToIncome), s1, "Total gjeld / Årlig inntekt", "Gjeldskapasitet"));
  tbody.appendChild(trRow("Egenkapitalandel (EK%)", fmtPct(equityPct), s2, "(Total EK / Totale eiendeler) × 100", "Soliditet"));
  tbody.appendChild(trRow("Kontantstrøm/Gjeld", fmtX(cashToDebt), s3, "(Årlig kontantstrøm + renter og avdrag) / Gjeld", "Likviditet"));

  table.appendChild(thead);
  table.appendChild(tbody);
  panel.appendChild(table);

  // Konklusjon
  const concl = document.createElement("div");
  concl.className = `tbe-conclusion ${overall}`;
  const title = document.createElement("div");
  title.className = "tbe-title";
  title.textContent = `Samlet TBE: ${statusLabel(overall)} (${totalScore} poeng)`;
  const expl = document.createElement("p");
  let reason = "";
  if (overall === "low") {
    const worst = s1 === "low" ? `høy Gjeldsgrad (${fmtX(debtToIncome)})` : s2 === "low" ? `lav EK% (${fmtPct(equityPct)})` : `lav Kontantstrøm/Gjeld (${fmtX(cashToDebt)})`;
    reason = `Din Tapsbærende Evne er Lav med ${totalScore} poeng. Løft indikatorene (bl.a. ${worst}) for å nå minst 5 poeng.`;
  } else if (overall === "mid") {
    reason = `Din Tapsbærende Evne er Middels med ${totalScore} poeng. For å nå Høy må du få minst 7 poeng totalt.`;
  } else {
    reason = `Alle tre nøkkeltall gir samlet ${totalScore} poeng. Økonomien fremstår robust.`;
  }
  expl.textContent = reason;
  concl.appendChild(title);
  concl.appendChild(expl);
  panel.appendChild(concl);

  // Grunnlagsblokk bevisst utelatt i TBE-visningen

  root.appendChild(panel);
  updateTopSummaries();
}

function getFinancialSnapshot() {
  const assets = AppState.assets || [];
  const debts = AppState.debts || [];
  const incomes = AppState.incomes || [];
  const sumAssets = assets.reduce((s, x) => s + (x.amount || 0), 0);
  const sumDebts = debts.reduce((s, x) => s + (x.amount || 0), 0);
  const equity = sumAssets - sumDebts;

  const upper = (s) => String(s || "").toUpperCase();
  const incomeItems = incomes || [];
  const annualCosts = incomeItems
    .filter((x) => /SKATT|KOSTNAD/.test(upper(x.name)))
    .reduce((s, x) => s + (x.amount || 0), 0);
  const totalIncome = incomeItems
    .filter((x) => !/SKATT|KOSTNAD/.test(upper(x.name)))
    .reduce((s, x) => s + (x.amount || 0), 0);
  const disposableIncome = totalIncome - annualCosts;
  const annualDebtPayment = calculateTotalAnnualDebtPayment(debts);
  const cashflow = Math.round(totalIncome - annualCosts - annualDebtPayment);

  return {
    sumAssets,
    sumDebts,
    equity,
    totalIncome,
    annualCosts,
    annualDebtPayment,
    cashflow,
    disposableIncome
  };
}

function calculateTbeSummary(snapshot) {
  const totalAssets = snapshot.sumAssets;
  const totalDebt = snapshot.sumDebts;
  const totalIncome = snapshot.totalIncome;
  const disposableIncome = snapshot.disposableIncome;
  const annualDebtPayment = snapshot.annualDebtPayment;
  const equity = snapshot.equity;

  const debtToIncome = totalIncome > 0 ? totalDebt / totalIncome : 0;
  const equityPct = totalAssets > 0 ? (equity / totalAssets) * 100 : 0;
  const cashToDebt = totalDebt > 0 ? (disposableIncome + annualDebtPayment) / totalDebt : 0;

  const scoreDebtToIncome = (v) => (v < 3.0 ? "high" : v <= 5.0 ? "mid" : "low");
  const scoreEquityPct = (v) => (v >= 35 ? "high" : v >= 20 ? "mid" : "low");
  const scoreCashToDebt = (v) => (v >= 0.25 ? "high" : v >= 0.10 ? "mid" : "low");

  const s1 = scoreDebtToIncome(debtToIncome);
  const s2 = scoreEquityPct(equityPct);
  const s3 = scoreCashToDebt(cashToDebt);

  const breakdown = { debtToIncome: s1, equityPct: s2, cashToDebt: s3 };

  const scoreMap = { low: 1, mid: 2, high: 3 };
  const totalScore = (scoreMap[s1] || 0) + (scoreMap[s2] || 0) + (scoreMap[s3] || 0);

  const overall = totalScore <= 4 ? "low" : totalScore <= 6 ? "mid" : "high";

  const statusLabel = overall === "high" ? "Høy" : overall === "mid" ? "Middels" : "Lav";
  const statusClass = overall === "high" ? "status-high" : overall === "mid" ? "status-mid" : "status-low";

  return {
    label: statusLabel,
    cssClass: statusClass,
    totalScore,
    breakdown
  };
}

function updateForsideCards(snapshot, forceActive = false) {
  const forsideIsActive = forceActive || !!document.querySelector('.nav-item[data-section="Forside"].is-active');
  const summaryCards = document.querySelectorAll(".summary-card");
  summaryCards.forEach(card => {
    card.classList.toggle("is-forside", forsideIsActive);
  });

  const tbe = calculateTbeSummary(snapshot);
  const tbeSub = document.getElementById("forside-card-subtitle-tbe");
  if (tbeSub) {
    tbeSub.textContent = `Score: ${tbe.totalScore} poeng`;
    tbeSub.classList.remove("status-high", "status-mid", "status-low");
    tbeSub.classList.add(tbe.cssClass);
  }
}

function updateTopSummaries() {
  const snapshot = getFinancialSnapshot();
  const el = document.getElementById("sum-assets");
  if (el) el.textContent = formatNOK(snapshot.sumAssets);

  const elD = document.getElementById("sum-debts");
  if (elD) elD.textContent = formatNOK(snapshot.sumDebts);

  const elE = document.getElementById("sum-equity");
  if (elE) elE.textContent = formatNOK(snapshot.equity);

  // Kontantstrøm per år fra Analyse-beregningen
  const elC = document.getElementById("sum-cashflow");
  if (elC) elC.textContent = formatNOK(snapshot.cashflow);

  updateForsideCards(snapshot);
}



// --- Output modal, copy, and generation ---
function initOutputUI() {
  const fab = document.getElementById("output-fab");
  const modal = document.getElementById("output-modal");
  const textArea = document.getElementById("output-text");
  const copyBtn = document.getElementById("copy-output");

  if (!fab || !modal || !textArea || !copyBtn) return;

  function openModal() {
    // Generate fresh output every time
    try {
      textArea.value = generateOutputText();
    } catch (e) {
      textArea.value = `Kunne ikke generere output.\n${String(e && e.message || e)}`;
    }
    modal.removeAttribute("hidden");
    // Focus for accessibility
    setTimeout(() => { textArea.focus(); textArea.select(); }, 0);
    document.addEventListener("keydown", onKeyDown);
  }

  function closeModal() {
    modal.setAttribute("hidden", "");
    document.removeEventListener("keydown", onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
  }

  fab.addEventListener("click", openModal);
  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && (t.getAttribute && t.getAttribute("data-close") === "true")) {
      closeModal();
    }
  });

  copyBtn.addEventListener("click", async () => {
    const reset = () => {
      copyBtn.classList.remove("is-success");
      const icon = copyBtn.querySelector(".copy-icon");
      const label = copyBtn.querySelector(".copy-label");
      if (icon) icon.textContent = "📋";
      if (label) label.textContent = "Kopier";
    };

    try {
      const txt = textArea.value || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(txt);
      } else {
        // Fallback method
        textArea.focus();
        textArea.select();
        const ok = document.execCommand && document.execCommand("copy");
        if (!ok) throw new Error("Clipboard API ikke tilgjengelig");
      }
      copyBtn.classList.add("is-success");
      const icon = copyBtn.querySelector(".copy-icon");
      const label = copyBtn.querySelector(".copy-label");
      if (icon) icon.textContent = "✔"; // hake-ikon
      if (label) label.textContent = "Kopiert!";
      setTimeout(reset, 2000);
    } catch (err) {
      // Error state visual
      const label = copyBtn.querySelector(".copy-label");
      if (label) label.textContent = "Feil ved kopiering";
      setTimeout(() => { const l = copyBtn.querySelector(".copy-label"); if (l) l.textContent = "Kopier"; }, 2000);
      console.error("Kopiering feilet:", err);
    }
  });
}

function generateOutputText() {
  // Samle alle inn- og ut-data med norsk formatering
  const nf = new Intl.NumberFormat("nb-NO");
  const nok = (v) => new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(v || 0);
  const nokSigned = (v) => new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(v);

  // Inputs (skann AppState)
  const assets = (AppState.assets || []).map((a) => `- ${a.name}: ${nok(a.amount)}`).join("\n");
  const debts = (AppState.debts || []).map((d) => `- ${d.name}: ${nok(d.amount)}`).join("\n");
  const incomes = (AppState.incomes || []).map((i) => `- ${i.name}: ${nok(i.amount)}`).join("\n");
  // Generer gjeldsparametere per gjeldspost
  const debtParamsLines = [];
  (AppState.debts || []).forEach((debt, idx) => {
    const debtParams = debt.debtParams || AppState.debtParams;
    debtParamsLines.push(`${debt.name || `Gjeld ${idx + 1}`}:`);
    debtParamsLines.push(`  - Lånetype: ${debtParams.type}`);
    debtParamsLines.push(`  - Lånetid: ${nf.format(debtParams.years)} år`);
    debtParamsLines.push(`  - Rente: ${(debtParams.rate*100).toFixed(1).replace('.', ',')} %`);
  });
  const debtParams = debtParamsLines.join('\n');
  const exp = AppState.expectations || { likvider: 0, fastEiendom: 0, investeringer: 0, andreEiendeler: 0, kpi: 0 };
  const expectations = [
    `- LIKVIDER: ${nf.format(exp.likvider)} %`,
    `- FAST EIENDOM: ${nf.format(exp.fastEiendom)} %`,
    `- INVESTERINGER: ${nf.format(exp.investeringer)} %`,
    `- ANDRE EIENDELER: ${nf.format(exp.andreEiendeler)} %`,
    `- KPI: ${nf.format(exp.kpi)} %`
  ].join("\n");

  // Results (sanntid)
  const sumAssets = (AppState.assets || []).reduce((s, x) => s + (x.amount || 0), 0);
  const sumDebts = (AppState.debts || []).reduce((s, x) => s + (x.amount || 0), 0);
  const equity = sumAssets - sumDebts;

  const incomeItems = AppState.incomes || [];
  const upper = (s) => String(s || "").toUpperCase();
  const annualCosts = incomeItems.filter((x) => /SKATT|KOSTNAD/.test(upper(x.name))).reduce((s, x) => s + (x.amount || 0), 0);
  const totalIncome = incomeItems.filter((x) => !/SKATT|KOSTNAD/.test(upper(x.name))).reduce((s, x) => s + (x.amount || 0), 0);
  // Beregn årlig gjeldstjeneste basert på hver gjeldsposts egen debtParams
  const annualDebtPayment = calculateTotalAnnualDebtPayment(AppState.debts);
  const cashflow = Math.round(totalIncome - annualCosts - annualDebtPayment);

  // Waterfall-detaljer (inntekter og kostnader eksplisitt)
  const wage = incomeItems.filter(x => /L[ØO]NN/.test(upper(x.name))).reduce((s,x)=> s + (x.amount || 0), 0);
  const dividends = incomeItems.filter(x => /UTBYT/.test(upper(x.name))).reduce((s,x)=> s + (x.amount || 0), 0);
  const otherIncome = incomeItems.filter(x => /ANDRE/.test(upper(x.name))).reduce((s,x)=> s + (x.amount || 0), 0);
  const annualTax = incomeItems.filter(x => /SKATT/.test(upper(x.name))).reduce((s,x)=> s + (x.amount || 0), 0);
  const annualCostsOnly = incomeItems.filter(x => /KOSTNAD/.test(upper(x.name))).reduce((s,x)=> s + (x.amount || 0), 0);
  const totalDebt = sumDebts;
  const interestCost = calculateTotalAnnualInterest(AppState.debts);
  const annualPaymentWF = calculateTotalAnnualDebtPayment(AppState.debts);
  const principalCost = Math.max(0, annualPaymentWF - interestCost);

  // TBE-indikatorer
  const equityPct = sumAssets > 0 ? (equity / sumAssets) * 100 : 0;
  const debtToIncome = totalIncome > 0 ? sumDebts / totalIncome : 0;
  const disposableCashflow = totalIncome - annualCosts; // før renter/avdrag
  const cashToDebt = sumDebts > 0 ? (disposableCashflow + annualDebtPayment) / sumDebts : 0;
  const scoreDebtToIncome = (v) => v < 3.0 ? "HØY" : v <= 5.0 ? "MIDDELS" : "LAV";
  const scoreEquityPct = (v) => v >= 35 ? "HØY" : v >= 20 ? "MIDDELS" : "LAV";
  const scoreCashToDebt = (v) => v >= 0.25 ? "HØY" : v >= 0.10 ? "MIDDELS" : "LAV";
  const s1 = scoreDebtToIncome(debtToIncome);
  const s2 = scoreEquityPct(equityPct);
  const s3 = scoreCashToDebt(cashToDebt);
  const numericMap = { "LAV": 1, "MIDDELS": 2, "HØY": 3 };
  const totalTbeScore = (numericMap[s1] || 0) + (numericMap[s2] || 0) + (numericMap[s3] || 0);
  const overallTBE = totalTbeScore <= 4 ? "LAV" : totalTbeScore <= 6 ? "MIDDELS" : "HØY";

  // Strukturert tekst
  const lines = [];
  lines.push("=== INPUT ===");
  lines.push("Eiendeler:");
  lines.push(assets || "- (ingen)");
  lines.push("");
  lines.push("Gjeld:");
  lines.push(debts || "- (ingen)");
  lines.push("");
  lines.push("Inntekter og kostnader:");
  lines.push(incomes || "- (ingen)");
  lines.push("");
  lines.push("Låneparametre:");
  lines.push(debtParams);
  lines.push("");
  lines.push("Forventninger (% p.a.):");
  lines.push(expectations);
  lines.push("");
  lines.push("=== RESULTATER (sanntid) ===");
  lines.push(`Sum eiendeler: ${nok(sumAssets)}`);
  lines.push(`Sum gjeld: ${nok(sumDebts)}`);
  lines.push(`Egenkapital: ${nok(equity)}`);
  lines.push(`Årlig kontantstrøm: ${nok(cashflow)}`);

  // Waterfall-detaljer
  lines.push("");
  lines.push("=== KONTANTSTRØM (detaljer) ===");
  if (wage > 0) lines.push(`Lønnsinntekt: ${nok(wage)}`);
  if (dividends > 0) lines.push(`Utbytter: ${nok(dividends)}`);
  if (otherIncome > 0) lines.push(`Andre inntekter: ${nok(otherIncome)}`);
  if (annualTax > 0) lines.push(`Årlig skatt: ${nokSigned(-annualTax)}`);
  if (annualCostsOnly > 0) lines.push(`Årlige kostnader: ${nokSigned(-annualCostsOnly)}`);
  if (interestCost > 0) lines.push(`Rentekostnader: ${nokSigned(-Math.round(interestCost))}`);
  if (principalCost > 0) lines.push(`Avdrag: ${nokSigned(-Math.round(principalCost))}`);
  lines.push(`Netto kontantstrøm: ${nokSigned(Math.round(cashflow))}`);

  // TBE-oversikt
  lines.push("");
  lines.push("=== TBE (indikatorer) ===");
  lines.push(`Gjeld/inntekter: ${debtToIncome.toFixed(2)}x · ${s1}`);
  lines.push(`Egenkapitalandel: ${equityPct.toFixed(1).replace('.', ',')} % · ${s2}`);
  lines.push(`Kontantstrøm/gjeld: ${cashToDebt.toFixed(2)}x · ${s3}`);
  lines.push(`Samlet TBE: ${overallTBE} (${totalTbeScore} poeng)`);

  return lines.join("\n");
}


