from flask import Flask, request, jsonify
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
        return jsonify({"message": "URL recibida exitosamente"}), 200
    else:
        return jsonify({"error": "Método no permitido"}), 405

if __name__ == '__main__':
    app.run(debug=True)
