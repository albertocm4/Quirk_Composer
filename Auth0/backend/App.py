from flask import Flask, request, jsonify, redirect
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/recibir_url_quirk', methods=['POST'])
def recibir_url_quirk():
    if request.method == 'POST':
        data = request.get_json()
        url_quirk = data.get('urlQuirk')
        # Aquí puedes manejar la URL recibida como desees
        print("URL recibida desde Quirk:", url_quirk)
        # Redirigir a la aplicación de React con la URL procesada como parámetro de consulta
        return redirect("http://localhost:4444?url={}".format(url_quirk), code=302)
    else:
        return jsonify({"error": "Método no permitido"}), 405


if __name__ == '__main__':
    app.run(debug=True)
