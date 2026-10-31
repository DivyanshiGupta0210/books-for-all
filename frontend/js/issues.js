// issues.js - issue / receipt / return API calls

const Issues = {
  plans() { return apiRequest("/issues/plans"); },
  issue(bookId, durationDays) {
    return apiRequest("/issues", {
      method: "POST",
      body: JSON.stringify({ book_id: Number(bookId), duration_days: Number(durationDays) }),
    });
  },
  mine() { return apiRequest("/issues/my-books"); },
  receipt(transactionId) { return apiRequest("/issues/receipt/" + encodeURIComponent(transactionId)); },
  returnBook(issueId) { return apiRequest("/issues/return/" + encodeURIComponent(issueId), { method: "POST" }); },
};
