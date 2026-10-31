// books.js - book API calls

const Books = {
  list(filters) {
    const params = new URLSearchParams();
    Object.keys(filters || {}).forEach(function (k) {
      if (filters[k]) params.set(k, filters[k]);
    });
    const qs = params.toString();
    return apiRequest("/books" + (qs ? "?" + qs : ""));
  },
  featured() { return apiRequest("/books/featured"); },
  newArrivals() { return apiRequest("/books/new-arrivals"); },
  meta() { return apiRequest("/books/meta"); },
  get(id) { return apiRequest("/books/" + encodeURIComponent(id)); },
};
