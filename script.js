import { 
    collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc 
} 
from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";
let adminLogueado = false;

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

    function abrirAdmin() {
    ocultarSecciones();

    const admin = document.getElementById('admin');
    admin.classList.remove('oculto');

    console.log("Cargando admin...");

    setTimeout(() => {
        cargarReportesAdmin();
    }, 50);
}

function mostrarLoginAdmin() {

    if (adminLogueado) {
        abrirAdmin();
        return;
    }

    const usuario = prompt("Usuario administrador:");
    const clave = prompt("Contraseña:");

    if (usuario === ADMIN_USER && clave === ADMIN_PASS) {

        adminLogueado = true;
        abrirAdmin();

    } else {
        alert("Acceso denegado ❌");
    }
}


const btnCerrarSesion = document.getElementById("btnCerrarSesion");

if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {

        adminLogueado = false;

        ocultarSecciones();

        document.getElementById("inicio").classList.remove("oculto");

        console.log("Sesión cerrada");
    });
}


    enlaces.forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            e.preventDefault();

            const seccionId = this.getAttribute('data-section');

            ocultarSecciones();

            if (seccionId === "admin") {
            e.preventDefault();
            mostrarLoginAdmin();
            return;
        }

            if (seccionId === "inicio") {
                document.getElementById('inicio').classList.remove('oculto');
            } 
            else if (seccionId === "reportar") {
                document.getElementById('reporte').classList.remove('oculto');
            } 
            else if (seccionId === "consultar") {
                document.getElementById('consultar').classList.remove('oculto');
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
            const autorizacion = document.getElementById("autorizacionDatos").checked;

            // VALIDACIÓN
            if ((nombre || contacto) && !autorizacion) {
                alert("Debes autorizar el tratamiento de datos para enviar información personal");
                return;
            }

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
            fila.id = `fila-${doc.id}`;

            fila.innerHTML = `
                <td>${data.codigo}</td>
                <td>${data.fecha}</td>
                <td>${data.tipo}</td>
                <td>${data.ubicacion}</td>
                <td>${data.estado}</td>
                <td>
                    <button onclick="verDetalle('${doc.id}')">Ver detalle</button>
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

// ELIMINAR REPORTE
window.eliminarReporte = async function(id) {

    const confirmar = confirm("¿Eliminar este reporte?");

    if (!confirmar) return;

    try {
        await deleteDoc(doc(window.db, "reportes", id));

        alert("Reporte eliminado ✅");

        // recargar tabla
        cargarReportesAdmin();

    } catch (error) {
        console.error(error);
        alert("Error al eliminar");
    }
};

//  CAMBIAR ESTADO
window.cambiarEstado = async function(id) {

    const opcion = prompt(
        "Nuevo estado:\n1. Pendiente\n2. En Proceso\n3. Solucionado"
    );

    let nuevoEstado = "";

    if (opcion === "1") nuevoEstado = "pendiente";
    else if (opcion === "2") nuevoEstado = "en proceso";
    else if (opcion === "3") nuevoEstado = "solucionado";
    else {
        alert("Opción inválida");
        return;
    }

    try {
        await updateDoc(doc(window.db, "reportes", id), {
            estado: nuevoEstado
        });

        alert("Estado actualizado ✅");

        // recargar tabla
        cargarReportesAdmin();

    } catch (error) {
        console.error(error);
        alert("Error al actualizar");
    }
};

//ver detalles
window.verDetalle = async function(id) {

    const fila = document.getElementById(`fila-${id}`);
    if (!fila) return;

    // cerrar otro abierto
    document.querySelectorAll("[id^='detalle-']").forEach(el => el.remove());

    // si ya estaba abierto, solo cerramos y salimos
    const existente = document.getElementById(`detalle-${id}`);
    if (existente) {
        existente.remove();
        return;
    }

    const docSnap = await getDoc(doc(window.db, "reportes", id));

    if (!docSnap.exists()) return;

    const data = docSnap.data();

    const detalle = document.createElement("tr");
    detalle.id = `detalle-${id}`;

    detalle.innerHTML = `
        <td colspan="6">
            <div style="padding:10px; background:#f5f5f5;">
                <p><strong>Tipo:</strong> ${data.tipo}</p>
                <p><strong>Ubicación:</strong> ${data.ubicacion}</p>
                <p><strong>Estado:</strong> ${data.estado}</p>
                <p><strong>Descripción:</strong> ${data.descripcion}</p>
                <p><strong>Nombre:</strong> ${data.nombre || "No aplica"}</p>
                <p><strong>Contacto:</strong> ${data.contacto || "No aplica"}</p>
            </div>
        </td>
    `;

    fila.insertAdjacentElement("afterend", detalle);
};



