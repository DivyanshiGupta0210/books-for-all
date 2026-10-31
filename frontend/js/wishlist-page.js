// wishlist-page.js - saved books: a details panel for the selected book + a row of cards
(function () {
  if (!Auth.requireLogin()) return;

  const content = document.getElementById("content");
  let items = [];
  let selectedBookId = null;

  function stripCard(w) {
    const b = w.book;
    return '<button type="button" class="strip-card" data-id="' + b.book_id + '" aria-pressed="' + (b.book_id === selectedBookId) + '">' +
      coverMarkup(b, "cover") + "<h3>" + esc(b.title) + '</h3><div class="strip-meta">' + esc(b.author) + "</div></button>";
  }

  function render() {
    if (!items.length) {
      content.innerHTML = '<p class="empty">Your wishlist is empty.</p><a class="btn btn-primary" href="explore.html">Explore books</a>';
      return;
    }
    const sel = items.find(function (w) { return w.book.book_id === selectedBookId; }) || items[0];
    selectedBookId = sel.book.book_id;
    const b = sel.book;
    const cover = b.has_cover && b.cover_url ? '<div class="detail-cover">' + coverMarkup(b, "cover") + "</div>" : "";
    const available = b.copies_available > 0;

    content.innerHTML =
      '<section class="detail-panel">' + cover + '<div class="detail-info">' + bookFieldRows(b) +
      (available ? "" : '<div class="status-line late">No copies available right now</div>') +
      '<div class="panel-actions"><a class="btn btn-primary btn-sm" href="issue-book.html?id=' + b.book_id + '">Issue Book</a>' +
      '<button type="button" class="btn btn-outline btn-sm" id="removeBtn">Remove from Wishlist</button></div></div></section>' +
      '<div class="strip" id="strip">' + items.map(stripCard).join("") + "</div>";

    document.getElementById("strip").addEventListener("click", function (e) {
      const card = e.target.closest(".strip-card");
      if (!card) return;
      selectedBookId = Number(card.dataset.id);
      render();
    });
    const rm = document.getElementById("removeBtn");
    rm.addEventListener("click", async function () {
      rm.disabled = true;
      try {
        await Wishlist.remove(b.book_id);
        toast("Removed from your wishlist");
        selectedBookId = null;
        await load();
      } catch (err) {
        toast(err.message, "error");
        rm.disabled = false;
      }
    });
  }

  async function load() {
    try {
      items = await Wishlist.list();
      render();
    } catch (err) {
      content.innerHTML = '<p class="empty">' + esc(err.message) + "</p>";
    }
  }

  load();
})();
