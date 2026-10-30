# Simulador del movimiento de un vehículo 🐾

Proyecto de Física: **Movimiento Rectilíneo Uniforme (MRU) y Uniformemente Acelerado (MRUA)**.

Escribes la posición inicial, la velocidad, la aceleración y el tiempo, y el programa:

1. Calcula cómo se mueve el vehículo.
2. Lo anima en una carretera (el auto tiene orejitas de gato, porque sí).
3. Dibuja las gráficas de **posición vs tiempo** y **velocidad vs tiempo**.

---

## 1. La física detrás

Cuando un vehículo se mueve en línea recta con aceleración constante:

| Fórmula | Qué significa |
|---|---|
| `x = x₀ + v₀·t + ½·a·t²` | Dónde está el vehículo en el tiempo `t` |
| `v = v₀ + a·t` | Qué tan rápido va en el tiempo `t` |

- `x₀` = posición inicial (metros)
- `v₀` = velocidad inicial (m/s)
- `a` = aceleración (m/s²)
- `t` = tiempo (segundos)

Si `a = 0` es **MRU** (velocidad constante). Si `a ≠ 0` es **MRUA**.
Si la velocidad sale negativa, el vehículo va hacia atrás (el auto se voltea en la animación).

---

## 2. Cómo correrlo

Necesitas tener **Python 3** instalado (python.org).

Abre una terminal dentro de la carpeta `simulador` y escribe:

```
pip install -r requirements.txt
python app.py
```

- La primera línea instala Flask (lo que permite crear la página web).
- La segunda enciende el programa.

Luego abre en tu navegador: **http://127.0.0.1:5000**

Para apagarlo, presiona `Ctrl + C` en la terminal.

> Las gráficas y la tipografía se cargan de internet (Chart.js y Google Fonts),
> así que necesitas conexión la primera vez que abras la página.

---

## 3. Qué hay en cada carpeta

```
simulador/
├── app.py             → el "cerebro": hace las cuentas de física (Python)
├── requirements.txt   → lista de lo que hay que instalar
├── templates/
│   └── index.html     → el esqueleto de la página (HTML)
└── static/
    ├── style.css      → los colores y el diseño (CSS)
    └── script.js      → la animación y las gráficas (JavaScript)
```

Cómo trabajan juntos: el navegador muestra `index.html`. Cuando le das **Simular**,
`script.js` manda tus 4 números a `app.py`; este hace las cuentas y los devuelve;
y `script.js` los usa para animar el auto y dibujar las gráficas.

---

## 4. Explicación línea por línea

Una "línea que empieza con `#`" en Python es un **comentario**: la computadora la ignora,
sirve solo para que las personas entiendan.

### 4.1 `requirements.txt`

| Línea | Qué hace |
|---|---|
| `flask` | Le dice a `pip` que instale Flask, una herramienta de Python para hacer páginas web. |

### 4.2 `app.py` (Python)

| Líneas | Qué hacen |
|---|---|
| 1-2 | Comentarios: título del programa y cómo correrlo. |
| 4 | Trae `math`, un paquete de Python con funciones matemáticas. Lo usamos para revisar que los números sean válidos. |
| 5 | Trae de Flask lo que necesitamos: `Flask` (crea la app), `render_template` (muestra una página HTML), `request` (lee lo que manda el navegador) y `jsonify` (convierte la respuesta a un formato que JavaScript entiende). |
| 7 | Crea la aplicación web y la guarda en la variable `app`. |
| 9-11 | `PUNTOS = 200`: cuántos puntos calculamos. Entre más puntos, más suave se ve la gráfica. |
| 13-14 | `TIEMPO_MAXIMO = 600`: límite de 600 segundos para que nadie trabe el programa con un tiempo enorme. |
| 17 | `@app.route("/")` significa: "cuando alguien entre a la página principal, ejecuta la función de abajo". |
| 18 | Crea la función `inicio`. |
| 19 | Comentario. |
| 20 | Entrega la página `index.html` al navegador. |
| 23 | `@app.route("/calcular", methods=["POST"])`: crea otra "puerta" llamada `/calcular` que recibe datos enviados por el formulario. |
| 24 | Crea la función `calcular`. |
| 25 | Lee los datos que mandó el navegador y los guarda en `datos`. |
| 28 | `try:` = "intenta hacer esto; si algo sale mal, no te rompas". |
| 29-32 | Saca cada número de `datos` y lo convierte con `float()` (número con decimales). Los guarda como `x0` (posición inicial), `v0` (velocidad inicial), `a` (aceleración) y `tiempo_total`. |
| 33-34 | Si faltó un dato o no era un número, responde con un mensaje de error (el `400` es el código que significa "datos incorrectos"). |
| 36-39 | Recorre los 4 valores y revisa que sean números normales. Python acepta cosas raras como `nan` o `inf` ("infinito"), y aquí las rechazamos. |
| 41-42 | Si el tiempo es 0 o negativo, responde con error. |
| 44-45 | Si el tiempo pasa de 600 s, responde con error. |
| 47-49 | Comentarios con las dos fórmulas de física. |
| 50-52 | Crea tres listas vacías: una para los tiempos, otra para las posiciones y otra para las velocidades. |
| 54 | Un ciclo `for` que se repite 201 veces (de `i = 0` a `i = 200`). |
| 55 | Calcula el tiempo de este punto repartiendo el tiempo total en partes iguales. |
| 57 | Guarda ese tiempo en la lista. |
| 58 | Aplica `x = x₀ + v₀·t + ½·a·t²` y guarda el resultado (`**` significa "elevado a"). |
| 59 | Aplica `v = v₀ + a·t` y guarda el resultado. |
| 61-62 | Si la aceleración es 0, el tipo es `"MRU"`; si no, `"MRUA"`. |
| 64-73 | Devuelve todo al navegador: el tipo, las tres listas, la posición final, la velocidad final y el desplazamiento (posición final menos la inicial). `[-1]` significa "el último elemento de la lista". |
| 76-77 | Si ejecutas este archivo directamente, enciende el servidor. `debug=True` hace que se reinicie solo si cambias el código. |

