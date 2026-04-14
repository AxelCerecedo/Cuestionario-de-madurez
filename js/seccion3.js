// =========================================================
// CONFIGURACIÓN DE LA SECCIÓN 3 (NUEVA ESTRUCTURA)
// =========================================================
const CONFIG_SECCION = {
    seccion: "III. Características del Acervo",
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
                { id: 1, texto: "Incipiente", ayuda: "El acervo no tiene organización por fondos/subfondos. No se tiene precisión de su cobertura temporal. Los materiales que conforman el acervo son principalmente positivos y predominan las reproducciones. No existe un inventario. La catalogación no supera el 20% del acervo y no se aplican reglas o estándares de catalogación por desconocimiento. La digitalización se hace siguiendo necesidades muy puntuales más que siguiendo un plan que contribuya a la preservación tanto física como digital del acervo." },
                { id: 2, texto: "Básico estructural", ayuda: "Existen algunos fondos/subfondos. Se tiene identificada la cobertura temporal del acervo, aunque poco está poco documentada. Los materiales que conforman el acervo son principalmente positivos y predominan las reproducciones. No existe un inventario o está en proceso de integración. La catalogación apenas supera el 20% del acervo y no se aplican reglas o estándares de catalogación por falta de capacitación. La digitalización del acervo no se hace conforme a un plan sino con base a necesidades específicas y coyunturales, aunque se tiene un orden y organización que facilitan la localización de materiales digitales." },
                { id: 3, texto: "Intermedio", ayuda: "El acervo está organizado por fondos/subfondos desde su origen y otros se han formado de manera posterior. Hay una diversidad de materiales, aunque predominan los positivos y un porcentaje considerable del acervo son materiales originales (alrededor del 50%). Existe un inventario parcial pero consistente (alrededor del 50%) que constantemente se actualiza. Más de la mitad del acervo está catalogado con base normas o estándares, pero hace falta capacitación para una aplicación sistemática. La digitalización no sigue un plan orientado a la preservación sino a necesidades de investigación/difusión y es cercana al 50% y no se siguen estándares de preservación." },
                { id: 4, texto: "Consolidado", ayuda: "El acervo está organizado por fondos/subfondos desde su origen y otros se han formado de manera posterior. Hay una amplia diversidad de materiales y predominan los materiales originales. Existe un inventario que abarca la mayor parte del acervo (del 70% en adelante), incluyendo documentos y objetos asociados, considerando la descripción por unidad documental simple y compuesta. Alrededor de dos terceras partes del acervo está catalogado con base una aplicación consistente de normas o estándares. Existe un plan de digitalización con metas cuantitativas, por lo que se cuenta formatos adecuados para preservación." },
                { id: 5, texto: "Avanzado", ayuda: "El acervo está organizado por fondos/sufondos desde su origen y otros se han formado de manera posterior. Hay mucha diversidad de materiales, incluyendo positivos en papel, diapositivas, negativos, fotografías digitales, documentos asociados y dispositivos fotográficos, predominando materiales originales. Existe un inventario superior al 90% del acervo. Más de dos terceras partes del acervo están catalogadas y se aplican normas o estándares de forma sistemática debido al conocimiento del personal." }
            ]
        }
    ]
};