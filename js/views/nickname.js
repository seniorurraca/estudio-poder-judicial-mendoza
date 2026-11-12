import { saveProfile } from "../api.js";
import { nickname, profileSnapshot, setNickname } from "../store.js";
import { escapeHtml } from "../ui.js";

const isNetworkError = (error) => error instanceof TypeError;

export function openNicknameDialog({ onDone, canClose = false } = {}) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <form class="card nickname-card">
      <div class="nickname-emoji">👋</div>
      <h2>${canClose ? "Cambiar apodo" : "¡Bienvenida/o!"}</h2>
      <p class="muted">Elegí un apodo. Va a aparecer en el ranking que ven todos, así que mejor no uses tu nombre completo.</p>
      <input class="search" name="nickname" maxlength="20" autocomplete="nickname" placeholder="Ej: Juli, Fede, Tigre…" value="${escapeHtml(nickname())}" required>
      <p class="form-error" role="alert"></p>
      <div class="actions">
        ${canClose ? `<button type="button" class="btn" data-close>Cancelar</button>` : ""}
        <button class="btn primary big" type="submit">Empezar a estudiar</button>
      </div>
    </form>`;
  document.body.append(overlay);
  const form = overlay.querySelector("form");
  const errorBox = overlay.querySelector(".form-error");
  const close = () => overlay.remove();
  overlay.querySelector("[data-close]")?.addEventListener("click", close);
  form.nickname.focus();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const chosen = form.nickname.value.trim().replace(/\s+/g, " ");
    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    errorBox.textContent = "";
    try {
      await saveProfile({ ...profileSnapshot(), nickname: chosen });
    } catch (error) {
      if (!isNetworkError(error)) {
        errorBox.textContent = error.message;
        button.disabled = false;
        return;
      }
    }
    setNickname(chosen);
    close();
    onDone?.();
  });
}
