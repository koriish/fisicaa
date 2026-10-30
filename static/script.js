// Parte "visual" del simulador: manda los datos a Flask, anima el auto,
// dibuja las graficas y maneja las pestañas.

// ---------- cosas de la pagina que vamos a usar ----------
const formulario = document.getElementById("formulario");
const botonReiniciar = document.getElementById("reiniciar");
const botonRepetir = document.getElementById("repetir");
const botonPrincipal = document.getElementById("botonPrincipal");
const mensaje = document.getElementById("mensaje");
const cajaResultados = document.getElementById("resultados");

const relojT = document.getElementById("relojT");
const relojX = document.getElementById("relojX");
const relojV = document.getElementById("relojV");

const pista = document.getElementById("pista");
const ctx = pista.getContext("2d");

// ---------- colores (los mismos del CSS) ----------
const ROSA = "#f6a5b7";
const ROSA_OSCURO = "#d9708f";
const CAFE = "#6b4a3a";
const AZUL = "#9ed3e6";

// ---------- variables que cambian mientras corre el programa ----------
let datos = null;          // lo que nos responde Flask
let idAnimacion = null;    // para poder detener la animacion
let graficaPosicion = null;
let graficaVelocidad = null;
let rapidez = 1;           // 0.5, 1 o 2
let escena = { x: 0, v: 0 };   // ultimo estado dibujado (para redibujar al cambiar de tamaño)

let vistaActual = "animacion";   // que pestaña esta abierta

Chart.defaults.font.family = "Quicksand";
Chart.defaults.font.size = 13;
Chart.defaults.color = CAFE;


// =====================================================
//  Pestañas (Animación / Posición / Velocidad)
// =====================================================
const pestanas = document.querySelectorAll(".pestana");

function irA(nombre) {
  vistaActual = nombre;

  // en las gráficas el botón dice "Graficar"; en las demás dice "Simular"
  botonPrincipal.textContent = (nombre === "posicion" || nombre === "velocidad") ? "Graficar" : "Simular";

  pestanas.forEach(function (p) {
    const activa = p.dataset.vista === nombre;
    p.classList.toggle("activa", activa);
    p.setAttribute("aria-selected", activa);
    document.getElementById("vista-" + p.dataset.vista).hidden = !activa;
  });

  // las graficas necesitan recalcular su tamaño al aparecer
  if (nombre === "posicion" && graficaPosicion) graficaPosicion.resize();
  if (nombre === "velocidad" && graficaVelocidad) graficaVelocidad.resize();
  if (nombre === "animacion") ajustarLienzo();
}

pestanas.forEach(function (p) {
  p.addEventListener("click", function () { irA(p.dataset.vista); });
});


// =====================================================
//  Chips de rapidez
// =====================================================
document.querySelectorAll("#chipsRapidez .chip").forEach(function (chip) {
  chip.addEventListener("click", function () {
    document.querySelectorAll("#chipsRapidez .chip").forEach(function (c) {
      c.classList.remove("activo");
    });
    chip.classList.add("activo");
    rapidez = Number(chip.dataset.rapidez);
  });
});


// =====================================================
//  Enviar el formulario
// =====================================================
function avisar(texto, esError) {
  mensaje.textContent = texto;
  mensaje.classList.toggle("error", esError);
}

formulario.addEventListener("submit", async function (evento) {
  evento.preventDefault();   // evita que la pagina se recargue
  avisar("", false);

  const envio = {
    posicion: document.getElementById("posicion").value,
    velocidad: document.getElementById("velocidad").value,
    aceleracion: document.getElementById("aceleracion").value,
    tiempo: document.getElementById("tiempo").value,
  };

  let respuesta, resultado;
  try {
    respuesta = await fetch("/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envio),
    });
    resultado = await respuesta.json();
  } catch (e) {
    avisar("No pude hablar con el servidor. ¿Sigue corriendo python app.py?", true);
    return;
  }

  if (!respuesta.ok) {
    avisar(resultado.error, true);
    return;
  }

  datos = resultado;

  mostrarResultados();
  prepararGraficas();
  empezarAnimacion();   // nos quedamos en la pestaña que estaba abierta
});

botonReiniciar.addEventListener("click", reiniciar);
botonRepetir.addEventListener("click", function () { if (datos) empezarAnimacion(); });



