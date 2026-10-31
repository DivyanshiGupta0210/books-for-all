// nav.js - the navbar shared by every page
//
//   Nav.render("home")             marketing pages (Home / About Us / Contact Us)
//   Nav.render("login")            Home / About Us / Explore
//   Nav.render("app", "explore")   signed-in pages (Home / Explore / My Books + account menu)

const Nav = {
  logo() {
    return '<a class="logo" href="index.html" aria-label="Books For All - home">' +
      '<span class="logo-b">B</span><span class="logo-pill" aria-hidden="true"></span><span class="logo-oks">OKS</span>' +
      '<span class="logo-f">F</span><span class="logo-r">R ALL</span></a>';
  },

  render(variant, active) {
    const host = document.getElementById("nav");
    if (!host) return;

    const sets = {
      home: [["Home", "index.html", "home"], ["About Us", "index.html#about", "about"], ["Contact Us", "index.html#contact", "contact"]],
      login: [["Home", "index.html", "home"], ["About Us", "index.html#about", "about"], ["Explore", "explore.html", "explore"]],
      app: [["Home", "index.html", "home"], ["Explore", "explore.html", "explore"], ["My Books", "my-books.html", "my-books"]],
    };
    const links = (sets[variant] || sets.app).map(function (l) {
      return '<a href="' + l[1] + '"' + (l[2] === active ? ' class="active" aria-current="page"' : "") + ">" + l[0] + "</a>";
    }).join("");

    let user = "";
    if (variant === "app" && Auth.isLoggedIn()) {
      const u = Auth.getUser();
      user = '<div class="nav-user">' +
        '<button class="nav-avatar" id="navAvatar" aria-haspopup="true" aria-expanded="false" aria-label="Account menu">' + esc(initials(u)) + "</button>" +
        '<div class="nav-menu" id="navMenu" hidden>' +
        '<div class="menu-name">' + esc((u && (u.full_name || u.username)) || "") + "</div>" +
        '<a href="profile.html">Profile</a><a href="wishlist.html">Wishlist</a>' +
        '<button type="button" id="navLogout">Log out</button></div></div>';
    }

    host.className = "navbar";
    host.innerHTML = '<div class="navbar-inner">' + this.logo() +
      '<div class="nav-right"><nav class="nav-links" aria-label="Main">' + links + "</nav>" + user + "</div></div>";

    const avatar = document.getElementById("navAvatar");
    if (avatar) {
      const menu = document.getElementById("navMenu");
      const close = function () { menu.hidden = true; avatar.setAttribute("aria-expanded", "false"); };
      avatar.addEventListener("click", function (e) {
        e.stopPropagation();
        const open = menu.hidden;
        menu.hidden = !open;
        avatar.setAttribute("aria-expanded", String(open));
      });
      document.addEventListener("click", function (e) { if (!menu.contains(e.target)) close(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      document.getElementById("navLogout").addEventListener("click", function () { Auth.logout(); });
    }
  },
};
