// receipt.js - "Book Issued Successfully" page
(function () {
  if (!Auth.requireLogin()) return;

  const content = document.getElementById("content");
  const txn = getQueryParam("txn");

  function item(label, value) {
    return '<div><div class="label">' + esc(label) + '</div><div class="value">' + esc(value) + "</div></div>";
  }

  function render(r) {
    content.innerHTML =
      '<div class="receipt-page">' +
      '<div class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
      "<h1>Book Issued Successfully</h1>" +
      '<p class="lead">Your book has been issued and is ready for pickup. Please review the details below.</p>' +
      '<div class="receipt-card"><h2>Issue Receipt</h2><div class="receipt-grid">' +
      item("Book Title", r.book_title) +
      item("Issue Date", formatLongDate(r.issue_date)) +
      item("Return Date", formatLongDate(r.due_date)) +
      item("Duration", durationLabel(r.duration_days)) +
      item("Charge", rupees(r.amount)) +
      item("Transaction ID", r.transaction_id) +
      "</div>" +
      '<p class="receipt-thanks">Thank you for using BooksForAll. We hope you enjoy your reading experience!</p></div>' +
      '<div class="receipt-actions"><a class="btn btn-outline" href="explore.html">Explore more books</a>' +
      '<button type="button" class="btn btn-outline" id="printBtn">Print receipt</button>' +
      '<a class="btn btn-primary" href="my-books.html">Go to My Books</a></div></div>';
    document.getElementById("printBtn").addEventListener("click", function () { window.print(); });
  }

  if (!txn) {
    content.innerHTML = '<p class="empty">No receipt selected. <a href="my-books.html"><u>Go to My Books</u></a></p>';
    return;
  }
  Issues.receipt(txn).then(render).catch(function (err) {
    content.innerHTML = '<p class="empty">' + esc(err.message) + ' <a href="my-books.html"><u>Go to My Books</u></a></p>';
  });
})();
