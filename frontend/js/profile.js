// profile.js - view / edit your details, log out
(function () {
  if (!Auth.requireLogin()) return;

  const content = document.getElementById("content");
  let user = null;
  let stats = { active: 0, total: 0, wishlist: 0 };

  function item(label, value) {
    return '<div><div class="label">' + esc(label) + '</div><div class="value">' + esc(value) + "</div></div>";
  }

  function memberSince(iso) {
    if (!iso) return "-";
    const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
    return MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  function renderView() {
    content.innerHTML =
      '<div class="profile-card"><div class="profile-top"><div class="profile-avatar" aria-hidden="true">' + esc(initials(user)) + "</div>" +
      "<div><h2>" + esc(user.full_name || user.username) + '</h2><p class="muted">@' + esc(user.username) + "</p></div></div>" +
      '<div class="profile-grid">' +
      item("Username", user.username) + item("Name", user.full_name || "-") +
      item("Email", user.email) + item("Member since", memberSince(user.created_at)) +
      item("Books currently issued", stats.active) + item("Wishlist", stats.wishlist + (stats.wishlist === 1 ? " book" : " books")) +
      '</div><div class="profile-actions"><button type="button" class="btn btn-primary" id="editBtn">Edit profile</button>' +
      '<button type="button" class="btn btn-outline" id="logoutBtn">Log out</button></div></div>';
    document.getElementById("editBtn").addEventListener("click", renderEdit);
    document.getElementById("logoutBtn").addEventListener("click", function () { Auth.logout(); });
  }

  function renderEdit() {
    content.innerHTML =
      '<div class="profile-card"><form id="editForm" class="edit-form" novalidate>' +
      '<div class="field"><label for="full_name">Name</label><input class="input" id="full_name" maxlength="120" value="' + esc(user.full_name || "") + '"></div>' +
      '<div class="field"><label for="email">Email</label><input class="input" id="email" type="email" value="' + esc(user.email) + '"></div>' +
      '<div class="field"><label>Username</label><input class="input" value="' + esc(user.username) + '" disabled></div>' +
      '<div class="profile-actions"><button type="submit" class="btn btn-primary" id="saveBtn">Save changes</button>' +
      '<button type="button" class="btn btn-outline" id="cancelBtn">Cancel</button></div>' +
      '<p id="editMsg" class="form-msg error" role="alert" hidden></p></form></div>';

    document.getElementById("cancelBtn").addEventListener("click", renderView);
    document.getElementById("editForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      const msg = document.getElementById("editMsg");
      const btn = document.getElementById("saveBtn");
      const name = document.getElementById("full_name").value.trim();
      const email = document.getElementById("email").value.trim();
      if (!name || !email) { showMessage(msg, "Name and email cannot be empty."); return; }

      btn.disabled = true;
      try {
        user = await updateProfile({ full_name: name, email: email });
        Auth.setUser(user);
        Nav.render("app", "");
        toast("Profile updated");
        renderView();
      } catch (err) {
        showMessage(msg, err.message);
        btn.disabled = false;
      }
    });
  }

  async function init() {
    try {
      const results = await Promise.all([fetchCurrentUser(), Issues.mine(), Wishlist.list()]);
      user = results[0];
      Auth.setUser(user);
      stats = {
        active: results[1].filter(function (i) { return !i.returned; }).length,
        total: results[1].length,
        wishlist: results[2].length,
      };
      renderView();
    } catch (err) {
      content.innerHTML = '<p class="empty">' + esc(err.message) + "</p>";
    }
  }

  init();
})();
