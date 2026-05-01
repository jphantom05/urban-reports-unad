import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    console.log("¡El sistema de Reporte Ciudadano está listo!");

    // NAV
    const enlaces = document.querySelectorAll('.enlace-nav');
    const secciones = document.querySelectorAll('section');

    function ocultarSecciones() {
        secciones.forEach(seccion => {
            seccion.classList.add('oculto');
        });
    }

    enlaces.forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            e.preventDefault();

            const seccionId = this.getAttribute('data-section');

            ocultarSecciones();

            if (seccionId === "inicio") {
                document.getElementById('inicio').classList.remove('oculto');
            } 
            else if (seccionId === "reportar") {
                document.getElementById('reporte').classList.remove('oculto');
            } 
            else if (seccionId === "consultar") {
                document.getElementById('consultar').classList.remove('oculto');
            } 
            else if (seccionId === "admin") {
                document.getElementById('admin').classList.remove('oculto');
                cargarReportesAdmin();
            }    
        });
    });

    // BOTÓN INICIO
    const btnInicioReporte = document.getElementById('inicio-reporte');

    if (btnInicioReporte) {
        btnInicioReporte.addEventListener('click', function () {
            ocultarSecciones();
            document.getElementById('reporte').classList.remove('oculto');
        });
    }

    // FORMULARIO
    const form = document.getElementById("formulario-reporte");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const tipo = document.getElementById("tipoNovedad").value;
            const ubicacion = document.getElementById("ubicacion").value;
            const descripcion = document.getElementById("descripcion").value;
            const nombre = document.getElementById("nombreUsuario").value;
            const contacto = document.getElementById("contacto").value;

            // GENERAR CÓDIGO
            const codigo = "RPT-" + Math.floor(1000 + Math.random() * 9000);

            try {
                await addDoc(collection(window.db, "reportes"), {
                    codigo,
                    tipo,
                    ubicacion,
                    descripcion,
                    nombre: nombre || null,
                    contacto: contacto || null,
                    estado: "pendiente",
                    fecha: new Date().toISOString()
                });

                // copiar código
                navigator.clipboard.writeText(codigo);

                // mostrar mensaje bonito
                mostrarMensaje("✅ Reporte enviado. Código: " + codigo);

                // limpiar formulario
                form.reset();

            } catch (error) {
                console.error("Error:", error);
                alert("Error al guardar");
            }
        });
    }

});

// MENSAJE 
function mostrarMensaje(texto) {
    const contenedor = document.getElementById("mensaje-exito");
    const textoMensaje = document.getElementById("texto-mensaje");

    if (contenedor && textoMensaje) {
        textoMensaje.innerText = texto;
        contenedor.classList.remove("oculto");
    }
}

// cerrar mensaje
window.cerrarMensaje = function() {
    const contenedor = document.getElementById("mensaje-exito");
    if (contenedor) {
        contenedor.classList.add("oculto");
    }
};

//  BUSCAR REPORTE
const btnBuscar = document.getElementById("btnBuscar");

if (btnBuscar) {
    btnBuscar.addEventListener("click", async () => {

        const codigoBuscado = document.getElementById("idReporte").value.trim();

        if (!codigoBuscado) {
            alert("Ingresa un código");
            return;
        }

        try {
            const querySnapshot = await getDocs(collection(window.db, "reportes"));

            let encontrado = null;

            querySnapshot.forEach(doc => {
                const data = doc.data();

                if (data.codigo === codigoBuscado) {
                    encontrado = data;
                }
            });

            if (encontrado) {
                document.getElementById("resultadoId").textContent = encontrado.codigo;
                document.getElementById("resultadoTipo").textContent = encontrado.tipo;
                document.getElementById("resultadoUbicacion").textContent = encontrado.ubicacion;
                document.getElementById("resultadoEstado").textContent = encontrado.estado;
                document.getElementById("resultadoFecha").textContent = encontrado.fecha;
                document.getElementById("descripcionReporte").textContent = encontrado.descripcion;
                document.getElementById("resultadoNombre").textContent = encontrado.nombre || "No aplica";
                document.getElementById("resultadoContacto").textContent = encontrado.contacto || "No aplica";

            } else {
                alert("No se encontró el reporte ❌");
            }

        } catch (error) {
            console.error(error);
            alert("Error al buscar");
        }
    });
}

//  CARGAR REPORTES ADMIN
async function cargarReportesAdmin() {

    const tabla = document.getElementById("cuerpo-tabla-reportes");

    if (!tabla) return;

    tabla.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(window.db, "reportes"));

        querySnapshot.forEach(doc => {

            const data = doc.data();

            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${data.codigo}</td>
                <td>${data.fecha}</td>
                <td>${data.tipo}</td>
                <td>${data.ubicacion}</td>
                <td>${data.estado}</td>
                <td>
                    <button onclick="cambiarEstado('${doc.id}')">Cambiar</button>
                    <button onclick="eliminarReporte('${doc.id}')">Eliminar</button>
                </td>
            `;

            tabla.appendChild(fila);
        });

    } catch (error) {
        console.error(error);
    }
}