// ============================================================
// TME Africa — Site JS
// ============================================================

// ═══════════════════════════════════════════════════════════════
// HERO & NAVIGATION BEHAVIORS
// ═══════════════════════════════════════════════════════════════

(function () {
  const nav           = document.getElementById("main-nav");
  const hamburger     = document.getElementById("hamburger");
  const drawer        = document.getElementById("mobile-drawer");
  const drawerOverlay = document.getElementById("drawer-overlay");
  const drawerCloseBtn = document.getElementById("drawer-close-btn");
  const scrollIndicator = document.getElementById("scroll-indicator");
  const heroBg        = document.getElementById("hero-bg");

  // ── Shared smooth-scroll utility (nav-offset aware) ──────────
  function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId.replace("#", ""));
    if (!target) return;
    const navH = nav ? nav.offsetHeight : 72;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: "smooth" });
  }

  // Wire ALL internal anchor links across the whole page
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      smoothScrollTo(id);
    });
  });

  // 1. NAV SCROLL STATE ─────────────────────────────────────────
  function updateNav() {
    if (!nav) return;
    nav.classList.toggle("nav-scrolled", window.scrollY > 80);
  }
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  // 2. ACTIVE SECTION DETECTION ─────────────────────────────────
  const navLinks = document.querySelectorAll(".hero-nav-link");
  const sectionIds = ["hero", "services", "machinery", "case-studies", "contact"];

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.dataset.section === entry.target.id;
          link.classList.toggle("nav-link-active", active);
          if (active) {
            link.style.color = "#FF6B00";
          } else {
            link.style.color = "rgba(245,245,245,0.75)";
          }
        });
      });
    },
    { threshold: 0.35 },
  );
  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  // 3. MOBILE DRAWER ────────────────────────────────────────────
  function openDrawer() {
    if (!drawer) return;
    drawer.style.right        = "0";
    drawerOverlay.style.opacity       = "1";
    drawerOverlay.style.pointerEvents = "auto";
    hamburger.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.style.right        = "-100%";
    drawerOverlay.style.opacity       = "0";
    drawerOverlay.style.pointerEvents = "none";
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (hamburger)      hamburger.addEventListener("click", openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
  if (drawerOverlay)  drawerOverlay.addEventListener("click", closeDrawer);

  document.querySelectorAll(".drawer-nav-link").forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // 4. NAV CTA BUTTON ───────────────────────────────────────────
  const navCtaBtn = document.getElementById("nav-cta-btn");
  if (navCtaBtn) {
    navCtaBtn.addEventListener("click", () => {
      smoothScrollTo("contact");
      if (typeof preFillEnquiry === "function") {
        preFillEnquiry("General Enquiry", "General Enquiry");
      }
    });
  }

  // 5. HERO PRIMARY CTA ─────────────────────────────────────────
  const heroPrimaryCta = document.getElementById("hero-primary-cta");
  if (heroPrimaryCta) {
    heroPrimaryCta.addEventListener("click", () => {
      smoothScrollTo("contact");
      if (typeof preFillEnquiry === "function") {
        preFillEnquiry("General Enquiry", "General Enquiry");
      }
    });
  }

  // 6. SPEC CARD BUTTONS ────────────────────────────────────────
  const cardQuoteBtn   = document.getElementById("card-quote-btn");
  const cardCatalogBtn = document.getElementById("card-catalog-btn");

  if (cardQuoteBtn) {
    cardQuoteBtn.addEventListener("click", () => {
      if (typeof preFillEnquiry === "function") {
        preFillEnquiry("1M Bed Lathe Machine — REF: TME-LT-1000", "Lathe Machine");
      }
      smoothScrollTo("contact");
    });
  }

  if (cardCatalogBtn) {
    cardCatalogBtn.addEventListener("click", () => smoothScrollTo("machinery"));
  }

  // 7. SERVICE TILES ────────────────────────────────────────────
  document.querySelectorAll(".service-tile").forEach((tile) => {
    tile.addEventListener("click", () => smoothScrollTo("services"));
  });

  // 8. SCROLL INDICATOR FADE ────────────────────────────────────
  if (scrollIndicator) {
    window.addEventListener("scroll", () => {
      scrollIndicator.style.opacity = window.scrollY > 120 ? "0" : "1";
    }, { passive: true });
  }

  // 9. PARALLAX (desktop only, respects reduced motion) ─────────
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (heroBg && !prefersReduced) {
    window.addEventListener("scroll", () => {
      if (window.innerWidth > 768) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
      }
    }, { passive: true });
  }
})();

// ============================================================
// Shared Helpers
// Used by Trust Bar, Machinery Catalog, and Case Studies.
// ============================================================

// --- Count-up animation (Trust Bar stats, Case Study metrics) -----
// initCounters(scope) can be called as many times as needed —
// once for the static HTML on page load, then again any time a
// section injects new [data-target] elements via innerHTML.
// A single shared observer/WeakSet means no logic is duplicated
// per section, and no element is ever observed twice.
const COUNT_DURATION_MS = 2000;
const observedCounters = new WeakSet();

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || "";
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / COUNT_DURATION_MS, 1);
    const value = Math.round(progress * target);
    el.textContent = value + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

function initCounters(scope = document) {
  scope.querySelectorAll("[data-target]").forEach((counter) => {
    if (observedCounters.has(counter)) return;
    observedCounters.add(counter);
    counterObserver.observe(counter);
  });
}

// --- Contact-form handoff -----------------------------------------
// Called by Catalog quote buttons and Case Study CTAs. Fills the
// hidden subject field + pre-fill banner on the real Contact form,
// optionally pre-selects a matching Equipment Interest option, and
// scrolls to #contact.
function preFillEnquiry(subject, equipment, description = "") {
  const subjectField   = document.getElementById("enquiry-subject");
  const equipmentField = document.getElementById("equipment-interest");
  const descField      = document.getElementById("project-description");
  const banner         = document.getElementById("prefill-banner");
  const bannerText     = document.getElementById("prefill-banner-text");
  const contactSection = document.getElementById("contact");

  if (subjectField) subjectField.value = subject;

  if (equipmentField && equipment) {
    const optionExists = Array.from(equipmentField.options).some(
      (o) => o.value === equipment,
    );
    if (optionExists) equipmentField.value = equipment;
  }

  if (description && descField) descField.value = description;

  if (banner && bannerText) {
    bannerText.textContent = subject;
    banner.classList.remove("hidden");
  }

  if (contactSection) {
    contactSection.scrollIntoView({ behavior: "smooth" });
  }
}

function clearPrefill() {
  const subjectField = document.getElementById("enquiry-subject");
  const equipmentField = document.getElementById("equipment-interest");
  const banner = document.getElementById("prefill-banner");

  if (subjectField) subjectField.value = "";
  if (equipmentField) equipmentField.value = "";
  if (banner) banner.classList.add("hidden");
}

// Picks up the Trust Bar stats now — the Featured Case Study's
// metrics are added in this same pass too, since they're static
// HTML already present by the time this script runs.
initCounters(document);

