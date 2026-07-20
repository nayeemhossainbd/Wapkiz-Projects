(() => {
  const STORAGE_KEY = "motionhub_theme";
  const root = document.documentElement;
  const button = document.getElementById("themeToggle");
  const icon = button?.querySelector("i");
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function updateIcon(theme) {
    if (!icon) return;
    icon.className = theme === "dark"
      ? "fa-solid fa-sun"
      : "fa-solid fa-moon";
  }

  function applyTheme(theme) {
    root.setAttribute("data-bs-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateIcon(theme);
  }

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) ||
      (media.matches ? "dark" : "light");
  }

  applyTheme(getTheme());

  button?.addEventListener("click", () => {
    const current = root.getAttribute("data-bs-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  if (media.addEventListener) {
    media.addEventListener("change", e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  } else {
    media.addListener(e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }
})();
