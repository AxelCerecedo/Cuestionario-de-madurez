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
            texto: "Fecha de creación del Archivo o fundación",
            ayuda: "Ingrese al menos el año. Si conoce el mes y día exactos, puede completarlos.",
            tipo: "fecha_flexible", 
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
            id: 6,
            orden: 5,
            texto: "Contactos",
            ayuda: "Agregue los contactos necesarios",
            tipo: "tabla_contactos", 
            obligatorio: true
        },
        {
            id: 7,
            orden: 6,
            texto: "Página Web (Website)",
            ayuda: "URL completa",
            tipo: "liga",
            obligatorio: false
        },
        {
            id: 8,
            orden: 7,
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
            orden: 8,
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
            orden: 9,
            texto: "Adscripción",
            ayuda: "¿Depende de alguna organización? Indicar cuál",
            tipo: "texto_corto",
            obligatorio: false
        },
        {
            id: 11,
            orden: 10,
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
            orden: 11,
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
            orden: 12,
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

   // =========================================================
// AUTO-LLENADO DE PERFIL (SOLO SI NO HAY DATOS PREVIOS)
// =========================================================
async function autoLlenarPrimerContacto() {
    console.log("🔵 [AUTO-LLENADO] Iniciando proceso...");

    // 🛑 FRENO 1: Si al arrancar ya hay datos cargados, nos vamos.
    if (localStorage.getItem('datosCargados') === 'true') {
        console.log("🛑 Datos previos ya existen. Cancelando auto-llenado.");
        return;
    }

    const idUsuario = localStorage.getItem('idUsuario');
    if (!idUsuario) return;

    try {
        // 1. OBTENER DATOS DEL USUARIO
        const response = await fetch(`https://api-cuestionario.onrender.com/api/usuario-basico/${idUsuario}`);
        const data = await response.json();
        
        if (data.error) { console.error("Error obteniendo usuario:", data.error); return; }
        
        console.log("🔵 Datos de perfil recuperados:", data);

        // 2. BUCLE PARA BUSCAR TABLA Y BOTÓN (POLLING)
        let intentos = 0;
        const maxIntentos = 10; 

        const intervalo = setInterval(() => {
            intentos++;

            // 🛑 FRENO 2: CRÍTICO
            // Revisamos en cada intento. Si en medio segundo encuesta.js terminó de cargar,
            // nosotros nos detenemos inmediatamente para no sobrescribir.
            if (localStorage.getItem('datosCargados') === 'true') {
                console.log("🛑 Se detectó carga de datos externos. Deteniendo auto-llenado.");
                clearInterval(intervalo);
                return;
            }

            const tabla = document.getElementById('tablaContactos');
            
            if (tabla) {
                // Buscamos filas EXISTENTES (Tr) en el cuerpo de la tabla
                const filas = tabla.querySelectorAll('tbody tr');
                
                // Si ya hay filas y tienen datos, asumimos que son los guardados y paramos
                if (filas.length > 0) {
                    const primerInput = filas[0].querySelector('input');
                    if (primerInput && primerInput.value !== '') {
                        // Ya hay algo escrito (probablemente recuperado de la BD)
                        console.log("🛑 La tabla ya tiene datos. Cancelando auto-llenado.");
                        clearInterval(intervalo);
                        return;
                    }
                }

                const inputs = tabla.querySelectorAll('input');
                
                // ESCENARIO A: Tabla vacía -> Clic en Agregar
                if (inputs.length === 0) {
                    const btnAgregar = document.querySelector('.btn-agregar'); // Tu clase correcta
                    if (btnAgregar) {
                        btnAgregar.click();
                    } 
                } 
                // ESCENARIO B: Ya hay inputs vacíos -> Llenamos
                else {
                    const inputNombre = inputs[0]; 
                    // OJO: Ajusta el índice si agregaste columnas. 
                    // 0=Nombre, 1=Cargo, 2=Correo (según tu HTML actual)
                    const inputCorreo = inputs[2]; 

                    // Solo llenamos si están EFECTIVAMENTE vacíos
                    if (inputNombre && inputNombre.value.trim() === '') {
                        inputNombre.value = data.nombre_completo || '';
                        inputNombre.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    if (inputCorreo && inputCorreo.value.trim() === '') {
                        inputCorreo.value = data.email || '';
                        inputCorreo.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    console.log("✨ ¡Primer contacto llenado con datos de perfil!");
                    clearInterval(intervalo); // TERMINAMOS
                }

            } 

            if (intentos >= maxIntentos) {
                clearInterval(intervalo);
            }

        }, 500); 

    } catch (error) { console.error(error); }
}

document.addEventListener('DOMContentLoaded', autoLlenarPrimerContacto);