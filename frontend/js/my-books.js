// my-books.js - issued books: a details panel for the selected book + a row of cards
(function () {
  if (!Auth.requireLogin()) return;

  const content = document.getElementById("content");
  let issues = [];
  let selectedId = null;

  // books still out first (soonest due first), then returned ones (newest first)
  function sortIssues(list) {
    return list.slice().sort(function (a, b) {
      if (a.returned !== b.returned) return a.returned ? 1 : -1;
      if (!a.returned) return parseISO(a.due_date) - parseISO(b.due_date);
      return parseISO(b.issue_date) - parseISO(a.issue_date) || b.id - a.id;
    });
  }

  function statusLine(i) {
    if (i.returned) {
      const fee = i.late_fee > 0 ? " · late fee paid " + rupees(i.late_fee) : "";
      return '<div class="status-line ok">Returned on ' + esc(formatShortDate(i.return_date)) + esc(fee) + "</div>";
    }
    const left = daysFromToday(i.due_date);
    if (left < 0) {
      return '<div class="status-line late">Overdue by ' + (-left) + " day" + (left === -1 ? "" : "s") +
        " · late fee so far " + esc(rupees(i.late_fee)) + "</div>";
    }
    if (left === 0) return '<div class="status-line">Due today</div>';
    return '<div class="status-line">Due in ' + left + " day" + (left === 1 ? "" : "s") + "</div>";
  }

  function stripCard(i) {
    const overdue = !i.returned && daysFromToday(i.due_date) < 0;
    const tag = i.returned ? '<span class="tag">Returned</span>' : overdue ? '<span class="tag late">Overdue</span>' : "";
    return '<button type="button" class="strip-card" data-id="' + i.id + '" aria-pressed="' + (i.id === selectedId) + '">' +
      coverMarkup(i.book, "cover") + "<h3>" + esc(i.book.title) + "</h3>" + tag +
      '<div class="strip-meta">Issue Date: ' + esc(formatShortDate(i.issue_date)) +
      "<br>Submission Date: " + esc(formatShortDate(i.due_date)) +
      "<br>Duration: " + esc(durationLabel(i.duration_days)) +
      "<br>Charges: " + esc(rupees(i.charge)) + "</div></button>";
  }

  function render() {
    if (!issues.length) {
      content.innerHTML = '<p class="empty">You have not issued any books yet.</p>' +
        '<a class="btn btn-primary" href="explore.html">Explore books</a>';
      return;
    }
    const sel = issues.find(function (i) { return i.id === selectedId; }) || issues[0];
    selectedId = sel.id;
    const b = sel.book;
    const cover = b.has_cover && b.cover_url ? '<div class="detail-cover">' + coverMarkup(b, "cover") + "</div>" : "";

    content.innerHTML =
      '<section class="detail-panel">' + cover + '<div class="detail-info">' + bookFieldRows(b) + statusLine(sel) +
      '<div class="panel-actions"><a class="btn btn-outline btn-sm" href="book-info.html?id=' + b.book_id + '">View Book</a>' +
      (sel.returned ? "" : '<button type="button" class="btn btn-primary btn-sm" id="returnBtn">Return Book</button>') +
      "</div></div></section>" +
      '<div class="strip" id="strip">' + issues.map(stripCard).join("") + "</div>";

    document.getElementById("strip").addEventListener("click", function (e) {
      const card = e.target.closest(".strip-card");
      if (!card) return;
      selectedId = Number(card.dataset.id);
      render();
    });
    const ret = document.getElementById("returnBtn");
    if (ret) ret.addEventListener("click", function () { returnBook(sel, ret); });
  }

  async function returnBook(issue, btn) {
    if (!confirm('Return "' + issue.book.title + '" now?')) return;
    btn.disabled = true;
    try {
      const r = await Issues.returnBook(issue.id);
      toast(r.late_fee > 0 ? "Returned. Late fee due: " + rupees(r.late_fee) : "Book returned. Thank you!");
      await load();
    } catch (err) {
      toast(err.message, "error");
      btn.disabled = false;
    }
  }

  async function load() {
    try {
      issues = sortIssues(await Issues.mine());
      if (!issues.some(function (i) { return i.id === selectedId; })) selectedId = issues.length ? issues[0].id : null;
      render();
    } catch (err) {
      content.innerHTML = '<p class="empty">' + esc(err.message) + "</p>";
    }
  }

  load();
})();
