// issue-book.js - choose a duration, add to wishlist, issue the book
(function () {
  if (!Auth.requireLogin()) return;

  const content = document.getElementById("content");
  const id = getQueryParam("id");
  let book = null;
  let inWishlist = false;

  function render(plans) {
    const radios = plans.plans.map(function (p, i) {
      return '<label class="radio-row"><input type="radio" name="duration" value="' + p.days + '"' + (i === 0 ? " checked" : "") + ">" +
        '<span class="radio-mark"></span><span class="radio-label">' + esc(p.label) + '</span><span class="radio-price">₹' + p.price + "/-</span></label>";
    }).join("");

    content.innerHTML =
      '<p class="breadcrumb"><a href="explore.html">Books</a> / <a href="book-info.html?id=' + book.book_id + '">' + esc(book.genre) + "</a></p>" +
      '<div class="book-head"><h1>' + esc(book.title) + '</h1><p class="author">' + esc(book.author) + "</p></div>" +
      '<div class="issue-grid">' +
      '<section><h2 class="h-section">Issue Duration with Charges</h2><div class="plans" role="radiogroup" aria-label="Issue duration">' + radios + "</div></section>" +
      '<section><h2 class="h-section">Note</h2><ul class="notes">' +
      "<li><strong>Late Return Fee:</strong> ₹" + plans.late_fee_per_day + " per day (post due date)</li>" +
      "<li><strong>Renewal (same duration):</strong> 80% of original charge</li>" +
      "<li><strong>Damage/Loss Penalty:</strong> Cost of Book + ₹50 processing fee</li></ul></section></div>" +
      '<div class="page-actions"><button type="button" class="btn btn-outline" id="wishBtn"></button>' +
      '<button type="button" class="btn btn-primary" id="issueBtn">Issue Book</button></div>' +
      '<p id="issueMsg" class="form-msg error" role="alert" hidden></p>';

    updateWishButton();
    if (book.copies_available <= 0) {
      document.getElementById("issueBtn").disabled = true;
      showMessage(document.getElementById("issueMsg"), "Sorry, no copies of this book are available right now.");
    }
    document.getElementById("wishBtn").addEventListener("click", toggleWishlist);
    document.getElementById("issueBtn").addEventListener("click", issue);
  }

  function updateWishButton() {
    document.getElementById("wishBtn").textContent = inWishlist ? "Remove from Wishlist" : "Add to Wishlist";
  }

  async function toggleWishlist() {
    const btn = document.getElementById("wishBtn");
    btn.disabled = true;
    try {
      if (inWishlist) {
        await Wishlist.remove(book.book_id);
        inWishlist = false;
        toast("Removed from your wishlist");
      } else {
        await Wishlist.add(book.book_id);
        inWishlist = true;
        toast("Added to your wishlist");
      }
      updateWishButton();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      btn.disabled = false;
    }
  }

  async function issue() {
    const btn = document.getElementById("issueBtn");
    const msg = document.getElementById("issueMsg");
    const picked = document.querySelector('input[name="duration"]:checked');
    showMessage(msg, "");
    if (!picked) { showMessage(msg, "Please choose an issue duration."); return; }

    btn.disabled = true;
    btn.textContent = "Issuing...";
    try {
      const issued = await Issues.issue(book.book_id, picked.value);
      location.href = "receipt.html?txn=" + encodeURIComponent(issued.transaction_id);
    } catch (err) {
      showMessage(msg, err.message);
      btn.disabled = false;
      btn.textContent = "Issue Book";
    }
  }

  async function init() {
    if (!id) {
      content.innerHTML = '<p class="empty">No book selected. <a href="explore.html"><u>Go to Explore</u></a></p>';
      return;
    }
    try {
      const results = await Promise.all([Books.get(id), Issues.plans(), Wishlist.list()]);
      book = results[0];
      inWishlist = results[2].some(function (w) { return w.book.book_id === book.book_id; });
      document.title = "Issue " + book.title + " - Books For All";
      render(results[1]);
    } catch (err) {
      content.innerHTML = '<p class="empty">' + esc(err.message) + ' <a href="explore.html"><u>Back to Explore</u></a></p>';
    }
  }

  init();
})();
