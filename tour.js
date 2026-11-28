/* ---------------------------------------------------------------
   Données de la tournée — tout se met à jour ici.
   state : "onsale" (billetterie ouverte, url requise)
           "soldout" (complet, pas de lien)
           "soon" (date annoncée, billetterie pas encore ouverte)
   --------------------------------------------------------------- */

const TOUR = [
  { date: "2027-01-09", city: "Le Mans",     venue: "Antares Arena",           kind: "Showcase", tags: [],           state: "onsale", url: "https://www.unideal.fr/nocturne" },
  { date: "2027-01-29", city: "Rennes",      venue: "L'Étage",                 kind: "Concert",  tags: [],           state: "soldout" },
  { date: "2027-01-29", city: "Rennes",      venue: "L'Espace Club",           kind: "Showcase", tags: [],           state: "onsale", url: "https://shotgun.live/fr/events/niro-x-l-espace-club" },
  { date: "2027-03-20", city: "Avignon",     venue: "Salle de l'Étoile",       kind: "Concert",  tags: [],           state: "onsale", url: "https://www.francebillet.com/event/niro-tournee-salle-de-letoile-chateaurenard-22426596" },
  { date: "2027-04-02", city: "Toulouse",    venue: "Salle Interférence",      kind: "Concert",  tags: [],           state: "onsale", url: "https://spectacles.bleucitron.net/reserver/niro-interference-balma/10783" },
  { date: "2027-04-03", city: "Bordeaux",    venue: "Salle du Grand Parc",     kind: "Concert",  tags: [],           state: "soldout" },
  { date: "2027-04-09", city: "Amiens",      venue: "Zénith Amiens",           kind: "Concert",  tags: [],           state: "soldout" },
  { date: "2027-04-10", city: "Rennes",      venue: "BOOMIN FEST",             kind: "Festival", tags: [],           state: "onsale", url: "https://shotgun.live/fr/events/boomin-fest-rennes-liberte" },
  { date: "2027-04-14", city: "Lyon",        venue: "Le Transbordeur",         kind: "Concert",  tags: [],           state: "onsale", url: "https://shotgun.live/fr/events/niro-high-lo-lyon" },
  { date: "2027-04-23", city: "Brest",       venue: "Brest Arena",             kind: "Concert",  tags: [],           state: "onsale", url: "https://www.fnacspectacles.com/event/niro-tournee-brest-arena-brest-22463552/" },
  { date: "2027-04-24", city: "Bruxelles",   venue: "La Madeleine",            kind: "Concert",  tags: ["Belgique"], state: "soldout" },
  { date: "2027-05-05", city: "Lille",       venue: "Zénith Lille",            kind: "Concert",  tags: [],           state: "onsale", url: "https://shotgun.live/fr/events/rawww-verone-niro-zenith-lille" },
  { date: "2027-05-14", city: "Montpellier", venue: "Rockstore",               kind: "Concert",  tags: [],           state: "soldout" },
  { date: "2027-05-15", city: "Marseille",   venue: "Hangar à Sucre",          kind: "Concert",  tags: [],           state: "onsale", url: "https://www.fnacspectacles.com/event/niro-tournee-le-hangar-a-sucre-22466199/" },
  { date: "2027-05-22", city: "Nantes",      venue: "BOOMIN FEST",             kind: "Festival", tags: [],           state: "onsale", url: "https://linktr.ee/BoominFestNantes2027" }
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

const actionMarkup = (item, inert) => {
  if (item.state === "onsale" && item.url) {
    const btn = `Billetterie
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>`;
    return inert
      ? `<span class="btn" aria-hidden="true">${btn}</span>`
      : `<a class="btn" href="${esc(item.url)}" target="_blank" rel="noopener">${btn}</a>`;
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
  const kindLine = item.kind
    ? `<p class="date-kind">${esc(item.kind)}</p>`
    : "";

  const link = item.state === "onsale" && item.url;

  const inner = `
    <div class="date-day">
      <span class="date-num${item.dayText ? " is-text" : ""}">${esc(day)}</span>
      <span class="date-wd">${esc(wd)}</span>
    </div>
    <div class="date-main">${cityLine}${venueLine}${kindLine}</div>
    <div class="date-action">${actionMarkup(item, link)}</div>`;

  const tag = link ? "a" : "div";
  const attrs = link
    ? ` href="${esc(item.url)}" target="_blank" rel="noopener" aria-label="${esc(item.city)} — billetterie"`
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
    subEl.textContent = `${cities} villes · France · Belgique`;
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
