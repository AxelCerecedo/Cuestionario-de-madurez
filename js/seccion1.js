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

    async function autoLlenarPrimerContacto() {
        console.log("🔵 [AUTO-LLENADO] Iniciando proceso...");

        const idUsuario = localStorage.getItem('idUsuario');
        if (!idUsuario) return;

        try {
            // 1. OBTENER DATOS DEL USUARIO
            const response = await fetch(`https://api-cuestionario.onrender.com/api/usuario-basico/${idUsuario}`);
            const data = await response.json();
            
            if (data.error) { console.error("Error obteniendo usuario:", data.error); return; }
            
            console.log("🔵 Datos recuperados:", data);

            // 2. BUCLE PARA BUSCAR TABLA Y BOTÓN (POLLING)
            let intentos = 0;
            const maxIntentos = 10; // Intentar durante 5 segundos aprox

            const intervalo = setInterval(() => {
                intentos++;
                const tabla = document.getElementById('tablaContactos');
                
                if (tabla) {
                    const inputs = tabla.querySelectorAll('input');
                    
                    // ESCENARIO A: La tabla está vacía (0 inputs) -> Hay que dar clic en "Agregar"
                    if (inputs.length === 0) {
                        console.log(`⚠️ Intento ${intentos}: Tabla vacía. Buscando botón .btn-agregar...`);
                        
                        // AQUÍ USAMOS LA CLASE QUE ME DISTE
                        const btnAgregar = document.querySelector('.btn-agregar');

                        if (btnAgregar) {
                            console.log("👇 Clic automático en '+ Agregar Contacto'");
                            btnAgregar.click();
                            // No detenemos el intervalo todavía, esperamos al siguiente ciclo para ver los inputs
                        } else {
                            console.warn("❌ No encuentro el botón con clase .btn-agregar");
                        }
                    } 
                    
                    // ESCENARIO B: Ya hay inputs (se creó la fila) -> Llenamos los datos
                    else {
                        console.log("✅ Inputs detectados. Procediendo a llenar...");

                        // Asumiendo orden de columnas: [0]Nombre, [1]Cargo, [2]Correo, [3]Teléfono
                        const inputNombre = inputs[0]; 
                        const inputCorreo = inputs[2]; // <--- CAMBIA A [1] SI CORREO ES LA SEGUNDA COLUMNA

                        // Solo llenamos si están vacíos para no borrar lo que escriba el usuario
                        if (inputNombre && inputNombre.value === '') {
                            inputNombre.value = data.nombre_completo;
                            // Disparamos evento para que el sistema detecte que se escribió algo
                            inputNombre.dispatchEvent(new Event('input', { bubbles: true }));
                            inputNombre.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        if (inputCorreo && inputCorreo.value === '') {
                            inputCorreo.value = data.email;
                            inputCorreo.dispatchEvent(new Event('input', { bubbles: true }));
                            inputCorreo.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        console.log("✨ ¡Primer contacto llenado con éxito!");
                        clearInterval(intervalo); // TERMINAMOS
                    }

                } else {
                    console.log(`⏳ Esperando a que se dibuje la tabla... (${intentos})`);
                }

                if (intentos >= maxIntentos) {
                    clearInterval(intervalo);
                    console.log("⏹️ Se acabaron los intentos.");
                }

            }, 500); // Revisar cada medio segundo

        } catch (error) { console.error(error); }
    }

    document.addEventListener('DOMContentLoaded', autoLlenarPrimerContacto);