// ============================================================
// Section: Machinery Catalog
// ============================================================

(function () {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  // --- Data -----------------------------------------------------
  // Machine data lives in assets/js/machines-data.js (loaded before
  // this file), as the global `machinesData` array. Edit that file
  // to add, remove, or update machines — nothing here needs to change.

  // --- State ------------------------------------------------------
  const PAGE_SIZE = 6;
  const FADE_MS = 300;
  let activeCategory = "All";
  let searchQuery = "";
  let visibleLimit = PAGE_SIZE;

  // --- Card markup -------------------------------------------------
  function buildSpecRows(specs) {
    return Object.entries(specs)
      .slice(0, 5)
      .map(
        ([key, value]) => `
        <div class="flex justify-between py-2">
          <span class="text-fog">${key}</span>
          <span class="text-crisp font-semibold text-right">${value}</span>
        </div>`,
      )
      .join("");
  }

  function buildCard(item) {
    const tagBadge = item.tag
      ? `<span class="absolute top-2 right-2 bg-orange text-steel text-[10px] font-condensed font-bold uppercase tracking-wide px-2 py-1">${item.tag}</span>`
      : "";

    const conditionBadge = item.condition
      ? `<span class="absolute top-2 left-2 bg-steel/90 text-crisp text-[10px] font-condensed font-bold uppercase tracking-wide px-2 py-1 border border-fog/40">${item.condition}</span>`
      : "";

    return `
      <div class="catalog-card transition-all duration-300 ease-out bg-midgrey border border-transparent hover:border-orange"
           data-id="${item.id}" data-category="${item.category}" data-name="${item.name.toLowerCase()}">
        <div class="modal-image-trigger relative w-full aspect-video bg-steel overflow-hidden cursor-pointer group"
             onclick="openModal(${item.id})">
          <img
            src="${item.image}"
            alt="${item.name}"
            loading="lazy"
            class="w-full h-full object-cover"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div class="absolute inset-0 hidden items-center justify-center bg-steel px-4 text-center">
            <span class="text-fog font-condensed font-bold uppercase text-sm">${item.name}</span>
          </div>
          <div class="absolute inset-0 flex items-center justify-center bg-steel/0 group-hover:bg-steel/40 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <span class="bg-steel/90 text-crisp text-xs font-condensed font-bold uppercase tracking-wide px-3 py-1.5 border border-orange">View Details</span>
          </div>
          ${conditionBadge}
          ${tagBadge}
        </div>
        <div class="p-5 lg:p-6">
          <span class="block text-orange text-xs font-condensed font-bold uppercase tracking-[0.2em] mb-2">${item.category}</span>
          <h3 class="font-condensed font-bold text-crisp uppercase text-lg lg:text-xl mb-4 cursor-pointer hover:text-orange transition-colors duration-200"
              onclick="openModal(${item.id})">${item.name}</h3>
          <div class="divide-y divide-midgrey border-t border-midgrey mb-5 text-xs sm:text-sm">
            ${buildSpecRows(item.specs)}
          </div>
          <button
            type="button"
            class="quote-btn w-full min-h-[48px] bg-orange hover:bg-orange/85 text-steel font-condensed font-bold uppercase tracking-wide text-sm transition-colors duration-200"
            data-machine-id="${item.id}"
          >
            Request a Quote
          </button>
        </div>
      </div>`;
  }

  // --- Rendering ----------------------------------------------------
  // Display order: the Heavy-Duty Lathe (id 1) always leads, then every
  // machine with a real photo (hasPhoto: true), then placeholder-only
  // machines last. This is a display-order sort only — it doesn't touch
  // machinesData itself, so the data file stays append-only.
  function sortForDisplay(data) {
    return [...data].sort((a, b) => {
      if (a.id === 1) return -1;
      if (b.id === 1) return 1;
      if (a.hasPhoto !== b.hasPhoto) return a.hasPhoto ? -1 : 1;
      return 0;
    });
  }

  function renderCatalogOnce() {
    grid.innerHTML = sortForDisplay(machinesData).map(buildCard).join("");
    updateVisibility(false);
  }

  function setCardVisibility(card, show, animate) {
    const isHidden = card.classList.contains("hidden");

    if (!animate) {
      card.classList.toggle("hidden", !show);
      card.classList.remove("opacity-0", "scale-95");
      return;
    }

    if (show && isHidden) {
      card.classList.remove("hidden");
      card.classList.add("opacity-0", "scale-95");
      // Two rAFs ensure the browser paints the hidden->visible state
      // before the transition classes are removed, so it actually animates.
      requestAnimationFrame(() => {
        requestAnimationFrame(() =>
          card.classList.remove("opacity-0", "scale-95"),
        );
      });
    } else if (!show && !isHidden) {
      card.classList.add("opacity-0", "scale-95");
      window.setTimeout(() => card.classList.add("hidden"), FADE_MS);
    }
  }

  function toggleEmptyState(isEmpty) {
    let emptyMsg = document.getElementById("catalog-empty-message");
    if (!emptyMsg) {
      emptyMsg = document.createElement("p");
      emptyMsg.id = "catalog-empty-message";
      emptyMsg.className =
        "col-span-full text-center text-fog text-sm py-12 hidden";
      emptyMsg.textContent =
        "No equipment matches your search. Try a different filter or keyword.";
      grid.appendChild(emptyMsg);
    }
    emptyMsg.classList.toggle("hidden", !isEmpty);
  }

  function updateLoadMoreVisibility(matchCount) {
    const btn = document.getElementById("catalog-load-more");
    if (!btn) return;
    btn.classList.toggle("hidden", matchCount <= visibleLimit);
  }

  // Combined category + search filter, applied to the persistent
  // card nodes (cards are never destroyed, only shown/hidden) so
  // the fade-out/collapse transition has something to animate.
  function updateVisibility(animate = true) {
    const cards = Array.from(grid.querySelectorAll(".catalog-card"));
    const query = searchQuery.trim().toLowerCase();

    const matches = cards.filter((card) => {
      const matchesCategory =
        activeCategory === "All" || card.dataset.category === activeCategory;
      const matchesSearch = card.dataset.name.includes(query);
      return matchesCategory && matchesSearch;
    });

    const visibleSet = new Set(matches.slice(0, visibleLimit));
    cards.forEach((card) =>
      setCardVisibility(card, visibleSet.has(card), animate),
    );

    updateLoadMoreVisibility(matches.length);
    toggleEmptyState(matches.length === 0);
  }

  function filterCatalog(category) {
    activeCategory = category;
    visibleLimit = PAGE_SIZE;
    updateVisibility(true);
  }

  function searchCatalog(query) {
    searchQuery = query;
    visibleLimit = PAGE_SIZE;
    updateVisibility(true);
  }

  function handleLoadMore() {
    visibleLimit += PAGE_SIZE;
    updateVisibility(true);
  }

  // --- Event wiring -------------------------------------------------
  // triggerContactPrefill() is defined once in Shared Helpers above.
  document.getElementById("catalog-filters")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;

    document.querySelectorAll("#catalog-filters [data-filter]").forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle("bg-orange", isActive);
      b.classList.toggle("border-orange", isActive);
      b.classList.toggle("text-steel", isActive);
      b.classList.toggle("border-midgrey", !isActive);
      b.classList.toggle("text-crisp", !isActive);
      b.setAttribute("aria-pressed", String(isActive));
    });

    filterCatalog(btn.dataset.filter);
  });

  document.getElementById("catalog-search")?.addEventListener("input", (e) => {
    searchCatalog(e.target.value);
  });

  document
    .getElementById("catalog-load-more")
    ?.addEventListener("click", handleLoadMore);

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".quote-btn");
    if (!btn) return;
    if (typeof openModal === "function") openModal(Number(btn.dataset.machineId));
  });

  document
    .getElementById("sourcing-request-btn")
    ?.addEventListener("click", () => {
      preFillEnquiry("Custom Sourcing Request", "Custom Sourcing Request");
    });

  document
    .getElementById("spare-parts-cta")
    ?.addEventListener("click", () => {
      preFillEnquiry("Spare Parts Enquiry", "Spare Parts / Consumables");
    });

  renderCatalogOnce();
})();

