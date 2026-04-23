// =========================================================
// CONFIGURACIÓN DE LA SECCIÓN 1 (NUEVA ESTRUCTURA)
// =========================================================
const CONFIG_SECCION = {
    seccion: "1. Gestión Institucional y Gestión del Acervo",
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
                { id: 1, texto: "Incipiente", ayuda: "Se opera sin una planeación estratégica, sin organigrama ni manuales de procedimiento que den orden al trabajo institucional. Se carece de procesos formales para la gestión del acervo, por lo cual, al acervo queda en una situación altamente vulnerable ante daños o pérdidas. No hay mecanismos de seguimiento de resultados. No se cuenta con financiamiento o el que se tiene no es estable." },
                { id: 2, texto: "Básico estructural", ayuda: "Existe planeación estratégica, aunque es más declarativa que operativa. No existe un marco organizativo ni manuales de procedimiento. Existen procesos formales para la gestión del acervo, pero no se siguen de forma consistente, lo que pone al acervo en una situación medianamente vulnerable ante daños o pérdidas. Existen algunos mecanismos de seguimiento de resultados. El financiamiento no es estable y no satisface necesidades básicas de operación." },
                { id: 3, texto: "Intermedio", ayuda: "Existe planeación estratégica que orienta planes y acciones, aunque no existe un organigrama ni manuales de procedimientos. Existen procesos formales para la gestión del acervo que se aplican con cierto orden, lo que contribuye a tener cierto control ante daños o pérdidas. Se han hecho esfuerzos para implementar mecanismos de seguimiento de resultados. El financiamiento es estable y satisface necesidades básicas de operación, aunque se requieren recursos para fortalecer y alcanzar objetivos estratégicos." },
                { id: 4, texto: "Consolidado", ayuda: "Existe planeación estratégica (3 a 5 años) que define objetivos (específicos, medibles, alcanzables y relevantes). Los objetivos se cumplen parcialmente y se identifican áreas de mejora. Existen procesos formales para la gestión del acervo, lo que contribuye a mantener control ante daños y pérdidas. El financiamiento es estable, satisface necesidades básicas de operación, y se cuenta con la capacidad para gestionar recursos para fortalecer y alcanzar objetivos estratégicos específicos." },
                { id: 5, texto: "Avanzado", ayuda: "Existe planeación estratégica que orienta planes y acciones y se revisa, evalúa y actualiza de forma periódica (3 a 5 años), además de que se tienen objetivos (específicos, medibles, alcanzables y relevantes). Los objetivos se cumplen de manera satisfactoria y se cuenta con mecanismos de rendición de cuentas que documentan logros institucionales. Existen procesos formales para la gestión del acervo, lo que contribuye a un control sistemático ante daños y pérdidas, y contar con acciones preventivas. El financiamiento es estable, satisface necesidades básicas de operación y se cuenta con capacidad de gestionar y diversificar fuentes de financiamiento, lo que permite fortalecer y alcanzar objetivos estratégicos." }
            ]
        }
    ]
};