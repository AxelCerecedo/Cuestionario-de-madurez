// js/seccion4.js

const CONFIG_SECCION = {
    seccion: "4. Inventario, catalogación y documentación",
    siguiente: "seccion5.html", 
    anterior: "seccion3.html", 

    preguntas: [

        // --- SUBSECCIÓN 4.1 ---
        {
            id: 300, // ID virtual solo para mostrar título
            tipo: "titulo_subseccion",
            texto: "4.1 Inventario"
        },
        {
            id: 29,
            orden: 29,
            texto: "Porcentaje del acervo inventariado",
            ayuda: "Inventariado significa que cada ítem del acervo cuenta con un número de identificación único y está registrado en una lista o sistema que permite saber qué objetos existen y dónde se encuentran.",
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
        },
        

        // --- SUBSECCIÓN 4.2 ---
        {
            id: 30,
            orden: 30,
            texto: "Porcentaje del acervo catalogado",
            ayuda: "Catalogado significa que cada ítem cuenta con información técnica y descriptiva completa siguiendo reglas o estándares de catalogación.",
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
        },
        {
            id: 31,
            orden: 31,
            texto: "Reglas de catalogación utilizadas (marcar):",
            ayuda: "Son normas o estándares para describir y organizar el acervo (ej. ISAD-G, MARC21, NMX, Object ID). Seleccione todas las que utilice su institución.",
            tipo: "catalogo_multiple",
            obligatorio: true, 
            graficar: true, 
            opciones: [
                { id: 1, texto: "MARC21" },
                { id: 2, texto: "ISAD(G)" },
                { id: 3, texto: "ISBD" },
                { id: 4, texto: "Norma Mexicana: NMX-R-069-SCFI-2016" },
                { id: 5, texto: "RDA" },
                { id: 6, texto: "CCO" },
                { id: 5, texto: "Object ID" },
                { id: 5, texto: "VRA Core" },
                { id: 6, texto: "Otro", especificar: true },
                { id: 99, texto: "Ninguna de las anteriores" } // ID 99 para lógica de limpieza
                
            ]
        },
        {
            id: 32,
            orden: 32,
            texto: "Nivel de dominio del personal en las reglas empleadas",
            tipo: "catalogo_unico", 
            obligatorio: true, 
            graficar: true,
            puntaje_regla: "escala_directa",
            opciones: [
                { id: 1, texto: "Inexperto", ayuda: "Persona que desconoce o comprende muy superficialmente las reglas. Requiere guía constante, puede cometer errores frecuentes y no es capaz de aplicarlas de manera autónoma." },
                { id: 2, texto: "Nivel Básico", ayuda: "Persona que conoce las reglas fundamentales y puede aplicarlas en situaciones simples. Aún requiere supervisión o apoyo en casos no rutinarios, pero comprende la estructura general y evita errores básicos." },
                { id: 3, texto: "Nivel intermedio", ayuda: "Persona que aplica las reglas con autonomía en situaciones complejas, anticipa errores, toma decisiones fundamentadas y brinda apoyo técnico a otros para mejorar los procesos." },
                { id: 4, texto: "Nivel avanzado", ayuda: "Persona que domina la mayoría de las reglas y puede aplicarlas con autonomía en situaciones comunes y algunas complejas. Resuelve problemas habituales, identifica errores y puede orientar a personal menos experimentado." },
                { id: 5, texto: "Experto", ayuda: "Persona que conoce profundamente las reglas, incluyendo excepciones y escenarios complejos. Puede interpretarlas, adaptarlas cuando es necesario, proponer mejoras a los procesos, brindar capacitación y servir como referencia técnica para los demás." }
            ]
        },

        {
            id: 33,
            orden: 33,
            texto: "Unidad de descripción usada:",
            tipo: "catalogo_unico", 
            obligatorio: false, 
            graficar: true,
            opciones: [
                { id: 1, texto: "Por fotografía (UDS)" },
                { id: 2, texto: "Unidad documental compuesta (UDC)" },
                { id: 3, texto: "Ambas" },
                { id: 99, texto: "Ninguna de las anteriores" }, // ID 99 para lógica de limpieza
            ]
        },
        

        // --- SUBSECCIÓN 4.3 ---
        {
            id: 302,
            tipo: "titulo_subseccion",
            texto: "4.3 Digitalización"
        },
        {
            id: 34,
            orden: 34,
            texto: "Porcentaje del acervo digitalizado",
            ayuda: "Digitalizado significa que el ítem tiene una copia digital generada bajo parámetros técnicos adecuados.",
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
        },

        {
            id: 35,
            orden: 35,
            texto: "Métodos de resguardo digital (marcar los que aplique):",
            tipo: "catalogo_multiple",
            obligatorio: true, 
            graficar: true, 
            opciones: [
                { id: 1, texto: "Computadora" },
                { id: 2, texto: "Unidades externas (discos duros, USB, CD, etc.)" },
                { id: 3, texto: "Nube gratuita" },
                { id: 4, texto: "Nube de pago" },
                { id: 5, texto: "Servidor / NAS" },
                { id: 6, texto: "Sistema DAM" },
                { id: 7, texto: "Repositorio digital" },
                { id: 99, texto: "Ninguna de las anteriores" }, // ID 99 para lógica de limpieza
            ]
        },
        {
            id: 36,
            orden: 36,
            texto: "Digitalización que realiza la institución (marcar los que aplique):",
            tipo: "catalogo_multiple",
            obligatorio: false, 
            graficar: true, 
            opciones: [
                { id: 1, texto: "Digitalización por escaneo" },
                { id: 2, texto: "Digitalización por registro fotogáfico (reprografía)" },
                { id: 3, texto: "Plan de digitalización escrito" },
                { id: 4, texto: "Plan de digitalización para conservación" },
                { id: 5, texto: "Digitalización bajo demanda" }
            ]
        },

        {
            id: 37,
            orden: 37,
            texto: "Calidad de la digitalización (estándares, formato, resolución) [marcar los que aplique]:",
            tipo: "catalogo_multiple",
            obligatorio: true, 
            graficar: true, 
            puntaje_regla: "escala_directa",
            opciones: [
                { id: 1, texto: "No se digitaliza", },
                { id: 2, texto: "Sin estándar ", ayuda: "Formatos no estables, resolución variada" },
                { id: 3, texto: "Estándar básico", ayuda: "JPEG, 300 dpi aproximadamente, uso para consulta" },
                { id: 4, texto: "Estándar intermedio", ayuda: "TIFF/JPEG de alta calidad, 300-600 dpi, color controlado)" },
                { id: 5, texto: "Estándar de preservación", ayuda: "TIFF/RAW sin compresión, 600+ dpi, control de color, metadatos técnicos)" }
            ]
        }
        
    ]
};

