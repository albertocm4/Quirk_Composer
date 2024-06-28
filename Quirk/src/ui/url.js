/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {notifyAboutRecoveryFromUnexpectedError} from "../fallback.js"
import {CircuitDefinition} from "../circuit/CircuitDefinition.js"
import {Config} from "../Config.js"
import {HistoryPusher} from "../browser/HistoryPusher.js"
import {fromJsonText_CircuitDefinition, Serializer} from "../circuit/Serializer.js"
import { takeScreenshotOfCanvas } from "../fallback.js";

function urlWithCircuitHash(jsonText) {
    if (jsonText.indexOf('%') !== -1 || jsonText.indexOf('&') !== -1) {
        jsonText = encodeURIComponent(jsonText);
    }
    return "#" + Config.URL_CIRCUIT_PARAM_KEY + "=" + jsonText;
}

/**
 * @param {!Revision} revision
 */
function initUrlCircuitSync(revision) {
    // Pull initial circuit out of URL '#x=y' arguments.
    const getHashParameters = () => {
        let hashText = document.location.hash.substr(1);
        let paramsMap = new Map();
        if (hashText !== "") {
            for (let keyVal of hashText.split("&")) {
                let eq = keyVal.indexOf("=");
                if (eq === -1) {
                    continue;
                }
                let key = keyVal.substring(0, eq);
                let val = decodeURIComponent(keyVal.substring(eq + 1));
                paramsMap.set(key, val);
            }
        }
        return paramsMap;
    };

    const historyPusher = new HistoryPusher();
    const loadCircuitFromUrl = () => {
        try {
            historyPusher.currentStateIsMemorableButUnknown();
            let params = getHashParameters();
            if (!params.has(Config.URL_CIRCUIT_PARAM_KEY)) {
                let def = document.DEFAULT_CIRCUIT || JSON.stringify(Serializer.toJson(CircuitDefinition.EMPTY));
                params.set(Config.URL_CIRCUIT_PARAM_KEY, def);
            }

            let jsonText = params.get(Config.URL_CIRCUIT_PARAM_KEY);
            historyPusher.currentStateIsMemorableAndEqualTo(jsonText);
            let circuitDef = fromJsonText_CircuitDefinition(jsonText);
            let cleanedJson = JSON.stringify(Serializer.toJson(circuitDef));
            revision.clear(cleanedJson);
            if (circuitDef.isEmpty() && params.size === 1) {
                historyPusher.currentStateIsNotMemorable();
            } else {
                let urlHash = urlWithCircuitHash(jsonText);
                historyPusher.stateChange(jsonText, urlHash);
            }
        } catch (ex) {
            notifyAboutRecoveryFromUnexpectedError(
                "Defaulted to an empty circuit. Failed to understand circuit from URL.",
                {document_location_hash: document.location.hash},
                ex);
        }
    };

    window.addEventListener('popstate', loadCircuitFromUrl);
    loadCircuitFromUrl();

    revision.latestActiveCommit().whenDifferent().skip(1).subscribe(jsonText => {
        historyPusher.stateChange(jsonText, urlWithCircuitHash(jsonText));
    });
}




function obtenerURL() {
    let url = window.location.href;
    console.log("URL original:", url);
    // Obtener la posición de "&cadena="
    const index = url.indexOf("&cadena=");
    if (index !== -1) {
        // Si se encuentra "&cadena=", eliminar todo desde ese punto en adelante
        url = url.substring(0, index);
    }
    url = decodeURIComponent(url);
    console.log("URL decodificada:", url);

    return url;
}


// Escuchar el evento 'message' para recibir el mensaje del documento principal
window.addEventListener('message', function(event) {
    // Verificar si el mensaje es del tipo 'get url'
    if (event.data && event.data.type === 'get url') {
        // Obtener la URL actual
        const urlQuirk = obtenerURL();
        console.log("URL actual:", urlQuirk); // Comprobar si la URL se obtiene correctamente
        // Enviar la URL a Django
        enviarURLADjango(urlQuirk);
    }
    else if (event.data && event.data.type === 'edit circuit') {
        // Obtener la URL actual de Quirk
        const urlQuirk = obtenerURL();
        console.log("URL actual de Quirk:", urlQuirk); // Comprobar si la URL se obtiene correctamente
        // Obtener la URL global de Quirk desde quirk.template.html
        let urlGlobalQuirk = window.urlAntesDeCadena;
        urlGlobalQuirk = decodeURIComponent(urlGlobalQuirk);
        console.log("-----------------------------------");
        console.log("URL global decodificada de Quirk:", urlGlobalQuirk); // Comprobar si la URL global se decodifica correctamente
        console.log("URL actual de Quirk:", urlQuirk); // Comprobar si la URL actual se obtiene correctamente
        console.log("-----------------------------------");
        // Comprobar si la URL actual de Quirk es igual a la URL global de Quirk
        if (urlQuirk === urlGlobalQuirk) {
            console.log("La URL actual de Quirk es igual a la URL global de Quirk");
            window.location.href = `http://localhost:3000/mis-circuitos`;
        } else {
                // Obtener la cadena del circuito desde quirk.template.html
                let cadenaCircuito = window.cadenaCircuito;
                console.log("Enviando la cadena global con la URL actual de Quirk a un nuevo endpoint en Quirk");
                console.log("URL actual de Quirk:", urlQuirk); // Agregar este mensaje de registro
                console.log("Cadena de circuito:", cadenaCircuito); // Agregar este mensaje de registro
                console.log("HOLAAAA");
                enviarURLADjangoEditada(urlQuirk, cadenaCircuito);            
        }
    }    
});