### 4.3 `templates/index.html` (HTML)

HTML es el esqueleto de la página: dice **qué cosas hay**, no cómo se ven.
Las cosas entre `<` y `>` se llaman *etiquetas*; casi todas se abren (`<p>`) y se cierran (`</p>`).

| Parte | Qué hace |
|---|---|
| `<!DOCTYPE html>` | Avisa al navegador que esto es una página HTML moderna. |
| `<html lang="es">` | Empieza la página y dice que está en español. |
| `<head>` ... `</head>` | Información "de fondo" que no se ve en la página. |
| `<meta charset="UTF-8">` | Para que se vean bien los acentos y la ñ. |
| `<meta name="viewport" ...>` | Para que la página se acomode bien en celulares. |
| `<title>` | El nombre que sale en la pestaña del navegador. |
| `<link ... fonts.googleapis.com ...>` (2 líneas) | Descargan la tipografía **Quicksand** (redondita y minimalista) de Google Fonts. |
| `<link rel="stylesheet" href="{{ url_for(...) }}">` | Conecta el archivo de estilos `style.css`. Las llaves `{{ }}` las resuelve Flask para encontrar el archivo. |
| `<body>` | Aquí empieza todo lo que sí se ve. |
| `<header>` con `<h1>` y `<p>` | El encabezado: el título grande y el subtítulo. |
| `<main>` | El contenido principal. |
| `<section class="tarjeta">` | Una "cajita" con borde rosa (la clase `tarjeta` está definida en el CSS). |
| `<form id="formulario">` | El formulario. El `id` es un nombre para que JavaScript lo encuentre. |
| `<label>` | Un campo con su texto. Hay uno por cada dato. |
| `<input type="number" id="posicion" value="0" step="any" required>` | Una casilla para escribir un número. `value` es el valor inicial, `step="any"` permite decimales y `required` obliga a llenarla. Igual para velocidad, aceleración y tiempo (el tiempo además tiene `min="0.1"`). |
| `<select id="rapidez">` con `<option>` | Un menú para elegir qué tan rápida va la animación (0.5x, 1x o 2x). `selected` marca la opción por defecto. |
| `<div class="botones">` | Una caja para acomodar los dos botones. |
| `<button type="submit">Simular</button>` | Botón que envía el formulario. |
| `<button type="button" id="reiniciar" ...>` | Botón para limpiar todo. |
| `<p id="mensaje">` | Espacio donde aparecen los mensajes de error. |
| `<canvas id="pista" width="900" height="230">` | Un "lienzo" donde JavaScript dibuja la carretera y el auto. |
| `<p id="reloj">` | Texto que muestra `t`, `x` y `v` en vivo. |
| `<section ... id="resultados" hidden>` | Caja de resultados; está oculta (`hidden`) hasta que haya una simulación. |
| `<section class="graficas">` con 2 `<canvas>` | Dos lienzos para las gráficas de posición y de velocidad. |
| `<footer>` | Pie de página con las dos fórmulas. |
| `<script src="...chart.js...">` | Carga **Chart.js**, una librería que dibuja gráficas. |
| `<script src="{{ url_for(...) }}">` | Carga nuestro `script.js`. Va al final para que la página ya exista cuando corra. |

Las líneas que empiezan con `<!--` son comentarios.

### 4.4 `static/style.css` (CSS)

