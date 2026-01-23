// js/seccion6.js

const CONFIG_SECCION = {
    seccion: "6. Recursos humanos",
    siguiente: "seccion7.html", 
    anterior: "seccion5.html", 

    preguntas: [
        {
            id: 41,
            orden: 41,
            texto: "Número total de personas que trabajan en el archivo/acervo.",
            tipo: "numero",
            obligatorio: true,
            graficar: false // <--- CAMBIO: "false" porque es un número libre, no categorías.
        },
        {
            id: 42,
            orden: 42,
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
            orden: 43,
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
        // --- AQUÍ FALTABAN LAS OPCIONES ---
        {
            id: 44, 
            orden: 44,
            texto: "¿Cuenta con plan de capacitación?",
            tipo: "booleano",
            obligatorio: false,
            graficar: true,
            opciones: [
                { id: 1, texto: "Sí" },
                { id: 0, texto: "No" }
            ]
        },
        // ----------------------------------
        {
            id: 45,
            orden: 45,
            texto: "Capacitación recibida (marcar todos los que correspondan):",
            tipo: "catalogo_multiple",
            obligatorio: true,
            graficar: true,
            opciones: [
                { id: 1, texto: "Archivística" },
                { id: 2, texto: "Catalogación" },
                { id: 3, texto: "Restauración" },
                { id: 4, texto: "Digitalización / Reprografía" },
                { id: 5, texto: "Cómputo y herramientas digitales" },
                { id: 6, texto: "Historia / arte" },
                { id: 7, texto: "Manipulación física" },
                { id: 8, texto: "Otro", especificar: true },
                { id: 99, texto: "Ninguno" }  
            ]
        },
        {
            id: 46,
            orden: 46,
            texto: "¿Con qué frecuencia recibe capacitación relacionada con sus funciones?",
            ayuda: "Para cada tema seleccionado arriba, marque la frecuencia correspondiente.",
            tipo: "matriz_dinamica", 
            modo: "matriz_radio", 
            id_pregunta_origen: 45, 
            obligatorio: true,
            graficar: true,
            columnas: [
                { id: 1, texto: "No recibe", valor: 1 },       
                { id: 2, texto: "Ocasional", valor: 2 },       
                { id: 3, texto: "Periódica", valor: 3 },       
                { id: 4, texto: "Frecuente", valor: 4 },       
                { id: 5, texto: "Muy frecuente", valor: 5 },   
            ]
        },
        // --- AQUÍ TAMBIÉN FALTABAN ---
        {
            id: 47, 
            orden: 47,
            texto: "¿Se evalúa el desempeño del personal?",
            tipo: "booleano",
            obligatorio: false,
            graficar: true,
            opciones: [
                { id: 1, texto: "Sí" },
                { id: 0, texto: "No" }
            ]
        }
        // -----------------------------
    ]
};