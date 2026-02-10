// js/seccion6.js

const CONFIG_SECCION = {
    seccion: "6. Recursos humanos",
    siguiente: "seccion7.html", 
    anterior: "seccion5.html", 

    preguntas: [
        {
            id: 41,
            orden: 40,
            texto: "Número total de personas que trabajan en el archivo/acervo.",
            tipo: "numero",
            obligatorio: true,
            graficar: false
        },
        {
            id: 42,
            orden: 41,
            texto: "Antigüedad promedio del personal",
            tipo: "catalogo_unico",
            obligatorio: false,
            graficar: true,
            opciones: [
                { id: 1, texto: "0-2 años" },
                { id: 2, texto: "3-5 años" },
                { id: 3, texto: "6-10 años" },
                { id: 4, texto: "11-20 años" },
                { id: 5, texto: "Más de 20 años" }
            ]
        },
        {
            id: 43,
            orden: 42,
            texto: "Nivel educativo del personal (Seleccione los que apliquen)",
            tipo: "catalogo_tabla",
            obligatorio: false,
            graficar: true,
            opciones: [
                { id: 1, texto: "Nivel básico", ayuda: "Incluye estudios de educación primaria y secundaria..." },
                { id: 2, texto: "Nivel medio superior", ayuda: "Comprende el bachillerato o preparatoria..." },
                { id: 3, texto: "Nivel superior", ayuda: "Incluye estudios profesionales de nivel universitario..." },
                { id: 4, texto: "Posgrado", ayuda: "Abarca estudios especializados posteriores..." },
            ]
        },
        // --- PREGUNTA DETONADORA ---
        {
            id: 44, 
            orden: 43,
            texto: "¿Cuenta con plan de capacitación?",
            tipo: "booleano",
            obligatorio: true, // Debe ser obligatoria para saber si mostrar las otras
            graficar: true,
            opciones: [
                { id: 1, texto: "Sí" },
                { id: 0, texto: "No" }
            ]
        },
        // --- PREGUNTA DEPENDIENTE 1 ---
        {
            id: 45,
            orden: 44,
            texto: "Capacitación recibida (marcar todos los que correspondan):",
            tipo: "catalogo_multiple",
            obligatorio: true,
            graficar: true,
            
            // AGREGAMOS ESTA CONDICIÓN
            condicion: { pregunta: 44, valor: 1 }, 

            opciones: [
                { id: 1, texto: "Archivística [clasificación, ordenación, descripción]" },
                { id: 2, texto: "Catalogación" },
                { id: 3, texto: "Fotografía / historia de la fotografía" },
                { id: 4, texto: "Conservación preventiva" },
                { id: 5, texto: "Restauración" },
                { id: 6, texto: "Digitalización/Reprografía" },
                { id: 7, texto: "Cómputo, herramientas digitales o bases de datos" },
                { id: 8, texto: "Historia / arte" },
                { id: 9, texto: "Manipulación física del material del acervo" }, // Corregí el error de dedo "Manipulacón"
                { id: 10, texto: "Otro", especificar: true }
            ]
        },
        // --- PREGUNTA DEPENDIENTE 2 ---
        {
            id: 46,
            orden: 45,
            texto: "¿Con qué frecuencia recibe capacitación relacionada con sus funciones?",
            ayuda: "Para cada tema seleccionado arriba, marque la frecuencia correspondiente.",
            tipo: "matriz_dinamica", 
            modo: "matriz_radio", 
            id_pregunta_origen: 45, 
            obligatorio: true,
            graficar: true,

            // AGREGAMOS ESTA CONDICIÓN TAMBIÉN
            condicion: { pregunta: 44, valor: 1 },

            columnas: [
                { id: 1, texto: "No recibe", valor: 1 },       
                { id: 2, texto: "Ocasional (1 vez al año o menos)", valor: 2 },       
                { id: 3, texto: "Periódica (2 a 4 veces al año)", valor: 3 },       
                { id: 4, texto: "Frecuente (mensual)", valor: 4 },       
                { id: 5, texto: "Muy frecuente (más de una vez al mes)", valor: 5 },   
            ]
        },
        {
            id: 47, 
            orden: 46,
            texto: "¿Se evalúa el desempeño del personal?",
            tipo: "booleano",
            obligatorio: false,
            graficar: true,
            opciones: [
                { id: 1, texto: "Sí" },
                { id: 0, texto: "No" }
            ]
        }
    ]
};

// =========================================================
// 🧠 MOTOR LÓGICO CONDICIONAL (NUEVO)
// =========================================================
function inicializarLogicaCondicional() {
    if (typeof CONFIG_SECCION === 'undefined' || !CONFIG_SECCION.preguntas) return;

    // 1. Filtramos las preguntas que tienen condiciones (Hijas)
    const preguntasCondicionales = CONFIG_SECCION.preguntas.filter(p => p.condicion);

    if (preguntasCondicionales.length === 0) return;

    console.log("🧠 Inicializando lógica condicional...");

    // 2. Función que evalúa si mostrar u ocultar
    const evaluar = () => {
        preguntasCondicionales.forEach(hija => {
            const padreId = hija.condicion.pregunta;
            const valorEsperado = String(hija.condicion.valor);
            
            // Buscamos el contenedor de la pregunta Hija
            const divHija = document.getElementById(`pregunta-box-${hija.id}`);
            if (!divHija) return;

            // Buscamos qué respondió el usuario en la pregunta Padre
            let valorActual = null;
            
            // Intento 1: Radio Buttons (Booleanos, Catálogo Único)
            const radioMarcado = document.querySelector(`input[name="pregunta_${padreId}"]:checked`);
            if (radioMarcado) {
                valorActual = radioMarcado.value;
            } 
            // Intento 2: Selects
            else {
                const select = document.querySelector(`select[data-id-pregunta="${padreId}"]`);
                if (select) valorActual = select.value;
            }

            // 3. Comparar y Actuar
            if (valorActual === valorEsperado) {
                // MOSTRAR
                divHija.style.display = 'block';
                // Reactivar inputs para que se guarden y sean obligatorios
                divHija.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
            } else {
                // OCULTAR
                divHija.style.display = 'none';
                // Desactivar inputs (IMPORTANTE: Esto evita que validación 'obligatorio' bloquee el envío)
                divHija.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
            }
        });
    };

    // 3. Agregar "Listeners" a las preguntas Padre
    // Identificamos los IDs únicos de los padres para no repetir listeners
    const idsPadres = [...new Set(preguntasCondicionales.map(p => p.condicion.pregunta))];

    idsPadres.forEach(idPadre => {
        // Escuchar cambios en Radios
        const radios = document.querySelectorAll(`input[name="pregunta_${idPadre}"]`);
        radios.forEach(r => r.addEventListener('change', evaluar));

        // Escuchar cambios en Selects
        const select = document.querySelector(`select[data-id-pregunta="${idPadre}"]`);
        if (select) select.addEventListener('change', evaluar);
    });

    // 4. Ejecutar una vez al inicio (para aplicar reglas a datos cargados)
    evaluar();
}