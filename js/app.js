import { countVisitOncePerDay, syncProfile } from "./api.js";
import { nickname, profileSnapshot } from "./store.js";
import { setupThemeToggle } from "./theme.js";
import { runLeaveHandlers } from "./ui.js";
import { renderExam } from "./views/exam.js";
import { renderHome } from "./views/home.js";
import { renderInfo } from "./views/info.js";
import { renderModule } from "./views/module.js";
import { openNicknameDialog } from "./views/nickname.js";
import { renderRanking } from "./views/ranking.js";
import { renderReview } from "./views/review.js";

const view = document.getElementById("view");

const ROUTES = {
  "": renderHome,
  simulacro: renderExam,
  repaso: renderReview,
  ranking: renderRanking,
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
  if (nickname()) syncProfile(profileSnapshot());
}

window.addEventListener("hashchange", route);
setupThemeToggle();
countVisitOncePerDay();
route();
if (!nickname()) openNicknameDialog({ onDone: route });
