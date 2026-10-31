// ui.js - small helpers shared by every page

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toast(message, type) {
  let host = document.getElementById("toastHost");
  if (!host) {
    host = document.createElement("div");
    host.id = "toastHost";
    host.className = "toast-host";
    host.setAttribute("role", "status");
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = "toast" + (type === "error" ? " error" : "");
  el.textContent = message;
  host.appendChild(el);
  setTimeout(function () { el.remove(); }, 3500);
}

function showMessage(el, message, type) {
  if (!el) return;
  if (!message) { el.hidden = true; return; }
  el.textContent = message;
  el.className = "form-msg " + (type || "error");
  el.hidden = false;
}

// ----- covers -----

// Books with a cover show the image; if the image file is missing we fall back
// to a grey tile with the first letter of the title.
function coverMarkup(book, cls) {
  cls = cls || "cover";
  const letter = esc((book.title || "?").trim().charAt(0).toUpperCase());
  if (book.has_cover && book.cover_url) {
    return '<img class="' + cls + '" src="' + esc(encodeURI(book.cover_url)) + '" alt="Cover of ' + esc(book.title) +
      '" loading="lazy" data-letter="' + letter + '" onerror="coverFallback(this)">';
  }
  return '<div class="' + cls + ' cover-none" aria-hidden="true">' + letter + "</div>";
}

function coverFallback(img) {
  const tile = document.createElement("div");
  tile.className = img.className + " cover-none";
  tile.setAttribute("aria-hidden", "true");
  tile.textContent = img.dataset.letter || "?";
  img.replaceWith(tile);
}

// ----- formatting -----

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

function parseISO(iso) {
  const p = String(iso).slice(0, 10).split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
// "July 20th, 2025"  (receipt)
function formatLongDate(iso) {
  const d = parseISO(iso);
  return MONTHS[d.getMonth()] + " " + ordinal(d.getDate()) + ", " + d.getFullYear();
}
// "24 June 2025"  (my books)
function formatShortDate(iso) {
  const d = parseISO(iso);
  return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
}
function daysFromToday(iso) {
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((parseISO(iso) - today) / 86400000);
}
function rupees(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 }) + "/-";
}
function durationLabel(days) {
  const map = { 60: "2 Months", 180: "6 Months" };
  return map[days] || days + " Days";
}
function yearLabel(y) {
  return y < 0 ? Math.abs(y) + " BCE" : String(y);
}

// "Book ID : 1042" style list used on Explore results, My Books and Wishlist
function bookFieldRows(book) {
  const rows = [
    ["Book ID", book.book_id],
    ["Title", book.title],
    ["Author", book.author],
    ["Genre", book.genre],
    ["Language", book.language],
    ["Book Type", book.book_type],
    ["Publishing Year", yearLabel(book.publishing_year)],
    ["Available Copies", book.copies_available],
    ["ISBN", book.isbn],
  ];
  return '<div class="fields">' + rows.map(function (r) {
    return '<div class="field-row"><span class="field-label">' + esc(r[0]) + '</span><span class="field-sep">:</span><span class="field-value">' + esc(r[1]) + "</span></div>";
  }).join("") + "</div>";
}

function initials(user) {
  const name = (user && (user.full_name || user.username)) || "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0] || "?").charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : "")).toUpperCase();
}

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}
