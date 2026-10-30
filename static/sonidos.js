// Sonidos estilo "Doki Doki Literature Club": solo dos, como en el menu del juego.
//   hover       -> al pasar el mouse sobre un boton
//   seleccionar -> al hacer clic
//
// Este programa NO trae sonidos. Solo suena lo que tu pongas en static/sonidos/:
//   hover.ogg  y  seleccionar.ogg     (tambien sirven .mp3 o .wav)
// Si no hay archivos, simplemente no suena nada.

const Sonidos = (function () {
  const archivos = {};    // nombre -> Audio, solo para los archivos que si existen

  // ---------- ver que audios puso el usuario ----------
  async function buscarArchivos() {
    for (const nombre of ["hover", "seleccionar"]) {
      for (const ext of ["ogg", "mp3", "wav"]) {
        const url = "/static/sonidos/" + nombre + "." + ext;
        try {
          const r = await fetch(url, { method: "HEAD" });
          if (r.ok) {
            const audio = new Audio(url);
            audio.preload = "auto";
            archivos[nombre] = audio;
            break;
          }
        } catch (e) { /* no hay archivo: se queda sin sonido */ }
      }
    }
  }
  buscarArchivos();

  // ---------- tocar un sonido por su nombre ----------
  function tocar(nombre) {
    if (!archivos[nombre]) return;                  // no hay archivo: silencio

    const copia = archivos[nombre].cloneNode();     // copia para que se puedan encimar
    copia.volume = 0.6;
    copia.play().catch(function () {});             // si el navegador lo bloquea, no pasa nada
  }

  // ---------- conectar sonidos a toda la pagina ----------
  const SELECTOR = "button:not(:disabled), input, select";

  // mouse encima de un boton, casilla o menu
  document.addEventListener("pointerover", function (e) {
    if (e.pointerType !== "mouse") return;
    const el = e.target.closest(SELECTOR);
    if (el && !el.contains(e.relatedTarget)) tocar("hover");
  });

  // clic en un boton
  document.addEventListener("click", function (e) {
    if (e.target.closest("button:not(:disabled)")) tocar("seleccionar");
  });

  // elegir una opcion en un menu desplegable
  document.addEventListener("change", function (e) {
    if (e.target.matches("select")) tocar("seleccionar");
  });

  return { tocar: tocar };
})();
