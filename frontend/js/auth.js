// auth.js - login state (token kept in localStorage) + account API calls

const Auth = {
  TOKEN_KEY: "bfa_token",
  USER_KEY: "bfa_user",

  getToken() {
    try { return localStorage.getItem(this.TOKEN_KEY); } catch (e) { return null; }
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY) || "null"); } catch (e) { return null; }
  },
  setSession(token, user) {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (e) { /* storage blocked: user will simply need to log in again */ }
  },
  setUser(user) {
    try { localStorage.setItem(this.USER_KEY, JSON.stringify(user)); } catch (e) {}
  },
  clear() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (e) {}
  },
  isLoggedIn() {
    return !!this.getToken();
  },

  currentPage() {
    const file = location.pathname.split("/").pop() || "index.html";
    return file + location.search;
  },
  redirectToLogin() {
    location.replace("login.html?next=" + encodeURIComponent(this.currentPage()));
  },
  // Call at the top of every page that needs an account.
  requireLogin() {
    if (!this.isLoggedIn()) {
      this.redirectToLogin();
      return false;
    }
    return true;
  },
  logout() {
    this.clear();
    location.href = "login.html";
  },
  // Page to open after login (only allows our own .html pages).
  nextPage() {
    const next = new URLSearchParams(location.search).get("next");
    return next && /^[A-Za-z0-9_-]+\.html(\?[A-Za-z0-9_=&%.-]*)?$/.test(next) ? next : "explore.html";
  },
};

function registerUser(payload) {
  return apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload), noAuthRedirect: true });
}
function loginUser(identifier, password) {
  return apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }), noAuthRedirect: true });
}
function fetchCurrentUser() {
  return apiRequest("/auth/me");
}
function updateProfile(payload) {
  return apiRequest("/auth/profile", { method: "PUT", body: JSON.stringify(payload) });
}
