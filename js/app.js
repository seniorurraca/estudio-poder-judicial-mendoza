import { setupThemeToggle } from "./theme.js";
import { runLeaveHandlers } from "./ui.js";
import { renderExam } from "./views/exam.js";
import { renderHome } from "./views/home.js";
import { renderInfo } from "./views/info.js";
import { renderModule } from "./views/module.js";
import { renderReview } from "./views/review.js";

const view = document.getElementById("view");

const ROUTES = {
  "": renderHome,
  simulacro: renderExam,
  repaso: renderReview,
  info: renderInfo,
  modulo: renderModule,
};

function route() {
  runLeaveHandlers();
  const [name = "", ...params] = location.hash.replace(/^#\/?/, "").split("/");
  const render = ROUTES[name] || renderHome;
  render(view, ...params);
  document.querySelectorAll("[data-nav]").forEach((a) =>
    a.classList.toggle("active", a.dataset.nav === (name || "home"))
  );
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);
setupThemeToggle();
route();
