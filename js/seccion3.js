const CONFIG_SECCION = {
    seccion: "3. Caracterización del acervo",
    siguiente: "seccion4.html", 
    anterior: "seccion2.html", 

    preguntas: [ 

        // --- SUBSECCIÓN 3.1 ---
        {
            id: 300,
            tipo: "titulo_subseccion",
            texto: "3.1 Volumen y características"
        },
        {
            id: 20,
            orden: 19,
            texto: "Indique el volumen aproximado del acervo fotográfico que resguardan",
            tipo: "catalogo_unico",
            obligatorio: true, 
            graficar: true, 
            opciones: [
                { id: 1, texto: "Hasta 500 ítems" },
                { id: 2, texto: "Hasta 5000 ítems" },
                { id: 3, texto: "Hasta 50,000 ítems" },
                { id: 4, texto: "Más de 50,000 ítems" }
            ]
        },
        {
            id: 21, 
            orden: 20,
            texto: "Describa los fondos o colecciones más representativos (máximo 3)",
            ayuda: "Indique el nombre o descripción breve de cada fondo.",
            tipo: "lista_inputs", 
            obligatorio: false,
            opciones: [
                { id: 1, texto: "Fondo / Colección 1" },
                { id: 2, texto: "Fondo / Colección 2" },
                { id: 3, texto: "Fondo / Colección 3" },
            ]
        },
        {
            id: 22,
            orden: 21,
            texto: "Tipos de materiales (marcar todos los que correspondan):",
            tipo: "catalogo_multiple",
            obligatorio: true, 
            graficar: true,
            opciones: [
                { id: 1, texto: "Positivos en papel" },
                { id: 2, texto: "Positivos en película (diapositivas)" },
                { id: 3, texto: "Negativos (vidrio, nitrato, acetato, poliéster)" },
                { id: 4, texto: "Fotografías nacidas digitales" },
                { id: 5, texto: "Fotografías digitalizadas" },
                { id: 6, texto: "Documentos u objetos asociados" },
                { id: 7, texto: "Dispositivos fotográficos" },
                { id: 8, texto: "Otro", especificar: true }
            ]
        },

        // --- SUBSECCIÓN 3.2 ---
        {
            id: 301,
            tipo: "titulo_subseccion",
            texto: "3.2 Perfil del contenido"
        },
        {
            id: 23,
            orden: 22,
            texto: "Período temporal aproximado que abarca el acervo",
            ayuda: "Indique el año inicial y final. Mes y día son opcionales.",
            tipo: "rango_fechas_flexibles", 
            obligatorio: true
        },
        
        // --- 🟢 AQUÍ ESTABA EL ERROR DE LA GRÁFICA ---
        {
            id: 24, 
            orden: 23,
            texto: "¿Cuenta con un registro o control de autoridades?",
            ayuda: "Se considera registro o control de autoridades cualquier sistema que permita identificar de forma consistente a las personas...",
            tipo: "booleano",
            obligatorio: true,
            graficar: true,
            valor: 1,
            opciones: [
                { id: 1, texto: "Sí" },
                { id: 0, texto: "No" } // <--- CAMBIO CLAVE: ID 0 para coincidir con encuesta.js
            ]
        },
        // ---------------------------------------------

        // --- SUBSECCIÓN 3.3 ---
        {
            id: 302,
            tipo: "titulo_subseccion",
            texto: "3.3 Infraestructura del acervo"
        },
        {
            id: 25,
            orden: 24,
            texto: "¿Qué nivel de adecuación tiene el establecimiento (espacios y distribución)?",
            tipo: "catalogo_unico", 
            obligatorio: true, 
            graficar: true,
            puntaje_regla: "escala_directa", 
            opciones: [
                { id: 1, ayuda: "Espacio insuficiente o no acondicionado; distribución improvisada.", texto: "Inadecuado" },
                { id: 2, ayuda: "Espacio limitado; existe cierta organización, pero no cumple condiciones mínimas.", texto: "Básico" },
                { id: 3, ayuda: "Espacio suficiente y organizado; cumple parcialmente requisitos de resguardo.", texto: "Adecuado"},
                { id: 4, ayuda: "Buena distribución; áreas definidas; condiciones controladas.", texto: "Bueno" },
                { id: 5, ayuda: "Distribución profesional; espacios diferenciados y diseñados para conservación.", texto: "Óptimo" }
            ]
        },
        {
            id: 26,
            orden: 25,
            texto: "¿Cuál es el nivel de equipamiento disponible para la organización, conservación y prestación de servicios relacionados con el acervo?",
            tipo: "catalogo_unico", 
            obligatorio: true, 
            graficar: true,
            puntaje_regla: "escala_directa",
            opciones: [
                { id: 1, texto: "Inadecuado", ayuda: "No se cuenta con equipamiento adecuado; solo herramientas básicas, insuficientes o improvisadas. No permite realizar correctamente tareas de organización, conservación o servicios." },
                { id: 2, texto: "Básico", ayuda: "Se cuenta con algunos elementos mínimos o parciales, pero no cubren las necesidades del acervo. El equipamiento permite realizar solo actividades muy esenciales." },
                { id: 3, texto: "Adecuado", ayuda: "El equipamiento es suficiente para realizar las tareas esenciales de organización, conservación y operación del acervo. Puede haber áreas por mejorar, pero las funciones principales están cubiertas." },
                { id: 4, texto: "Bueno", ayuda: "Equipamiento completo, funcional y en buenas condiciones. Permite realizar procesos especializados y ofrecer servicios de manera eficiente y estable." },
                { id: 5, texto: "Óptimo", ayuda: "Equipamiento profesional, actualizado y especializado. Cumple estándares técnicos para conservación, operación, digitalización y servicios. Permite un funcionamiento de alto nivel." }
            ]
        },
        {
            id: 27,
            orden: 26,
            texto: "¿Con qué espacios de almacenamiento acondicionados cuenta la institución?",
            ayuda: "Espacio especialmente preparado para conservar el acervo, con control de temperatura, humedad, iluminación, mobiliario adecuado y protección contra riesgos.",
            tipo: "catalogo_multiple",
            obligatorio: true, 
            graficar: true,
            puntaje_regla: "acumulativo_max5", 
            opciones: [
                { id: 1, texto: "Control de temperatura" },
                { id: 2, texto: "Control de humedad" },
                { id: 3, texto: "Iluminación adecuada" },
                { id: 4, texto: "Mobiliario adecuado" },
                { id: 5, texto: "Protección contra riesgos" },
                { id: 6, texto: "Todas las anteriores" } 
            ]
        },
        {
            id: 28,
            orden: 27,
            texto: "¿Qué instalaciones fotográficas tiene la institución?",
            tipo: "catalogo_multiple",
            obligatorio: false, 
            graficar: true,
            puntaje_regla: "acumulativo_max5",
            opciones: [
                { id: 1, texto: "Laboratorio fotográfico" },
                { id: 2, texto: "Estudio fotográfico" },
                { id: 3, texto: "Área de reproducción documental" },
                { id: 4, texto: "Estación de digitalización" },
                { id: 99, texto: "Ninguna de las anteriores" } 
            ]
        }
    ]
};