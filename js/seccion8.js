const CONFIG_SECCION = {
    seccion: "8. Normatividad y procesos",
    siguiente: "seccion9.html", 
    anterior: "seccion7.html", 

    preguntas: [
        // --- GRUPO 1: PROCESOS GENERALES (Checkboxes simples fuera de tabla) ---
        {
            id: 49, 
            orden: 48,
            texto: "A continuación, se presenta una lista de procesos de planificación, gestión y conservación.",
            //ayuda: "Marque todos los procesos con los que cuenta su institución (Si aplica):",
            tipo: "catalogo_multiple", 
            obligatorio: true,
            graficar: true,
            opciones: [
                { 
                    id: 491, 
                    texto: "Proceso formal para la entrada o ingreso de objetos al acervo.", 
                    ayuda: "Existe un documento o proceso oficial de entrada." 
                },
                { 
                    id: 492, 
                    texto: "Proceso establecido para la salida de objetos del acervo (temporal o definitiva).", 
                    ayuda: "Existe proceso para salidas temporales o definitivas." 
                },
                { 
                    id: 493, 
                    texto: "Plan de emergencia actualizado para la protección del acervo", 
                    ayuda: "Cuenta con un plan actualizado ante desastres." 
                }
            ]
        },

        // --- GRUPO 2: DETALLES ESPECÍFICOS (Ahora sí, la Tabla) ---
        {
            id: 50, // <--- NUEVO ID
            orden: 49,
            texto: "Detalles sobre gestión y normatividad",
            ayuda: "Para cada rubro, seleccione la opción que describa mejor su situación.",
            tipo: "catalogo_tabla", // <--- ESTE SE QUEDA COMO TABLA
            obligatorio: true,
            graficar: true,
            encabezados: ["Rubro / Documento", "Opciones / Frecuencia"], // Encabezados coherentes
            opciones: [
                // AQUÍ SOLO DEJAMOS LAS COMPLEJAS
                { 
                    id: 494, 
                    texto: "Tipo de documento que utiliza para préstamo y devolución", 
                    ayuda: "Formatos utilizados:",
                    sub_opciones: [
                        { id: 4941, texto: "Formato institucional" },
                        { id: 4942, texto: "Contrato" },
                        { id: 4943, texto: "Hoja de movimientos" },
                        { id: 4944, texto: "Otro", especificar: true }
                    ]
                },
                { 
                    id: 495, 
                    texto: "Frecuencia de auditorías", 
                    modo: "unica",
                    ayuda: "Frecuencia de realización:",
                    sub_opciones: [
                        { id: 4951, texto: "No se realizan" },
                        { id: 4952, texto: "Cada dos años o más" },
                        { id: 4953, texto: "Anual" },
                        { id: 4954, texto: "Semestral" },
                        { id: 4955, texto: "Trimestral" }
                    ]
                },
                { 
                    id: 496, 
                    texto: "Evaluación de estado de conservación", 
                    modo: "unica",
                    ayuda: "¿Quién la realiza?",
                    sub_opciones: [
                        { id: 4961, texto: "Especialista interno" },
                        { id: 4962, texto: "Especialista externo" },
                        { id: 4963, texto: "Ambos" }
                    ]
                },
                { 
                    id: 497, 
                    texto: "Registro formal de daños/pérdidas",
                    modo: "unica",
                    ayuda: "Frecuencia de actualización:",
                    sub_opciones: [
                        { id: 4971, texto: "No se lleva registro" },
                        { id: 4972, texto: "Anual" },
                        { id: 4973, texto: "Semestral / Trimestral" },
                        { id: 4974, texto: "Bimestral / Mensual" },
                        { id: 4975, texto: "Cada incidente (Inmediato)" }
                    ]
                }
            ]
        }
    ]
};