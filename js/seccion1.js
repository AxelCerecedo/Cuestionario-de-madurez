// js/seccion1.js

const CONFIG_SECCION = {
  
    seccion: "1. Identificación de la Institución / Archivo",
    // Navegación
    siguiente: "seccion2.html", 
    anterior: null,            

    // Array de preguntas
    preguntas: [
        {
            id: 1, 
            orden: 1,
            texto: "Nombre del Archivo / Institución",
            ayuda: "Nombre oficial",
            tipo: "texto_corto",
            obligatorio: true
        },
        {
            id: 2,
            orden: 2,
            texto: "Año de creación del Archivo o fundación",
            ayuda: "Formato AAAA",
            tipo: "fecha",
            obligatorio: true
        },
        {
            id: 3,
            orden: 3,
            texto: "Historia del archivo",
            ayuda: "Origen y contexto de creación",
            tipo: "texto_largo",
            obligatorio: true
        },
        {
            id: 4,
            orden: 4,
            texto: "Dirección postal",
            ayuda: "Calle, número, colonia, CP",
            tipo: "direccion",
            obligatorio: true
        },
        {
            id: 5,
            orden: 5,
            texto: "Teléfono Institucional",
            ayuda: "Incluir lada",
            tipo: "numero",
            obligatorio: false
        },
        {
            id: 6,
            orden: 6,
            texto: "Contactos",
            ayuda: "Agregue los contactos necesarios",
            tipo: "tabla_contactos", 
            obligatorio: true
        },
        {
            id: 7,
            orden: 7,
            texto: "Página Web (Website)",
            ayuda: "URL completa",
            tipo: "liga",
            obligatorio: false
        },
        {
            id: 8,
            orden: 8,
            texto: "Redes Sociales",
            ayuda: "Copie y pegue la URL de sus perfiles (Deje en blanco las que no tenga)",
            tipo: "liga_multiple", 
            obligatorio: false,    
            opciones: [
                { id: 1, texto: "Instagram" },
                { id: 2, texto: "Facebook" },
                { id: 3, texto: "TikTok" },
                { id: 4, texto: "Twitter / X" },
                { id: 5, texto: "YouTube" },
                { id: 6, texto: "WhatsApp" },
                { id: 7, texto: "Snapchat" },
                { id: 8, texto: "Pinterest" },
                { id: 9, texto: "LinkedIn" },
                { id: 10, texto: "Otra" },
                { id: 99, texto: "Ninguno" }  
            ]
        },
        {
            id: 9,
            orden: 9,
            texto: "Tipo de institución",
            tipo: "catalogo_unico",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Pública" },
                { id: 2, texto: "Privada" },
                { id: 3, texto: "Organización de la Sociedad Civil" },
                { id: 4, texto: "Mixta [pública y/o privada y/o organización de la sociedad civil]" },
                { id: 5, texto: "Otro", especificar: true }
            ]
        },
        {
            id: 10,
            orden: 10,
            texto: "Adscripción",
            ayuda: "¿Depende de alguna organización? Indicar cuál",
            tipo: "texto_corto",
            obligatorio: false
        },
        {
            id: 11,
            orden: 11,
            texto: "El acervo esta en resguardo de:",
            tipo: "catalogo_unico",
            obligatorio: true, 
            opciones: [
                { id: 1, texto: "Acervo institucional" },
                { id: 2, texto: "Acervo o colección privada" },
                { id: 3, texto: "Biblioteca" },
                { id: 4, texto: "Centro de documentación" },
                { id: 5, texto: "Fototeca" },
                { id: 6, texto: "Museo" },
                { id: 7, texto: "Otro", especificar: true }
            ]
        },
        {
            id: 12,
            orden: 12,
            texto: "Tipos de acervos resguardados",
            ayuda: "Indique qué tipos de acervos o colecciones resguarda su institución (puede seleccionar más de uno)",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Artes visuales" },
                { id: 2, texto: "Arqueológica" },
                { id: 3, texto: "Histórica" },
                { id: 4, texto: "Arquitectónica" },
                { id: 5, texto: "Documental" },
                { id: 6, texto: "Etnográfica" },
                { id: 7, texto: "Bibliográfica" },
                { id: 8, texto: "Científica" },
                { id: 9, texto: "Industrial" },
                { id: 10, texto: "Numismática" },
                { id: 11, texto: "Fotográfica" },
                { id: 12, texto: "Hemerográfica" },
                { id: 13, texto: "Planoteca" },
                { id: 14, texto: "Otro", especificar: true }
            ]
        },
        {
            id: 13,
            orden: 13,
            texto: "Propósito del acervo",
            tipo: "catalogo_multiple",
            obligatorio: true,
            opciones: [
                { id: 1, texto: "Conservación patrimonial" },
                { id: 2, texto: "Producción" },
                { id: 3, texto: "Investigación / Educación" },
                { id: 4, texto: "Comercialización" },
                { id: 5, texto: "Otro", especificar: true }
            ]
        }
    ]
};

