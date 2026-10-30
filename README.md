# MovMotion: simulador del movimiento de un vehículo 

Proyecto de Física: **Movimiento Rectilíneo Uniforme (MRU) y Uniformemente Variado (MRUV)**.

Escribes la posición inicial, la velocidad, la aceleración y el tiempo, y el programa:

1. Calcula cómo se mueve el vehículo.
2. Lo anima en una carretera (el auto tiene orejitas de gato, porque sí).
3. Dibuja las gráficas de **posición vs tiempo** y **velocidad vs tiempo**.

La pantalla se divide en dos: a la **izquierda** está la "calculadora", que tiene dos apartados: **Movimiento** (datos, botones y resultado) y **Convertir a m/s**
(pasar velocidades de otras unidades a m/s). A la **derecha** está el visor, con tres pestañas para cambiar entre
**Animación**, **Posición vs tiempo** y **Velocidad vs tiempo**. Además puede reproducir sonidos de menú (como los de *Doki Doki Literature Club*) si pones tus propios audios.

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

Si `a = 0` es **MRU** (velocidad constante). Si `a ≠ 0` es **MRUV**.
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
    ├── script.js      → la animación, las gráficas y las pestañas (JavaScript)
    ├── sonidos.js     → reproduce hover y seleccionar si los pones (JavaScript)
    └── sonidos/       → (opcional) aquí pones hover.ogg y seleccionar.ogg
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
| 61-62 | Si la aceleración es 0, el tipo es `"MRU"`; si no, `"MRUV"`. |
| 64-73 | Devuelve todo al navegador: el tipo, las tres listas, la posición final, la velocidad final y el desplazamiento (posición final menos la inicial). `[-1]` significa "el último elemento de la lista". |
| 76-77 | Si ejecutas este archivo directamente, enciende el servidor. `debug=True` hace que se reinicie solo si cambias el código. |

### 4.3 `templates/index.html` (HTML)

HTML es el esqueleto: dice **qué cosas hay**, no cómo se ven.

| Parte | Qué hace |
|---|---|
| `<head>` | Título de la pestaña, tipografía **Quicksand** (Google Fonts) y conexión con `style.css`. |
| `<header class="barra">` | La barra de arriba con el nombre "MovMotion" a la izquierda y "MRU y MRUV" a la derecha. |
| `<div class="layout">` | Caja que se divide en **dos columnas**: izquierda y derecha. |
| `<aside class="izquierda">` | La columna izquierda. Arriba tiene dos pastillas (`data-seccion`) para elegir el apartado: `#seccion-calculadora` o `#seccion-conversor` (solo se ve uno a la vez). |
| `<form id="formulario">` | Las 4 casillas (posición, velocidad, aceleración, tiempo), las 3 pastillas de rapidez, el recuadro de errores (solo aparece si algo sale mal) y los botones **Simular/Graficar** y **Reiniciar**. |
| `<div id="resultados">` | Aquí se escribe el resultado numérico. |
| `<div id="seccion-conversor">` | El apartado del convertidor de velocidad a m/s: una casilla para el valor y un menú `<select>` para la unidad (km/h, mi/h, ft/s y cm/s). Cada `<option>` guarda en `value` cuántos m/s vale 1 de esa unidad. |
| `<section class="derecha">` | La columna derecha. |
| `<nav class="pestanas">` | Los **3 botones** para cambiar de vista. Cada uno tiene `data-vista` con el nombre de su vista. |
| `<div class="visor">` | El recuadro grande blanco. Adentro hay tres `<div class="vista">`, y solo una se ve a la vez (las otras tienen `hidden`). |
| `<canvas id="pista">` | El lienzo donde JavaScript dibuja la carretera y el auto. |
| `<span class="dato-vivo">` (3) | Los números en vivo: `t`, `x` y `v`. |
| `<canvas id="graficaPosicion">` y `graficaVelocidad` | Los lienzos de las gráficas. Mientras no haya simulación muestran "La gráfica aparecerá aquí". |
| `<script>` (3) | Cargan Chart.js (gráficas), `sonidos.js` y `script.js`. El orden importa: `script.js` usa a los otros dos. |

### 4.4 `static/style.css` (CSS)

CSS dice **cómo se ve** cada cosa.

