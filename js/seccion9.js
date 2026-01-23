// js/seccion9.js
const CONFIG_SECCION = {
    seccion: "9. Servicios",
    siguiente: "resumen.html", 
    anterior: "seccion8.html", 

    preguntas: [
        {
            id: 50, 
            orden: 50,
            texto: "Oferta de servicios y accesibilidad:",
            ayuda: "Seleccione los servicios que ofrece su institución:",
            tipo: "catalogo_tabla", 
            estilo_tabla: "desplegable", // <--- Con tu código actual, esto activa el estilo con checkbox padre
            obligatorio: true,
            graficar: true,
            encabezados: ["Categoría", "Opciones Disponibles"],
            opciones: [
                // --- 1. SERVICIOS BÁSICOS (Cambiamos ID 1 a 91) ---
                { 
                    id: 91, texto: "Servicios al usuario", 
                    sub_opciones: [
                        { id: 101, texto: "Consulta en sala" },
                        { id: 102, texto: "Préstamos" },
                        { id: 103, texto: "Reprografía / Digitalización" },
                        { id: 104, texto: "Investigación" },
                        { id: 105, texto: "Gestión de permisos de uso" },
                        { id: 106, texto: "Otro", especificar: true },
                        { id: 107, texto: "Ninguno" }
                    ]
                },
                // --- 2. REQUISITOS (Cambiamos ID 2 a 92) ---
                { 
                    id: 92, texto: "Requisitos de consulta", 
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
                    id: 93, texto: "Servicios educativos", 
                    sub_opciones: [
                        { id: 120, texto: "Cursos" },
                        { id: 121, texto: "Talleres" },
                        { id: 122, texto: "Conferencias" },
                        { id: 123, texto: "Visitas guiadas" },
                        { id: 124, texto: "Otros", especificar: true },
                        { id: 125, texto: "Ninguno" }
                    ]
                },
                // --- 4. DIFUSIÓN (Cambiamos ID 4 a 94) ---
                { 
                    id: 94, texto: "Difusión y divulgación", 
                    sub_opciones: [
                        { id: 130, texto: "Exhibición" },
                        { id: 131, texto: "Prensa" },
                        { id: 132, texto: "Publicaciones" },
                        { id: 133, texto: "Venta de obra" },
                        { id: 134, texto: "Otros", especificar: true },
                        { id: 135, texto: "Ninguno" },
                        { id: 136, texto: "Redes sociales"}
                    ]
                }
            ]
        }
    ]
};