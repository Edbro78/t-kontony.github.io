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
    { id: genId(), name: "BOLIGLÅN", amount: 10000000 }
  ],
  incomes: [
    { id: genId(), name: "LØNNSINNTEKT", amount: 1500000 },
    { id: genId(), name: "UTBYTTER", amount: 0 },
    { id: genId(), name: "ANDRE INNTEKTER", amount: 0 },
    { id: genId(), name: "ÅRLIG SKATT", amount: 0 },
    { id: genId(), name: "ÅRLIGE KOSTNADER", amount: 0 }
  ],
  debtParams: { type: "Annuitetslån", years: 25, rate: 0.04 },
  expectations: { likvider: 4, fastEiendom: 5, investeringer: 8, andreEiendeler: 0 }
};

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const sectionTitle = document.getElementById("sectionTitle");
  const moduleRoot = document.getElementById("module-root");
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
        if (section === "Eiendeler") renderAssetsModule(moduleRoot);
        else if (section === "Gjeld") renderDebtModule(moduleRoot);
        else if (section === "Inntekter") renderIncomeModule(moduleRoot);
        else if (section === "Analyse") renderAnalysisModule(moduleRoot);
        else if (section === "Forventet avkastning") renderExpectationsModule(moduleRoot);
        else if (section === "Grafikk I") renderGraphicsModule(moduleRoot);
        else if (section === "Grafikk II") renderDonutModule(moduleRoot);
        else if (section === "Kontantstrøm") renderWaterfallModule(moduleRoot);
        else if (section === "Fremtidig utvikling") renderFutureModule(moduleRoot);
        else moduleRoot.innerHTML = "";
      }
      updateTopSummaries();
    });
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const currentlyActive = document.querySelector(".nav-item.is-active");
      if (currentlyActive) currentlyActive.classList.remove("is-active");

      item.classList.add("is-active");

      const title = item.getAttribute("data-section") || item.textContent || "";
      if (sectionTitle) sectionTitle.textContent = title;

      if (!moduleRoot) return;
      if (title === "Eiendeler") {
        renderAssetsModule(moduleRoot);
      } else if (title === "Gjeld") {
        renderDebtModule(moduleRoot);
      } else if (title === "Inntekter") {
        renderIncomeModule(moduleRoot);
      } else if (title === "Analyse") {
        renderAnalysisModule(moduleRoot);
      } else if (title === "Forventet avkastning") {
        renderExpectationsModule(moduleRoot);
      } else if (title === "Grafikk I") {
        renderGraphicsModule(moduleRoot);
      } else if (title === "Grafikk II") {
        renderDonutModule(moduleRoot);
      } else if (title === "Kontantstrøm") {
        renderWaterfallModule(moduleRoot);
      } else if (title === "Fremtidig utvikling") {
        renderFutureModule(moduleRoot);
      } else {
        moduleRoot.innerHTML = "";
      }
    });
  });

  // Last inn Eiendeler som startvisning
  if (moduleRoot) {
    renderAssetsModule(moduleRoot);
  }
  // Oppdater summer i topp-boksene
  updateTopSummaries();
});


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
    { key: "likvider", label: "LIKVIDER" },
    { key: "fastEiendom", label: "FAST EIENDOM" },
    { key: "investeringer", label: "INVESTERINGER" },
    { key: "andreEiendeler", label: "ANDRE EIENDELER" }
  ];

  items.forEach(({ key, label }) => {
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
    range.min = "0";
    range.max = "12";
    range.step = "1";
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

// --- Grafikk modul ---
function renderGraphicsModule(root) {
  root.innerHTML = "";

  // Bruk faktiske eiendelsnavn (identiske med Eiendeler-fanen)
  const assets = AppState.assets || [];
  const debts = AppState.debts || [];
  const blueScale = ["#2A4D80", "#355F9E", "#60A5FA", "#00A9E0", "#294269", "#203554"];
  const assetCategories = assets.map((a, idx) => ({
    key: String(a.name || `Eiendel ${idx + 1}`),
    value: a.amount || 0,
    color: blueScale[idx % blueScale.length]
  }));

  const totalAssets = assetCategories.reduce((s, x) => s + x.value, 0);
  const totalDebtRaw = debts.reduce((s, d) => s + (d.amount || 0), 0);
  const debtVal = Math.min(totalDebtRaw, totalAssets);
  const equityVal = Math.max(0, totalAssets - debtVal);

  const financingParts = [
    { key: "Egenkapital", value: equityVal, color: "#4ADE80" },
    { key: "Gjeld", value: debtVal, color: "#f87171" }
  ];

  // Bygg SVG iht. krav (uten ekstra ramme rundt)
  const svg = buildFinanceSVG(assetCategories, financingParts, totalAssets);
  root.appendChild(svg);

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
    .t-title { font: 900 28px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #E5E7EB; }
    .t-sub { font: 500 14px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #94A3B8; }
    .t-panel { font: 700 20px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #E5E7EB; }
    .t-label { font: 500 14px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #E5E7EB; }
    .t-value { font: 700 13px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #CBD5E1; }
    .t-legend { font: 500 13px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #94A3B8; }
    .sum-text { font: 700 14px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #CBD5E1; display: none; }
  `;
  svg.appendChild(style);

  // Background
  const bg = document.createElementNS(svgNS, "rect");
  bg.setAttribute("x", "0"); bg.setAttribute("y", "0");
  bg.setAttribute("width", String(vbW)); bg.setAttribute("height", String(vbH));
  bg.setAttribute("fill", "#1A2A47");
  svg.appendChild(bg);

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
  const cardStroke = "#364A6E";

  // Estimate card height to fit bar and texts (may approach bottom)
  const cardHeight = Math.min(700 - panelsTopY - 32 - 24, 560); // heuristic to keep legend room

  // Cards
  const leftCard = document.createElementNS(svgNS, "rect");
  leftCard.setAttribute("x", String(leftX));
  leftCard.setAttribute("y", String(panelsTopY));
  leftCard.setAttribute("width", String(panelW));
  leftCard.setAttribute("height", String(cardHeight));
  leftCard.setAttribute("rx", String(cardR)); leftCard.setAttribute("ry", String(cardR));
  leftCard.setAttribute("fill", "#24385B");
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
  rightCard.setAttribute("fill", "#24385B");
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
  const barWidth = 156; // 30% bredere stolper for mer elegant uttrykk
  const gapHeadToBar = 24;
  const barTopY = Math.round(panelsTopY + 24 + 26 + gapHeadToBar);
  const topSpace = barTopY - panelsTopY;
  const barHeight = Math.max(200, cardHeight - topSpace * 2);
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
  leftOutline.setAttribute("stroke", "#364A6E");
  leftOutline.setAttribute("stroke-width", "1.5");
  svg.appendChild(leftOutline);

  // Right financing bar (two parts: bottom Gjeld, top Egenkapital)
  const totalFin = financingParts.reduce((s, x) => s + x.value, 0);
  let cursorYR = barTopY + barHeight;
  const orderRight = [
    financingParts.find(x => x && x.key === "Gjeld") || { key: "Gjeld", value: 0, color: "#f87171" },
    financingParts.find(x => x && x.key === "Egenkapital") || { key: "Egenkapital", value: 0, color: "#10B981" }
  ];
  orderRight.forEach((seg) => {
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

  const rightOutline = document.createElementNS(svgNS, "rect");
  rightOutline.setAttribute("x", String(barRightX));
  rightOutline.setAttribute("y", String(barTopY));
  rightOutline.setAttribute("width", String(barWidth));
  rightOutline.setAttribute("height", String(barHeight));
  rightOutline.setAttribute("rx", "8"); rightOutline.setAttribute("ry", "8");
  rightOutline.setAttribute("fill", "none");
  rightOutline.setAttribute("stroke", "#364A6E"); // subtle contour
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
  eqPlate.setAttribute("fill", "#24385B");
  eqPlate.setAttribute("stroke", "#364A6E");
  eqPlate.setAttribute("filter", "url(#cardShadow)");
  svg.appendChild(eqPlate);

  const eqText = document.createElementNS(svgNS, "text");
  eqText.setAttribute("x", String(eqX));
  eqText.setAttribute("y", String(eqY + 8));
  eqText.setAttribute("text-anchor", "middle");
  eqText.setAttribute("class", "t-label");
  eqText.setAttribute("fill", "#00A9E0");
  eqText.textContent = "=";
  svg.appendChild(eqText);

  // Legend (approximate centering, computed after items are appended)
  const legendItems = [
    { key: "Anleggsmidler", color: "#2A4D80" },
    { key: "Varelager", color: "#355F9E" },
    { key: "Fordringer", color: "#60A5FA" },
    { key: "Kontanter", color: "#00A9E0" },
    { key: "Egenkapital", color: "#4ADE80" },
    { key: "Gjeld", color: "#f87171" }
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

// --- Donut (Grafikk2) ---
function renderDonutModule(root) {
  root.innerHTML = "";
  const assets = AppState.assets || [];
  const blueScale = ["#2A4D80", "#355F9E", "#60A5FA", "#00A9E0", "#294269", "#203554"];
  const assetCategories = assets.map((a, idx) => ({
    key: String(a.name || `Eiendel ${idx + 1}`),
    value: a.amount || 0,
    color: blueScale[idx % blueScale.length]
  })).filter(a => a.value > 0);

  const vbW = 960, vbH = 520;
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
  svg.style.width = "100%"; svg.style.height = "auto"; svg.style.display = "block";

  const bg = document.createElementNS(svgNS, "rect");
  bg.setAttribute("x", "0"); bg.setAttribute("y", "0");
  bg.setAttribute("width", String(vbW)); bg.setAttribute("height", String(vbH));
  bg.setAttribute("fill", "#1A2A47");
  svg.appendChild(bg);

  const centerX = Math.round(vbW * 0.38); const centerY = Math.round(vbH * 0.52);
  const outerR = 208; const innerR = 104; // 30% større donut
  const total = assetCategories.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -Math.PI / 2; // start på topp

  // Tooltip
  const tip = document.createElementNS(svgNS, "g");
  tip.setAttribute("visibility", "hidden");
  tip.setAttribute("pointer-events", "none");
  const tipBg = document.createElementNS(svgNS, "rect");
  tipBg.setAttribute("rx", "8"); tipBg.setAttribute("ry", "8");
  tipBg.setAttribute("fill", "#24385B"); tipBg.setAttribute("stroke", "#364A6E");
  const tipText = document.createElementNS(svgNS, "text");
  tipText.setAttribute("fill", "#E5E7EB"); tipText.setAttribute("font-size", "14"); tipText.setAttribute("font-weight", "700");
  tip.appendChild(tipBg); tip.appendChild(tipText);
  svg.appendChild(tip);

  assetCategories.forEach((seg) => {
    const frac = seg.value / total;
    const sweep = frac * Math.PI * 2;
    const x1 = centerX + outerR * Math.cos(angle);
    const y1 = centerY + outerR * Math.sin(angle);
    const x2 = centerX + outerR * Math.cos(angle + sweep);
    const y2 = centerY + outerR * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;

    // Ytre bue
    const g = document.createElementNS(svgNS, "g");
    const path = document.createElementNS(svgNS, "path");
    const d = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2}`,
      `L ${centerX + innerR * Math.cos(angle + sweep)} ${centerY + innerR * Math.sin(angle + sweep)}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${centerX + innerR * Math.cos(angle)} ${centerY + innerR * Math.sin(angle)}`,
      "Z"
    ].join(" ");
    path.setAttribute("d", d);
    path.setAttribute("fill", seg.color);
    path.setAttribute("fill-opacity", "0.9");
    g.appendChild(path);
    svg.appendChild(g);

    // Interaktivitet: hover-zoom og tooltip med prosent
    function showTip(evt) {
      const percent = (frac * 100).toFixed(1).replace('.', ',');
      tipText.textContent = `${seg.key}: ${percent} %`;
      tip.setAttribute("visibility", "visible");
      const ptX = evt.clientX - svg.getBoundingClientRect().left;
      const ptY = evt.clientY - svg.getBoundingClientRect().top;
      const x = Math.max(16, Math.min(vbW - 140, ptX));
      const y = Math.max(24, Math.min(vbH - 40, ptY));
      tipText.setAttribute("x", String(x + 10));
      tipText.setAttribute("y", String(y + 18));
      const w = tipText.getComputedTextLength() + 20;
      tipBg.setAttribute("x", String(x)); tipBg.setAttribute("y", String(y));
      tipBg.setAttribute("width", String(w)); tipBg.setAttribute("height", "28");
    }
    function hideTip() { tip.setAttribute("visibility", "hidden"); }
    function zoomIn() { g.setAttribute("transform", `translate(${centerX},${centerY}) scale(1.06) translate(${-centerX},${-centerY})`); }
    function zoomOut() { g.removeAttribute("transform"); }
    g.addEventListener("mouseenter", (e)=>{ zoomIn(); showTip(e); });
    g.addEventListener("mousemove", showTip);
    g.addEventListener("mouseleave", ()=>{ zoomOut(); hideTip(); });

    angle += sweep;
  });

  // Legg på små labels til høyre (legend med verdier)
  const legendX = Math.round(vbW * 0.6); let legendY = centerY - 40;
  assetCategories.forEach((seg) => {
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", String(legendX)); rect.setAttribute("y", String(legendY));
    rect.setAttribute("width", "12"); rect.setAttribute("height", "12"); rect.setAttribute("rx", "3");
    rect.setAttribute("fill", seg.color); rect.setAttribute("fill-opacity", "0.9");
    svg.appendChild(rect);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", String(legendX + 18)); text.setAttribute("y", String(legendY + 11));
    text.setAttribute("fill", "#E5E7EB"); text.setAttribute("font-size", "14"); text.setAttribute("font-weight", "600");
    text.textContent = `${seg.key} · ${formatNOK(seg.value)}`;
    svg.appendChild(text);
    legendY += 22;
  });

  root.appendChild(svg);
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
    .wf-title { font: 900 24px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #E5E7EB; }
    .wf-label { font: 600 13px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #CBD5E1; }
    .wf-value { font: 700 13px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill: #E5E7EB; }
  `;
  svg.appendChild(style);

  const bg = document.createElementNS(svgNS, "rect");
  bg.setAttribute("x", "0"); bg.setAttribute("y", "0");
  bg.setAttribute("width", String(vbW)); bg.setAttribute("height", String(vbH));
  bg.setAttribute("fill", "#1A2A47");
  svg.appendChild(bg);

  const panel = document.createElementNS(svgNS, "rect");
  panel.setAttribute("x", "12"); panel.setAttribute("y", "12");
  panel.setAttribute("width", String(vbW - 24)); panel.setAttribute("height", String(vbH - 24));
  panel.setAttribute("rx", "12"); panel.setAttribute("fill", "#24385B"); panel.setAttribute("stroke", "#364A6E");
  svg.appendChild(panel);

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

    // Debt-derived costs: interest and principal (approx. first-year split)
    const totalDebt = (AppState.debts || []).reduce((s,d)=> s + (d.amount || 0), 0);
    const r = AppState.debtParams && AppState.debtParams.rate || 0;
    const n = Math.max(1, AppState.debtParams && AppState.debtParams.years || 1);
    let annualPayment = 0;
    if ((AppState.debtParams && AppState.debtParams.type) === "Serielån") {
      annualPayment = totalDebt / n + (totalDebt * r) / 2; // approx average
    } else {
      annualPayment = totalDebt * (r / (1 - Math.pow(1 + r, -n)));
    }
    const interestCost = totalDebt * r; // first-year interest approximation
    const principalCost = Math.max(0, annualPayment - interestCost);

    const costs = [
      { key: "Årlig skatt", value: annualTax },
      { key: "Årlige kostnader", value: annualCosts },
      { key: "Rentekostnader", value: interestCost },
      { key: "Avdrag", value: principalCost }
    ].filter(c => c.value > 0);

    const net = totalIncome - costs.reduce((s,c)=> s + c.value, 0);
    return { totalIncome, costs, net };
  }

  function draw() {
    // Clear dynamic content except styles/panel
    while (svg.childNodes.length > 3) svg.removeChild(svg.lastChild);

    const { totalIncome, costs, net } = getData();

    const padX = 80; const padTop = 70; const padBottom = 64;
    const chartW = vbW - padX * 2; const chartH = vbH - padTop - padBottom;

    const steps = [
      { type: "start", key: "Totale inntekter", value: totalIncome },
      ...costs.map(c => ({ type: "down", key: c.key, value: -c.value })),
      { type: "end", key: "Nettoresultat", value: net }
    ];

    const maxAbs = Math.max(
      Math.abs(totalIncome),
      Math.abs(net),
      Math.abs(costs.reduce((s,c)=> Math.max(s, c.value), 0))
    );
    const scaleY = (v) => (v / Math.max(1, maxAbs)) * chartH;

    const green = "#52cc86"; const red = "#d85f76"; const blue = "#60A5FA";

    const colW = Math.max(60, Math.floor(chartW / steps.length) - 10);
    let cursorX = padX;
    let running = 0;
    steps.forEach((s, idx) => {
      let h, y, fill;
      if (s.type === "start") {
        h = scaleY(Math.abs(s.value));
        y = padTop + chartH - h;
        fill = blue;
        running = s.value;
      } else if (s.type === "down") {
        const from = running;
        running += s.value; // s.value is negative
        h = scaleY(Math.abs(s.value));
        y = padTop + chartH - scaleY(Math.abs(from)) + 1;
        fill = red;
      } else { // end
        h = scaleY(Math.abs(s.value));
        y = padTop + chartH - h;
        fill = s.value >= 0 ? green : red;
      }

      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", String(cursorX));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(colW));
      rect.setAttribute("height", String(Math.max(2, h)));
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", fill);
      rect.setAttribute("fill-opacity", "0.9");
      rect.setAttribute("stroke", "#1f2937");
      rect.setAttribute("stroke-opacity", "0.3");
      svg.appendChild(rect);

      const lab = document.createElementNS(svgNS, "text");
      lab.setAttribute("class", "wf-label");
      lab.setAttribute("x", String(cursorX + colW / 2));
      lab.setAttribute("y", String(vbH - 24));
      lab.setAttribute("text-anchor", "middle");
      lab.textContent = s.key;
      svg.appendChild(lab);

      const val = document.createElementNS(svgNS, "text");
      val.setAttribute("class", "wf-value");
      val.setAttribute("x", String(cursorX + colW / 2));
      val.setAttribute("y", String(y - 8));
      val.setAttribute("text-anchor", "middle");
      val.textContent = formatNOK(Math.round(Math.abs(s.value)));
      svg.appendChild(val);

      cursorX += colW + 10;
    });

    // Title
    const title = document.createElementNS(svgNS, "text");
    title.setAttribute("class", "wf-title");
    title.setAttribute("x", String(vbW / 2));
    title.setAttribute("y", "44");
    title.setAttribute("text-anchor", "middle");
    title.textContent = "Resultatanalyse (Waterfall)";
    svg.appendChild(title);
  }

  select.addEventListener("change", draw);
  draw();
  root.appendChild(svg);
}
// --- Fremtiden modul ---
function renderFutureModule(root) {
  root.innerHTML = "";
  const assets = AppState.assets || [];
  const debts = AppState.debts || [];
  const blueScale = ["#2A4D80", "#355F9E", "#60A5FA", "#00A9E0", "#294269", "#203554"];

  const graphWrap = document.createElement("div");
  root.appendChild(graphWrap);

  function projectAssetsForYear(yearVal) {
    const yearsFromStart = Math.max(0, Number(yearVal) - 2025);
    const exp = AppState.expectations || { likvider: 0, fastEiendom: 0, investeringer: 0, andreEiendeler: 0 };
    const rLikv = (exp.likvider || 0) / 100;
    const rEiend = (exp.fastEiendom || 0) / 100;
    const rInv = (exp.investeringer || 0) / 100;
    const rOther = (exp.andreEiendeler || 0) / 100;
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

  function remainingDebtForYear(yearVal) {
    const P = debts.reduce((s, d) => s + (d.amount || 0), 0);
    const t = Math.max(0, Math.min(Number(yearVal) - 2025, AppState.debtParams.years));
    const N = Math.max(1, AppState.debtParams.years);
    const r = AppState.debtParams.rate || 0;
    if (P <= 0) return 0;
    if (AppState.debtParams.type === "Serielån") {
      const rem = P - (P / N) * t;
      return Math.max(0, rem);
    } else {
      if (r === 0) {
        return Math.max(0, P * (1 - t / N));
      }
      const A = P * (r / (1 - Math.pow(1 + r, -N)));
      const rem = P * Math.pow(1 + r, t) - A * ((Math.pow(1 + r, t) - 1) / r);
      return Math.max(0, rem);
    }
  }

  function draw(yearVal) {
    const assetCategories = projectAssetsForYear(yearVal);
    const totalAssets = assetCategories.reduce((s, x) => s + x.value, 0);
    const remDebt = remainingDebtForYear(yearVal);
    const debtVal = Math.min(remDebt, totalAssets);
    const equityVal = Math.max(0, totalAssets - debtVal);
  const financingParts = [
    { key: "Egenkapital", value: equityVal, color: "#4ADE80" },
    { key: "Gjeld", value: debtVal, color: "#f87171" }
  ];
    graphWrap.innerHTML = "";
    graphWrap.appendChild(buildFinanceSVG(assetCategories, financingParts, totalAssets));

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
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.alignItems = "center";
  wrap.style.marginTop = "-48px";

  const yearLabel = document.createElement("div");
  yearLabel.className = "year-display";
  yearLabel.textContent = "2025";
  yearLabel.style.color = "#E5E7EB";
  yearLabel.style.fontWeight = "700";
  yearLabel.style.fontSize = "24px";
  yearLabel.style.marginBottom = "0px";
  wrap.appendChild(yearLabel);

  const year = document.createElement("input");
  year.type = "range";
  year.min = "2025"; year.max = "2050"; year.step = "1"; year.value = "2025";
  year.style.width = "70%";
  year.className = "year-range";
  year.addEventListener("input", () => { yearLabel.textContent = year.value; draw(Number(year.value)); });
  wrap.appendChild(year);
  root.appendChild(wrap);
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
    const t1 = document.createElementNS(svgNS, "text"); t1.setAttribute("class", "t-label"); t1.setAttribute("fill", "#334155");
    const t2 = document.createElementNS(svgNS, "text"); t2.setAttribute("class", "t-value");
    const t3 = document.createElementNS(svgNS, "text"); t3.setAttribute("class", "t-value");
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
    const scaleX = 1200 / rect.width;
    const scaleY = 700 / rect.height;
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
      if (/L[ØO]NN|SKATT/.test(label)) {
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

// --- Gjeld modul ---
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

  AppState.debts.forEach((item) => list.appendChild(createItemRow("debts", item)));

  // Lånetype
  const typeLabel = document.createElement("div");
  typeLabel.className = "section-label";
  typeLabel.textContent = "Lånetype";
  panel.appendChild(typeLabel);

  const typeWrap = document.createElement("div");
  typeWrap.className = "select";
  const select = document.createElement("select");
  ["Annuitetslån", "Serielån"].forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t.toUpperCase();
    select.appendChild(opt);
  });
  select.value = AppState.debtParams.type;
  select.addEventListener("change", () => {
    AppState.debtParams.type = select.value;
    updateTopSummaries();
  });
  typeWrap.appendChild(select);
  panel.appendChild(typeWrap);

  // Lånetid (år)
  const yearsLabel = document.createElement("div");
  yearsLabel.className = "section-label";
  yearsLabel.textContent = "Lånetid (år)";
  panel.appendChild(yearsLabel);

  const yearsRow = document.createElement("div");
  yearsRow.className = "asset-row";
  const yearsCol = document.createElement("div");
  yearsCol.className = "asset-col";
  const yearsRange = document.createElement("input");
  yearsRange.type = "range";
  yearsRange.className = "asset-range";
  yearsRange.min = "1"; yearsRange.max = "30"; yearsRange.step = "1";
  // Clamp to 30 if necessary
  if (AppState.debtParams.years > 30) AppState.debtParams.years = 30;
  yearsRange.value = String(AppState.debtParams.years);
  const yearsOut = document.createElement("div");
  yearsOut.className = "asset-amount";
  yearsOut.textContent = `${AppState.debtParams.years} år`;
  yearsRange.addEventListener("input", () => {
    AppState.debtParams.years = Number(yearsRange.value);
    yearsOut.textContent = `${yearsRange.value} år`;
    updateTopSummaries();
  });
  yearsCol.appendChild(yearsRange);
  yearsRow.appendChild(yearsCol);
  yearsRow.appendChild(yearsOut);
  panel.appendChild(yearsRow);

  // Rentekostnader (%)
  const rateLabel = document.createElement("div");
  rateLabel.className = "section-label";
  rateLabel.textContent = "Rentekostnader (%)";
  panel.appendChild(rateLabel);

  const rateRow = document.createElement("div");
  rateRow.className = "asset-row";
  const rateCol = document.createElement("div");
  rateCol.className = "asset-col";
  const rateRange = document.createElement("input");
  rateRange.type = "range";
  rateRange.className = "asset-range";
  rateRange.min = "0"; rateRange.max = "20"; rateRange.step = "0.1"; rateRange.value = String(AppState.debtParams.rate * 100);
  const rateOut = document.createElement("div");
  rateOut.className = "asset-amount";
  rateOut.textContent = `${(AppState.debtParams.rate * 100).toFixed(1).replace('.', ',')} %`;
  rateRange.addEventListener("input", () => {
    AppState.debtParams.rate = Number(rateRange.value) / 100;
    rateOut.textContent = `${Number(rateRange.value).toFixed(1).replace('.', ',')} %`;
    updateTopSummaries();
  });
  rateCol.appendChild(rateRange);
  rateRow.appendChild(rateCol);
  rateRow.appendChild(rateOut);
  panel.appendChild(rateRow);

  const addBtn = document.createElement("button");
  addBtn.className = "btn-add";
  addBtn.textContent = "Legg til gjeld";
  addBtn.addEventListener("click", () => {
    const newItem = { id: genId(), name: "NY GJELD", amount: 0 };
    AppState.debts.push(newItem);
    list.appendChild(createItemRow("debts", newItem));
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

  // Debt service per year
  const r = AppState.debtParams.rate; // annual
  const n = Math.max(1, AppState.debtParams.years);
  let annualDebtPayment = 0;
  if (AppState.debtParams.type === "Annuitetslån") {
    if (r === 0) annualDebtPayment = totalDebt / n;
    else annualDebtPayment = totalDebt * (r / (1 - Math.pow(1 + r, -n)));
  } else { // Serielån (avg. over løpetid)
    annualDebtPayment = totalDebt / n + (totalDebt * r) / 2;
  }

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

function updateTopSummaries() {
  const sumAssets = (AppState.assets || []).reduce((s, x) => s + (x.amount || 0), 0);
  const el = document.getElementById("sum-assets");
  if (el) el.textContent = formatNOK(sumAssets);

  const sumDebts = (AppState.debts || []).reduce((s, x) => s + (x.amount || 0), 0);
  const elD = document.getElementById("sum-debts");
  if (elD) elD.textContent = formatNOK(sumDebts);

  const elE = document.getElementById("sum-equity");
  if (elE) elE.textContent = formatNOK(sumAssets - sumDebts);

  // Kontantstrøm per år fra Analyse-beregningen
  const incomeItems = AppState.incomes || [];
  const upper = (s) => String(s || "").toUpperCase();
  const annualCosts = incomeItems
    .filter((x) => /SKATT|KOSTNAD/.test(upper(x.name)))
    .reduce((s, x) => s + (x.amount || 0), 0);
  const totalIncome = incomeItems
    .filter((x) => !/SKATT|KOSTNAD/.test(upper(x.name)))
    .reduce((s, x) => s + (x.amount || 0), 0);
  const r = AppState.debtParams.rate;
  const n = Math.max(1, AppState.debtParams.years);
  const totalDebt = sumDebts;
  let annualDebtPayment = 0;
  if (AppState.debtParams.type === "Annuitetslån") {
    if (r === 0) annualDebtPayment = totalDebt / n;
    else annualDebtPayment = totalDebt * (r / (1 - Math.pow(1 + r, -n)));
  } else {
    annualDebtPayment = totalDebt / n + (totalDebt * r) / 2;
  }
  const cashflow = Math.round(totalIncome - annualCosts - annualDebtPayment);
  const elC = document.getElementById("sum-cashflow");
  if (elC) elC.textContent = formatNOK(cashflow);
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

  // Inputs (skann AppState)
  const assets = (AppState.assets || []).map((a) => `- ${a.name}: ${nok(a.amount)}`).join("\n");
  const debts = (AppState.debts || []).map((d) => `- ${d.name}: ${nok(d.amount)}`).join("\n");
  const incomes = (AppState.incomes || []).map((i) => `- ${i.name}: ${nok(i.amount)}`).join("\n");
  const debtParams = `- Lånetype: ${AppState.debtParams.type}\n- Lånetid: ${nf.format(AppState.debtParams.years)} år\n- Rente: ${(AppState.debtParams.rate*100).toFixed(1).replace('.', ',')} %`;
  const exp = AppState.expectations || { likvider: 0, fastEiendom: 0, investeringer: 0, andreEiendeler: 0 };
  const expectations = [
    `- LIKVIDER: ${nf.format(exp.likvider)} %`,
    `- FAST EIENDOM: ${nf.format(exp.fastEiendom)} %`,
    `- INVESTERINGER: ${nf.format(exp.investeringer)} %`,
    `- ANDRE EIENDELER: ${nf.format(exp.andreEiendeler)} %`
  ].join("\n");

  // Results (sanntid)
  const sumAssets = (AppState.assets || []).reduce((s, x) => s + (x.amount || 0), 0);
  const sumDebts = (AppState.debts || []).reduce((s, x) => s + (x.amount || 0), 0);
  const equity = sumAssets - sumDebts;

  const incomeItems = AppState.incomes || [];
  const upper = (s) => String(s || "").toUpperCase();
  const annualCosts = incomeItems.filter((x) => /SKATT|KOSTNAD/.test(upper(x.name))).reduce((s, x) => s + (x.amount || 0), 0);
  const totalIncome = incomeItems.filter((x) => !/SKATT|KOSTNAD/.test(upper(x.name))).reduce((s, x) => s + (x.amount || 0), 0);
  const r = AppState.debtParams.rate;
  const n = Math.max(1, AppState.debtParams.years);
  let annualDebtPayment = 0;
  if (AppState.debtParams.type === "Annuitetslån") {
    if (r === 0) annualDebtPayment = sumDebts / n;
    else annualDebtPayment = sumDebts * (r / (1 - Math.pow(1 + r, -n)));
  } else {
    annualDebtPayment = sumDebts / n + (sumDebts * r) / 2;
  }
  const cashflow = Math.round(totalIncome - annualCosts - annualDebtPayment);

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

  return lines.join("\n");
}