// ============================================================
// Section: Machine Media Lightbox
// ============================================================
// Triggered by clicking a catalog card's photo (".gallery-trigger").
// Shows the machine's main photo, plus everything in its "gallery"
// and "videos" arrays from machines-data.js, in one swipeable/
// arrow-key-navigable viewer. Machines with no extra media still
// open the lightbox — it just shows the single main photo.

(function () {
  const modal = document.getElementById("machine-lightbox");
  const grid = document.getElementById("catalog-grid");
  if (!modal || !grid) return;

  const mediaEl = document.getElementById("lightbox-media");
  const titleEl = document.getElementById("lightbox-title");
  const counterEl = document.getElementById("lightbox-counter");
  const thumbsEl = document.getElementById("lightbox-thumbs");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  let items = []; // [{ type: "image" | "video", src }]
  let currentIndex = 0;
  let currentName = "";

  function isVideoPath(path) {
    return /\.(mp4|mov|webm)$/i.test(path);
  }

  function buildItems(machine) {
    const images = [machine.image, ...machine.gallery].map((src) => ({
      type: "image",
      src,
    }));
    const videos = machine.videos.map((src) => ({ type: "video", src }));
    return [...images, ...videos];
  }

  function renderMedia() {
    const item = items[currentIndex];
    mediaEl.innerHTML =
      item.type === "video"
        ? `<video src="${item.src}" controls playsinline class="max-w-full max-h-full"></video>`
        : `<img src="${item.src}" alt="${currentName}" class="max-w-full max-h-full object-contain" />`;
  }

  function renderThumbs() {
    thumbsEl.innerHTML = items
      .map((item, i) => {
        const activeClass =
          i === currentIndex ? "border-orange" : "border-transparent";
        const inner =
          item.type === "video"
            ? `<div class="w-full h-full bg-steel flex items-center justify-center text-crisp text-xs">&#9654;</div>`
            : `<img src="${item.src}" alt="" class="w-full h-full object-cover" />`;
        return `<button type="button" class="lightbox-thumb-btn shrink-0 w-16 h-12 sm:w-20 sm:h-14 border-2 ${activeClass} overflow-hidden" data-index="${i}">${inner}</button>`;
      })
      .join("");
  }

  function renderCounter() {
    counterEl.textContent = `${currentIndex + 1} / ${items.length}`;
  }

  function render() {
    titleEl.textContent = currentName;
    renderMedia();
    renderThumbs();
    renderCounter();
  }

  function goTo(index) {
    currentIndex = (index + items.length) % items.length;
    render();
  }

  function openLightbox(machineId) {
    const machine = machinesData.find((m) => m.id === machineId);
    if (!machine) return;
    items = buildItems(machine);
    currentName = machine.name;
    currentIndex = 0;
    render();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");
  }

  function closeLightbox() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
    mediaEl.innerHTML = ""; // stops any playing video
  }

  grid.addEventListener("click", (e) => {
    const trigger = e.target.closest(".gallery-trigger");
    if (!trigger) return;
    openLightbox(Number(trigger.dataset.galleryId));
  });

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
  nextBtn.addEventListener("click", () => goTo(currentIndex + 1));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLightbox();
  });

  thumbsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".lightbox-thumb-btn");
    if (!btn) return;
    goTo(Number(btn.dataset.index));
  });

  document.addEventListener("keydown", (e) => {
    if (modal.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goTo(currentIndex - 1);
    if (e.key === "ArrowRight") goTo(currentIndex + 1);
  });
})();

// ============================================================
// Section: Case Studies (secondary case study cards)
// ============================================================

