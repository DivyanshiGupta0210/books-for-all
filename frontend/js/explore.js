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

  function fillSelect(select, values) {
    values.forEach(function (v) {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      select.appendChild(o);
    });
  }

  function isFiltering() {
    return !!(state.q || state.genre || state.language || state.book_type);
  }

  async function runSearch() {
    const mine = ++requestId;
    const filtering = isFiltering();
    $("browse").hidden = filtering;
    $("resultsSection").hidden = !filtering;
    $("clearFilters").hidden = !filtering;
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
      fillSelect($("genreFilter"), meta.genres);
      fillSelect($("typeFilter"), meta.book_types);
      fillSelect($("languageFilter"), meta.languages);
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
  [["genreFilter", "genre"], ["typeFilter", "book_type"], ["languageFilter", "language"]].forEach(function (pair) {
    $(pair[0]).addEventListener("change", function (e) {
      state[pair[1]] = e.target.value;
      runSearch();
    });
  });
  $("clearFilters").addEventListener("click", function () {
    state.q = state.genre = state.language = state.book_type = "";
    $("searchInput").value = "";
    ["genreFilter", "typeFilter", "languageFilter"].forEach(function (id) { $(id).value = ""; });
    runSearch();
  });

  init();
})();
