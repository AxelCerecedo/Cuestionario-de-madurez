// js/seccion6.js

// =========================================================
// 🎨 INYECTOR DE ESTILOS CSS (DINÁMICO)
// =========================================================
function agregarEstilosDeshabilitados() {
    // Definimos el CSS como un string de texto //
    const cssStyles = `
        /* Clase para preguntas deshabilitadas (Visibles pero bloqueadas) */
        .pregunta-deshabilitada {
            opacity: 0.5 !important;       /* Se ve semitransparente */
            pointer-events: none;          /* No recibe clics del ratón */
            filter: grayscale(100%);       /* Lo pone en blanco y negro */
            background-color: #f9f9f9;     /* Fondo grisáceo suave */
            transition: all 0.3s ease;     /* Transición suave */
            position: relative;            /* Para mantener estructura */
        }

        /* Asegurar que los inputs dentro no sean editables visualmente */
        .pregunta-deshabilitada input,
        .pregunta-deshabilitada select,
        .pregunta-deshabilitada label,
        .pregunta-deshabilitada textarea {
            cursor: not-allowed;
            background-color: #e9ecef !important; /* Input gris */
            color: #6c757d !important;            /* Texto gris */
        }
        
        /* Ocultar botones de agregar filas si es matriz o tabla */
        .pregunta-deshabilitada button {
            display: none !important;
        }
    `;

    // Creamos la etiqueta <style>
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = cssStyles;

    // La agregamos al <head> del documento
    document.head.appendChild(styleSheet);
}

agregarEstilosDeshabilitados();

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
            encabezados: ["Nivel Educativo"],
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
            texto: "¿El personal del acervo recibe capacitación? ",
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
            texto: "Indique las areas o actividades en las que el personal recibe capacitación.",
            tipo: "catalogo_multiple",
            obligatorio: true,
            graficar: true,
            condicion_visual: { pregunta: 44, valor: 1 },

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
            texto: "¿Con que frecuencia el personal del acervo recibe capacitación en las areas mencionadas?",
            ayuda: "Por cada área seleccionada en la pregunta previa, se activará la frecuencia.",
            tipo: "matriz_dinamica", 
            modo: "matriz_radio", 
            id_pregunta_origen: 45, 
            obligatorio: true,
            graficar: true,
            
            // 🔥 CAMBIO CLAVE: Aquí también
            condicion_visual: { pregunta: 44, valor: 1 }, 

            columnas: [
                { id: 1, texto: "No recibe", valor: 1 },       
                { id: 2, texto: "Ocasional", valor: 2 },       
                { id: 3, texto: "Periódica", valor: 3 },       
                { id: 4, texto: "Frecuente", valor: 4 },       
                { id: 5, texto: "Muy frecuente", valor: 5 },   
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
// 🧠 LÓGICA ESPECÍFICA PARA SECCIÓN 6 (BLOQUEO GRIS)
// =========================================================
function iniciarLogicaVisualRH() {
    if (typeof CONFIG_SECCION === 'undefined' || !CONFIG_SECCION.preguntas) return;

    // 1. Filtramos buscando la NUEVA propiedad 'condicion_visual'
    const preguntasCondicionales = CONFIG_SECCION.preguntas.filter(p => p.condicion_visual);

    if (preguntasCondicionales.length === 0) return;

    console.log("🧠 Inicializando lógica visual RH (Gris/Bloqueado)...");

    const evaluar = () => {
        preguntasCondicionales.forEach(hija => {
            // Leemos la propiedad nueva
            const padreId = hija.condicion_visual.pregunta;
            const valorEsperado = String(hija.condicion_visual.valor);
            
            const divHija = document.getElementById(`pregunta-box-${hija.id}`);
            if (!divHija) return;

            let valorActual = null;
            
            // Radio Buttons
            const radioMarcado = document.querySelector(`input[name="pregunta_${padreId}"]:checked`);
            if (radioMarcado) valorActual = radioMarcado.value;
            // Selects
            else {
                const select = document.querySelector(`select[data-id-pregunta="${padreId}"]`);
                if (select) valorActual = select.value;
            }

            // 3. Comparar y Actuar
            if (String(valorActual) === valorEsperado) {
                // ✅ MOSTRAR Y ACTIVAR
                divHija.classList.remove('pregunta-deshabilitada');
                divHija.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = false);
            } else {
                // ⛔ BLOQUEAR (PERO MANTENER VISIBLE)
                divHija.classList.add('pregunta-deshabilitada');
                
                // Forzamos que se vea (por si acaso heredó un display:none)
                divHija.style.display = 'block'; 

                divHija.querySelectorAll('input, select, textarea, button').forEach(el => {
                    el.disabled = true; 
                    if (el.type === 'checkbox' || el.type === 'radio') {
                        el.checked = false;
                        el.dispatchEvent(new Event('change')); 
                    } else if (el.type !== 'button') {
                        el.value = '';
                    }
                });
            }
        });
    };

    // 3. Listeners
    const idsPadres = [...new Set(preguntasCondicionales.map(p => p.condicion_visual.pregunta))];

    idsPadres.forEach(idPadre => {
        const inputs = document.querySelectorAll(`input[name="pregunta_${idPadre}"]`);
        inputs.forEach(r => r.addEventListener('change', evaluar));
        const select = document.querySelector(`select[data-id-pregunta="${idPadre}"]`);
        if (select) select.addEventListener('change', evaluar);
    });

    // Ejecutar evaluación inicial
    setTimeout(evaluar, 500); 
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(iniciarLogicaVisualRH, 800); 
});