(function () {
  const grid = document.getElementById("case-study-grid");
  if (!grid) return;

  // To add a new case study: append an object below. No HTML
  // edits required — render() builds cards from this array.
  const caseStudyData = [
    {
      id: 1,
      title: "Hydraulic Press Line Commissioning",
      sector: "Metal Fabrication",
      location: "Ogun State, Nigeria",
      equipment: "300-Ton Hydraulic Press + Rolling Machine",
      equipmentOption: "Hydraulic Press",
      image: "assets/images/case-hydraulic-press.jpg",
      page: "case-studies/ogun-hydraulic-press.html",
      resultTarget: 250,
      resultSuffix: "%",
      resultLabel: "Output Capacity Increase",
      enquiryDescription:
        "I have reviewed the Hydraulic Press Line Commissioning case study (Ogun State) and I am interested in a similar hydraulic press and rolling machine setup for my facility.\n\nPlease provide a formal quotation including unit pricing, delivery timeline, installation scope, and commissioning details. I am ready to proceed.",
    },
    {
      id: 2,
      title: "Engine Reboring Service Center Setup",
      sector: "Automotive & Engine Repair",
      location: "Lagos State, Nigeria",
      equipment: "Engine Block Reboring Machine + Welding Station",
      equipmentOption: "Automotive Reconditioning",
      image: "assets/images/case-reboring-center.jpg",
      page: "case-studies/lagos-reboring-center.html",
      resultTarget: 35,
      resultSuffix: " Engines",
      resultLabel: "Reconditioned Monthly",
      enquiryDescription:
        "I have reviewed the Engine Reboring Service Center case study (Lagos State) and I am interested in setting up a similar engine reconditioning capability for my workshop.\n\nPlease contact me to discuss machine options, pricing, installation, and operator training. I am ready to proceed.",
    },
    {
      id: 3,
      title: "Multi-Machine Workshop Integration",
      sector: "Construction & Heavy Equipment",
      location: "Rivers State, Nigeria",
      equipment: "Lathe + Milling + Shaping Machine Line",
      equipmentOption: "Lathe Machine",
      image: "assets/images/case-workshop-integration.jpg",
      page: "case-studies/rivers-workshop.html",
      resultTarget: 6,
      resultSuffix: " Wks",
      resultLabel: "Full Commissioning Timeline",
      enquiryDescription:
        "I have reviewed the Multi-Machine Workshop Integration case study (Rivers State) and I am interested in a similar multi-machine setup for my facility — including lathe, milling, and shaping machines.\n\nPlease provide a formal quotation for a complete workshop line, covering supply, delivery, installation, and commissioning. I am ready to proceed.",
    },
  ];

  function buildCard(item) {
    return `
      <div class="case-study-card bg-midgrey border-l-4 border-orange/50 hover:border-orange transition-all duration-200 ease-out hover:-translate-y-1">
        <div class="relative w-full aspect-video bg-steel overflow-hidden">
          <img
            src="${item.image}"
            alt="${item.title}"
            loading="lazy"
            class="w-full h-full object-cover"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div class="absolute inset-0 hidden items-center justify-center bg-steel px-4 text-center">
            <span class="text-fog font-condensed font-bold uppercase text-xs">${item.title}</span>
          </div>
        </div>
        <div class="p-6">
          <span class="block text-orange text-xs font-condensed font-bold uppercase tracking-[0.2em] mb-2">Case Study</span>
          <h3 class="font-condensed font-bold text-crisp uppercase text-lg mb-4 leading-snug">${item.title}</h3>
          <div class="space-y-1.5 text-xs sm:text-sm mb-5">
            <div class="flex justify-between gap-2"><span class="text-fog uppercase tracking-wide">Sector</span><span class="text-crisp font-semibold text-right">${item.sector}</span></div>
            <div class="flex justify-between gap-2"><span class="text-fog uppercase tracking-wide">Location</span><span class="text-crisp font-semibold text-right">${item.location}</span></div>
            <div class="flex justify-between gap-2"><span class="text-fog uppercase tracking-wide">Equipment</span><span class="text-crisp font-semibold text-right">${item.equipment}</span></div>
          </div>
          <div class="border-t border-steel/60 pt-4 mb-5">
            <span class="counter block font-condensed font-extrabold text-orange text-2xl sm:text-3xl" data-target="${item.resultTarget}" data-suffix="${item.resultSuffix}">0</span>
            <span class="block text-crisp text-xs uppercase tracking-wide mt-1">${item.resultLabel}</span>
          </div>
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <a href="${item.page}" class="group inline-flex items-center gap-1 text-orange text-sm font-condensed font-semibold uppercase tracking-wide">
              <span aria-hidden="true">→</span><span class="group-hover:underline">View Full Case Study</span>
            </a>
            <button
              type="button"
              class="case-quote-btn shrink-0 bg-orange hover:bg-orange/85 text-steel font-condensed font-bold uppercase tracking-wide text-xs px-4 py-2 transition-colors duration-200"
              data-case-id="${item.id}"
            >Get a Quote</button>
          </div>
        </div>
      </div>`;
  }

  grid.innerHTML = caseStudyData.map(buildCard).join("");

  // These 3 result counters were just injected via innerHTML, so
  // the initial document-wide initCounters() call (which already
  // ran above) never saw them — pick them up now.
  initCounters(grid);

  // "Get a Quote" buttons on each case study card
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".case-quote-btn");
    if (!btn) return;
    const cs = caseStudyData.find((c) => c.id === Number(btn.dataset.caseId));
    if (!cs) return;
    preFillEnquiry(cs.title, cs.equipmentOption, cs.enquiryDescription);
  });

  document
    .getElementById("featured-case-cta")
    ?.addEventListener("click", () => {
      window.location.href = "case-studies/kaduna-workshop.html";
    });
})();

// ============================================================
// Section: Contact / Enquiry Form
// ============================================================

// ═══════════════════════════════════════
// EMAILJS CONFIGURATION
// Replace these values with your real
// EmailJS credentials before going live
// ═══════════════════════════════════════
const EMAILJS_CONFIG = {
  publicKey: "Roc6csA-p0LiYlC-t",
  serviceID: "service_gb4rofs",
  templateID_notify: "template_mzoitnc",
  templateID_reply: "template_7fjm0ao",
};

