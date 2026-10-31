// config.js - where the API lives.
// When the website is opened through the backend (http://127.0.0.1:8000) the API
// is on the same address. If you open the HTML some other way (VS Code Live
// Server, double-click) it falls back to the backend on port 8000.
(function () {
  var elsewhere = location.protocol === "file:" || (location.port && location.port !== "8000");
  window.API_BASE = elsewhere ? "http://127.0.0.1:8000/api" : "/api";
})();
