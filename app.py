# Simulador del movimiento de un vehiculo (MRU y MRUV)
# Para correrlo:  python app.py   y luego abrir http://127.0.0.1:5000

import math
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# cuantos puntos calculamos para las graficas
# (mas puntos = curva mas suave, pero tampoco hace falta pasarse)
PUNTOS = 200

# para que nadie ponga un tiempo de un millon de segundos y se trabe todo
TIEMPO_MAXIMO = 600


@app.route("/")
def inicio():
    # solo muestra la pagina principal
    return render_template("index.html")


@app.route("/calcular", methods=["POST"])
def calcular():
    datos = request.get_json()

    # leemos los 4 numeros que manda el formulario
    try:
        x0 = float(datos["posicion"])
        v0 = float(datos["velocidad"])
        a = float(datos["aceleracion"])
        tiempo_total = float(datos["tiempo"])
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "Revisa que todos los campos tengan un numero."}), 400

    # float() acepta cosas raras como "nan" o "inf", asi que las checamos aparte
    for valor in (x0, v0, a, tiempo_total):
        if not math.isfinite(valor):
            return jsonify({"error": "Los valores tienen que ser numeros normales."}), 400

    if tiempo_total <= 0:
        return jsonify({"error": "El tiempo tiene que ser mayor que 0."}), 400

    if tiempo_total > TIEMPO_MAXIMO:
        return jsonify({"error": f"El tiempo maximo es {TIEMPO_MAXIMO} s."}), 400

    # aqui va la fisica:
    #   x = x0 + v0*t + (1/2)*a*t^2
    #   v = v0 + a*t
    tiempos = []
    posiciones = []
    velocidades = []

    for i in range(PUNTOS + 1):
        t = tiempo_total * i / PUNTOS

        tiempos.append(t)
        posiciones.append(x0 + v0 * t + 0.5 * a * t ** 2)
        velocidades.append(v0 + a * t)

    # si no hay aceleracion es MRU, si hay es MRUV
    tipo = "MRU" if a == 0 else "MRUV"

    return jsonify({
        "tipo": tipo,
        "tiempo_total": tiempo_total,
        "tiempos": tiempos,
        "posiciones": posiciones,
        "velocidades": velocidades,
        "posicion_final": posiciones[-1],
        "velocidad_final": velocidades[-1],
        "desplazamiento": posiciones[-1] - x0,
    })


if __name__ == "__main__":
    app.run(debug=True)
