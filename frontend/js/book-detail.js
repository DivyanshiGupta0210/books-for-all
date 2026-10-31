// book-detail.js - Book Info page
(function () {
  if (!Auth.requireLogin()) return;

  const content = document.getElementById("content");
  const id = getQueryParam("id");

  function item(label, value) {
    return '<div class="info-item"><div class="label">' + esc(label) + '</div><div class="value">' + esc(value) + "</div></div>";
  }

  function render(b) {
    document.title = b.title + " - Books For All";
    const cover = b.has_cover && b.cover_url ? '<div class="info-cover">' + coverMarkup(b, "cover") + "</div>" : "";
    content.innerHTML =
      '<p class="breadcrumb"><a href="explore.html">Books</a> / ' + esc(b.genre) + "</p>" +
      '<div class="book-head"><h1>' + esc(b.title) + '</h1><p class="author">' + esc(b.author) + "</p></div>" +
      '<div class="info-layout">' + cover + '<div class="info-main">' +
      '<div class="info-grid">' +
      item("Book ID", b.book_id) + item("Genre", b.genre) +
      item("Book Type", b.book_type) + item("Language", b.language) +
      item("Publishing Year", yearLabel(b.publishing_year)) + item("Available Copies", b.copies_available) +
      item("ISBN", b.isbn) +
      "</div>" +
      '<div class="summary"><h2>Summary</h2><p>' + esc(b.summary) + "</p></div>" +
      '<div class="page-actions"><a class="btn btn-outline" href="explore.html">Back</a>' +
      '<a class="btn btn-primary" href="issue-book.html?id=' + b.book_id + '">Next</a></div>' +
      "</div></div>";
  }

  if (!id) {
    content.innerHTML = '<p class="empty">No book selected. <a href="explore.html"><u>Go to Explore</u></a></p>';
    return;
  }
  Books.get(id).then(render).catch(function (err) {
    content.innerHTML = '<p class="empty">' + esc(err.message) + ' <a href="explore.html"><u>Back to Explore</u></a></p>';
  });
})();
