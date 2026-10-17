// ============================================================
// TME Africa — Shared form validation
// Used by every form that submits via EmailJS (contact.html,
// services/workshop-performance-audit.html,
// services/mechanical-fitting.html). Keep validation/spam/UX
// logic here — the per-form code in main.js should only wire
// field ids to these functions, not reimplement them.
// ============================================================

// ── Phone ────────────────────────────────────────────────────
// Nigerian: 0XXXXXXXXXX (11 digits) or +234XXXXXXXXXX / 234XXXXXXXXXX
// (10 digits after 234); first digit after the 0/234 must be 7, 8 or 9,
// second must be 0 or 1 (covers the 070/080/081/090/091 etc. ranges).
// International (+, not +234): 8-15 digits total (E.164).
const TME_PHONE_NG_RE = /^(?:\+?234|0)[789][01]\d{8}$/;

function TME_cleanPhone(raw) {
  return String(raw || "").replace(/[\s\-.()]/g, "");
}

// Returns { valid, e164, waDigits } — e164 is the normalised
// "+234XXXXXXXXXX" (or "+<countrycode><digits>") form for sending to
// EmailJS; waDigits is the same number with no leading "+", for
// building wa.me links.
function TME_validatePhone(raw) {
  const cleaned = TME_cleanPhone(raw);
  const invalid = { valid: false, e164: "", waDigits: "" };
  if (!cleaned) return invalid;

  if (TME_PHONE_NG_RE.test(cleaned)) {
    let digits;
    if (cleaned.startsWith("+234")) digits = cleaned.slice(4);
    else if (cleaned.startsWith("234")) digits = cleaned.slice(3);
    else digits = cleaned.slice(1); // leading "0"
    return { valid: true, e164: `+234${digits}`, waDigits: `234${digits}` };
  }

  if (cleaned.startsWith("+") && !cleaned.startsWith("+234")) {
    const digitsOnly = cleaned.slice(1);
    const isAllDigits = /^\d+$/.test(digitsOnly);
    if (isAllDigits && digitsOnly.length >= 8 && digitsOnly.length <= 15) {
      return { valid: true, e164: `+${digitsOnly}`, waDigits: digitsOnly };
    }
  }

  return invalid;
}

// ── Email ────────────────────────────────────────────────────
const TME_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function TME_isValidEmail(value) {
  return TME_EMAIL_RE.test(String(value || "").trim());
}

function TME_normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

// ── Field error display + a11y ──────────────────────────────
// Wires aria-describedby once (call at form-init time), then
// setFieldError toggles aria-invalid + the red border/text on
// every validate pass.
function TME_wireFieldAria(field, errorEl) {
  if (!field || !errorEl) return;
  if (!errorEl.id) return;
  field.setAttribute("aria-describedby", errorEl.id);
  field.setAttribute("aria-invalid", "false");
}

function TME_setFieldError(field, errorEl, message) {
  if (!field) return;
  const hasError = Boolean(message);
  field.classList.toggle("border-red-500", hasError);
  field.classList.toggle("border-transparent", !hasError);
  field.setAttribute("aria-invalid", hasError ? "true" : "false");
  if (errorEl) {
    errorEl.textContent = message || "";
    errorEl.classList.toggle("hidden", !hasError);
  }
}

// Attaches blur + input listeners so a field validates on blur and
// on submit, and clears its own error the moment it becomes valid
// (no need to wait for another blur). validatorFn(value) must return
// "" for valid or an error string.
function TME_wireFieldValidation(field, errorEl, validatorFn) {
  if (!field) return;
  TME_wireFieldAria(field, errorEl);

  field.addEventListener("blur", () => {
    TME_setFieldError(field, errorEl, validatorFn(field.value));
  });

  field.addEventListener("input", () => {
    const stillShowingError = field.classList.contains("border-red-500");
    if (stillShowingError && !validatorFn(field.value)) {
      TME_setFieldError(field, errorEl, "");
    }
  });
}

// ── Reference number + received-date formatting ─────────────
// "TME-847291-394" / "TME-AUDIT-847291-394" / "TME-FIT-847291-394"
function TME_formatReference(prefix) {
  const last6 = String(Date.now()).slice(-6);
  const random3 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return prefix ? `TME-${prefix}-${last6}-${random3}` : `TME-${last6}-${random3}`;
}

// "Monday, 23 June 2025 — 14:32 WAT" — built from formatToParts so the
// shape never drifts across browsers. Africa/Lagos has no DST, so
// "WAT" is always correct.
function TME_formatDateReceived() {
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

// ── Anti-spam ────────────────────────────────────────────────
// One guard per form (keyed by a short string unique to that form),
// covering all three defenses: honeypot, minimum time-to-submit, and
// a repeat-submission cooldown. localStorage access is wrapped in
// try/catch — private browsing / blocked storage just disables the
// cooldown check rather than breaking submission.
function TME_initAntiSpam(formKey) {
  const loadedAt = Date.now();
  const storageKey = `tme_last_submit_${formKey}`;

  return {
    isHoneypotFilled(hpFieldId) {
      const hp = document.getElementById(hpFieldId);
      return Boolean(hp && hp.value.trim());
    },
    isTooFast() {
      return Date.now() - loadedAt < 3000;
    },
    isRateLimited() {
      try {
        const last = localStorage.getItem(storageKey);
        return Boolean(last && Date.now() - Number(last) < 30000);
      } catch (e) {
        return false;
      }
    },
    markSubmitted() {
      try {
        localStorage.setItem(storageKey, String(Date.now()));
      } catch (e) {
        // ignore — storage unavailable, cooldown just won't apply
      }
    },
  };
}
