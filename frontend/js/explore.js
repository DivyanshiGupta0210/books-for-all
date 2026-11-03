// explore.js - search, filters, Featured Books, New Arrivals
(function () {
  if (!Auth.requireLogin()) return;

  const $ = function (id) { return document.getElementById(id); };
  const state = { q: "", genre: "", language: "", book_type: "" };
  let requestId = 0;
  let timer = null;

  function bookCard(b) {
    return '<a class="book-card" href="book-info.html?id=' + b.book_id + '">' + coverMarkup(b, "cover") +
      "<h3>" + esc(b.title) + "</h3><p>" + esc(b.author) + "</p></a>";
  }

  function resultCard(b) {
    const cover = b.has_cover && b.cover_url
      ? '<a class="result-cover" href="book-info.html?id=' + b.book_id + '">' + coverMarkup(b, "cover") + "</a>"
      : "";
    return '<article class="result-card">' + cover + '<div class="result-body">' + bookFieldRows(b) +
      '<a class="btn btn-primary btn-sm" href="book-info.html?id=' + b.book_id + '">View Details</a></div></article>';
  }

  // ---- custom dropdowns (replace the browser's default <select>) ----
  const dropdowns = {};

  function closeAll(except) {
    Object.keys(dropdowns).forEach(function (id) {
      if (dropdowns[id] !== except) dropdowns[id].close();
    });
  }

  function makeDropdown(root, values, onChange) {
    const label = root.dataset.label;
    let value = "";
    let active = -1;
    const options = [""].concat(values); // "" = nothing chosen

    root.innerHTML =
      '<button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false"><span class="dd-text"></span>' +
      '<svg class="dd-caret" width="14" height="9" viewBox="0 0 14 9" fill="none" aria-hidden="true"><path d="M1 1.5l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<ul class="dd-menu" role="listbox" hidden></ul>';
    const btn = root.querySelector(".dd-btn");
    const text = root.querySelector(".dd-text");
    const menu = root.querySelector(".dd-menu");

    menu.innerHTML = options.map(function (v, i) {
      return '<li role="option" class="dd-item" data-i="' + i + '">' + esc(v || "All " + label.toLowerCase() + "s") + "</li>";
    }).join("");
    const items = menu.querySelectorAll(".dd-item");

    function paint() {
      text.textContent = value || label;
      root.classList.toggle("has-value", !!value);
      items.forEach(function (li, i) {
        const sel = options[i] === value;
        li.classList.toggle("selected", sel);
        li.classList.toggle("active", i === active);
        li.setAttribute("aria-selected", sel);
      });
    }
    function open() {
      closeAll(api);
      menu.hidden = false;
      root.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      active = Math.max(0, options.indexOf(value));
      paint();
      items[active].scrollIntoView({ block: "nearest" });
    }
    function close() {
      menu.hidden = true;
      root.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      active = -1;
      paint();
    }
    function choose(i) {
      value = options[i];
      close();
      onChange(value);
    }

    btn.addEventListener("click", function () { menu.hidden ? open() : close(); });
    menu.addEventListener("click", function (e) {
      const li = e.target.closest(".dd-item");
      if (li) choose(Number(li.dataset.i));
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (menu.hidden) { open(); return; }
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
        paint();
        items[active].scrollIntoView({ block: "nearest" });
      } else if ((e.key === "Enter" || e.key === " ") && !menu.hidden) {
        e.preventDefault();
        choose(active);
      } else if (e.key === "Escape") {
        close();
      }
    });

    const api = {
      close: close,
      reset: function () { value = ""; close(); },
    };
    paint();
    return api;
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dd")) closeAll(null);
  });

  function isFiltering() {
    return !!(state.q || state.genre || state.language || state.book_type);
  }

  async function runSearch() {
    const mine = ++requestId;
    const filtering = isFiltering();
    $("browse").hidden = filtering;
    $("resultsSection").hidden = !filtering;
    $("clearFilters").disabled = !filtering;
    if (!filtering) return;

    try {
      const books = await Books.list(state);
      if (mine !== requestId) return; // a newer search replaced this one
      $("resultsTitle").textContent = "Search Results";
      $("results").innerHTML = books.length
        ? books.map(resultCard).join("")
        : '<p class="empty">Book not available</p>';
    } catch (err) {
      if (mine !== requestId) return;
      $("results").innerHTML = '<p class="empty">' + esc(err.message) + "</p>";
    }
  }

  async function init() {
    try {
      const [meta, featured, arrivals] = await Promise.all([Books.meta(), Books.featured(), Books.newArrivals()]);
      [["genreFilter", "genre", meta.genres], ["typeFilter", "book_type", meta.book_types], ["languageFilter", "language", meta.languages]]
        .forEach(function (d) {
          dropdowns[d[0]] = makeDropdown($(d[0]), d[2], function (v) { state[d[1]] = v; runSearch(); });
        });
      $("featuredRow").innerHTML = featured.map(bookCard).join("");
      $("newGrid").innerHTML = arrivals.map(bookCard).join("");
    } catch (err) {
      $("featuredRow").innerHTML = '<p class="empty">' + esc(err.message) + "</p>";
    }
  }

  $("searchInput").addEventListener("input", function (e) {
    state.q = e.target.value.trim();
    clearTimeout(timer);
    timer = setTimeout(runSearch, 300); // wait until typing pauses
  });
  $("clearFilters").addEventListener("click", function () {
    state.q = state.genre = state.language = state.book_type = "";
    $("searchInput").value = "";
    Object.keys(dropdowns).forEach(function (id) { dropdowns[id].reset(); });
    runSearch();
  });

  init();
})();
