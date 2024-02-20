# server/api.py
from flask import Flask, request, redirect

app = Flask(__name__)

@app.route('/')
def index():
    return '¡La aplicación Flask está funcionando correctamente!'

@app.route('/redirect', methods=['POST'])
def redireccionar():
    url_del_circuito = request.json.get('https://algassert.com/quirk#circuit={%22cols%22:[]}')
    if url_del_circuito:
        # Realizar el redireccionamiento
        return redirect(url_del_circuito)
    else:
        return 'URL del circuito no proporcionada', 400

if __name__ == '__main__':
    app.run(debug=True)
