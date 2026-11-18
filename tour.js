/* ---------------------------------------------------------------
   Données de la tournée — tout se met à jour ici.
   state : "onsale" (billetterie ouverte, url requise)
           "soldout" (complet, pas de lien)
           "soon" (date annoncée, billetterie pas encore ouverte)
   --------------------------------------------------------------- */

const TOUR = [
  { date: "2027-01-29", city: "Rennes",      venue: "L'Étage",                            tags: [],           state: "soldout" },
  { date: "2027-01-29", city: "Rennes",      venue: "L'Espace Club",                      tags: ["Showcase"], state: "soon" },
  { date: "2027-03-20", city: "Avignon",     venue: "Salle de l'Étoile",                  tags: [],           state: "soon" },
  { date: "2027-03-27", city: "Amnéville",   venue: "Le Galaxie",                         tags: ["Showcase"], state: "soon" },
  { date: "2027-04-02", city: "Toulouse",    venue: "Salle Interférence",                 tags: [],           state: "soon" },
  { date: "2027-04-03", city: "Bordeaux",    venue: "Salle du Grand Parc",                tags: [],           state: "soldout" },
  { date: "2027-04-09", city: "Amiens",      venue: "Zénith Amiens",                      tags: [],           state: "soldout" },
  { date: "2027-04-10", city: "Rennes",      venue: "BOOMIN FEST",                        tags: ["Festival"], state: "soon" },
  { date: "2027-04-14", city: "Lyon",        venue: "Le Transbordeur",                    tags: [],           state: "soon" },
  { date: "2027-04-23", city: "Brest",       venue: "Brest Arena",                        tags: [],           state: "soon" },
  { date: "2027-04-24", city: "Bruxelles",   venue: "La Madeleine",                       tags: ["Belgique"], state: "soon" },
  { date: "2027-05-05", city: "Lille",       venue: "Zénith Lille",                       tags: [],           state: "onsale", url: "https://shotgun.live/fr/events/rawww-verone-niro-zenith-lille" },
  { date: "2027-05-14", city: "Montpellier", venue: "Rockstore",                          tags: [],           state: "soldout" },
  { date: "2027-05-15", city: "Marseille",   venue: "Salle des Sucres",                   tags: [],           state: "soon" },
  { date: "2027-05-22", city: "Nantes",      venue: "BOOMIN FEST",                        tags: ["Festival"], state: "soon" },
  { sort: "2027-07-01", dayText: "Début", wdText: "juil.", city: "Liège", venue: "Les Ardentes", tags: ["Festival", "Belgique"], state: "soon" },
  { date: "2027-08-28", city: "Dijon",       venue: "Golden Coast Festival",              tags: ["Festival"], state: "soon" }
];

/* --------------------------------------------------------------- */

const MONTH_FMT = new Intl.DateTimeFormat("fr-FR", { month: "long" });
const WEEKDAY_FMT = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);

const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const parse = (iso) => new Date(`${iso}T12:00:00`);

const sortKey = (item) => item.sort || item.date;

const actionMarkup = (item) => {
  if (item.state === "onsale" && item.url) {
    return `<a class="btn" href="${esc(item.url)}" target="_blank" rel="noopener">Billets
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a>`;
  }
  if (item.state === "soldout") {
    return `<span class="badge badge--soldout">Complet</span>`;
  }
  return `<span class="badge badge--soon">Bientôt</span>`;
};

const rowMarkup = (item) => {
  const d = parse(sortKey(item));
  const day = item.dayText || String(d.getDate()).padStart(2, "0");
  const wd = item.wdText || WEEKDAY_FMT.format(d).replace(".", "");

  const tags = item.tags
    .map((t) => `<span class="tag">${esc(t)}</span>`)
    .join("");

  const cityLine = `<div class="date-city"><span>${esc(item.city)}</span>${tags}</div>`;
  const venueLine = item.venue
    ? `<p class="date-venue">${esc(item.venue)}</p>`
    : "";

  const inner = `
    <div class="date-day">
      <span class="date-num${item.dayText ? " is-text" : ""}">${esc(day)}</span>
      <span class="date-wd">${esc(wd)}</span>
    </div>
    <div class="date-main">${cityLine}${venueLine}</div>
    <div class="date-action">${actionMarkup(item)}</div>`;

  const link = item.state === "onsale" && item.url;
  const tag = link ? "a" : "div";
  const attrs = link
    ? ` href="${esc(item.url)}" target="_blank" rel="noopener" aria-label="${esc(item.city)} — billets"`
    : "";

  return `<li class="date-row">
    <${tag} class="date-link"${attrs}>${inner}</${tag}>
  </li>`;
};

const render = () => {
  const list = document.getElementById("tour-list");
  if (!list) return;

  const items = TOUR.slice().sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const groups = [];

  items.forEach((item) => {
    const d = parse(sortKey(item));
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, date: d, items: [item] });
    }
  });

  list.innerHTML = groups.map((group) => {
    const label = `${MONTH_FMT.format(group.date)} ${group.date.getFullYear()}`;
    const count = group.items.length;
    return `
      <section class="month">
        <div class="month-head">
          <h3 class="month-name">${esc(cap(label))}</h3>
          <span class="month-count">${count} date${count > 1 ? "s" : ""}</span>
        </div>
        <ul class="dates-list">
          ${group.items.map((item, i) => rowMarkup(item, i)).join("")}
        </ul>
      </section>`;
  }).join("");

  document.querySelectorAll(".date-row").forEach((row, i) => {
    row.style.transitionDelay = `${Math.min(i % 6, 5) * 45}ms`;
  });

  const countEl = document.getElementById("summary-count");
  if (countEl) countEl.textContent = items.length;

  const rangeEl = document.getElementById("summary-range");
  if (rangeEl && items.length) {
    const first = parse(items[0].date);
    const last = parse(items[items.length - 1].date);
    const sameYear = first.getFullYear() === last.getFullYear();
    rangeEl.textContent = sameYear
      ? `${cap(MONTH_FMT.format(first))} — ${MONTH_FMT.format(last)} ${last.getFullYear()}`
      : `${cap(MONTH_FMT.format(first))} ${first.getFullYear()} — ${MONTH_FMT.format(last)} ${last.getFullYear()}`;
  }

  const subEl = document.getElementById("hero-sub");
  if (subEl) {
    const cities = new Set(items.map((i) => i.city)).size;
    subEl.textContent = `${cities} villes · France · Belgique · Canada`;
  }

  observeRows();
};

const observeRows = () => {
  const rows = document.querySelectorAll(".date-row");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    rows.forEach((row) => row.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

  rows.forEach((row) => observer.observe(row));
};

const onScroll = () => {
  const head = document.querySelector(".site-head");
  if (!head) return;
  head.classList.toggle("is-stuck", window.scrollY > 48);
};

document.addEventListener("DOMContentLoaded", render);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
