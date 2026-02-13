// js/seccion9.js
const CONFIG_SECCION = {
    seccion: "9. Servicios",
    siguiente: "resumen.html", 
    es_final: true,
    anterior: "seccion8.html", 

    preguntas: [
        {
            id: 50, 
            orden: 49,
            texto: "Oferta de servicios y accesibilidad:",
            ayuda: "Seleccione los servicios que ofrece su institución:",
            tipo: "catalogo_tabla", 
            estilo_tabla: "desplegable", 
            obligatorio: true,
            graficar: true,
            encabezados: ["Categoría", "Opciones disponibles"],
            opciones: [
                // --- 1. SERVICIOS BÁSICOS (Cambiamos ID 1 a 91) ---
                { 
                    id: 91, texto: "Servicios que ofrece la institución a las personas usuarias", 
                    sub_opciones: [
                        { id: 101, texto: "Consulta en sala" },
                        { id: 102, texto: "Préstamos" },
                        { id: 103, texto: "Reprografía / Digitalización" },
                        { id: 104, texto: "Investigación" },
                        { id: 105, texto: "Gestión de permisos de uso" },
                        { id: 106, texto: "Otro", especificar: true }
                    ]
                },
                // --- 2. REQUISITOS (Cambiamos ID 2 a 92) ---
                { 
                    id: 92, texto: "Requisitos o condiciones se solicitan para la consulta del acervo", 
                    sub_opciones: [
                        { id: 110, texto: "Consulta libre (Sin requisitos)" },
                        { id: 111, texto: "Cita previa" },
                        { id: 112, texto: "Carta de solicitud" },
                        { id: 113, texto: "Registro / Autorización interna" },
                        { id: 114, texto: "Consulta supervisada" },
                        { id: 115, texto: "Restringida (Solo personal interno)" },
                        { id: 116, texto: "No cuenta con condiciones formales" },
                        { id: 117, texto: "Otra", especificar: true }
                    ]
                },
                // --- 3. EDUCATIVOS (Cambiamos ID 3 a 93) ---
                { 
                    id: 93, texto: "Servicios educativos que ofrece la institución", 
                    sub_opciones: [
                        { id: 120, texto: "Cursos" },
                        { id: 121, texto: "Talleres" },
                        { id: 122, texto: "Conferencias" },
                        { id: 123, texto: "Visitas guiadas" },
                        { id: 124, texto: "Otros", especificar: true }
                    ]
                },
                // --- 4. DIFUSIÓN (Cambiamos ID 4 a 94) ---
                { 
                    id: 94, texto: "Mecanismos de difusión y divulgación que realiza la institución", 
                    sub_opciones: [
                        { id: 130, texto: "Exposiciones" },
                        { id: 131, texto: "Prensa" },
                        { id: 132, texto: "Publicaciones" },
                        { id: 133, texto: "Venta de obra" },
                        { id: 134, texto: "Otros", especificar: true },
                        { id: 136, texto: "Redes sociales"}
                    ]
                }
            ]
        }
    ]
};
