// =========================================================
// CONFIGURACIÓN DE LA SECCIÓN 4 (NUEVA ESTRUCTURA)
// =========================================================
const CONFIG_SECCION = {
    seccion: "4. Infraestructura física y tecnológica",
    siguiente: "seccion5.html", 
    anterior: "seccion3.html", 

    preguntas: [
        {
            id: 38, orden: 38,
            texto: "¿Qué nivel de adecuación tiene el establecimiento (espacios y distribución)?",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Inadecuado", ayuda: "Espacio insuficiente o no acondicionado; distribución improvisada." },
                { id: 2, texto: "Básico estructural", ayuda: "Espacio limitado; existe cierta organización, pero no cumple condiciones mínimas." },
                { id: 3, texto: "Adecuado", ayuda: "Espacio suficiente y organizado; cumple parcialmente requisitos de resguardo." },
                { id: 4, texto: "Bueno", ayuda: "Buena distribución; áreas definidas; condiciones controladas." },
                { id: 5, texto: "Óptimo", ayuda: "Distribución profesional; espacios diferenciados y diseñados para conservación." }
            ]
        },
        {
            id: 39, orden: 39,
            texto: "¿Cuál es el nivel de equipamiento disponible para la organización, conservación y prestación de servicios relacionados con el acervo?",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Inadecuado", ayuda: "No se cuenta con equipamiento adecuado; solo herramientas básicas, insuficientes o improvisadas. No permite realizar correctamente tareas de organización, conservación o servicios." },
                { id: 2, texto: "Básico", ayuda: "Se cuenta con algunos elementos mínimos o parciales, pero no cubren las necesidades del acervo. El equipamiento permite realizar solo actividades muy esenciales." },
                { id: 3, texto: "Adecuado", ayuda: "El equipamiento es suficiente para realizar las tareas esenciales de organización, conservación y operación del acervo. Puede haber áreas por mejorar, pero las funciones principales están cubiertas." },
                { id: 4, texto: "Bueno", ayuda: "Equipamiento completo, funcional y en buenas condiciones. Permite realizar procesos especializados y ofrecer servicios de manera eficiente y estable." },
                { id: 5, texto: "Óptimo", ayuda: "Equipamiento profesional, actualizado y especializado. Cumple estándares técnicos para conservación, operación, digitalización y servicios. Permite un funcionamiento de alto nivel." }
            ]
        },
        {
            id: 40, orden: 40,
            texto: "¿Con qué equipamientos de almacenamiento acondicionados cuenta la institución? (marcar todas las que apliquen)",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Control de temperatura" },
                { id: 2, texto: "Control de humedad" },
                { id: 3, texto: "Iluminación adecuada" },
                { id: 4, texto: "Mobiliario adecuado" },
                { id: 5, texto: "Protección contra riesgos" },
                { id: 6, texto: "Todas las anteriores" }
            ]
        },
        {
            id: 41, orden: 41,
            texto: "¿Qué instalaciones fotográficas tiene la institución? (marcar todas las que apliquen)",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Laboratorio fotográfico" },
                { id: 2, texto: "Estudio fotográfico" },
                { id: 3, texto: "Área de reproducción documental" },
                { id: 4, texto: "Estación de digitalización" },
                { id: 99, texto: "Ninguna de las anteriores" }
            ]
        },
        {
            id: 42, orden: 42,
            texto: "De la siguiente lista, indique con qué infraestructura y herramientas cuenta la institución o archivo (marcar todas las que apliquen)",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Equipo de cómputo" },
                { id: 2, texto: "Conexión a internet" },
                { id: 3, texto: "Servidor" },
                { id: 4, texto: "Servicio de hosting" },
                { id: 5, texto: "Equipo de digitalización" }
            ]
        },
        {
            id: 43, orden: 43,
            texto: "De la siguiente lista, seleccione las herramientas utilizadas para resolver las necesidades de gestión de información de su acervo (marcar todas las que apliquen)",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Registros en papel" },
                { id: 2, texto: "Hojas de cálculo" },
                { id: 3, texto: "Base de datos local (sin acceso a través de internet)" },
                { id: 4, texto: "Base de datos en línea" },
                { id: 5, texto: "Sistema DAM" },
                { id: 6, texto: "Repositorio digital" },
                { id: 99, texto: "Ninguna de las anteriores" }
            ]
        },
        {
            id: 44, orden: 44,
            texto: "Mencione si se emplea alguno de los siguientes softwares para los procesos de catalogación y gestión del acervo.",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Access" },
                { id: 2, texto: "Airtable" },
                { id: 3, texto: "AtoM" },
                { id: 4, texto: "Collective Access" },
                { id: 5, texto: "Collector" },
                { id: 6, texto: "Desarrollo o base de datos a la medida" },
                { id: 7, texto: "DSpace" },
                { id: 8, texto: "Filemaker" },
                { id: 9, texto: "Koha" },
                { id: 10, texto: "Omeka" },
                { id: 11, texto: "Tainacan" },
                { id: 12, texto: "Otro", especificar: true },
                { id: 99, texto: "Ninguno" }
            ]
        },
        {
            id: 45, orden: 45,
            texto: "Métodos de resguardo digital (marcar los que aplique)",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Computadoras" },
                { id: 2, texto: "Unidades externas (discos duros, USB, CD, etc.)" },
                { id: 3, texto: "Nube gratuita" },
                { id: 4, texto: "Nube de pago" },
                { id: 5, texto: "Servidor / NAS" },
                { id: 6, texto: "Sistema DAM" },
                { id: 7, texto: "Repositorio digital" },
                { id: 99, texto: "Ninguna de las anteriores" }
            ]
        },
        {
            id: 46, orden: 46,
            texto: "Indique el porcentaje del acervo disponible en internet.",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "1% a 20%" },
                { id: 2, texto: "21% a 40%" },
                { id: 3, texto: "41% a 60%" },
                { id: 4, texto: "61% a 80%" },
                { id: 5, texto: "81% a 100%" }
            ]
        },
        {
            id: 47, orden: 47,
            texto: "Indique la dirección electrónica en donde se puede consultar el acervo.",
            tipo: "liga",
            obligatorio: false
        },
        {
            id: 48, orden: 48,
            texto: "Tomando en cuenta la disponibilidad de infraestructura física y tecnológica de su organización/institución, ¿cómo evaluaría las condiciones para el manejo de su acervo?",
            tipo: "catalogo_unico",
            obligatorio: true,
            graficar: true,
            opciones: [
                { id: 1, texto: "Inadecuado", ayuda: "El establecimiento no cuenta con condiciones y equipamiento apropiados para la preservación del acervo. No dispone de instalaciones fotográficas. La infraestructura tecnológica es mínima: principalmente equipos de cómputo y conexión a internet. No se emplean herramientas profesionales para la gestión de la información ni para el manejo de materiales digitales. Los mecanismos de resguardo son básicos y se limitan a dispositivos locales (discos duros, unidades externas). El acervo no está disponible en internet." },
                { id: 2, texto: "Básico", ayuda: "Se cuenta con condiciones y equipamiento mínimos para la preservación. Existen instalaciones fotográficas básicas. La infraestructura tecnológica es funcional, con equipo de cómputo, conexión a internet y algunos recursos de digitalización. No se utilizan herramientas especializadas para la gestión del acervo, aunque hay un uso constante de los recursos disponibles. El resguardo combina soportes físicos y servicios de nube, principalmente gratuitos. La difusión en línea es limitada y se concentra en algunos materiales publicados en redes sociales." },
                { id: 3, texto: "Intermedio", ayuda: "El establecimiento dispone de condiciones y equipamiento suficientes para garantizar niveles básicos de preservación del acervo. Cuenta con instalaciones fotográficas adecuadas. Se emplean herramientas profesionales para la gestión de la información, aunque su aprovechamiento podría optimizarse mediante capacitación. El resguardo combina soportes físicos y servicios de nube, tanto gratuitos como de pago. La difusión en línea abarca una parte del acervo, principalmente a través de redes sociales o un sitio web institucional." },
                { id: 4, texto: "Consolidado", ayuda: "Las condiciones e infraestructura aseguran la preservación del acervo. Se dispone de instalaciones fotográficas completas. Se utilizan herramientas profesionales para la gestión de la información, junto con esquemas de resguardo que integran medios físicos y soluciones digitales, como bases de datos o repositorios. Una parte significativa del acervo se difunde en internet mediante redes sociales, sitio web institucional y plataformas de consulta en línea." },
                { id: 5, texto: "Avanzado", ayuda: "La institución cuenta con infraestructura integral y equipamiento especializado que garantizan la preservación a largo plazo. Dispone de instalaciones fotográficas completas y funcionales. La gestión de la información se apoya en herramientas profesionales avanzadas, y el resguardo combina sistemas físicos y soluciones digitales robustas, como repositorios, bases de datos en línea o sistemas de gestión de activos digitales (DAM). La difusión y el acceso en línea forman parte de una estrategia establecida y sostenida." }
            ]
        }
    ]
};