// =====================================================
//  Animacion
// =====================================================
function empezarAnimacion() {
  cancelAnimationFrame(idAnimacion);

  const horaInicio = performance.now();
  const velocidadAnim = rapidez;

  function cuadro(ahora) {
    const segundos = (ahora - horaInicio) / 1000 * velocidadAnim;
    const t = Math.min(segundos, datos.tiempo_total);

    actualizar(t);

    if (t < datos.tiempo_total) {
      idAnimacion = requestAnimationFrame(cuadro);   // seguimos
    }
  }

  idAnimacion = requestAnimationFrame(cuadro);
}

function reiniciar() {
  cancelAnimationFrame(idAnimacion);
  datos = null;
  avisar("", false);

  cajaResultados.className = "caja-resultado vacio";
  cajaResultados.textContent = "El resultado aparecerá aquí";
  botonRepetir.disabled = true;

  relojT.textContent = "t = 0.00 s";
  relojX.textContent = "x = 0.00 m";
  relojV.textContent = "v = 0.00 m/s";

  if (graficaPosicion) {
    graficaPosicion.destroy();
    graficaVelocidad.destroy();
    graficaPosicion = null;
    graficaVelocidad = null;
  }
  document.querySelectorAll(".vacio-grafica").forEach(function (p) {
    p.classList.remove("oculto");
  });

  dibujarEscena(0, 0);
}

// Calcula x y v en un tiempo t usando los puntos que mando Flask
function valoresEn(t) {
  const ultimo = datos.tiempos.length - 1;
  const lugar = t / datos.tiempo_total * ultimo;

  const i = Math.min(Math.floor(lugar), ultimo - 1);
  const fraccion = lugar - i;

  return {
    x: mezclar(datos.posiciones[i], datos.posiciones[i + 1], fraccion),
    v: mezclar(datos.velocidades[i], datos.velocidades[i + 1], fraccion),
  };
}

function mezclar(a, b, fraccion) {
  return a + (b - a) * fraccion;
}

// Se llama en cada cuadro de la animacion
function actualizar(t) {
  const { x, v } = valoresEn(t);

  relojT.textContent = "t = " + t.toFixed(2) + " s";
  relojX.textContent = "x = " + x.toFixed(2) + " m";
  relojV.textContent = "v = " + v.toFixed(2) + " m/s";

  dibujarEscena(x, v);

  // movemos el puntito de cada grafica
  graficaPosicion.data.datasets[1].data = [{ x: t, y: x }];
  graficaVelocidad.data.datasets[1].data = [{ x: t, y: v }];
  graficaPosicion.update("none");
  graficaVelocidad.update("none");
}


// =====================================================
//  Dibujar la pista y el auto
// =====================================================

// Ajusta el lienzo al tamaño real en pantalla (y a pantallas retina)
function ajustarLienzo() {
  const dpr = window.devicePixelRatio || 1;
  const w = pista.clientWidth;
  const h = pista.clientHeight;
  if (w === 0 || h === 0) return;   // esta oculto

  pista.width = Math.round(w * dpr);
  pista.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  dibujarEscena(escena.x, escena.v);
}

new ResizeObserver(ajustarLienzo).observe(pista);

