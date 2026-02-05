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

async function prellenarContactoMejorado() {
        console.log("🔵 [INICIO] Script de auto-llenado v3");

        const idUsuario = localStorage.getItem('idUsuario');
        if (!idUsuario) return;

        try {
            // 1. Obtener Datos
            const response = await fetch(`https://api-cuestionario.onrender.com/api/usuario-basico/${idUsuario}`);
            const data = await response.json();
            
            if (data.error) { console.error("Error datos:", data.error); return; }
            
            console.log("🔵 Datos listos para usar:", data);

            // 2. Bucle de intentos (Polling)
            let intentos = 0;
            const maxIntentos = 10; 

            const intervalo = setInterval(() => {
                intentos++;
                const tabla = document.getElementById('tablaContactos'); // Usamos el ID que vimos en tu log

                if (tabla) {
                    const inputs = tabla.querySelectorAll('input');
                    
                    // CASO A: Ya hay inputs (filas) -> Llenamos y terminamos
                    if (inputs.length > 0) {
                        console.log("✅ Inputs detectados. Llenando...");
                        
                        // Asumiendo orden: Nombre (0), Cargo (1), Correo (2), Teléfono (3)
                        // Ajusta los índices [0] y [2] si tu tabla tiene otro orden
                        if (inputs[0] && inputs[0].value === '') inputs[0].value = data.nombre_completo;
                        if (inputs[2] && inputs[2].value === '') inputs[2].value = data.email;
                        
                        // Disparar evento 'input' para que el motor sepa que hubo cambios (importante para guardar)
                        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
                        inputs[2].dispatchEvent(new Event('input', { bubbles: true }));

                        clearInterval(intervalo);
                        console.log("✨ ¡Contacto pre-llenado con éxito!");
                        return;
                    } 
                    
                    // CASO B: Tabla vacía -> Intentamos agregar fila
                    else {
                        console.warn(`⚠️ Intento ${intentos}: Tabla vacía. Buscando botón 'Agregar'...`);
                        
                        // ESTRATEGIA PARA ENCONTRAR EL BOTÓN
                        // 1. Buscamos botones dentro del contenedor de la pregunta
                        // 2. Buscamos botones genéricos con texto "+" o "Agregar"
                        
                        // Opción 1: Buscar por clase común (ajusta esto si tu botón tiene otra clase)
                        let btnAgregar = document.querySelector('.btn-agregar-fila') || 
                                         document.querySelector('.btn-add') ||
                                         document.getElementById('btnAgregarContacto');

                        // Opción 2: Buscar por texto (Fuerza bruta)
                        if (!btnAgregar) {
                            const botones = document.querySelectorAll('button');
                            for (let btn of botones) {
                                if (btn.innerText.includes('Agregar') || btn.innerText.includes('+')) {
                                    // Verificamos que esté cerca de nuestra tabla (opcional)
                                    btnAgregar = btn;
                                    break;
                                }
                            }
                        }

                        if (btnAgregar) {
                            console.log("👇 Haciendo clic automático en el botón:", btnAgregar);
                            btnAgregar.click();
                            // No limpiamos el intervalo, esperamos al siguiente ciclo para ver si ya aparecieron los inputs
                        } else {
                            console.error("❌ No encuentro el botón de agregar. Necesito que le pongas un ID en el HTML.");
                        }
                    }

                } else {
                    console.log(`⏳ Esperando tabla... (${intentos})`);
                }

                if (intentos >= maxIntentos) clearInterval(intervalo);

            }, 500); 

        } catch (error) { console.error(error); }
    }

    document.addEventListener('DOMContentLoaded', prellenarContactoMejorado);