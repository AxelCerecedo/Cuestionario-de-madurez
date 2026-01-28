// js/seccion5.js

const CONFIG_SECCION = {
    seccion: "5. Gestión de información y software",
    siguiente: "seccion6.html", 
    anterior: "seccion4.html", 

    preguntas: [
        {
            id: 38,
            orden: 38,
            texto: "De la siguiente lista de herramientas, seleccione las que usa para gestionar la información de su acervo:",
            tipo: "catalogo_multiple",
            obligatorio: true,
            graficar: true,
            opciones: [
                { id: 381, texto: "Fichas manuales" },
                { id: 382, texto: "Hojas de cálculo" },
                { id: 383, texto: "Base de datos local" },
                { id: 384, texto: "Base de datos en línea" },
                { id: 385, texto: "Sistema DAM" },
                { id: 386, texto: "Repositorio digital" },
                { id: 3899, texto: "Ninguna de las anteriores" }
            ]
        },
        {
            id: 39,
            orden: 39,
            texto: "Nivel de experiencia:",
            tipo: "matriz_dinamica",
            id_pregunta_origen: 38,
            invertir_ejes: true, 
            obligatorio: true,
            graficar: true,
            columnas: [
                { id: 1, texto: "Inventario" },
                { id: 2, texto: "Catalogación" },
                { id: 3, texto: "Control de movimientos" },
                { id: 4, texto: "Gestión del acervo" },
                { id: 5, texto: "Listas de obra" },
                { id: 6, texto: "Reportes" },
                { id: 7, texto: "Consulta interna" },
                { id: 8, texto: "Consulta pública" },
                { id: 9, texto: "Registro" },
                { id: 10, texto: "Diagnóstico" },
                { id: 11, texto: "Investigación" },
                { id: 12, texto: "Otro" }
            ]
        },
        {
            id: 40,
            orden: 40,
            texto: "Porcentaje del acervo disponible en linea",
            tipo: "catalogo_unico",
            obligatorio: true, 
            graficar: true,
            puntaje_regla: "escala_directa", 
            opciones: [
                { id: 1, texto: "De 1 a 20%" },
                { id: 2, texto: "De 21 a 40%" },
                { id: 3, texto: "De 41 a 60%" },
                { id: 4, texto: "De 61 a 80%" },
                { id: 5, texto: "De 81 a 100%" }
            ]
        }
    ]
};

// =========================================================
// 🕵️‍♂️ MODO DIAGNÓSTICO (CON LOGS)
// =========================================================

// 1. EVENTO DE CAMBIO (EXCLUSIVIDAD)
document.addEventListener('change', function(e) {
    // Filtramos solo checkboxes de la pregunta 38
    if (e.target.type === 'checkbox' && e.target.getAttribute('data-id-pregunta') === '38') {
        
        console.log("🔘 CLICK DETECTADO EN PREGUNTA 38");
        
        const checkbox = e.target;
        const valor = parseInt(checkbox.value);
        const ID_NINGUNA = 3899;
        const grupo = document.querySelectorAll('input[type="checkbox"][data-id-pregunta="38"]');

        console.log(`   -> Valor clickeado: ${valor}`);
        console.log(`   -> Estado: ${checkbox.checked ? 'Marcado' : 'Desmarcado'}`);

        // A. Si marqué Ninguna -> Borrar las demás
        if (valor === ID_NINGUNA && checkbox.checked) {
            console.warn("   ⚠️ SELECCIONÓ 'NINGUNA'. BORRANDO LAS DEMÁS...");
            grupo.forEach(cb => {
                if (parseInt(cb.value) !== ID_NINGUNA) {
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }

        // B. Si marqué Otra -> Borrar Ninguna
        if (valor !== ID_NINGUNA && checkbox.checked) {
            console.log("   -> Seleccionó otra opción. Verificando si 'Ninguna' estaba marcada...");
            grupo.forEach(cb => {
                if (parseInt(cb.value) === ID_NINGUNA) {
                    if(cb.checked) {
                        console.warn("   ⚠️ DESMARCANDO 'NINGUNA'...");
                        cb.checked = false;
                        cb.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        }
    }
});

// 2. MONITOR CONSTANTE (BUSCA Y OCULTA)
setInterval(() => {
    const ID_NINGUNA = 3899;
    
    // 1. BUSCAR EL CHECKBOX 'NINGUNA'
    // Usamos el selector más específico posible
    const checkNinguna = document.querySelector(`input[value="${ID_NINGUNA}"][data-id-pregunta="38"]`);
    
    if (!checkNinguna) {
        // Solo mostramos este log una vez cada tanto para no saturar, pero sirve para saber si existe el input
        // console.log("❌ ERROR: No encuentro el input checkbox de 'Ninguna' (ID 3899)");
        return; 
    }

    // 2. BUSCAR EL CONTENEDOR DE LA MATRIZ (PREGUNTA 39)
    let contenedorMatriz = document.getElementById('pregunta-container-39');
    
    // Plan B: Buscar por atributo
    if (!contenedorMatriz) {
        // console.log("🔍 Buscando contenedor 39 por método alternativo...");
        const inputMatriz = document.querySelector('[data-id-pregunta="39"]'); // Algún input dentro de la matriz
        if (inputMatriz) {
            contenedorMatriz = inputMatriz.closest('.card') || inputMatriz.closest('.mb-4') || inputMatriz.closest('.pregunta-container');
        }
    }

    if (!contenedorMatriz) {
        // Si no existe el contenedor 39, no podemos ocultarlo.
        // Esto pasa si encuesta.js aun no lo dibuja.
        return; 
    }

    // 3. APLICAR LÓGICA
    if (checkNinguna.checked) {
        // Si Ninguna está marcada...
        
        // Verificamos si ya está oculta para no spammear la consola
        if (contenedorMatriz.style.display !== 'none') {
            console.warn("🔥 ACCIÓN: OCULTANDO MATRIZ 39 (Force Hide)");
            contenedorMatriz.style.setProperty('display', 'none', 'important');
            
            // INTENTO EXTRA: Ocultar también el título si está separado
            // A veces el título está en un div hermano anterior
            if(contenedorMatriz.previousElementSibling && contenedorMatriz.previousElementSibling.tagName === 'H5') {
                 contenedorMatriz.previousElementSibling.style.display = 'none';
            }
        } else {
            // Ya está oculta, aseguramos por si acaso
            contenedorMatriz.style.setProperty('display', 'none', 'important');
        }

    } else {
        // Si Ninguna NO está marcada...
        
        // Verificamos si hay otras marcadas
        const hayOtras = document.querySelectorAll('input[type="checkbox"][data-id-pregunta="38"]:checked').length > 0;
        
        if (hayOtras) {
            if (contenedorMatriz.style.display === 'none') {
                console.log("✅ ACCIÓN: MOSTRANDO MATRIZ 39");
                contenedorMatriz.style.display = 'block';
            }
        } else {
            // Si no hay nada marcado, también ocultamos
            if (contenedorMatriz.style.display !== 'none') {
                // console.log("👻 Ocultando matriz porque no hay nada seleccionado");
                contenedorMatriz.style.setProperty('display', 'none', 'important');
            }
        }
    }

}, 200); // Revisar cada 200msa