// js/seccion5.js

const CONFIG_SECCION = {
    seccion: "5. Gestión de información y software",
    siguiente: "seccion6.html", 
    anterior: "seccion4.html", 

    preguntas: [
        {
            id: 38,
            orden: 38,
            texto: "De la siguiente lista, seleccione las herramientas utilizadas para resolver las necesidades de gestión de información de su acervo:",
            tipo: "catalogo_multiple",
            obligatorio: true,
            graficar: true,
            opciones: [
                { id: 381, texto: "Fichas manuales", ayuda: "Registros en papel." },
                { id: 382, texto: "Hojas de cálculo", ayuda: "Excel o similares." },
                { id: 383, texto: "Base de datos local", ayuda: "Software instalado sin internet." },
                { id: 384, texto: "Base de datos en línea", ayuda: "Sistema accesible por web." },
                { id: 385, texto: "Sistema DAM", ayuda: "Gestor especializado." },
                { id: 386, texto: "Repositorio digital", ayuda: "Plataforma oficial." },
                { id: 3899, texto: "Ninguna de las anteriores" }
            ]
        },
        {
            id: 39,
            orden: 39,
            texto: "De las herramientas que seleccionó, indique su nivel de experiencia o dominio en función de las actividades que realiza.",
            ayuda: "Seleccione una actividad de la lista, agréguela a la tabla y califique su nivel.",
            tipo: "matriz_dinamica",
            id_pregunta_origen: 38,
            invertir_ejes: true, 
            obligatorio: true,
            graficar: true,
            modo_incremental: true, 
            columnas: [
                { id: 1, texto: "Inventario", ayuda: "Registro básico con número único identificador de cada pieza u objeto." },
                { id: 2, texto: "Catalogación", ayuda: "Descripción detallada del acervo siguiendo normas y estándares establecidos." },
                { id: 3, texto: "Control de movimientos", ayuda: "Seguimiento de traslados, préstamos, cambios de ubicación y movimientos internos." },
                { id: 4, texto: "Gestión del acervo", ayuda: "Operaciones técnicas y administrativas relacionadas con la organización, preservación y control del acervo." },
                { id: 5, texto: "Listas de obra", ayuda: "Listados generados para exposiciones, préstamos, revisiones o actividades específicas." },
                { id: 6, texto: "Reportes", ayuda: "Informes o listados generados para análisis, revisión interna o toma de decisiones." },
                { id: 7, texto: "Consulta interna", ayuda: "Acceso del personal autorizado para revisar información detallada del acervo." },
                { id: 8, texto: "Consulta pública", ayuda: "Acceso del público general a información seleccionada o aprobada del acervo." },
                { id: 9, texto: "Registro", ayuda: "Documentación formal y sistemática de la información esencial de cada pieza en el acervo." },
                { id: 10, texto: "Diagnóstico de estados de conservación", ayuda: "Evaluación del estado físico de cada pieza, identificación de deterioros y necesidades de conservación." },
                { id: 11, texto: "Investigación", ayuda: "Uso del acervo con fines académicos, técnicos, científicos o de investigación especializada." },
                { id: 12, texto: "Otro", especificar: true, ayuda: "Cualquier otro uso no contemplado en la lista que pueda definirse según las necesidades de la institución." }
            ]
        },
        {
            id: 40,
            orden: 40,
            texto: "Porcentaje del acervo disponible en linea",
            ayuda: "Indique qué porcentaje del acervo cuenta con un registro consultable públicamente en un catálogo o plataforma en línea.",
            tipo: "catalogo_unico",
            obligatorio: true, 
            graficar: true,
            puntaje_regla: "escala_directa", 
            opciones: [
                { id: 1, texto: "De 1 a 20%" },
                { id: 2, texto: "De 21 a 40%" },
                { id: 3, texto: "De 41 a 60%" },
                { id: 4, texto: "De 61 a 80%" },
                { id: 5, texto: "De 81 a 100%" }
            ]
        }

    ]
};

// =========================================================
// LÓGICA DE BLOQUEO VISUAL SECCIÓN 5
// =========================================================

function bloquearMatrizSiNinguna() {
    const ID_NINGUNA = 3899;
    const checkNinguna = document.querySelector(`input[value="${ID_NINGUNA}"][data-id-pregunta="38"]`);
    
    // Buscamos el contenedor de la Matriz (Pregunta 39)
    let contenedorMatriz = document.getElementById('pregunta-container-39');
    
    if (!contenedorMatriz) {
        const inputMatriz = document.querySelector('[data-id-pregunta="39"]');
        if (inputMatriz) {
            contenedorMatriz = inputMatriz.closest('.card') || inputMatriz.closest('.mb-4');
        }
    }

    if (contenedorMatriz && checkNinguna) {
        if (checkNinguna.checked) {
            // === MODO BLOQUEO ===
            // 1. Bloquear clics (Nadie puede seleccionar nada)
            contenedorMatriz.style.pointerEvents = 'none';
            // 2. Hacerla transparente para indicar que está deshabilitada
            contenedorMatriz.style.opacity = '0.4';
            contenedorMatriz.style.filter = 'grayscale(100%)'; // Opcional: ponerla en gris
            
            // 3. Deshabilitar inputs internos (Doble seguridad)
            const inputsInternos = contenedorMatriz.querySelectorAll('input');
            inputsInternos.forEach(input => input.disabled = true);

        } else {
            // === MODO DESBLOQUEO ===
            // Restaurar interactividad si selecciona otra cosa
            const hayOtras = document.querySelectorAll('input[type="checkbox"][data-id-pregunta="38"]:checked').length > 0;
            
            if (hayOtras) {
                contenedorMatriz.style.pointerEvents = 'auto';
                contenedorMatriz.style.opacity = '1';
                contenedorMatriz.style.filter = 'none';
                
                const inputsInternos = contenedorMatriz.querySelectorAll('input');
                inputsInternos.forEach(input => input.disabled = false);
            } else {
                // Si no hay nada seleccionado, mejor la ocultamos visualmente (opcional)
                contenedorMatriz.style.display = 'none';
            }
        }
    }
}

document.addEventListener('change', function(e) {
    // Detectamos cambios en la pregunta 38
    if (e.target.type === 'checkbox' && e.target.getAttribute('data-id-pregunta') === '38') {

        const checkboxClickeado = e.target;
        const valor = parseInt(checkboxClickeado.value);
        const ID_NINGUNA = 3899; 
        const grupoCheckboxes = document.querySelectorAll('input[type="checkbox"][data-id-pregunta="38"]');

        // --- 1. LÓGICA DE EXCLUSIVIDAD (Igual que antes) ---
        if (valor === ID_NINGUNA && checkboxClickeado.checked) {
            grupoCheckboxes.forEach(cb => {
                if (parseInt(cb.value) !== ID_NINGUNA) {
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change', { bubbles: true })); 
                }
            });
        }

        if (valor !== ID_NINGUNA && checkboxClickeado.checked) {
            grupoCheckboxes.forEach(cb => {
                if (parseInt(cb.value) === ID_NINGUNA) {
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }

        // --- 2. EJECUTAR EL BLOQUEO ---
        // Lo ejecutamos con varios retrasos para asegurar que, 
        // aunque se dibuje la tabla, inmediatamente la bloqueemos.
        bloquearMatrizSiNinguna();
        setTimeout(bloquearMatrizSiNinguna, 100);
        setTimeout(bloquearMatrizSiNinguna, 300);
        setTimeout(bloquearMatrizSiNinguna, 500);
    }
});

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(bloquearMatrizSiNinguna, 200);
});