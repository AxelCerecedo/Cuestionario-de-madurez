// js/seccion8.js

const CONFIG_SECCION = {
    seccion: "8. Normatividad y procesos",
    siguiente: "seccion9.html", 
    anterior: "seccion7.html", 

    preguntas: [
        {
            id: 49, 
            orden: 49,
            texto: "Evaluación de procesos, normatividad y conservación",
            ayuda: "Marque la casilla izquierda para confirmar. Si hay opciones, selecciónelas en la derecha.",
            tipo: "catalogo_tabla", 
            obligatorio: true,
            graficar: true,
            encabezados: ["Proceso / Normatividad", "Detalles / Selección"],
            opciones: [
                // --- A. BOOLEANOS (Padres simples) ---
                { 
                    id: 491, // VALE 1 PUNTO
                    texto: "Proceso formal de ingreso", 
                    ayuda: "Marque si existe un documento o proceso oficial de entrada." 
                },
                { 
                    id: 492, // VALE 1 PUNTO
                    texto: "Proceso formal de salida", 
                    ayuda: "Marque si existe proceso para salidas temporales o definitivas." 
                },
                { 
                    id: 493, // VALE 1 PUNTO
                    texto: "Plan de emergencia", 
                    ayuda: "Marque si cuenta con un plan actualizado para protección del acervo." 
                },

                // --- B. LISTAS DESPLEGABLES ---
                
                // ESTA SE QUEDA MULTIPLE (CHECKBOXES) - NO AGREGAMOS NADA
                { 
                    id: 494, 
                    texto: "Documentos de préstamo/devolución", 
                    ayuda: "Seleccione los formatos que utiliza:",
                    sub_opciones: [
                        { id: 4941, texto: "Formato institucional" },
                        { id: 4942, texto: "Contrato / Convenio" },
                        { id: 4943, texto: "Hoja de movimientos" },
                        { id: 4944, texto: "Otro", especificar: true }
                       
                    ]
                },

                // ESTA SERÁ ÚNICA (RADIO BUTTONS)
                { 
                    id: 495, 
                    texto: "Frecuencia de auditorías", 
                    modo: "unica", // <--- AGREGAR ESTO
                    ayuda: "Seleccione la frecuencia actual:",
                    sub_opciones: [
                        { id: 4951, texto: "No se realizan" },
                        { id: 4952, texto: "Cada dos años o más" },
                        { id: 4953, texto: "Anual" },
                        { id: 4954, texto: "Semestral" },
                        { id: 4955, texto: "Trimestral" }
                    ]
                },

                // ESTA SERÁ ÚNICA
                { 
                    id: 496, 
                    texto: "Evaluación de conservación", 
                    modo: "unica", // <--- AGREGAR ESTO
                    ayuda: "¿Quién la realiza?",
                    sub_opciones: [
                        { id: 4961, texto: "Especialista interno" },
                        { id: 4962, texto: "Especialista externo" },
                        { id: 4963, texto: "Ambos" }
                    ]
                },

                // ESTA SERÁ ÚNICA
                { 
                    id: 497, 
                    texto: "Registro formal de daños/pérdidas",
                    modo: "unica", // <--- AGREGAR ESTO
                    ayuda: "¿Con qué frecuencia se actualiza?",
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