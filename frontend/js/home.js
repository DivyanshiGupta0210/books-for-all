// home.js
(function () {
  // Logged-in visitors get "Explore Books" instead of "Login".
  if (Auth.isLoggedIn()) {
    const btn = document.getElementById("heroBtn");
    btn.textContent = "Explore Books";
    btn.href = "explore.html";
  }

  // Hide the hero covers that are missing (or all of them if none exist).
  const visual = document.getElementById("heroVisual");
  const imgs = Array.from(visual.querySelectorAll("img"));
  let failed = 0;
  imgs.forEach(function (img) {
    img.addEventListener("error", function () {
      img.remove();
      failed += 1;
      if (failed === imgs.length) visual.remove();
    });
  });
})();
