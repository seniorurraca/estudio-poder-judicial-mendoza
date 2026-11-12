const KEY = "pj-theme";
const root = document.documentElement;

const isDark = () => root.dataset.theme === "dark";

function apply(button) {
  button.textContent = isDark() ? "☀️" : "🌙";
  document.querySelector('meta[name="theme-color"]').content = isDark() ? "#0f1220" : "#6247f5";
}

export function setupThemeToggle() {
  const button = document.getElementById("theme-toggle");
  apply(button);
  button.addEventListener("click", () => {
    if (isDark()) delete root.dataset.theme;
    else root.dataset.theme = "dark";
    try {
      localStorage.setItem(KEY, isDark() ? "dark" : "light");
    } catch {
      /* preference lives only for this visit */
    }
    apply(button);
  });
}
