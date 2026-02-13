// js/seccion7.js

const CONFIG_SECCION = {
    seccion: "7. Infraestructura tecnológica",
    siguiente: "seccion8.html", 
    anterior: "seccion6.html", 

    preguntas: [
        {
            id: 48, 
            orden: 47,
            texto: "De la siguiente lista, indique con que infraestructura y herramientas cuenta institución o archivo:",
            ayuda: "Marque las opciones con las que cuenta su institución.",
            tipo: "catalogo_tabla",
            obligatorio: true,
            graficar: true,
            encabezados: ["Infraestructura y Recursos Tecnológicos"],
            opciones: [
                // PADRES (Valen 1 punto)
                { id: 481, texto: "Equipo de cómputo", ayuda: "Computadoras de escritorio o laptops asignadas al acervo." },
                { id: 482, texto: "Conexión a Internet", ayuda: "Acceso estable para realizar las funciones." },
                { id: 483, texto: "Servidor / Hosting", ayuda: "Infraestructura para almacenamiento o publicación web." },
                { id: 484, texto: "Equipo de digitalización", ayuda: "Escáneres, cámaras o equipos de reprografía." },
                
                // PADRE CON HIJOS
                { 
                    id: 485, // Este vale 1 punto
                    texto: "Software especializado", 
                    ayuda: "¿Utiliza alguno de los siguientes software o sistema especializado?",
                    graficar: true,
                    sub_opciones: [
                        // HIJOS (Valen 0 puntos, solo son descriptivos)
                        { id: 4810, texto: "Omeka" },
                        { id: 4811, texto: "Tainacan" },
                        { id: 4812, texto: "Collective Access" },
                        { id: 4813, texto: "Filemaker" },
                        { id: 4814, texto: "Koha" },
                        { id: 4815, texto: "Access" },
                        { id: 4816, texto: "DSpace" },
                        { id: 4817, texto: "Unique Collection" },
                        { id: 4818, texto: "Collector" },
                        { id: 4819, texto: "Airtable" },
                        { id: 4820, texto: "AtoM" },
                        { id: 4821, texto: "Desarrollo a la medida" },
                        { id: 4822, texto: "Otro", especificar: true }
                    ]
                }
            ]
        }
    ]
};