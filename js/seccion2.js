// =========================================================
// CONFIGURACIÓN DE LA SECCIÓN 2 (NUEVA ESTRUCTURA)
// =========================================================
const CONFIG_SECCION = {
    seccion: "2. Recursos Humanos",
    siguiente: "seccion3.html", 
    anterior: "seccion1.html", 

    preguntas: [
        {
            id: 15, orden: 15,
            texto: "Mencione el número total de personas que trabajan en el archivo/institución.",
            tipo: "numero",
            obligatorio: true
        },
        {
            id: 16, orden: 16,
            texto: "Mencione la antigüedad promedio del personal del archivo/institución.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "0-2 años" },
                { id: 2, texto: "3-5 años" },
                { id: 3, texto: "6-10 años" },
                { id: 4, texto: "11-20 años" },
                { id: 5, texto: "Más de 20 años" }
            ]
        },
        {
            id: 17, orden: 17,
            texto: "Indique el nivel educativo del personal que trabaja en el archivo/institución (Indicar el número de personas según corresponda).",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Archivística [clasificación, ordenación, descripción]" },
                { id: 2, texto: "Catalogación" },
                { id: 3, texto: "Fotografía / historia de la fotografía" },
                { id: 4, texto: "Conservación preventiva" },
                { id: 5, texto: "Restauración" },
                { id: 6, texto: "Digitalización/Reprografía" },
                { id: 7, texto: "Cómputo, herramientas digitales o bases de datos" },
                { id: 8, texto: "Historia / arte" },
                { id: 9, texto: "Manipulación física del material del acervo" },
                { id: 10, texto: "Otro", especificar: true }
            ]
        },
        {
            id: 18, orden: 18,
            texto: "¿El personal recibe capacitación alineada con los objetivos o procedimientos institucionales?",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "No se imparte capacitación" },
                { id: 2, texto: "El personal se capacita por sus propios medios" },
                { id: 3, texto: "Hay capacitación interna" },
                { id: 4, texto: "Se gestiona capacitación externa" }
            ]
        },
        {
            id: 19, orden: 19,
            texto: "Cuenta con personal capacitado para realizar la evaluación del estado de conservación del acervo.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Sí, contamos con una persona especialista interna" },
                { id: 2, texto: "No, se contrata a una persona especialista externa" },
                { id: 3, texto: "Ambas" }
            ]
        },
        {
            id: 20, orden: 20,
            texto: "Indique las áreas o actividades en las que el personal recibe capacitación.",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Archivística [clasificación, ordenación, descripción]" },
                { id: 2, texto: "Catalogación" },
                { id: 3, texto: "Fotografía / historia de la fotografía" },
                { id: 4, texto: "Conservación preventiva" },
                { id: 5, texto: "Restauración" },
                { id: 6, texto: "Digitalización/Reprografía" },
                { id: 7, texto: "Cómputo, herramientas digitales o bases de datos" },
                { id: 8, texto: "Historia / arte" },
                { id: 9, texto: "Manipulación física del material del acervo" },
                { id: 10, texto: "Otro", especificar: true }
            ]
        },
        {
            id: 21, orden: 21,
            texto: "Tomando en cuenta el personal total del archivo/institución, ¿cómo evalúa la disposición de personal y su experiencia y formación para la gestión del acervo institucional?",
            tipo: "catalogo_unico",
            obligatorio: true,
            graficar: true,
            opciones: [
                { id: 1, texto: "Incipiente", ayuda: "El personal no es suficiente para las necesidades de manejo del acervo. No se cuenta con un plan de capacitación, lo que dificulta el logro de objetivos institucionales relacionados con el manejo del acervo." },
                { id: 2, texto: "Básico estructural", ayuda: "El personal no es suficiente para las necesidades de manejo del acervo, aunque ya se cuenta con experiencia que garantiza el desarrollo de funciones esenciales/básicas. El personal ha recibido capacitación, pero no es suficiente para profesionalizar y fortalecer el manejo del acervo." },
                { id: 3, texto: "Intermedio", ayuda: "El personal es suficiente y tiene formación académica que le proporciona bases suficientes para el manejo del acervo. Existen acciones de capacitación, aunque no están vinculadas con la planeación estratégica contribuyen a fortalecer el manejo del acervo." },
                { id: 4, texto: "Consolidado", ayuda: "El personal es suficiente para las necesidades de manejo del acervo, ya que cuenta con una formación académica que le proporciona bases sólidas para las necesidades de manejo del acervo. Se cuenta con un plan de capacitación vinculado con la planeación estratégica que contribuye a eficientar y fortalecer procesos." },
                { id: 5, texto: "Avanzado", ayuda: "El personal es suficiente para las necesidades de manejo del acervo, ya que cuenta con un plan de capacitación vinculado con la planeación estratégica, lo que contribuye a mantener altos estándares técnicos-documentales en el manejo del acervo, garantizando su conservación y acceso. Se cuenta con un plan de capacitación vinculado con la planeación estratégica, lo que contribuye a mantener procesos estables, así como para identificar áreas de oportunidad e innovaciones." }
            ]
        }
    ]
};

