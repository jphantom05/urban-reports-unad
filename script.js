document.addEventListener('DOMContentLoaded', () => {
    console.log("¡El sistema de Reporte Ciudadano está listo!");

    // Seleccionar todos los enlaces del menú
const enlaces = document.querySelectorAll('.enlace-nav');

// Seleccionar todas las secciones
const secciones = document.querySelectorAll('section');

// Función para ocultar todas las secciones
function ocultarSecciones() {
    secciones.forEach(seccion => {
        seccion.classList.add('oculto');
    });
}

// Evento click en cada enlace
enlaces.forEach(enlace => {
    enlace.addEventListener('click', function(e) {
        e.preventDefault();

        const seccionId = this.getAttribute('data-section');

        // Ocultar todo
        ocultarSecciones();

        // Mostrar la sección correspondiente
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
        }    
    });
});

// BOTÓN "Crear Reporte Ahora"
const btnInicioReporte = document.getElementById('inicio-reporte');

btnInicioReporte.addEventListener('click', function () {
    ocultarSecciones();
    document.getElementById('reporte').classList.remove('oculto');
});
    
});