| Parte | Qué hace |
|---|---|
| `:root { --rosa: ...; }` | Los colores con nombre, para usarlos como `var(--rosa)`. |
| `.layout` | `display: grid` con `grid-template-columns: 400px 1fr`: la izquierda mide 400 px y la derecha ocupa todo lo demás. |
| `.izquierda` | Con `overflow-y: auto` se desplaza sola si no cabe todo. |
| `.fila` | Pone dos casillas lado a lado. |
| `.chip` y `.chip.activo` | Las pastillas redondas; la activa se pinta de rosa claro. |
| `.mensaje` y `.mensaje.error` | El recuadro de errores; `:empty` lo oculta cuando no tiene texto. |
| `.selector-seccion` | Las dos pastillas de arriba a la izquierda. |
| `[hidden]` | Regla que oculta cualquier elemento con el atributo `hidden`. |
| `.conversor` y `.conv-resultado` | El estilo del convertidor y de su caja de resultado. |
| `.derecha` | Fondo crema con puntitos (`radial-gradient`). |
| `.pestana` y `.pestana.activa` | Los botones de arriba; el activo se rellena de rosa. |
| `.visor` y `.vista` | El recuadro blanco y cada vista dentro (`position: absolute; inset: 0` hace que ocupen todo el espacio). |
| `.vista[hidden]` | Oculta las vistas que no están seleccionadas. |
| `@media (max-width: 900px)` | En celular las dos columnas se apilan una sobre otra. |

### 4.5 `static/script.js` (JavaScript)

| Parte | Qué hace |
|---|---|
| Variables de arriba | Buscan los elementos de la página por su `id` y guardan el estado (`datos`, `rapidez`, las gráficas...). |
| `irA(nombre)` | **Cambia de pestaña**: marca la pestaña activa, muestra su vista y oculta las demás. También cambia el texto del botón principal: **Graficar** en las pestañas de gráficas y **Simular** en la animación. Las gráficas llaman a `resize()` porque no pueden calcular su tamaño mientras están ocultas. |
| Chips de rapidez | Al hacer clic en una pastilla se guarda 0.5, 1 o 2 en `rapidez`. |
| `submit` del formulario | Manda los 4 números a `app.py` con `fetch`, y si todo sale bien: guarda la respuesta, muestra resultados, crea gráficas, y arranca la simulación (sin cambiar de pestaña). Si hay error, lo muestra y suena el sonido de error. |
| `empezarAnimacion` | Ciclo con `requestAnimationFrame` (unas 60 veces por segundo) que calcula el tiempo `t` y llama a `actualizar`. Al terminar suena una campanita. |
| `reiniciar` | Borra datos, resultados y gráficas y deja el auto quieto. |
| `valoresEn(t)` y `mezclar` | Sacan `x` y `v` para cualquier `t` mezclando los dos puntos más cercanos que calculó Flask, para que el movimiento sea fluido. |
| `actualizar(t)` | En cada cuadro escribe el reloj, dibuja la escena y mueve el puntito de las dos gráficas. |
| `ajustarLienzo` | Hace que el lienzo tenga el tamaño real que ocupa en pantalla (incluyendo pantallas retina) y se redibuje si cambias el tamaño de la ventana (`ResizeObserver`). |
| `dibujarEscena` | Pinta cielo, sol, nubes, carretera, bandera de inicio, marcas de metros y el auto. Calcula qué rango de metros cabe usando la posición mínima y máxima. |
| `pasoBonito` | Elige saltos "redondos" (1, 2, 5, 10, 20, 50...) para la regla. |
| `dibujarAuto` | Dibuja el auto con formas simples. Si `v` es negativa lo voltea (`scale(-1, 1)`). `k` lo agranda según el tamaño del visor. |
| `mostrarResultados` | Escribe tipo de movimiento, posición final, velocidad final y desplazamiento. |
| `irASeccion(nombre)` | Cambia entre los apartados de la izquierda (Movimiento / Convertir a m/s). |
| Convertidor (`convertirAMs`, `actualizarConversion`) | Multiplica el valor escrito por el factor de la unidad elegida y muestra el resultado en m/s al instante. El botón "Usar como velocidad inicial" lo copia a la casilla de velocidad y te regresa al apartado Movimiento. |
| `crearGrafica` | Crea una gráfica de línea con Chart.js y un puntito que se mueve junto con el auto. `maintainAspectRatio: false` hace que llene el visor. |



- Agregar un botón para silenciar el sonido.
- Agregar un botón de pausa.
- Mostrar la distancia total recorrida (distinta del desplazamiento cuando el auto se regresa).
- Cambiar los colores en `:root` de `style.css`.
- Hacer que las gráficas funcionen sin internet descargando Chart.js a la carpeta `static`.