function dibujarEscena(x, v) {
  escena = { x: x, v: v };

  const ancho = pista.clientWidth;
  const alto = pista.clientHeight;
  if (ancho === 0 || alto === 0) return;

  const k = Math.min(Math.max(alto / 300, 0.9), 2);   // escala del auto
  const margen = 40 * k + 24;
  const sueloY = alto * 0.55;
  const altoCarretera = 56 * k * 0.8;

  ctx.clearRect(0, 0, ancho, alto);

  // cielo
  const cielo = ctx.createLinearGradient(0, 0, 0, sueloY);
  cielo.addColorStop(0, "#fffaf9");
  cielo.addColorStop(1, "#fde6ec");
  ctx.fillStyle = cielo;
  ctx.fillRect(0, 0, ancho, sueloY);

  // solecito y nubes
  ctx.fillStyle = "#ffeeb8";
  ctx.beginPath();
  ctx.arc(ancho * 0.85, alto * 0.16, 28 * k, 0, Math.PI * 2);
  ctx.fill();
  nube(ancho * 0.18, alto * 0.14, k);
  nube(ancho * 0.52, alto * 0.24, k * 0.8);

  // suelo
  ctx.fillStyle = "#fbeef0";
  ctx.fillRect(0, sueloY, ancho, alto - sueloY);

  // rango de metros que cabe en la pista
  let minX = -5;
  let maxX = 5;
  if (datos) {
    minX = Math.min(...datos.posiciones);
    maxX = Math.max(...datos.posiciones);
  }
  const holgura = Math.max((maxX - minX) * 0.1, 2);
  minX -= holgura;
  maxX += holgura;

  function aPixeles(metros) {
    return margen + (metros - minX) / (maxX - minX) * (ancho - 2 * margen);
  }

  // la carretera
  ctx.fillStyle = "#ead9c9";
  ctx.fillRect(0, sueloY, ancho, altoCarretera);

  ctx.strokeStyle = "#fffdfb";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(0, sueloY + altoCarretera * 0.75);
  ctx.lineTo(ancho, sueloY + altoCarretera * 0.75);
  ctx.stroke();
  ctx.setLineDash([]);

  // bandera de inicio
  if (datos) {
    const bx = aPixeles(datos.posiciones[0]);
    ctx.strokeStyle = ROSA_OSCURO;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, sueloY + 4);
    ctx.lineTo(bx, sueloY - 46 * k * 0.8);
    ctx.stroke();
    ctx.fillStyle = ROSA_OSCURO;
    ctx.beginPath();
    ctx.moveTo(bx, sueloY - 46 * k * 0.8);
    ctx.lineTo(bx + 18 * k * 0.8, sueloY - 39 * k * 0.8);
    ctx.lineTo(bx, sueloY - 32 * k * 0.8);
    ctx.fill();
  }

  // marcas de metros debajo de la carretera
  const paso = pasoBonito((maxX - minX) / 8);
  const primera = Math.ceil(minX / paso) * paso;

  ctx.fillStyle = CAFE;
  ctx.font = "14px Quicksand";
  ctx.textAlign = "center";

  for (let n = 0; primera + n * paso <= maxX; n++) {
    const metros = primera + n * paso;
    ctx.fillText(Number(metros.toFixed(2)) + " m", aPixeles(metros), sueloY + altoCarretera + 26);
  }

  dibujarAuto(aPixeles(x), sueloY + altoCarretera * 0.4, v, k);
}

function nube(cx, cy, k) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, 16 * k, 0, Math.PI * 2);
  ctx.arc(cx + 18 * k, cy - 6 * k, 20 * k, 0, Math.PI * 2);
  ctx.arc(cx + 40 * k, cy, 15 * k, 0, Math.PI * 2);
  ctx.fill();
}

// Elige un paso "redondo" para las marcas: 1, 2, 5, 10, 20, 50...
function pasoBonito(rango) {
  const potencia = Math.pow(10, Math.floor(Math.log10(rango)));

  for (const multiplo of [1, 2, 5, 10]) {
    if (multiplo * potencia >= rango) {
      return multiplo * potencia;
    }
  }
}

