const CONFIG_SECCION = {
    seccion: "2. Gestión Institucional",
    siguiente: "seccion3.html", 
    anterior: "seccion1.html", 

    preguntas: [
        {
            id: 14, orden: 13,
            texto: "Misión",
            ayuda: "Descripción breve de la misión institucional",
            tipo: "texto_largo",
            obligatorio: false
        },
        {
            id: 15, orden: 14,
            texto: "Visión",
            ayuda: "Descripción breve de la visión institucional",
            tipo: "texto_largo",
            obligatorio: false
        },
        {
            id: 16, orden: 15,
            texto: "Objetivos Institucionales",
            ayuda: "Descripción de los objetivos institucionales",
            tipo: "texto_largo",
            obligatorio: false,
            valor: 1
        },
        // --- AQUÍ ESTABA EL PROBLEMA ---
        {
            id: 17, orden: 16,
            texto: "¿Cuenta con procesos y procedimientos documentados?",
            ayuda: "Procesos y procedimientos definidos...",
            tipo: "booleano", 
            obligatorio: false,
            valor: 1,
            // AGREGAMOS ESTO PARA QUE EL ADMIN SEPA TRADUCIR EL ID
            opciones: [
                { id: 1, texto: "Sí" },
                { id: 2, texto: "No" }
            ]
        },
        {
            id: 18, orden: 17,
            texto: "¿Cuenta con un organigrama?",
            tipo: "booleano",
            obligatorio: false,
            valor: 1,
            // AGREGAMOS ESTO TAMBIÉN AQUÍ
            opciones: [
                { id: 1, texto: "Sí" },
                { id: 2, texto: "No" }
            ]
        },
        // --------------------------------
        {
            id: 19, orden: 18,
            texto: "Mencione cuáles son sus fuentes de financiamiento (marque todas las que correspondan):",
            tipo: "catalogo_multiple", 
            obligatorio: true,
            valor: 1,
            opciones: [
                { id: 1, texto: "Gubernamental nacional" },
                { id: 2, texto: "Gubernamental estatal" },
                { id: 3, texto: "Gubernamental municipal" },
                { id: 4, texto: "Recursos propios" },
                { id: 5, texto: "Particular nacional" },
                { id: 6, texto: "Particular extranjero" },
                { id: 7, texto: "Organismo internacional" },
                { id: 8, texto: "Otro", especificar: true },
                { id: 99, texto: "Ninguno" }  
            ]
        }
    ]
};