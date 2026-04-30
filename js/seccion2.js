// =========================================================
// CONFIGURACIÓN DE LA SECCIÓN 2 (NUEVA ESTRUCTURA)
// =========================================================
const CONFIG_SECCION = {
    seccion: "2. Recursos humanos",
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
            texto: "Indique  el numero de personas por nivel educativo que trabajan en tu archivo/educacion.",
            ayuda: "Coloque el numero de personas por nivel educativo según corresponda.",
            tipo: "lista_inputs",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Nivel básico" },
                { id: 2, texto: "Nivel medio superior" },
                { id: 3, texto: "Nivel superior" },
                { id: 4, texto: "Posgrado" }
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
            id: 20, orden: 20,
            texto: "¿Cuenta con personal capacitado para realizar la evaluación del estado de conservación del acervo?.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Sí, contamos con una persona especialista interna" },
                { id: 2, texto: "No, se contrata a una persona especialista externa" },
                { id: 3, texto: "Ambas" },
                { id: 4, texto: "No se realiza evaluación del estado de conservación del acervo" }
            ]
        },
        {
            id: 21, orden: 21,
            texto: "Tomando en cuenta el personal total del archivo/institución, ¿cómo evalúa la disposición de personal y su experiencia y formación para la gestión del acervo?",
            tipo: "catalogo_unico",
            obligatorio: true,
            graficar: true,
            opciones: [
                { id: 1, texto: "Incipiente", ayuda: "El número de personas es insuficiente para atender las necesidades del acervo. No existe un plan de capacitación, lo que limita el cumplimiento de los objetivos institucionales vinculados con su gestión." },
                { id: 2, texto: "Básico estructural", ayuda: "Aunque el personal sigue siendo limitado, se cuenta con experiencia suficiente para cubrir funciones esenciales. Se han realizado acciones de capacitación, pero aún no permiten consolidar un manejo profesional ni fortalecer de manera integral la gestión del acervo." },
                { id: 3, texto: "Intermedio", ayuda: "Se dispone de un equipo suficiente con formación académica que proporciona bases adecuadas para la gestión. Existen iniciativas de capacitación que, aunque no están articuladas con la planeación estratégica, contribuyen a mejorar las prácticas de manejo del acervo." },
                { id: 4, texto: "Consolidado", ayuda: "El personal responde a las necesidades del acervo y cuenta con formación sólida. Además, existe un plan de capacitación alineado con la planeación estratégica, lo que favorece la eficiencia operativa y el fortalecimiento de los procesos." },
                { id: 5, texto: "Avanzado", ayuda: "Se cuenta con un equipo suficiente y capacitado, respaldado por un programa de formación vinculado a la planeación estratégica. Esto permite sostener altos estándares técnico-documentales, asegurar la conservación y el acceso al acervo, así como mantener procesos estables e impulsar la innovación y la mejora continua." }
            ]
        }
    ]
};

