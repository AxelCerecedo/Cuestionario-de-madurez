// =========================================================
// CONFIGURACIÓN DE LA SECCIÓN 5 (NUEVA ESTRUCTURA)
// =========================================================
const CONFIG_SECCION = {
    seccion: "V. Servicios al Público",
    siguiente: "admin.html", // O la página de "Gracias/Cierre" que tengas configurada
    anterior: "seccion4.html", 

    preguntas: [
        {
            id: 49, orden: 49,
            texto: "Mencione qué servicios ofrece el archivo/institución a su público usuario (mencionar todas las que apliquen).",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Consulta en sala" },
                { id: 2, texto: "Préstamos" },
                { id: 3, texto: "Reprografía / Digitalización" },
                { id: 4, texto: "Investigación" },
                { id: 5, texto: "Gestión de permisos de uso" },
                { id: 6, texto: "Otros", especificar: true }
            ]
        },
        {
            id: 50, orden: 50,
            texto: "Mencione qué requisitos o condiciones se solicitan para la consulta del acervo (mencionar todas las que apliquen).",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Consulta libre (Sin requisitos)" },
                { id: 2, texto: "Cita previa" },
                { id: 3, texto: "Carta de solicitud" },
                { id: 4, texto: "Registro / Autorización interna" },
                { id: 5, texto: "Consulta supervisada" },
                { id: 6, texto: "Restringida (Solo personal interno)" },
                { id: 7, texto: "No cuenta con condiciones formales" },
                { id: 8, texto: "Otra", especificar: true }
            ]
        },
        {
            id: 51, orden: 51,
            texto: "Mencione qué servicios educativos que ofrece la institución (mencionar todas las que apliquen).",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Cursos" },
                { id: 2, texto: "Talleres" },
                { id: 3, texto: "Conferencias" },
                { id: 4, texto: "Visitas guiadas" },
                { id: 5, texto: "Otros", especificar: true },
                { id: 99, texto: "Ninguno" }
            ]
        },
        {
            id: 52, orden: 52,
            texto: "Mencione qué mecanismos de difusión y divulgación del acervo realiza la institución (mencionar todas las que apliquen).",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Exposiciones" },
                { id: 2, texto: "Prensa" },
                { id: 3, texto: "Publicaciones" },
                { id: 4, texto: "Venta de obra" },
                { id: 5, texto: "Redes sociales" },
                { id: 6, texto: "Otros", especificar: true },
                { id: 99, texto: "Ninguno" }
            ]
        },
        {
            id: 53, orden: 53,
            texto: "¿Realiza estudios de usuarios o encuestas de satisfacción de manera periódica?",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "No se realizan" },
                { id: 2, texto: "Se realizan de forma esporádica" },
                { id: 3, texto: "Se realizan anualmente y se utilizan para mejorar los servicios" }
            ]
        },
        {
            id: 54, orden: 54,
            texto: "Con base en los servicios al público que ofrece su institución, mencione cómo evalúa la calidad de servicios ofrecidos.",
            tipo: "catalogo_unico",
            obligatorio: true,
            graficar: true,
            opciones: [
                { id: 1, texto: "Incipiente", ayuda: "La consulta es limitada y no existe reglamento formal de acceso. La atención a las personas usuarias es informal. No se cuenta con registro sistemático de estadísticas de uso." },
                { id: 2, texto: "Básico estructural", ayuda: "La consulta está formalizada, aunque sin evaluación sistemática de impacto. Se cuenta con registro de consultas, pero se lleva de manera manual y no se cuenta con métricas de análisis." },
                { id: 3, texto: "Intermedio", ayuda: "Los servicios de consulta y reproducción operan con regularidad y criterios definidos. Se cuenta con registros manuales y/o electrónicos y estadísticas de uso." },
                { id: 4, texto: "Consolidado", ayuda: "Existe oferta activa de servicios educativos y de vinculación pública. Hay actividades de difusión regulares y se cuenta con registro sistemático de usuarios." },
                { id: 5, texto: "Avanzado", ayuda: "El archivo cuenta con estrategia integral de acceso abierto y vinculación pública. Servicios consolidados y eficientes. Hay medios de consulta digital que facilitan la gestión de servicios. Se cuenta con registros sistemático de estadísticas y usuarios." }
            ]
        }
    ]
};