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
                { id: 1, texto: "Inventario" },
                { id: 2, texto: "Catalogación" },
                { id: 3, texto: "Control de movimientos" },
                { id: 4, texto: "Gestión del acervo" },
                { id: 5, texto: "Listas de obra" },
                { id: 6, texto: "Reportes" },
                { id: 7, texto: "Consulta interna" },
                { id: 8, texto: "Consulta pública" },
                { id: 9, texto: "Registro" },
                { id: 10, texto: "Diagnóstico de estados de conservación" },
                { id: 11, texto: "Investigación" },
                { id: 12, texto: "Otro", especificar: true }
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
// 🛡️ LÓGICA DE PROTECCIÓN (MONITOR CONSTANTE)
// =========================================================

// 1. Manejo del click (Exclusividad: Si marco Ninguna, borro las otras)
document.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox' && e.target.getAttribute('data-id-pregunta') === '38') {
        
        const checkbox = e.target;
        const valor = parseInt(checkbox.value);
        const ID_NINGUNA = 3899;
        const grupo = document.querySelectorAll('input[type="checkbox"][data-id-pregunta="38"]');

        // A. Si marqué Ninguna -> Borrar las demás
        if (valor === ID_NINGUNA && checkbox.checked) {
            grupo.forEach(cb => {
                if (parseInt(cb.value) !== ID_NINGUNA) {
                    cb.checked = false;
                    // Avisamos a encuesta.js que hubo un cambio
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }

        // B. Si marqué Otra -> Borrar Ninguna
        if (valor !== ID_NINGUNA && checkbox.checked) {
            grupo.forEach(cb => {
                if (parseInt(cb.value) === ID_NINGUNA) {
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
    }
});

// 2. EL MARTILLO: Monitor que se ejecuta 10 veces por segundo
// Este código revisa constantemente si "Ninguna" está marcada y fuerza el ocultamiento de la tabla.
setInterval(() => {
    const ID_NINGUNA = 3899;
    
    // Buscamos el checkbox de "Ninguna"
    const checkNinguna = document.querySelector(`input[value="${ID_NINGUNA}"][data-id-pregunta="38"]`);
    
    // Buscamos el contenedor de la matriz (Pregunta 39)
    let contenedorMatriz = document.getElementById('pregunta-container-39');
    
    // Si no lo encuentra por ID, intenta buscarlo por atributo
    if (!contenedorMatriz) {
        const inputMatriz = document.querySelector('[data-id-pregunta="39"]');
        if (inputMatriz) {
            contenedorMatriz = inputMatriz.closest('.card') || inputMatriz.closest('.mb-4');
        }
    }

    if (contenedorMatriz && checkNinguna) {
        if (checkNinguna.checked) {
            // SI ESTÁ MARCADA "NINGUNA":
            // Forzamos ocultar con máxima prioridad.
            // Aunque encuesta.js intente mostrarla, esto la volverá a ocultar en milisegundos.
            contenedorMatriz.style.setProperty('display', 'none', 'important');
        } else {
            // SI NO ESTÁ MARCADA "NINGUNA":
            // Verificamos si hay ALGO más marcado
            const hayOtras = document.querySelectorAll('input[type="checkbox"][data-id-pregunta="38"]:checked').length > 0;
            
            if (hayOtras) {
                // Si hay otras opciones, dejamos que se vea
                // (Solo quitamos el none si nosotros lo pusimos, respetando el display original)
                if (contenedorMatriz.style.display === 'none') {
                    contenedorMatriz.style.display = 'block';
                }
            } else {
                // Si no hay nada marcado, ocultamos
                contenedorMatriz.style.setProperty('display', 'none', 'important');
            }
        }
    }
}, 100); // Se ejecuta cada 100ms