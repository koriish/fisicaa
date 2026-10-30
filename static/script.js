// Parte "visual" del simulador: manda los datos a Flask, anima el auto
// y dibuja las graficas.

// ---------- cosas de la pagina que vamos a usar ----------
const formulario = document.getElementById("formulario");
const botonReiniciar = document.getElementById("reiniciar");
const mensaje = document.getElementById("mensaje");
const reloj = document.getElementById("reloj");
const cajaResultados = document.getElementById("resultados");

const pista = document.getElementById("pista");
const ctx = pista.getContext("2d");

// ---------- colores (los mismos del CSS) ----------
const ROSA = "#f6a5b7";
const ROSA_OSCURO = "#e0708c";
const CAFE = "#6b4a3a";
const AZUL = "#9ed3e6";

// ---------- variables que cambian mientras corre el programa ----------
let datos = null;          // lo que nos responde Flask
let idAnimacion = null;    // para poder detener la animacion
let graficaPosicion = null;
let graficaVelocidad = null;

Chart.defaults.font.family = "Quicksand";
Chart.defaults.color = CAFE;


// =====================================================
//  Enviar el formulario
// =====================================================
formulario.addEventListener("submit", async function (evento) {
  evento.preventDefault();   // evita que la pagina se recargue
  mensaje.textContent = "";

  const envio = {
    posicion: document.getElementById("posicion").value,
    velocidad: document.getElementById("velocidad").value,
    aceleracion: document.getElementById("aceleracion").value,
    tiempo: document.getElementById("tiempo").value,
  };

  const respuesta = await fetch("/calcular", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(envio),
  });

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    mensaje.textContent = resultado.error;
    return;
  }

  datos = resultado;
  mostrarResultados();
  prepararGraficas();
  empezarAnimacion();
});

botonReiniciar.addEventListener("click", reiniciar);


// =====================================================
//  Animacion
// =====================================================
function empezarAnimacion() {
  cancelAnimationFrame(idAnimacion);

  const rapidez = Number(document.getElementById("rapidez").value);
  const horaInicio = performance.now();

  function cuadro(ahora) {
    const segundos = (ahora - horaInicio) / 1000 * rapidez;
    const t = Math.min(segundos, datos.tiempo_total);

    actualizar(t);

    // si todavia no termina, pedimos el siguiente cuadro
    if (t < datos.tiempo_total) {
      idAnimacion = requestAnimationFrame(cuadro);
    }
  }

  idAnimacion = requestAnimationFrame(cuadro);
}

function reiniciar() {
  cancelAnimationFrame(idAnimacion);
  datos = null;
  mensaje.textContent = "";
  cajaResultados.hidden = true;
  reloj.textContent = "t = 0.00 s";

  if (graficaPosicion) {
    graficaPosicion.destroy();
    graficaVelocidad.destroy();
    graficaPosicion = null;
    graficaVelocidad = null;
  }

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

  reloj.textContent =
    "t = " + t.toFixed(2) + " s   |   x = " + x.toFixed(2) + " m   |   v = " + v.toFixed(2) + " m/s";

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
function dibujarEscena(x, v) {
  const ancho = pista.width;
  const alto = pista.height;
  const margen = 60;
  const sueloY = 160;

  ctx.clearRect(0, 0, ancho, alto);

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

  // convierte metros a pixeles
  function aPixeles(metros) {
    return margen + (metros - minX) / (maxX - minX) * (ancho - 2 * margen);
  }

  // la carretera
  ctx.fillStyle = "#ead9c9";
  ctx.fillRect(0, sueloY, ancho, 40);

  ctx.strokeStyle = "#fffdfb";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(0, sueloY + 20);
  ctx.lineTo(ancho, sueloY + 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // marcas de metros debajo de la carretera
  const paso = pasoBonito((maxX - minX) / 8);
  const primera = Math.ceil(minX / paso) * paso;

  ctx.fillStyle = CAFE;
  ctx.font = "14px Quicksand";
  ctx.textAlign = "center";

  for (let k = 0; primera + k * paso <= maxX; k++) {
    const metros = primera + k * paso;
    ctx.fillText(Number(metros.toFixed(2)) + " m", aPixeles(metros), sueloY + 62);
  }

  dibujarAuto(aPixeles(x), sueloY, v);
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

function dibujarAuto(px, sueloY, v) {
  ctx.save();
  ctx.translate(px, sueloY);

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
  cajaResultados.hidden = false;
  cajaResultados.innerHTML =
    "<p><b>Tipo de movimiento:</b> " + datos.tipo + "</p>" +
    "<p><b>Posición final:</b> " + datos.posicion_final.toFixed(2) + " m</p>" +
    "<p><b>Velocidad final:</b> " + datos.velocidad_final.toFixed(2) + " m/s</p>" +
    "<p><b>Desplazamiento:</b> " + datos.desplazamiento.toFixed(2) + " m</p>";
}

function prepararGraficas() {
  if (graficaPosicion) {
    graficaPosicion.destroy();
    graficaVelocidad.destroy();
  }

  graficaPosicion = crearGrafica("graficaPosicion", "Posición vs tiempo", ROSA_OSCURO, "Posición (m)", datos.posiciones);
  graficaVelocidad = crearGrafica("graficaVelocidad", "Velocidad vs tiempo", "#5aa9c7", "Velocidad (m/s)", datos.velocidades);
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
        { data: [], borderColor: color, backgroundColor: color, pointRadius: 6, showLine: false },
      ],
    },
    options: {
      animation: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: titulo, font: { size: 16 } },
      },
      scales: {
        x: { type: "linear", title: { display: true, text: "Tiempo (s)" } },
        y: { title: { display: true, text: etiquetaY } },
      },
    },
  });
}


// al abrir la pagina dibujamos el auto quieto en el cero
dibujarEscena(0, 0);