// Called once, here, at the top level — not inside submitEnquiry().
// Safe to run even before the real key is pasted in: a bad key only
// causes a failure at send-time, not here.
if (typeof emailjs !== "undefined") {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

(function () {
  const form = document.getElementById("enquiry-form");
  if (!form) return;

  // ── File attachment state ──────────────────────────────────────────
  // Holds the processed file ready to be sent with the enquiry.
  // preview is a base64 data-URL for images; empty string for videos.
  let attachmentData = { name: "", size: "", type: "", preview: "" };

  const uploadZone    = document.getElementById("upload-zone");
  const uploadInput   = document.getElementById("attachment-input");
  const uploadPlaceholder = document.getElementById("upload-placeholder");
  const uploadPreview = document.getElementById("upload-preview");
  const uploadImgThumb = document.getElementById("upload-img-thumb");
  const uploadVideoIcon = document.getElementById("upload-video-icon");
  const uploadFileName = document.getElementById("upload-file-name");
  const uploadFileSize = document.getElementById("upload-file-size");
  const uploadActions  = document.getElementById("upload-actions");
  const uploadVideoNote = document.getElementById("upload-video-note");
  const uploadClearBtn = document.getElementById("upload-clear-btn");
  const uploadError    = document.getElementById("upload-error");

  const MAX_BYTES = 10 * 1024 * 1024; // 10 MB hard cap

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function showUploadError(msg) {
    if (uploadError) { uploadError.textContent = msg; uploadError.classList.remove("hidden"); }
  }

  function clearUploadError() {
    if (uploadError) { uploadError.textContent = ""; uploadError.classList.add("hidden"); }
  }

  function resetUpload() {
    attachmentData = { name: "", size: "", type: "", preview: "" };
    if (uploadInput) uploadInput.value = "";
    uploadPlaceholder?.classList.remove("hidden");
    uploadPreview?.classList.add("hidden");
    uploadPreview?.classList.remove("flex");
    uploadActions?.classList.add("hidden");
    if (uploadImgThumb) { uploadImgThumb.src = ""; uploadImgThumb.classList.add("hidden"); }
    uploadVideoIcon?.classList.add("hidden");
    uploadVideoNote?.classList.add("hidden");
    clearUploadError();
  }

  function processFile(file) {
    clearUploadError();

    if (file.size > MAX_BYTES) {
      showUploadError(`File is too large (${formatBytes(file.size)}). Maximum allowed is 10 MB.`);
      resetUpload();
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      showUploadError("Only image and video files are accepted.");
      resetUpload();
      return;
    }

    // Show preview shell
    uploadPlaceholder?.classList.add("hidden");
    uploadPreview?.classList.remove("hidden");
    uploadPreview?.classList.add("flex");
    uploadActions?.classList.remove("hidden");

    if (uploadFileName) uploadFileName.textContent = file.name;
    if (uploadFileSize) uploadFileSize.textContent = formatBytes(file.size);

    if (isVideo) {
      uploadImgThumb?.classList.add("hidden");
      uploadVideoIcon?.classList.remove("hidden");
      uploadVideoNote?.classList.remove("hidden");
      attachmentData = { name: file.name, size: formatBytes(file.size), type: "video", preview: "" };
      return;
    }

    // Image — show full-res thumbnail in UI, but send a tiny canvas-resized
    // version in the email to stay well within EmailJS's 50KB variables limit.
    uploadVideoIcon?.classList.add("hidden");
    uploadVideoNote?.classList.add("hidden");

    const reader = new FileReader();
    reader.onload = (e) => {
      const fullDataUrl = e.target.result;

      // Show full-res preview in the UI
      if (uploadImgThumb) {
        uploadImgThumb.src = fullDataUrl;
        uploadImgThumb.classList.remove("hidden");
      }

      // Resize to an email-safe thumbnail via canvas (max 280×210, JPEG 65%)
      // A thumbnail this size is typically 8–25 KB as base64 — safe under 50 KB total.
      const img = new Image();
      img.onload = () => {
        const MAX_W = 280, MAX_H = 210;
        let w = img.width, h = img.height;
        if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
        if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H; }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const thumb = canvas.toDataURL("image/jpeg", 0.65);
        attachmentData = { name: file.name, size: formatBytes(file.size), type: "image", preview: thumb };
      };
      img.src = fullDataUrl;
    };
    reader.readAsDataURL(file);
  }

  if (uploadInput) {
    uploadInput.addEventListener("change", () => {
      if (uploadInput.files && uploadInput.files[0]) processFile(uploadInput.files[0]);
    });
  }

  if (uploadZone) {
    uploadZone.addEventListener("dragover", (e) => { e.preventDefault(); uploadZone.classList.add("drag-over"); });
    uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-over"));
    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadZone.classList.remove("drag-over");
      const file = e.dataTransfer?.files?.[0];
      if (file) { if (uploadInput) uploadInput.value = ""; processFile(file); }
    });
  }

  if (uploadClearBtn) {
    uploadClearBtn.addEventListener("click", (e) => { e.stopPropagation(); resetUpload(); });
  }
  // ── End file attachment ────────────────────────────────────────────

  const REQUIRED_FIELDS = [
    { id: "full-name", label: "Full Name" },
    { id: "company-name", label: "Company Name" },
    { id: "phone-number", label: "Phone Number", type: "phone" },
    { id: "industry-sector", label: "Industry / Sector" },
    { id: "project-description", label: "Project Description / Requirements" },
  ];

  function setFieldError(field, errorEl, message) {
    const hasError = Boolean(message);
    field.classList.toggle("border-red-500", hasError);
    field.classList.toggle("border-transparent", !hasError);
    if (errorEl) {
      errorEl.textContent = message || "";
      errorEl.classList.toggle("hidden", !hasError);
    }
  }

  function validateForm() {
    let isValid = true;
    let firstErrorField = null;

    REQUIRED_FIELDS.forEach(({ id, label, type }) => {
      const field = document.getElementById(id);
      const errorEl = document.getElementById(`${id}-error`);
      if (!field) return;

      const value = field.value.trim();
      let message = "";

      if (!value) {
        message = `${label} is required.`;
      } else if (type === "phone" && value.replace(/\D/g, "").length < 10) {
        message = "Enter a valid phone number (at least 10 digits).";
      }

      setFieldError(field, errorEl, message);
      if (message) {
        isValid = false;
        if (!firstErrorField) firstErrorField = field;
      }
    });

    // Email is optional, but if filled in it must look like an email —
    // it's the only thing that decides whether the auto-reply can send.
    const emailField = document.getElementById("email-address");
    const emailErrorEl = document.getElementById("email-address-error");
    if (emailField) {
      const emailValue = emailField.value.trim();
      const isValidEmail =
        !emailValue || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
      setFieldError(
        emailField,
        emailErrorEl,
        isValidEmail ? "" : "Enter a valid email address.",
      );
      if (!isValidEmail) {
        isValid = false;
        if (!firstErrorField) firstErrorField = emailField;
      }
    }

    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      firstErrorField.focus();
    }

    return isValid;
  }

  // --- Reference number + date, for both templates -------------------
  // Matches the spec format exactly: "TME-847291-394"
  function generateReference() {
    const last6 = String(Date.now()).slice(-6);
    const random3 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    return `TME-${last6}-${random3}`;
  }

  // "Monday, 23 June 2025 — 14:32 WAT" — built from formatToParts
  // rather than a locale string + regex, so the shape never drifts
  // across browsers. Africa/Lagos has no DST, so "WAT" is always correct.
  function formatDateReceived() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const get = (type) => parts.find((p) => p.type === type)?.value || "";
    return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")} — ${get("hour")}:${get("minute")} WAT`;
  }

  // --- Error banner (synthesized — no new markup in index.html) ------
  function getErrorBanner() {
    let banner = document.getElementById("enquiry-error-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "enquiry-error-banner";
      banner.className =
        "hidden bg-red-500/15 border border-red-500 text-red-400 text-sm rounded px-4 py-3 mb-5";
      banner.textContent =
        "⚠ There was an error sending your enquiry. Please try again or contact us directly on WhatsApp.";
      document
        .getElementById("enquiry-submit-btn")
        ?.insertAdjacentElement("beforebegin", banner);
    }
    return banner;
  }

  function showErrorBanner() {
    getErrorBanner().classList.remove("hidden");
  }

  function hideErrorBanner() {
    document.getElementById("enquiry-error-banner")?.classList.add("hidden");
  }

  function showFormSuccess(firstName) {
    const successMessage = document.getElementById("enquiry-success-message");
    if (successMessage) {
      successMessage.textContent = `Thank you, ${firstName}. Our engineering team will review your requirements and respond within 24 working hours.`;
    }
    document.getElementById("enquiry-form-fields")?.classList.add("hidden");
    document.getElementById("enquiry-form-success")?.classList.remove("hidden");
  }

  const SUBMIT_BTN_DEFAULT_HTML =
    'Submit Enquiry <span aria-hidden="true">→</span>';
  const SUBMIT_BTN_LOADING_HTML = `
    <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"></path>
    </svg>
    SENDING...
  `;

  function setSubmitButtonLoading(isLoading) {
    const submitBtn = document.getElementById("enquiry-submit-btn");
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.classList.add(
      "inline-flex",
      "items-center",
      "justify-center",
      "gap-2",
    );
    submitBtn.innerHTML = isLoading
      ? SUBMIT_BTN_LOADING_HTML
      : SUBMIT_BTN_DEFAULT_HTML;
  }

  function resetForm() {
    form.reset();
    REQUIRED_FIELDS.forEach(({ id }) => {
      const field = document.getElementById(id);
      const errorEl = document.getElementById(`${id}-error`);
      if (field) setFieldError(field, errorEl, "");
    });
    const emailField = document.getElementById("email-address");
    if (emailField)
      setFieldError(
        emailField,
        document.getElementById("email-address-error"),
        "",
      );

    setSubmitButtonLoading(false);
    hideErrorBanner();
    resetUpload();
    document.getElementById("enquiry-form-fields")?.classList.remove("hidden");
    document.getElementById("enquiry-form-success")?.classList.add("hidden");
    clearPrefill();
  }

  function submitEnquiry(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const isConfigured = Object.values(EMAILJS_CONFIG).every(
      (v) => !v.startsWith("PASTE_"),
    );
    if (typeof emailjs === "undefined" || !isConfigured) {
      console.error(
        "EmailJS is not configured yet — replace the placeholders in EMAILJS_CONFIG (assets/js/main.js) with real values.",
      );
      alert(
        "Our enquiry form isn't fully connected yet — please reach us directly via WhatsApp or phone instead.",
      );
      return;
    }

    hideErrorBanner();

    const fullName = document.getElementById("full-name").value.trim();
    const firstName = fullName.split(" ")[0];
    const clientEmail = document.getElementById("email-address")?.value.trim();
    const subjectValue = document
      .getElementById("enquiry-subject")
      .value.trim();

    setSubmitButtonLoading(true);

    const templateParams = {
      from_name: fullName,
      company: document.getElementById("company-name").value.trim(),
      phone: document.getElementById("phone-number").value.trim(),
      industry: document.getElementById("industry-sector").value,
      equipment: document.getElementById("equipment-interest").value,
      message: document.getElementById("project-description").value.trim(),
      source: document.getElementById("hear-about").value,
      subject: subjectValue || "General Enquiry",
      timestamp: generateReference(),
      date_received: formatDateReceived(),
      reply_to: document.getElementById("phone-number").value.trim(),
      // Attachment fields — add {{attachment_name}}, {{attachment_size}},
      // {{attachment_type}}, and {{attachment_preview}} to your EmailJS
      // notify template. For images under 4 MB, attachment_preview is a
      // base64 data-URL you can render with: <img src="{{attachment_preview}}" />
      // Attachment fields — only included when a file was actually selected.
      // Add {{attachment_name}}, {{attachment_size}}, {{attachment_type}},
      // {{has_attachment}}, and {{attachment_preview}} to your EmailJS notify
      // template to display them. If the template doesn't have these variables
      // yet, they are safely omitted here until you add them.
      ...(attachmentData.name ? {
        attachment_name:    attachmentData.name,
        attachment_size:    attachmentData.size,
        attachment_type:    attachmentData.type,
        attachment_preview: attachmentData.preview,
        has_attachment:     "Yes",
      } : {}),
    };

    // The internal notification always sends. The client auto-reply
    // only sends if they gave us a real email — there's nowhere to
    // send it otherwise. This also means a submission with no email
    // costs 1 EmailJS credit, not 2.
    const sendPromises = [
      emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.templateID_notify,
        templateParams,
      ),
    ];

    if (clientEmail) {
      sendPromises.push(
        emailjs.send(
          EMAILJS_CONFIG.serviceID,
          EMAILJS_CONFIG.templateID_reply,
          {
            ...templateParams,
            to_email: clientEmail,
          },
        ),
      );
    }

    Promise.all(sendPromises)
      .then(() => showFormSuccess(firstName))
      .catch((error) => {
        console.error("EmailJS submission failed:", error);
        setSubmitButtonLoading(false);
        // Surface the actual EmailJS error so it's visible during testing
        const detail = error?.text || error?.message || JSON.stringify(error) || "Unknown error";
        const banner = getErrorBanner();
        banner.textContent = `⚠ Submission failed (${detail}). Please try again or contact us via WhatsApp.`;
        banner.classList.remove("hidden");
      });
  }

  form.addEventListener("submit", submitEnquiry);
  document
    .getElementById("enquiry-reset-btn")
    ?.addEventListener("click", resetForm);
  document
    .getElementById("prefill-clear")
    ?.addEventListener("click", clearPrefill);
})();

