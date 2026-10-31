// login.js
(function () {
  if (Auth.isLoggedIn()) { location.replace(Auth.nextPage()); return; }

  const form = document.getElementById("loginForm");
  const btn = document.getElementById("loginBtn");
  const msg = document.getElementById("loginMsg");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    showMessage(msg, "");

    const identifier = form.identifier.value.trim();
    const password = form.password.value;
    if (!identifier || !password) {
      showMessage(msg, "Please enter your username or email and your password.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Logging in...";
    try {
      const data = await loginUser(identifier, password);
      Auth.setSession(data.access_token, data.user);
      location.href = Auth.nextPage();
    } catch (err) {
      showMessage(msg, err.message);
      btn.disabled = false;
      btn.textContent = "Login";
    }
  });
})();