// =========================================================
// LÓGICA DE EXCLUSIVIDAD PARA PREGUNTA 37 (VERSIÓN ROBUSTA)
// =========================================================
document.addEventListener('change', function(e) {
    // 1. Verificamos que sea un checkbox
    if (e.target.type !== 'checkbox') return;

    // 2. Buscamos si este checkbox está dentro del contenedor de la pregunta 37
    // Buscamos hacia arriba un div que tenga algo que ver con la pregunta 37
    // (Generalmente los generadores ponen IDs como "pregunta-container-37" o similar)
    // O verificamos si el nombre del input contiene "37"
    const nombreInput = e.target.name || '';
    const idInput = e.target.id || '';

    // Si el nombre o el ID contiene "37", asumimos que es de esta pregunta
    if (nombreInput.includes('37') || idInput.includes('37')) {

        const checkboxClickeado = e.target;
        const valor = parseInt(checkboxClickeado.value);

        // Obtenemos TODOS los checkboxes que compartan el mismo nombre (sean del mismo grupo)
        const grupoCheckboxes = document.querySelectorAll(`input[name="${nombreInput}"]`);

        // CASO A: Se marcó "No se digitaliza" (ID 1)
        if (valor === 1 && checkboxClickeado.checked) {
            // Desmarcar todos los demás
            grupoCheckboxes.forEach(cb => {
                if (parseInt(cb.value) !== 1) {
                    cb.checked = false;
                }
            });
        }

        // CASO B: Se marcó cualquier otra opción (IDs 2, 3, 4, 5)
        if (valor !== 1 && checkboxClickeado.checked) {
            // Desmarcar "No se digitaliza" (ID 1)
            grupoCheckboxes.forEach(cb => {
                if (parseInt(cb.value) === 1) {
                    cb.checked = false;
                }
            });
        }
    }
});