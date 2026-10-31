// signup.js
(function () {
  if (Auth.isLoggedIn()) { location.replace("explore.html"); return; }

  const form = document.getElementById("signupForm");
  const btn = document.getElementById("signupBtn");
  const msg = document.getElementById("signupMsg");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    showMessage(msg, "");

    const payload = {
      full_name: form.full_name.value.trim(),
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
      confirm_password: form.confirm_password.value,
    };

    // quick checks here; the server validates everything again
    if (!payload.full_name || !payload.username || !payload.email || !payload.password) {
      showMessage(msg, "Please fill in all the fields.");
      return;
    }
    if (payload.password.length < 8) {
      showMessage(msg, "Password must be at least 8 characters.");
      return;
    }
    if (payload.password !== payload.confirm_password) {
      showMessage(msg, "Passwords do not match.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Creating account...";
    try {
      const data = await registerUser(payload);
      Auth.setSession(data.access_token, data.user);
      location.href = "explore.html";
    } catch (err) {
      showMessage(msg, err.message);
      btn.disabled = false;
      btn.textContent = "Sign up";
    }
  });
})();