function dibujarAuto(px, baseY, v, k) {
  ctx.save();
  ctx.translate(px, baseY);
  ctx.scale(k, k);

  // si va hacia atras, volteamos el auto
  if (v < 0) {
    ctx.scale(-1, 1);
  }

  // orejitas de gato (el toque neko)
  ctx.fillStyle = ROSA_OSCURO;
  ctx.beginPath();
  ctx.moveTo(-18, -48);
  ctx.lineTo(-14, -62);
  ctx.lineTo(-7, -48);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(7, -48);
  ctx.lineTo(14, -62);
  ctx.lineTo(18, -48);
  ctx.fill();

  // cabina
  ctx.fillStyle = ROSA;
  ctx.beginPath();
  ctx.roundRect(-20, -48, 40, 22, 8);
  ctx.fill();

  // ventana
  ctx.fillStyle = AZUL;
  ctx.beginPath();
  ctx.roundRect(-14, -44, 28, 13, 5);
  ctx.fill();

  // carroceria
  ctx.fillStyle = ROSA;
  ctx.beginPath();
  ctx.roundRect(-40, -30, 80, 22, 8);
  ctx.fill();

  // faro (marca hacia donde mira el auto)
  ctx.fillStyle = "#ffe7a3";
  ctx.beginPath();
  ctx.arc(36, -20, 4, 0, Math.PI * 2);
  ctx.fill();

  // llantas
  ctx.fillStyle = CAFE;
  ctx.beginPath();
  ctx.arc(-22, -8, 9, 0, Math.PI * 2);
  ctx.arc(22, -8, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}


// =====================================================
//  Resultados y graficas
// =====================================================
function mostrarResultados() {
  cajaResultados.className = "caja-resultado";
  cajaResultados.innerHTML =
    "<p><b>Tipo de movimiento:</b> " + datos.tipo + "</p>" +
    "<p><b>Posición final:</b> " + datos.posicion_final.toFixed(2) + " m</p>" +
    "<p><b>Velocidad final:</b> " + datos.velocidad_final.toFixed(2) + " m/s</p>" +
    "<p><b>Desplazamiento:</b> " + datos.desplazamiento.toFixed(2) + " m</p>";

  botonRepetir.disabled = false;
}

function prepararGraficas() {
  if (graficaPosicion) {
    graficaPosicion.destroy();
    graficaVelocidad.destroy();
  }

  graficaPosicion = crearGrafica("graficaPosicion", "Posición vs tiempo", ROSA_OSCURO, "Posición (m)", datos.posiciones);
  graficaVelocidad = crearGrafica("graficaVelocidad", "Velocidad vs tiempo", "#5aa9c7", "Velocidad (m/s)", datos.velocidades);

  // quitamos el texto "La gráfica aparecerá aquí"
  document.querySelectorAll(".vacio-grafica").forEach(function (p) {
    p.classList.add("oculto");
  });
}

function crearGrafica(idCanvas, titulo, color, etiquetaY, valoresY) {
  // juntamos tiempo y valor en puntos {x, y}
  const puntos = datos.tiempos.map(function (t, i) {
    return { x: t, y: valoresY[i] };
  });

  return new Chart(document.getElementById(idCanvas), {
    type: "line",
    data: {
      datasets: [
        // la linea completa
        { data: puntos, borderColor: color, borderWidth: 3, pointRadius: 0 },
        // el puntito que se mueve junto con el auto
        { data: [], borderColor: color, backgroundColor: color, pointRadius: 7, showLine: false },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,   // que llene el visor
      animation: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: titulo, font: { size: 18 } },
      },
      scales: {
        x: { type: "linear", title: { display: true, text: "Tiempo (s)" }, grid: { color: "#f6e6e8" } },
        y: { title: { display: true, text: etiquetaY }, grid: { color: "#f6e6e8" } },
      },
    },
  });
}


// al abrir la pagina dibujamos el auto quieto en el cero
ajustarLienzo();


// =====================================================
//  Apartados de la izquierda (Movimiento / Convertir a m/s)
// =====================================================
const chipsSeccion = document.querySelectorAll(".selector-seccion .chip");

function irASeccion(nombre) {
  chipsSeccion.forEach(function (chip) {
    chip.classList.toggle("activo", chip.dataset.seccion === nombre);
    document.getElementById("seccion-" + chip.dataset.seccion).hidden = chip.dataset.seccion !== nombre;
  });
}

chipsSeccion.forEach(function (chip) {
  chip.addEventListener("click", function () { irASeccion(chip.dataset.seccion); });
});


// =====================================================
//  Convertidor de unidades a m/s
// =====================================================
const convValor = document.getElementById("convValor");
const convUnidad = document.getElementById("convUnidad");
const convResultado = document.getElementById("convResultado");
const convUsar = document.getElementById("convUsar");

// Devuelve el valor en m/s (o null si la casilla está vacía)
function convertirAMs() {
  const valor = parseFloat(convValor.value);
  if (isNaN(valor)) return null;
  return valor * Number(convUnidad.value);   // el value de cada opción es "cuántos m/s vale 1 unidad"
}

function actualizarConversion() {
  const ms = convertirAMs();

  if (ms === null) {
    convResultado.textContent = "= — m/s";
    convUsar.disabled = true;
  } else {
    convResultado.textContent = "= " + Number(ms.toFixed(4)) + " m/s";
    convUsar.disabled = false;
  }
}

convValor.addEventListener("input", actualizarConversion);
convUnidad.addEventListener("change", actualizarConversion);

// copia el resultado a la casilla de velocidad inicial
convUsar.addEventListener("click", function () {
  const ms = convertirAMs();
  if (ms === null) return;

  document.getElementById("velocidad").value = Number(ms.toFixed(4));
  irASeccion("calculadora");   // volvemos a la calculadora para que veas la velocidad ya puesta
});

actualizarConversion();
