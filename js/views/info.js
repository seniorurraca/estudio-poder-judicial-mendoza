import { EXAM } from "../data.js";

const OFFICIAL = "https://jusmendoza.gob.ar/concurso-ingreso-administrativo-2026/";
const MATERIAL = "https://jusmendoza.gob.ar/concurso-ingreso-administrativo-2026-material-de-estudio/";

export function renderInfo(view) {
  view.innerHTML = `
    <h1>Sobre el examen</h1>
    <div class="card">
      <h3>📌 Etapas del concurso 2026</h3>
      <ol>
        <li><b>Jornadas de Evaluación Virtual</b> (2): 20 preguntas sobre un video institucional, 15 minutos.</li>
        <li><b>Comprensión Lectora</b>: 10 preguntas sobre un texto, 30 minutos, presencial.</li>
        <li><b>Conocimientos Específicos</b>: <b>${EXAM.questions} preguntas</b> de opción múltiple, <b>${EXAM.options} opciones</b> con una sola correcta, <b>${EXAM.minutes} minutos</b>, presencial y eliminatorio. ← <i>esta app prepara para esta etapa</i>.</li>
      </ol>
      <p class="muted small">Fuente: <a href="${OFFICIAL}" target="_blank" rel="noopener">página oficial del concurso</a>. Fechas y detalles (puntaje mínimo, penalización) los fija la Comisión del Concurso: verificá siempre la web oficial.</p>
    </div>
    <div class="card">
      <h3>🔎 ¿Hay exámenes de años anteriores?</h3>
      <p>No existen exámenes modelo oficiales publicados. Lo que se sabe de 2023:</p>
      <ul>
        <li>Fue con la plataforma <b>Moodle</b>, en computadoras, de manera presencial.</li>
        <li>Preguntas de opción múltiple <b>secuenciales</b>: no se podía volver atrás una vez pasada la página.</li>
        <li>El sistema cerraba el examen automáticamente al terminar el tiempo; el resultado se veía en pantalla al enviar.</li>
        <li>Luego se podía ver el examen completo y presentar impugnaciones por 5 días hábiles.</li>
      </ul>
      <p class="muted small">Por eso el simulacro de esta app no permite volver atrás y tiene tiempo límite.</p>
    </div>
    <div class="card">
      <h3>📚 Material oficial (5 módulos)</h3>
      <ol>
        <li>La Organización del Estado</li>
        <li>El Poder Judicial de Mendoza (fueros)</li>
        <li>Derechos Humanos</li>
        <li>Violencia de Género</li>
        <li>Atención para un Servicio de Justicia</li>
      </ol>
      <p class="muted small">Descargá los PDF desde la <a href="${MATERIAL}" target="_blank" rel="noopener">página de material de estudio</a>. Los resúmenes y preguntas de esta app son de práctica y no reemplazan la lectura del material completo.</p>
    </div>
    <div class="card">
      <h3>💾 Tu progreso</h3>
      <p>Se guarda solo en este navegador y dispositivo. Si cambiás de celular o borrás los datos del navegador, empieza de cero.</p>
    </div>`;
}