CSS dice **cómo se ve** cada cosa: colores, tamaños, espacios.

| Parte | Qué hace |
|---|---|
| `:root { --crema: ...; }` | Define los colores una sola vez con nombres: crema, blanco, rosa, rosa-oscuro, rosa-claro, café y azul. Después los usamos como `var(--rosa)`. |
| `* { box-sizing: border-box; }` | Hace que el tamaño de las cajas incluya su borde, para que no se salgan de la pantalla. |
| `body { ... }` | Fondo crema, texto color café, tipografía Quicksand y espacio entre renglones. |
| `header` | Centra el texto y le da espacio arriba y abajo. |
| `header h1` | El título: sin margen, tamaño `2rem`, grosor 600 y color rosa oscuro. |
| `header p` | El subtítulo, con un poco de margen arriba. |
| `main` | Ancho máximo de 940 px, centrado (`margin: 0 auto`), con las cajas una debajo de otra y 16 px entre ellas (`display: grid; gap`). |
| `.tarjeta` | Las cajitas: fondo casi blanco, borde rosa de 2 px, esquinas redondeadas y espacio interno. |
| `form` | Acomoda los campos en columnas que se adaptan al ancho (`auto-fit, minmax`). |
| `label` | Texto encima de la casilla, en negrita y un poco más chico. |
| `input, select` | Las casillas: tipografía igual al resto, fondo crema, borde rosa clarito y esquinas redondeadas. |
| `input:focus, select:focus` | Cuando haces clic en una casilla, quita el borde azul del navegador y lo pone rosa. |
| `.botones` | Pone los botones lado a lado, alineados abajo. |
| `button` | Botón rosa oscuro con letras blancas, sin borde, esquinas redondeadas y cursor de mano. |
| `button:hover` | El botón se aclara cuando pasas el mouse por encima. |
| `button.secundario` y su `:hover` | El botón "Reiniciar" es azul clarito con letras color café. |
| `#mensaje` y `#mensaje:empty` | El mensaje de error va en rosa oscuro; si está vacío, se oculta para no dejar espacio. |
| `#pista` | El lienzo ocupa todo el ancho de la tarjeta y se ajusta en proporción. |
| `#reloj` | El texto del reloj, centrado y en negrita. |
| `#resultados` y `#resultados p` | La caja de resultados con fondo rosa clarito y párrafos con poco espacio. |
| `.graficas` | Dos gráficas lado a lado. |
| `@media (max-width: 700px)` | Si la pantalla es angosta (celular), las gráficas se ponen una debajo de la otra. |
| `footer` | Pie de página centrado y con letra un poco más chica. |

### 4.5 `static/script.js` (JavaScript)

JavaScript hace que la página **haga cosas**. En JS, `//` inicia un comentario,
`const` crea un valor que no cambia y `let` uno que sí puede cambiar.

**Cosas de la página (inicio del archivo)**

| Líneas | Qué hacen |
|---|---|
| `const formulario = document.getElementById("formulario")` (y las siguientes) | Busca en la página los elementos por su `id` y los guarda en variables para poder usarlos: el formulario, el botón de reiniciar, el mensaje, el reloj y la caja de resultados. |
| `const pista = ...` y `const ctx = pista.getContext("2d")` | Busca el lienzo de la carretera y pide su "pincel" (`ctx`), con el que dibujaremos. |
| `const ROSA = ...` (4 líneas) | Los mismos colores del CSS, para dibujar el auto. |
| `let datos = null` | Aquí guardaremos lo que responda `app.py`. Empieza vacío (`null`). |
| `let idAnimacion = null` | Número que sirve para poder detener la animación. |
| `let graficaPosicion` y `let graficaVelocidad` | Aquí guardaremos las dos gráficas. |
| `Chart.defaults...` (2 líneas) | Le pone a las gráficas la misma tipografía y color de texto que a la página. |

**Enviar el formulario**

| Líneas | Qué hacen |
|---|---|
| `formulario.addEventListener("submit", async function (evento) {` | "Cuando se envíe el formulario, haz lo siguiente". `async` permite esperar respuestas del servidor. |
| `evento.preventDefault()` | Evita que la página se recargue (que es lo que haría el navegador normalmente). |
| `mensaje.textContent = ""` | Borra el mensaje de error anterior. |
| `const envio = { ... }` | Lee el valor de las 4 casillas y los junta en un paquete. |
| `const respuesta = await fetch("/calcular", {...})` | Envía el paquete a `app.py` y espera la respuesta. `POST` es el tipo de envío, y `JSON.stringify` convierte el paquete a texto para viajar. |
| `const resultado = await respuesta.json()` | Convierte la respuesta de texto a datos que JavaScript puede usar. |
| `if (!respuesta.ok) {...}` | Si hubo error, muestra el mensaje y se detiene (`return`). |
| `datos = resultado` | Guarda la respuesta. |
| `mostrarResultados(); prepararGraficas(); empezarAnimacion();` | Muestra los resultados, crea las gráficas y arranca la animación. |
| `botonReiniciar.addEventListener("click", reiniciar)` | Cuando hagan clic en "Reiniciar", ejecuta la función `reiniciar`. |

