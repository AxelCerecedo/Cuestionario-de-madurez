// js/seccion5.js

const CONFIG_SECCION = {
    seccion: "5. Gestión de información y software",
    siguiente: "seccion6.html", 
    anterior: "seccion4.html", 

    preguntas: [
        {
            id: 38,
            orden: 38,
            texto: "De la siguiente lista de herramientas, seleccione las que usa para gestionar la información de su acervo para la gestión de información:",
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
            texto: "De las herramientas que seleccionó, indique su nivel de experiencia o dominio en función de las siguientes actividades.",
            ayuda: "Donde Inexperto = 1, Nivel básico = 2, Nivel intermedio = 3, Nivel avanzado = 4, Experto = 5",
            tipo: "matriz_dinamica",
            id_pregunta_origen: 38,
            invertir_ejes: true, 
            obligatorio: true,
            graficar: true,
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
// LÓGICA ESPECIAL SECCIÓN 5:
// 1. Exclusividad de "Ninguna de las anteriores"
// 2. Ocultar la Matriz (P39) si se marca "Ninguna"
// =========================================================
document.addEventListener('change', function(e) {
    
    // Detectamos cambios SOLO en la pregunta 38
    if (e.target.type === 'checkbox' && e.target.getAttribute('data-id-pregunta') === '38') {

        const checkboxClickeado = e.target;
        const valor = parseInt(checkboxClickeado.value);
        const ID_NINGUNA = 3899; // El ID de "Ninguna de las anteriores"

        // Obtenemos todos los checkboxes de la pregunta 38
        const grupoCheckboxes = document.querySelectorAll('input[type="checkbox"][data-id-pregunta="38"]');

        // --- 1. LÓGICA DE EXCLUSIVIDAD (Limpieza de checks) ---
        
        // CASO A: Se marcó "Ninguna"
        if (valor === ID_NINGUNA && checkboxClickeado.checked) {
            grupoCheckboxes.forEach(cb => {
                if (parseInt(cb.value) !== ID_NINGUNA) {
                    cb.checked = false; // Desmarcar las demás
                }
            });
        }

        // CASO B: Se marcó cualquier otra opción
        if (valor !== ID_NINGUNA && checkboxClickeado.checked) {
            grupoCheckboxes.forEach(cb => {
                if (parseInt(cb.value) === ID_NINGUNA) {
                    cb.checked = false; // Desmarcar "Ninguna"
                }
            });
        }

        // --- 2. LÓGICA VISUAL: ¿MOSTRAMOS LA PREGUNTA 39? ---
        
        // Verificamos si "Ninguna" quedó marcada después de la lógica anterior
        const checkNinguna = document.querySelector(`input[value="${ID_NINGUNA}"][data-id-pregunta="38"]`);
        const estaNingunaMarcada = checkNinguna ? checkNinguna.checked : false;

        // Buscamos el contenedor visual de la Pregunta 39 para ocultarlo
        // (Intentamos varios métodos para asegurar que lo encuentre)
        let contenedorMatriz = document.getElementById('pregunta-container-39');
        
        // Si no tiene ID directo, buscamos por el atributo data-id dentro de un card
        if (!contenedorMatriz) {
            const inputMatriz = document.querySelector('[data-id-pregunta="39"]');
            if (inputMatriz) {
                contenedorMatriz = inputMatriz.closest('.card') || inputMatriz.closest('.mb-4');
            }
        }

        if (contenedorMatriz) {
            if (estaNingunaMarcada) {
                // Si "Ninguna" está marcada -> OCULTAMOS la matriz completa
                // Esto evita que se genere la columna y limpia la interfaz
                contenedorMatriz.style.display = 'none';
                
                // OPCIONAL: Limpiar los inputs de la matriz por si acaso había algo escrito antes
                const inputsMatriz = contenedorMatriz.querySelectorAll('input');
                inputsMatriz.forEach(inp => {
                    if(inp.type === 'radio' || inp.type === 'checkbox') inp.checked = false;
                    if(inp.type === 'text' || inp.type === 'number') inp.value = '';
                });

            } else {
                // Si hay otras opciones marcadas -> MOSTRAMOS la matriz
                // (Pero validamos que haya ALGO marcado para no mostrarla vacía)
                const hayAlgunaMarcada = Array.from(grupoCheckboxes).some(cb => cb.checked);
                
                if (hayAlgunaMarcada) {
                    contenedorMatriz.style.display = 'block';
                } else {
                    // Si no hay nada marcado (ni ninguna ni otras), también ocultamos
                    contenedorMatriz.style.display = 'none';
                }
            }
        }
    }
});