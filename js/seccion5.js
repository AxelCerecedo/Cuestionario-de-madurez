// js/seccion5.js

const CONFIG_SECCION = {
    seccion: "5. Gestión de información y software",
    siguiente: "seccion6.html", 
    anterior: "seccion4.html", 

    preguntas: [
        {
            id: 38,
            orden: 37,
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
            orden: 38,
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
            orden: 39,
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
// LÓGICA DE VISIBILIDAD SECCIÓN 5 (CORREGIDA Y ROBUSTA)
// =========================================================

function gestionarLogicaPregunta38() {
    const ID_NINGUNA = '3899'; // El ID de la opción "Ninguna"
    
    // 1. Identificar el Checkbox "Ninguna"
    const checkNinguna = document.querySelector(`input[value="${ID_NINGUNA}"][data-id-pregunta="38"]`);
    
    // 2. Verificar si hay otras opciones seleccionadas (diferentes a ninguna)
    const otrasSeleccionadas = document.querySelectorAll(`input[type="checkbox"][data-id-pregunta="38"]:checked:not([value="${ID_NINGUNA}"])`);
    
    // 3. Buscar el contenedor de la Matriz (Pregunta 39)
    // Intentamos buscar por el ID de la caja de la pregunta (generado en encuesta.js)
    let divMatriz = document.getElementById('pregunta-box-39');
    
    // Fallback: Si no encuentra por ID, busca por estructura (para asegurar compatibilidad)
    if (!divMatriz) {
        const tabla = document.getElementById('matriz_39');
        if (tabla) {
            divMatriz = tabla.closest('.pregunta-box') || tabla.closest('.card') || tabla.parentElement;
        }
    }

    if (divMatriz) {
        // --- ESCENARIO A: OCULTAR LA MATRIZ ---
        // Si "Ninguna" está marcada O si no se ha seleccionado nada todavía.
        if ((checkNinguna && checkNinguna.checked) || otrasSeleccionadas.length === 0) {
            
            // 1. Ocultar visualmente por completo
            divMatriz.style.display = 'none'; 
            
            // 2. DESACTIVAR inputs (CRÍTICO: Esto hace que la validación obligatoria se salte)
            divMatriz.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
        } 
        
        // --- ESCENARIO B: MOSTRAR LA MATRIZ ---
        // Si hay herramientas seleccionadas y NO es "Ninguna"
        else {
            divMatriz.style.display = 'block'; 
            
            // Reactivar inputs para que el usuario pueda contestar
            divMatriz.querySelectorAll('input, select, button').forEach(el => el.disabled = false);
        }
    }
}

// Listener para detectar cambios en tiempo real
document.addEventListener('change', function(e) {
    // Solo nos interesa la pregunta 38
    if (e.target.type === 'checkbox' && e.target.getAttribute('data-id-pregunta') === '38') {
        
        const checkbox = e.target;
        const ID_NINGUNA = '3899';
        const todosChecks = document.querySelectorAll('input[type="checkbox"][data-id-pregunta="38"]');

        // LÓGICA DE EXCLUSIVIDAD (Igual que tenías, pero optimizada)
        // Si marcas 'Ninguna', desmarca todas las demás
        if (checkbox.value === ID_NINGUNA && checkbox.checked) {
            todosChecks.forEach(cb => {
                if (cb.value !== ID_NINGUNA) {
                    cb.checked = false;
                    // Disparamos evento change para actualizar visualmente si es necesario
                    cb.dispatchEvent(new Event('change', { bubbles: false })); 
                }
            });
        } 
        // Si marcas cualquier otra, desmarca 'Ninguna'
        else if (checkbox.value !== ID_NINGUNA && checkbox.checked) {
            const checkNinguna = document.querySelector(`input[value="${ID_NINGUNA}"][data-id-pregunta="38"]`);
            if (checkNinguna && checkNinguna.checked) {
                checkNinguna.checked = false;
            }
        }

        // Ejecutar la lógica de visibilidad inmediatamente
        gestionarLogicaPregunta38();
    }
});

// Ejecutar al cargar la página (por si el usuario regresa a editar y ya traía datos)
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño retardo para dar tiempo a que se dibuje el HTML de la matriz
    setTimeout(gestionarLogicaPregunta38, 200);
});