async function prellenarContactoConLogs() {
        console.log("🔵 [INICIO] Iniciando script de prellenado...");

        // 1. Obtener ID
        const idUsuario = localStorage.getItem('idUsuario');
        console.log(`🔵 ID Usuario en LocalStorage: ${idUsuario}`);
        
        if (!idUsuario) {
            console.warn("⚠️ No hay ID de usuario. No se puede prellenar.");
            return;
        }

        try {
            // 2. Pedir datos al servidor
            console.log("🔵 Solicitando datos al servidor...");
            const response = await fetch(`https://api-cuestionario.onrender.com/api/usuario-basico/${idUsuario}`);
            const data = await response.json();

            console.log("🔵 Datos recibidos del servidor:", data);

            if (data.error) {
                console.error("❌ Error en datos:", data.error);
                return;
            }

            // 3. INTENTAR BUSCAR LA TABLA (REINTENTOS)
            let intentos = 0;
            const maxIntentos = 10; // Intentar por 5 segundos

            const intervalo = setInterval(() => {
                intentos++;
                console.log(`🔎 Intento ${intentos}/${maxIntentos} buscando la tabla de contactos...`);

                // BUSCAMOS TODOS LOS INPUTS EN LA PÁGINA PARA VER QUÉ HAY
                // Asumimos que la tabla está en la pregunta 6.
                // Buscamos un contenedor que tenga pinta de ser la pregunta 6 o una tabla general
                
                // Opción A: Buscar cualquier tabla
                const tabla = document.querySelector('table'); 
                
                // Opción B (Más precisa): Si tu motor pone IDs tipo 'pregunta-6' o 'p6'
                // const divPregunta = document.getElementById('pregunta-6');
                // const tabla = divPregunta ? divPregunta.querySelector('table') : null;

                if (tabla) {
                    console.log("✅ ¡Tabla encontrada!", tabla);
                    
                    // Buscamos todos los inputs dentro de esa tabla
                    const inputs = tabla.querySelectorAll('input');
                    console.log(`✅ Se encontraron ${inputs.length} inputs dentro de la tabla.`);

                    if (inputs.length > 0) {
                        // Limpiamos el intervalo, ya encontramos lo que queríamos
                        clearInterval(intervalo);

                        // LOGICA DE LLENADO
                        // Asumimos el orden estándar: [0]=Nombre, [1]=Cargo, [2]=Correo, [3]=Teléfono
                        const inputNombre = inputs[0]; 
                        const inputCorreo = inputs[2]; // Ajusta esto si el orden es diferente

                        console.log("🎯 Input Nombre (Indice 0):", inputNombre);
                        console.log("🎯 Input Correo (Indice 2):", inputCorreo);

                        if (inputNombre) {
                            if (inputNombre.value === '') {
                                inputNombre.value = data.nombre_completo || '';
                                console.log(`✏️ Nombre llenado con: ${data.nombre_completo}`);
                            } else {
                                console.log("⚠️ El input Nombre ya tenía datos, no se sobrescribió.");
                            }
                        }

                        if (inputCorreo) {
                            if (inputCorreo.value === '') {
                                inputCorreo.value = data.email || '';
                                console.log(`✏️ Correo llenado con: ${data.email}`);
                            } else {
                                console.log("⚠️ El input Correo ya tenía datos, no se sobrescribió.");
                            }
                        }
                    } else {
                        console.warn("⚠️ La tabla existe, pero no tiene inputs dentro todavía.");
                    }

                } else {
                    console.warn("❌ Tabla no encontrada en este intento.");
                }

                if (intentos >= maxIntentos) {
                    console.error("❌ Se acabaron los intentos. No se pudo encontrar la tabla.");
                    clearInterval(intervalo);
                }

            }, 500); // Revisar cada 500ms (medio segundo)

        } catch (error) {
            console.error("❌ Error fatal en el script:", error);
        }
    }

    document.addEventListener('DOMContentLoaded', prellenarContactoConLogs);