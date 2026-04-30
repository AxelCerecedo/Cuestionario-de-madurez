// =========================================================
// CONFIGURACIÓN DE LA SECCIÓN 3 (NUEVA ESTRUCTURA)
// =========================================================
const CONFIG_SECCION = {
    seccion: "3. Características del acervo",
    siguiente: "seccion4.html", 
    anterior: "seccion2.html", 

    preguntas: [
        {
            id: 22, orden: 22,
            texto: "Indique el volumen aproximado del acervo fotográfico en resguardo de su archivo/institución.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Hasta 500 ítems" },
                { id: 2, texto: "Hasta 5,000 ítems" },
                { id: 3, texto: "Hasta 50,000 ítems" },
                { id: 4, texto: "Más de 50,000 ítems" }
            ]
        },
        {
            id: 23, orden: 23,
            texto: "Si el acervo está estructurado por fondos/subfondos o colecciones, menciona los tres más representativos.",
            tipo: "lista_inputs",
            obligatorio: false,
            texto_ninguno: "No está organizado por fondos o colecciones",
            opciones: [
                { id: 1, texto: "Fondo / Colección 1:" },
                { id: 2, texto: "Fondo / Colección 2:" },
                { id: 3, texto: "Fondo / Colección 3:" }
            ]
        },
        {
            id: 24, orden: 24,
            texto: "Menciona los tipos de materiales que conforman el acervo de tu archivo/institución (marcar todos los que correspondan).",
            tipo: "catalogo_multiple",
            obligatorio: true,
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
        {
            id: 25, orden: 25,
            texto: "El acervo cuenta con materiales originales o reproducciones.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Originales" },
                { id: 2, texto: "Reproducciones" },
                { id: 3, texto: "Principalmente reproducciones y algunos originales" },
                { id: 4, texto: "Principalmente originales y algunas reproducciones" }
            ]
        },
        {
            id: 26, orden: 26,
            texto: "Identifique si existen soportes en riesgo químico por su naturaleza (marcar todas las que apliquen).",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Negativos de nitrato de celulosa" },
                { id: 2, texto: "Negativos de acetato de celulosa (síndrome de vinagre)" },
                { id: 3, texto: "Impresiones térmicas o instantáneas" },
                { id: 99, texto: "Ninguno" }
            ]
        },
        {
            id: 27, orden: 27,
            texto: "¿En qué estado de conservación física se encuentra el acervo de forma general?",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Malo", ayuda: "Deterioro activo (hongos, oxidación severa) en más del 50%" },
                { id: 2, texto: "Regular", ayuda: "Deterioro estable, pero requiere intervención de limpieza o estabilización" },
                { id: 3, texto: "Bueno", ayuda: "Material estable, sin deterioros químicos o biológicos evidentes" }
            ]
        },
        {
            id: 28, orden: 28,
            texto: "Indique el período temporal aproximado que abarca el acervo.",
            ayuda: "El año inicial y final son obligatorios, mes y día son opcionales.",
            tipo: "rango_fechas_flexibles",
            obligatorio: true
        },
        {
            id: 29, orden: 29,
            texto: "Indique el porcentaje del acervo inventariado.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "1 a 20%" },
                { id: 2, texto: "21 a 40%" },
                { id: 3, texto: "41 a 60%" },
                { id: 4, texto: "61 a 80%" },
                { id: 5, texto: "81 a 100%" }
            ]
        },
        {
            id: 30, orden: 30,
            texto: "Indique qué porcentaje del acervo está catalogado.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "1 a 20%" },
                { id: 2, texto: "21 a 40%" },
                { id: 3, texto: "41 a 60%" },
                { id: 4, texto: "61 a 80%" },
                { id: 5, texto: "81 a 100%" }
            ]
        },
        {
            id: 31, orden: 31,
            texto: "Mencione las reglas, lineamientos o estándares empleadas en la catalogación del acervo.",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "MARC21" },
                { id: 2, texto: "ISAD-G" },
                { id: 3, texto: "ISBD" },
                { id: 4, texto: "Norma Mexicana NMX-R-069-SCFI-2016" },
                { id: 5, texto: "RDA" },
                { id: 6, texto: "CCO" },
                { id: 7, texto: "ObjectID" },
                { id: 8, texto: "VRA" },
                { id: 9, texto: "Otra", especificar: true },
                { id: 99, texto: "Ninguna" }
            ]
        },
        {
            id: 32, orden: 32,
            texto: "¿Qué nivel de dominio tiene el personal responsable de la catalogación con relación a las reglas, lineamientos o estándares de catalogación?",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Inexperto", ayuda: "El personal desconoce o comprende superficialmente las reglas. Requiere guía constante, puede cometer errores frecuentes y no es capaz de aplicarlas de manera autónoma." },
                { id: 2, texto: "Básico", ayuda: "El personal conoce las reglas fundamentales y puede aplicarlas en situaciones simples. Aún requiere supervisión o apoyo en casos no rutinarios; comprende la estructura general y evita errores básicos." },
                { id: 3, texto: "Intermedio", ayuda: "El personal aplica las reglas con autonomía en situaciones complejas, anticipa errores, toma decisiones fundamentadas y brinda apoyo técnico a otros para mejorar procesos." },
                { id: 4, texto: "Avanzado", ayuda: "El personal domina la mayoría de las reglas y puede aplicarlas con autonomía en situaciones comunes y complejas. Resuelve problemas habituales, identifica errores y orienta a personal menos experimentado." },
                { id: 5, texto: "Experto", ayuda: "El personal conoce profundamente las reglas, incluyendo excepciones y escenarios complejos. Puede interpretarlas, adaptarlas cuando es necesario, proponer mejoras a los procesos, brindar capacitación y servir como referencia técnica para los demás." }
            ]
        },
        {
            id: 33, orden: 33,
            texto: "Indique el tipo de unidad de descripción usada.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Por fotografía (UDS)" },
                { id: 2, texto: "Por Unidad documental compuesta (UDC)" },
                { id: 3, texto: "Ambas" },
                { id: 99, texto: "Ninguna de las anteriores" }
            ]
        },
        {
            id: 34, orden: 34,
            texto: "Indique el porcentaje del acervo digitalizado.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "1 a 20%" },
                { id: 2, texto: "21 a 40%" },
                { id: 3, texto: "41 a 60%" },
                { id: 4, texto: "61 a 80%" },
                { id: 5, texto: "81 a 100%" }
            ]
        },
        {
            id: 35, orden: 35,
            texto: "Indique cómo se realizan los procesos de digitalización (marcar los que aplique).",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Digitalización por escaneo" },
                { id: 2, texto: "Digitalización por registro fotográfico (reprografía)" },
                { id: 3, texto: "Plan de digitalización escrito" },
                { id: 4, texto: "Plan de digitalización para conservación" },
                { id: 5, texto: "Digitalización bajo demanda" }
            ]
        },
        {
            id: 36, orden: 36,
            texto: "Indique la calidad de la digitalización empleada en su archivo/institución (marcar los que aplique).",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "No se digitaliza" },
                { id: 2, texto: "Sin estándar", ayuda: "Formatos no estables, resolución variada" },
                { id: 3, texto: "Estándar básico", ayuda: "JPEG, 300 dpi aproximadamente, uso para consulta" },
                { id: 4, texto: "Estándar intermedio", ayuda: "TIFF/JPEG de alta calidad, 300-600 dpi, color controlado" },
                { id: 5, texto: "Estándar de preservación", ayuda: "TIFF/RAW sin compresión, 600+ dpi, control de color, metadatos técnicos" }
            ]
        },
        {
            id: 37, orden: 37,
            texto: "Tomando en cuenta las características descritas de su acervo, ¿cómo evalúa la organización y gestión de su acervo?",
            tipo: "catalogo_unico",
            obligatorio: true,
            graficar: true,
            opciones: [
                { id: 1, texto: "Incipiente", ayuda: "El acervo no está organizado por fondos o subfondos y no se tiene claridad sobre su cobertura temporal. Los materiales que conforman el acervo son principalmente positivos y predominan las reproducciones. No existe inventario. La catalogación no supera el 20% y no se aplican normas o estándares por desconocimiento. La digitalización responde a necesidades puntuales y no a un plan orientado a la preservación, tanto física como digital." },
                { id: 2, texto: "Básico estructural", ayuda: "Se identifican algunos fondos o subfondos. La cobertura temporal está reconocida, aunque poco documentada. Los materiales que conforman el acervo son principalmente positivos y reproducciones. El inventario no existe o está en proceso. La catalogación apenas supera el 20% y carece de aplicación sistemática de normas por falta de capacitación. La digitalización se realiza sin un plan definido, aunque existe cierto orden que facilita la localización de archivos." },
                { id: 3, texto: "Intermedio", ayuda: "El acervo presenta una organización por fondos o subfondos, algunos definidos desde su origen y otros integrados posteriormente. Existe diversidad de materiales, con predominio de positivos y cerca de la mitad de originales. Se cuenta con un inventario parcial (alrededor del 50%) en actualización constante. Más de la mitad está catalogado con base en normas o estándares, aunque su aplicación aún no es sistemática. La digitalización cubre aproximadamente el 50%, responde principalmente a necesidades de investigación o difusión y no sigue criterios de preservación." },
                { id: 4, texto: "Consolidado", ayuda: "La organización por fondos y subfondos está claramente establecida. Se observa una amplia diversidad de materiales, con predominio de originales. El inventario cubre la mayor parte del acervo (70% o más), incluyendo documentos y objetos asociados, con distintos niveles de descripción. Aproximadamente dos terceras partes están catalogadas con aplicación consistente de normas o estándares. Existe un plan de digitalización con metas definidas y uso de formatos adecuados para la preservación." },
                { id: 5, texto: "Avanzado", ayuda: "El acervo presenta una organización sólida por fondos y subfondos. Existe alta diversidad de soportes, incluyendo positivos en papel, diapositivas, negativos, imágenes digitales, documentos asociados y dispositivos fotográficos, con predominio de originales. El inventario cubre más del 90% del conjunto. La catalogación supera las dos terceras partes y se realiza mediante la aplicación sistemática de normas y estándares, respaldada por personal capacitado. La digitalización responde a un plan integral orientado a la preservación y al acceso, con criterios técnicos más consolidados." }
            ]
        }
    ]
};