**Animación**

| Función | Qué hace |
|---|---|
| `empezarAnimacion` | Detiene cualquier animación anterior, lee la rapidez elegida y anota la hora de inicio. Dentro tiene la función `cuadro`, que se ejecuta una y otra vez (unas 60 veces por segundo): calcula cuántos segundos "de simulación" han pasado (`Math.min` evita pasarse del tiempo total), llama a `actualizar(t)` y, si todavía no termina, pide el siguiente cuadro con `requestAnimationFrame`. |
| `reiniciar` | Detiene la animación, borra los datos, el mensaje, los resultados y las gráficas, regresa el reloj a cero y dibuja el auto quieto. |
| `valoresEn(t)` | Para cualquier tiempo `t`, busca entre qué dos puntos calculados cae y toma un valor intermedio, así el movimiento se ve fluido. `Math.floor` redondea hacia abajo. |
| `mezclar(a, b, fraccion)` | Devuelve un valor entre `a` y `b` (con `fraccion = 0` da `a`, con `1` da `b`). |
| `actualizar(t)` | Se llama en cada cuadro: obtiene `x` y `v`, escribe el reloj, dibuja la escena y mueve el puntito de cada gráfica a donde va el auto. `toFixed(2)` deja 2 decimales. |

**Dibujar la carretera y el auto**

| Parte | Qué hace |
|---|---|
| `dibujarEscena(x, v)` | Primero borra el lienzo (`clearRect`). Luego calcula el rango de metros que debe caber en pantalla usando la posición más chica y la más grande (`Math.min` y `Math.max`) y agrega un poco de espacio extra (`holgura`). |
| `aPixeles(metros)` | Convierte metros a píxeles para saber en qué punto de la pantalla va el auto. |
| Bloque de la carretera | Pinta un rectángulo café clarito (`fillRect`) y una línea blanca punteada (`setLineDash`) en medio. |
| Bloque de las marcas | Calcula cada cuántos metros poner un número bajo la carretera y los escribe con `fillText`. |
| `pasoBonito(rango)` | Escoge un salto "redondo" (1, 2, 5, 10, 20, 50...) para que los números de la regla sean fáciles de leer. |
| `dibujarAuto(px, sueloY, v)` | Dibuja el auto con formas simples: orejitas (triángulos), cabina, ventana y carrocería (rectángulos redondeados), un faro amarillo y dos llantas (círculos con `arc`). `save`/`translate`/`restore` mueven el "origen" al lugar del auto, y si `v` es negativa, `scale(-1, 1)` lo voltea como espejo. |

**Resultados y gráficas**

| Función | Qué hace |
|---|---|
| `mostrarResultados` | Muestra la caja y escribe en ella el tipo de movimiento, la posición final, la velocidad final y el desplazamiento. |
| `prepararGraficas` | Si ya había gráficas, las destruye y crea las dos nuevas. |
| `crearGrafica` | Junta los tiempos con los valores en puntos `{x, y}` (con `.map`) y crea una gráfica de línea con Chart.js. Tiene dos conjuntos de datos: la línea completa y un punto grande que se mueve con el auto. `animation: false` evita que la gráfica se anime sola y choque con nuestra animación. Los textos `title` ponen el nombre y los ejes. |
| Última línea: `dibujarEscena(0, 0)` | Al abrir la página, dibuja la carretera con el auto en el cero. |

---

## 5. Cosas que puedes probar

| Posición | Velocidad | Aceleración | Tiempo | Qué pasa |
|---|---|---|---|---|
| 0 | 5 | 0 | 10 | MRU: va a velocidad constante, la gráfica de posición es una recta. |
| 0 | 5 | 2 | 10 | MRUA: acelera, la posición se curva hacia arriba. |
| 0 | 10 | -2 | 10 | Frena, se detiene a los 5 s y se regresa (la velocidad pasa a negativa). |
| 20 | -3 | 0 | 8 | Parte de los 20 m y va hacia atrás. |

---

## 6. Ideas para mejorarlo

- Agregar un botón de pausa.
- Mostrar la distancia total recorrida (distinta del desplazamiento cuando el auto se regresa).
- Cambiar los colores en `:root` de `style.css`.
- Hacer que las gráficas funcionen sin internet descargando Chart.js a la carpeta `static`.
