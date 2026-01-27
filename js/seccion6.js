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
                { id: 1, texto: "Nivel básico", ayuda: "Incluye estudios de educación primaria y secundaria, correspondientes a la formación escolar fundamental." },
                { id: 2, texto: "Nivel medio superior", ayuda: "Comprende el bachillerato o preparatoria, así como las carreras técnicas o técnico medio que proporcionan formación práctica especializada posterior a la educación básica." },
                { id: 3, texto: "Nivel superior", ayuda: "Incluye estudios profesionales de nivel universitario, tales como Técnico Superior Universitario (TSU), licenciatura, ingeniería o formación docente de nivel superior. Representa la preparación académica orientada a una especialización profesional amplia." },
                { id: 4, texto: "Posgrado", ayuda: "Abarca estudios especializados posteriores a la licenciatura, como especialidad, maestría y doctorado, destinados al desarrollo avanzado de competencias académicas, profesionales o de investigación." },
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
                { id: 1, texto: "Archivística [clasificación, ordenación, descripción]" },
                { id: 2, texto: "Catalogación" },
                { id: 3, texto: "Fotografía / historia de la fotografía" },
                { id: 4, texto: "Conservación prevenitiva" },
                { id: 5, texto: "Restauración" },
                { id: 6, texto: "Digitalización/Reprografía" },
                { id: 7, texto: "Cómputo, herramientas digitales o bases de datos" },
                { id: 7, texto: "Historia / arte" },
                { id: 7, texto: "Manipulacón física del material del acervo" },
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
                { id: 2, texto: "Ocasional (1 vez al año o menos)", valor: 2 },       
                { id: 3, texto: "Periódica (2 a 4 veces al año)", valor: 3 },       
                { id: 4, texto: "Frecuente (mensual)", valor: 4 },       
                { id: 5, texto: "Muy frecuente (más de una vez al mes)", valor: 5 },   
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