function enviarURLADjangoEditada(urlQuirk, cadenaCircuito) {
    console.log("Enviando solicitud para actualizar la URL del circuito...");

    // Obtener la captura de pantalla del canvas
    let canvas = document.getElementById("drawCanvas");
    let canvasDataURL = canvas.toDataURL("image/png");
    console.log("Captura de pantalla del canvas:", canvasDataURL);

    // Crear un objeto JSON para enviar los datos
    var data = JSON.stringify({urlQuirk: urlQuirk, cadenaCircuito: cadenaCircuito, screenshotUrl: canvasDataURL});

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8000/actualizar_url_circuito/", true);
    xhr.setRequestHeader("Content-Type", "application/json");  // Establecer el tipo de contenido como JSON
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log("Datos enviados exitosamente a Django");
                var response = JSON.parse(xhr.responseText);
                if (response.url) {
                    console.log("URL actualizada:", response.url);
                    window.location.href = `http://localhost:3000/mis-circuitos`;
                } else {
                    console.error("Error: No se recibió la URL esperada desde Django");
                    alert("Error al actualizar la URL en el servidor.");
                }
            } else {
                console.error("Error al enviar los datos a Django. Código de estado:", xhr.status);
                alert("Error en la solicitud al servidor.");
            }
        }
    };
    xhr.onerror = function() {
        console.error("Error de red al enviar los datos a Django");
        alert("Error de red al enviar la solicitud al servidor.");
    };
    console.log("Datos enviados:", data);
    xhr.send(data);
}


// function enviarURLADjangoEditada(urlQuirk, cadenaCircuito) {
//     console.log("Enviando solicitud para actualizar la URL del circuito...");
//     var xhr = new XMLHttpRequest();
//     xhr.open("POST", "http://localhost:8000/actualizar_url_circuito/", true);
//     xhr.setRequestHeader("Content-Type", "application/json");  // Establecer el tipo de contenido como JSON
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 console.log("Datos enviados exitosamente a Django");
//                 // Obtener la respuesta de Django
//                 var response = JSON.parse(xhr.responseText);
//                 // Verificar si se recibió la URL y la cadena
//                 if (response.url) {
//                     console.log("URL actualizada:", response.url);
//                     // Si necesitas manejar la respuesta del servidor aquí, puedes hacerlo
//                     window.location.href = `http://localhost:3000/mis-circuitos`;
//                 } else {
//                     console.error("Error: No se recibió la URL esperada desde Django");
//                     // Mensaje de error en el cliente
//                     alert("Error al actualizar la URL en el servidor.");
//                 }
//             } else {
//                 console.error("Error al enviar los datos a Django. Código de estado:", xhr.status);
//                 // Mensaje de error en el cliente
//                 alert("Error en la solicitud al servidor.");
//             }
//         }
//     };
//     xhr.onerror = function() {
//         console.error("Error de red al enviar los datos a Django");
//         // Mensaje de error en el cliente
//         alert("Error de red al enviar la solicitud al servidor.");
//     };
//     var data = JSON.stringify({urlQuirk: urlQuirk, cadenaCircuito: cadenaCircuito}); // Convertir a JSON
//     console.log("Datos enviados:", data);
//     xhr.send(data);
// }

function enviarURLADjango(urlQuirk) {
    // Obtener la captura de pantalla del canvas
    let canvas = document.getElementById("drawCanvas");
    let canvasDataURL = canvas.toDataURL("image/png");
    console.log("Captura de pantalla del canvas:", canvasDataURL);

    // Crear un objeto JSON para enviar los datos
    var data = JSON.stringify({urlQuirk: urlQuirk, screenshotUrl: canvasDataURL});

    // Crear una solicitud AJAX usando XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8000/recibir_url_quirk/", true);
    xhr.setRequestHeader("Content-Type", "application/json");  // Establecer el tipo de contenido como JSON
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log("URL enviada exitosamente a Django");
                // Obtener la respuesta de Django
                var response = JSON.parse(xhr.responseText);
                // Verificar si se recibió la URL
                if (response.url && response.cadena) {
                    console.log("URL con ID:", response.url);
                    // Enviar la cadena a la aplicación de React
                    enviarIDAReact(response.cadena);
                } else {
                    console.error("Error: No se recibió la URL o la cadena esperada desde Django");
                }
            } else {
                console.error("Error al enviar la URL a Django. Código de estado:", xhr.status);
            }
        }
    };
    xhr.onerror = function() {
        console.error("Error de red al enviar la URL a Django");
    };
    // Enviar los datos JSON
    xhr.send(data);
}




// function enviarURLADjango(urlQuirk) {
//     var xhr = new XMLHttpRequest();
//     xhr.open("POST", "http://localhost:8000/recibir_url_quirk/", true);
//     xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 console.log("URL enviada exitosamente a Django");
//                 // Obtener la respuesta de Django
//                 var response = JSON.parse(xhr.responseText);
//                 // Verificar si se recibió la URL
//                 if (response.url && response.cadena) {
//                     console.log("URL con ID:", response.url);
//                     // Enviar la cadena a la aplicación de React
//                     enviarIDAReact(response.cadena);
//                 } else {
//                     console.error("Error: No se recibió la URL o la cadena esperada desde Django");
//                 }
//             } else {
//                 console.error("Error al enviar la URL a Django. Código de estado:", xhr.status);
//             }
//         }
//     };
//     xhr.onerror = function() {
//         console.error("Error de red al enviar la URL a Django");
//     };
//     var data = "urlQuirk=" + encodeURIComponent(urlQuirk);
//     console.log("Datos enviados:", data);
//     xhr.send(data);
// }

function enviarIDAReact(cadena) {
    // Redirigir a la aplicación de React con la cadena concatenada
    window.location.href = `http://localhost:3000/receptor-datos?id=${cadena}`;
}




export {initUrlCircuitSync}
