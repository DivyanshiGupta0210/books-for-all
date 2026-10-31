// wishlist.js - wishlist API calls

const Wishlist = {
  list() { return apiRequest("/wishlist"); },
  add(bookId) { return apiRequest("/wishlist/add/" + encodeURIComponent(bookId), { method: "POST" }); },
  remove(bookId) { return apiRequest("/wishlist/remove/" + encodeURIComponent(bookId), { method: "DELETE" }); },
};