// ============================================================
// MACHINE DETAIL MODAL — Phase 2 Section 7
// ============================================================

(function () {
  const overlay  = document.getElementById("modal-overlay");
  const closeBtn = document.getElementById("modal-close-btn");
  const backBtn  = document.getElementById("modal-back-btn");
  const quoteBtn = document.getElementById("modal-quote-btn");
  if (!overlay) return;

  // ── State ────────────────────────────────────────────────────
  let currentMachine     = null;
  let selectedAccessories = [];

  // ── Category reference codes ──────────────────────────────────
  const CATEGORY_CODES = {
    "Lathes":               "LT",
    "Milling & Shaping":    "ML",
    "Cutting":              "CT",
    "Bending & Rolling":    "BR",
    "Pressing & Welding":   "PW",
    "Drilling & Grinding":  "DG",
    "Engine & Automotive":  "EA",
    "Industrial Equipment": "IE",
    "Tooling":              "TL",
  };

  // ── Accessory lists — keyed by machine type ───────────────────
  const ACC = {
    lathes: [
      "3-Jaw Self-Centering Chuck",
      "4-Jaw Independent Chuck",
      "Live Center & Facing Tool Set",
      "Carbide Turning Tools",
      "HSS Drill Bit Set",
      "Tap & Die Set",
      "Dividing Head",
    ],
    milling: [
      "End Mill Cutter Set",
      "Face Mill Cutter",
      "Dividing Head",
      "Carbide Insert Set",
      "Boring Head Set",
      "Milling Vise",
      "Tap & Die Set",
    ],
    laser: [
      "Laser Focusing Lens",
      "Copper Nozzle Set",
      "Assist Gas Regulator",
      "Cutting Head Protection Glass",
      "Laser Chiller Unit",
    ],
    plasma: [
      "Plasma Electrodes & Nozzle Kit",
      "Consumable Tips Set",
      "Plasma Torch",
      "Cutting Guide Rail",
      "Electrode & Shield Kit",
    ],
    saw: [
      "Circular / Band Saw Blades",
      "Coolant System",
      "Blade Guide Inserts",
      "Blade Tension Gauge",
    ],
    shearing: [
      "Replacement Shear Blades",
      "Blade Gap Gauge",
      "Back Gauge Ruler Set",
      "Hydraulic Seal Kit",
    ],
    bending: [
      "Press Brake Tooling Set (V-Dies & Punches)",
      "Bending Die Set",
      "Radius Gauge Set",
      "Hydraulic Seals Kit",
      "Safety Guard Kit",
    ],
    pressing: [
      "Press Tooling & Die Set",
      "Die Holder Plate",
      "Hydraulic Seal Kit",
      "Safety Guard Kit",
      "Pressure Gauge Set",
    ],
    welding: [
      "Welding Electrodes (E6013 / E7018)",
      "Welding Wire — MIG/TIG",
      "Auto-Darkening Welding Mask",
      "Ground Clamp Set",
      "Anti-Spatter Spray",
      "Welding Shield & Gloves Kit",
    ],
    drilling: [
      "HSS Drill Bit Set",
      "Tap & Die Set",
      "Drill Chuck Set (MT Taper)",
      "Center Drill Set",
      "Tapping Attachment",
    ],
    grinding: [
      "Grinding Wheel Set (Various Grit)",
      "Diamond Dressing Tool",
      "Magnetic Chuck",
      "Coolant Pump Kit",
      "Wheel Balancing Stand",
    ],
    engineBoring: [
      "Boring Bar Set",
      "CBN / PCD Cutting Inserts",
      "Dial Bore Gauge",
      "Honing Stones",
      "Precision Sleeve Set",
    ],
    autoDisc: [
      "Brake Disc Cutter Inserts",
      "Dial Indicator Set",
      "Centering Adapter Set",
      "Drum Turning Tools",
    ],
    industrial: [
      "Automatic Voltage Regulator (AVR)",
      "Shaft Coupling Set",
      "Drive Belt Kit",
      "Fuel Filter Kit",
      "Load Transfer Switch",
    ],
    _default: [
      "Carbide Cutting Tools",
      "HSS Drill Bit Set",
      "Tap & Die Set",
    ],
  };

  // Returns the right accessory list based on machine name + category
  function getAccessories(machine) {
    const n = machine.name.toLowerCase();
    const c = machine.category;

    if (c === "Lathes")           return ACC.lathes;
    if (c === "Milling & Shaping") return ACC.milling;

    if (c === "Cutting") {
      if (n.includes("laser"))  return ACC.laser;
      if (n.includes("plasma")) return ACC.plasma;
      if (n.includes("saw"))    return ACC.saw;
      if (n.includes("shear"))  return ACC.shearing;
      return ACC.laser;
    }

    if (c === "Bending & Rolling") return ACC.bending;

    if (c === "Pressing & Welding") {
      if (n.includes("weld")) return ACC.welding;
      return ACC.pressing;
    }

    if (c === "Drilling & Grinding") {
      if (n.includes("grind")) return ACC.grinding;
      return ACC.drilling;
    }

    if (c === "Engine & Automotive") {
      if (n.includes("disc") || n.includes("car ")) return ACC.autoDisc;
      return ACC.engineBoring;
    }

    if (c === "Industrial Equipment") return ACC.industrial;

    return ACC._default;
  }

  // ── Category descriptions ─────────────────────────────────────
  function getCategoryDescription(category, name) {
    const map = {
      "Lathes":
        `The ${name} is a precision metal-cutting lathe designed for heavy industrial machining operations. Suitable for facing, turning, threading, and boring across a range of ferrous and non-ferrous materials. Sourced direct from our OEM partner and adapted for 380V African grid standards.`,
      "Milling & Shaping":
        `The ${name} is a heavy-duty machine tool built for precision flat and contoured surface machining across mild steel, stainless, and aluminium workpieces. It supports a wide range of milling cutters and is supplied with a dividing head for angular work. Sourced direct from OEM and voltage-adapted for Nigerian grid use.`,
      "Cutting":
        `The ${name} is an industrial-grade cutting system engineered for high-accuracy, high-speed material separation across structural steel, plates, and profiles. CNC-interfaced models are available on request for programmable cutting paths. Commissioned by the TME engineering team with full operator training included.`,
      "Bending & Rolling":
        `The ${name} is a heavy-duty metal forming machine designed for precise plate rolling, bending, and profile shaping in fabrication workshops. Hydraulic and mechanical drive variants are available, adapted to your facility's power supply and production volume. Full commissioning by TME included.`,
      "Pressing & Welding":
        `The ${name} is built for high-force industrial pressing and joining operations in metal fabrication, automotive, and structural applications. Units are factory-tested to rated tonnage and supplied with full press tooling documentation. TME provides installation, calibration, and after-sales support.`,
      "Drilling & Grinding":
        `The ${name} is a precision machine tool engineered for accurate hole-making and surface finishing operations across mild steel, cast iron, and non-ferrous alloys. Radial arm models offer extended reach for large workpieces. Supplied with TME's standard 12-month parts and labour warranty.`,
      "Engine & Automotive":
        `The ${name} is a specialist automotive reconditioning machine designed to restore engine components to original OEM tolerances. It delivers consistent, repeatable results across crankshafts, engine blocks, and brake components. Trusted by automotive workshops and fleet maintenance centres across Nigeria.`,
      "Industrial Equipment":
        `The ${name} is a heavy-duty industrial unit built for continuous-duty production environments. Designed to international standards and adapted for African power grid conditions. TME provides supply, installation, and ongoing maintenance support nationwide.`,
      "Tooling":
        `The ${name} is a precision workshop consumable sourced from the same OEM network as all TME machinery. Manufactured to DIN/ISO standards for consistent fit, finish, and dimensional accuracy across a wide range of machine tools. Available ex-stock for rapid delivery nationwide.`,
    };
    return map[category] || map["Industrial Equipment"];
  }

  // ── Reference formatter ───────────────────────────────────────
  function generateReference(machine) {
    const code = CATEGORY_CODES[machine.category] || "XX";
    return `TME-${code}-${String(machine.id).padStart(3, "0")}`;
  }

  // ── Populate ──────────────────────────────────────────────────
  function populateModal(machine) {
    const ref = generateReference(machine);

    // Header ref tag
    document.getElementById("modal-ref-tag").textContent = `REF: ${ref}`;

    // Image / placeholder
    const imgEl  = document.getElementById("modal-img");
    const phEl   = document.getElementById("modal-placeholder");
    if (machine.hasPhoto && machine.image) {
      imgEl.src = machine.image;
      imgEl.alt = machine.name;
      imgEl.classList.add("modal-img-visible");
      phEl.style.display = "none";
    } else {
      imgEl.classList.remove("modal-img-visible");
      imgEl.src = "";
      phEl.style.display = "flex";
      document.getElementById("modal-placeholder-name").textContent = machine.name;
    }

    // Category + tag badges
    document.getElementById("modal-cat-badge").textContent = machine.category.toUpperCase();
    const tagBadge = document.getElementById("modal-tag-badge");
    if (machine.tag) {
      tagBadge.textContent = machine.tag;
      tagBadge.classList.remove("hidden");
    } else {
      tagBadge.classList.add("hidden");
    }

    // Name block
    document.getElementById("modal-machine-name").textContent = machine.name.toUpperCase();
    document.getElementById("modal-ref-inline").textContent = ref;
    const origin = (machine.specs && machine.specs["Origin"]) || "OEM Direct — China";
    document.getElementById("modal-origin-inline").textContent = "⊕ " + origin;

    // Quick stats — first 3 spec entries, skipping Origin
    const specEntries = Object.entries(machine.specs || {}).filter(([k]) => k !== "Origin");
    for (let i = 0; i < 3; i++) {
      document.getElementById(`modal-stat-val-${i}`).textContent = specEntries[i] ? specEntries[i][1] : "—";
      document.getElementById(`modal-stat-key-${i}`).textContent = specEntries[i] ? specEntries[i][0] : "—";
    }

    // Description
    document.getElementById("modal-description").textContent =
      getCategoryDescription(machine.category, machine.name);

    // Spec table — all specs + standard additions
    const additionalSpecs = {
      "Customization": "Available on request",
      "Warranty":      "12 Months — Parts & Labour",
      "After-Sales":   "TME Engineering Team",
      "Delivery":      "Nationwide — Nigeria",
    };
    const allSpecs = Object.assign({}, machine.specs || {}, additionalSpecs);
    document.getElementById("modal-spec-tbody").innerHTML = Object.entries(allSpecs)
      .map(([key, val]) => `
        <tr class="modal-spec-tr">
          <td class="modal-spec-td-key">${key}</td>
          <td class="modal-spec-td-val">${val}</td>
        </tr>`)
      .join("");

    // Accessories list
    const accList   = document.getElementById("modal-accessories-list");
    const accItems  = getAccessories(machine);
    accList.innerHTML = accItems
      .map((name) => `
        <div class="modal-accessory-card">
          <span class="modal-accessory-name">
            <span class="modal-accessory-diamond">&#9670;</span>${name}
          </span>
          <button type="button" class="modal-add-btn" data-accessory="${name}">ADD TO ENQUIRY</button>
        </div>`)
      .join("");

    accList.querySelectorAll(".modal-add-btn").forEach((btn) => {
      btn.addEventListener("click", () => addAccessory(btn.dataset.accessory, btn));
    });
  }

  // ── Tab switching ─────────────────────────────────────────────
  function switchTab(tabName) {
    document.querySelectorAll(".modal-tab").forEach((t) => {
      t.classList.toggle("modal-tab-active", t.dataset.tab === tabName);
    });
    document.querySelectorAll(".modal-tab-content").forEach((panel) => {
      panel.classList.toggle("hidden", panel.id !== `modal-tab-${tabName}`);
    });
  }

  // ── Accessory selection ───────────────────────────────────────
  function addAccessory(name, btn) {
    if (selectedAccessories.includes(name)) return;
    selectedAccessories.push(name);
    btn.textContent = "✓ ADDED";
    btn.classList.add("modal-added");
    btn.disabled = true;
  }

  // MOBILE RESPONSIVENESS FIXES
  // iOS Safari ignores overflow:hidden on body when scrolling.
  // The position:fixed pattern is the only reliable cross-browser lock.
  let _scrollLockY = 0;

  function lockScroll() {
    _scrollLockY = window.scrollY;
    document.body.classList.add("modal-scroll-locked");
    document.body.style.top = `-${_scrollLockY}px`;
  }

  function unlockScroll() {
    document.body.classList.remove("modal-scroll-locked");
    document.body.style.top = "";
    window.scrollTo(0, _scrollLockY);
  }

  // ── Open / close ──────────────────────────────────────────────
  function openModal(machineId) {
    const machine = machinesData.find((m) => m.id === machineId);
    if (!machine) return;

    currentMachine      = machine;
    selectedAccessories = [];

    populateModal(machine);
    switchTab("specifications");

    overlay.classList.add("modal-open");
    lockScroll();
  }

  function closeModal() {
    overlay.classList.remove("modal-open");
    unlockScroll();
    setTimeout(() => { currentMachine = null; }, 320);
  }

  // ── Quote handler (footer primary button) ─────────────────────
  function handleQuoteRequest() {
    if (!currentMachine) return;
    const machine   = currentMachine;
    const equipment = machine.equipmentOption || "General Enquiry";
    const ref       = generateReference(machine);

    closeModal();

    // Pre-fill the project description with a ready-to-send message
    const descField = document.getElementById("project-description");
    if (descField) {
      let desc = `I am interested in the ${machine.name} (${ref}) and would like to receive a formal quotation including unit pricing, delivery timeline to my facility, installation and commissioning scope, and warranty terms.`;

      if (selectedAccessories.length > 0) {
        desc += `\n\nI am also interested in the following accessories: ${selectedAccessories.join(", ")}.`;
      }

      desc += "\n\nPlease contact me at your earliest convenience to discuss availability and next steps.";

      descField.value = desc;
    }

    // Small delay lets the modal fade out before the scroll fires
    setTimeout(() => preFillEnquiry(machine.name, equipment), 320);
  }

  // ── Event wiring ──────────────────────────────────────────────
  closeBtn?.addEventListener("click", closeModal);
  backBtn?.addEventListener("click", closeModal);
  quoteBtn?.addEventListener("click", handleQuoteRequest);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("modal-open")) closeModal();
  });

  document.getElementById("modal-tab-bar")?.addEventListener("click", (e) => {
    const tab = e.target.closest(".modal-tab");
    if (tab) switchTab(tab.dataset.tab);
  });

  // Expose globally for inline onclick handlers in buildCard()
  window.openModal = openModal;
})();

