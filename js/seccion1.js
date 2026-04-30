// =========================================================
// CONFIGURACIÓN DE LA SECCIÓN 1 (NUEVA ESTRUCTURA)
// =========================================================
const CONFIG_SECCION = {
    seccion: "1. Gestión institucional y Gestión del acervo",
    siguiente: "seccion2.html", 
    anterior: null, 

    preguntas: [
        {
            id: 1, orden: 1,
            texto: "¿El archivo/institución cuenta con planeación estratégica?",
            tipo: "booleano",
            obligatorio: true,
            opciones: [{ id: 1, texto: "Sí" }, { id: 0, texto: "No" }]
        },
        {
            id: 2, orden: 2,
            texto: "Mencione la misión del archivo/institución.",
            tipo: "texto_largo",
            obligatorio: true
        },
        {
            id: 3, orden: 3,
            texto: "Mencione la visión del archivo/institución.",
            tipo: "texto_largo",
            obligatorio: true
        },
        {
            id: 4, orden: 4,
            texto: "¿Cuenta con organigrama?",
            tipo: "booleano",
            obligatorio: true,
            opciones: [{ id: 1, texto: "Sí" }, { id: 0, texto: "No" }]
        },
        {
            id: 5, orden: 5,
            texto: "¿Cuenta con manuales de procedimiento?",
            tipo: "booleano",
            obligatorio: true,
            opciones: [{ id: 1, texto: "Sí" }, { id: 0, texto: "No" }]
        },
        {
            id: 6, orden: 6,
            texto: "¿El archivo cuenta con una política formal de adquisiciones o incremento del acervo?",
            tipo: "booleano",
            obligatorio: true,
            opciones: [{ id: 1, texto: "Sí" }, { id: 0, texto: "No" }]
        },
        {
            id: 7, orden: 7,
            texto: "¿Cuenta con algún proceso formal para registrar la entrada o ingreso de objetos al acervo?",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Sí", especificar: true, placeholder_especificar: "Mencione cuál:" },
                { id: 0, texto: "No" }
            ]
        },
        {
            id: 8, orden: 8,
            texto: "¿Cuenta con algún proceso formal para registrar la salida de objetos del acervo? (considere salidas temporales y/o definitivas)",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Sí", especificar: true, placeholder_especificar: "Mencione cuál:" },
                { id: 0, texto: "No" }
            ]
        },
        {
            id: 9, orden: 9,
            texto: "¿Existe un plan de emergencias actualizado para la protección del acervo?",
            tipo: "booleano",
            obligatorio: true,
            opciones: [{ id: 1, texto: "Sí" }, { id: 0, texto: "No" }]
        },
        {
            id: 10, orden: 10,
            texto: "Mencione la frecuencia con la que se realizan auditorías del acervo.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "No se realizan auditorías" },
                { id: 2, texto: "Trimestrales" },
                { id: 3, texto: "Semestrales" },
                { id: 4, texto: "Anuales" },
                { id: 5, texto: "Cada dos años o más" }
            ]
        },
        {
            id: 11, orden: 11,
            texto: "Indique con qué frecuencia se realiza el registro formal de daños o pérdidas en el acervo.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "No se lleva registro" },
                { id: 2, texto: "Registro por cada incidente" },
                { id: 3, texto: "Mensual o bimestral" },
                { id: 4, texto: "Trimestral o semestral" }
            ]
        },
        {
            id: 12, orden: 12,
            texto: "¿La institución cuenta con un diagnóstico legal sobre la titularidad de los derechos de autor (patrimoniales) de sus fondos?",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "No se tiene identificada la situación legal" },
                { id: 2, texto: "Identificada parcialmente" },
                { id: 3, texto: "Identificada en su totalidad y documentada" }
            ]
        },
        {
            id: 13, orden: 13,
            texto: "Mencione las fuentes de financiamiento para el archivo (marcar todas las correspondientes).",
            tipo: "catalogo_multiple",
            obligatorio: true,
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
        },
        {
            id: 14, orden: 14,
            texto: "Tomando en cuenta su misión, visión y sus objetivos, ¿cómo evalúa la gestión institucional de su archivo?",
            tipo: "catalogo_unico",
            obligatorio: true,
            graficar: true,
            opciones: [
                { id: 1, texto: "Incipiente", ayuda: "La operación carece de planeación estratégica, así como de una estructura organizativa y lineamientos que orienten el trabajo. No existen procedimientos formales para la gestión del acervo, lo que lo expone a una alta vulnerabilidad ante daños o pérdidas. Tampoco hay mecanismos de seguimiento de resultados. El financiamiento es inexistente o inestable." },
                { id: 2, texto: "Básico estructural", ayuda: "Se dispone de una planeación estratégica, aunque es más declarativa que operativa. No hay un marco organizativo definido ni manuales de procedimiento. Aunque se han establecido algunos procesos para la gestión del acervo, su aplicación es irregular, lo que genera vulnerabilidad moderada. Existen algunos mecanismos de seguimiento de resultados. El financiamiento es inestable y no cubre las necesidades básicas de operación." },
                { id: 3, texto: "Intermedio", ayuda: "La planeación estratégica orienta las acciones institucionales, aunque aún no se formalizan un organigrama ni manuales operativos. Los procesos de gestión se aplican con cierta regularidad, lo que permite mantener un control parcial frente a riesgos. Se han impulsado acciones para el seguimiento de resultados. El financiamiento es estable y cubre la operación básica, pero resulta insuficiente para fortalecer el desarrollo y cumplir objetivos estratégicos." },
                { id: 4, texto: "Consolidado", ayuda: "Se cuenta con una planeación estratégica de mediano plazo (3 a 5 años) que establece objetivos claros (específicos, medibles, alcanzables y relevantes). Su cumplimiento es parcial y permite identificar áreas de mejora. La gestión del acervo se apoya en procesos formales que favorecen el control ante daños o pérdidas. El financiamiento es estable, cubre la operación y existe capacidad para gestionar recursos adicionales que fortalezcan el logro de objetivos." },
                { id: 5, texto: "Avanzado", ayuda: "La planeación estratégica guía de manera integral las acciones institucionales y se revisa, evalúa y actualiza periódicamente (3 a 5 años), con objetivos bien definidos. Estos se alcanzan de forma consistente y se respaldan con mecanismos de rendición de cuentas que documentan los logros. La gestión del acervo se realiza mediante procesos consolidados que aseguran un control sistemático e incorporan medidas preventivas. El financiamiento es sólido, cubre las necesidades operativas y se complementa con una gestión activa y diversificada de recursos, lo que impulsa el fortalecimiento y la innovación institucional." }
            ]
        }
    ]
};