// ═══════════════════════════════════════════════════════════════
// SCROLL ANIMATION SYSTEM — Phase 2 Section 9
// ═══════════════════════════════════════════════════════════════

(function () {
  // Step 1: respect reduced-motion preference — skip everything
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) return;

  // ── WhatsApp float: pop in 300ms after load ───────────────────
  setTimeout(() => {
    document.getElementById("whatsapp-float")?.classList.add("wa-visible");
  }, 300);

  // ── Single Intersection Observer for all scroll animations ────
  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || 0) * 80;
        el.style.willChange = "transform, opacity";
        setTimeout(() => {
          el.classList.add("anim-visible");
          el.addEventListener(
            "transitionend",
            () => { el.style.willChange = "auto"; },
            { once: true }
          );
        }, delay);
        animObserver.unobserve(el); // fire once, never re-trigger
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  // ── Observe all animated elements currently in the DOM ────────
  function observeAll() {
    document
      .querySelectorAll(
        ".anim-fade-up:not(.anim-visible)," +
        ".anim-fade-in:not(.anim-visible)," +
        ".anim-fade-left:not(.anim-visible)," +
        ".anim-fade-right:not(.anim-visible)," +
        ".anim-scale-in:not(.anim-visible)," +
        ".anim-line-grow:not(.anim-visible)," +
        ".anim-fade-down:not(.anim-visible)," +
        ".section-reveal:not(.anim-visible)"
      )
      .forEach((el) => animObserver.observe(el));
  }

  observeAll();
  window.observeAnimations = observeAll; // callable by other IIFEs after dynamic render

  // ── Catalog cards: initial batch + load-more via MutationObserver
  function animateCatalogCards() {
    document
      .querySelectorAll("#catalog-grid .catalog-card:not([data-anim])")
      .forEach((card, idx) => {
        card.classList.add("anim-fade-up");
        card.dataset.delay = String(idx % 3);
        card.dataset.anim  = "1";
        animObserver.observe(card);
      });
  }

  const catalogGrid = document.getElementById("catalog-grid");
  if (catalogGrid) {
    animateCatalogCards();
    new MutationObserver(animateCatalogCards).observe(catalogGrid, {
      childList: true,
    });
  }

  // ── Case study cards: rendered synchronously before this IIFE runs
  document
    .querySelectorAll("#case-study-grid .case-study-card:not([data-anim])")
    .forEach((card, idx) => {
      card.classList.add("anim-fade-up");
      card.dataset.delay = String(idx);
      card.dataset.anim  = "1";
      animObserver.observe(card);
    });
})();
