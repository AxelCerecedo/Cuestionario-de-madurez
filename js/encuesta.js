// js/encuesta.js

const API_URL_SAVE = 'https://api-cuestionario.onrender.com'; 

document.addEventListener('DOMContentLoaded', async function() { 
    
    // 1. VERIFICAR USUARIO
    const idUsuario = localStorage.getItem('idUsuario');
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    
    if (!idUsuario) {
        window.location.href = 'login.html';
        return;
    }

    // 2. BIENVENIDA
    const divBienvenida = document.getElementById('mensajeBienvenida');
    const esSeccionUno = window.location.href.includes('seccion1.html');
    if (nombreUsuario && divBienvenida && esSeccionUno) {
        divBienvenida.innerHTML = `👋 ¡Hola, <b>${nombreUsuario}</b>! <br> Tu progreso se guardará automáticamente.`;
        divBienvenida.style.display = 'block';
    }

    // 3. CONFIGURAR UI (Botones atrás/cerrar sesión)
    if (typeof configurarBotonesNavegacion === 'function') {
        configurarBotonesNavegacion();
    }

    // 4. CARGAR ESTRUCTURA DE PREGUNTAS (Dibuja el HTML)
    cargarCuestionarioLocal();

    // 5. RECUPERAR PROGRESO (Llena los inputs con datos)
    console.log("⏳ Esperando datos del servidor...");
    await cargarRespuestasPrevias(idUsuario); 
    console.log("✅ Datos cargados y cacheados.");

    // --- REFRESCAR MATRICES SI HAY DATOS PREVIOS ---
    const inputsOrigenActivados = document.querySelectorAll('.input-multiple:checked');
    if (inputsOrigenActivados.length > 0) {
        inputsOrigenActivados[0].dispatchEvent(new Event('change'));
        console.log("🔄 Disparador de matriz ejecutado.");
    }

    // 6. INICIALIZAR LÓGICA CONDICIONAL (SI/NO -> OCULTAR/MOSTRAR)
    // Usamos un try-catch para que si esta función falla, NO detenga el resto del código
    try {
        if (typeof inicializarLogicaCondicional === 'function') {
            inicializarLogicaCondicional();
        } else {
            console.warn("⚠️ La función 'inicializarLogicaCondicional' no está definida. Copia el código al final del archivo.");
        }
    } catch (e) {
        console.error("Error al iniciar lógica condicional:", e);
    }

    // 7. VERIFICAR SI ESTÁ FINALIZADA (MODO LECTURA)
    const estaFinalizada = localStorage.getItem('encuestaFinalizada');
    if (estaFinalizada === '1') {
        activarModoSoloLectura();
    }
    
    // 8. EVENTO SUBMIT (ESTO ACTIVA LAS VALIDACIONES ROJAS)
    const form = document.getElementById('formularioDinamico');
    if (form) {
        console.log("✅ Evento Submit asignado correctamente.");
        form.addEventListener('submit', enviarFormulario);
    } else {
        console.error("❌ No se encontró el formulario #formularioDinamico");
    }
});

// =========================================================
// NUEVA FUNCIÓN: BOTONES DE NAVEGACIÓN (HEADER)
// =========================================================
function configurarBotonesNavegacion() {
    // A. LOGICA CERRAR SESIÓN (Botón Rojo)
    const btnLogout = document.getElementById('btnCerrarSesion');
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            if(confirm("¿Estás seguro de cerrar sesión?")) {
                localStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }

    // B. LOGICA BOTÓN REGRESAR (Lado Izquierdo del Header)
    // Verificamos si existe configuración de página anterior
    if (typeof CONFIG_SECCION !== 'undefined' && CONFIG_SECCION.anterior) {
        
        // Buscamos el contenedor NUEVO en el header
        const areaHeaderIzquierda = document.getElementById('areaBotonRegresar');
        
        if (areaHeaderIzquierda) {
            const btnAtras = document.createElement('button');
            btnAtras.type = 'button';
            btnAtras.innerHTML = "⬅ Regresar"; // Puedes usar íconos
            
            // Estilos para que se vea bien en el header
            btnAtras.style.backgroundColor = "#6c757d"; // Gris
            btnAtras.style.color = "white";
            btnAtras.style.border = "none";
            btnAtras.style.padding = "10px 15px";
            btnAtras.style.borderRadius = "5px";
            btnAtras.style.cursor = "pointer";
            btnAtras.style.fontSize = "14px";

            // Acción
            btnAtras.addEventListener('click', function() {
                window.location.href = CONFIG_SECCION.anterior;
            });

            // Insertamos el botón en el área izquierda del header
            areaHeaderIzquierda.appendChild(btnAtras);
        }
    }
}

// =========================================================
// CARGA DE PREGUNTAS (Adaptada a archivos individuales)
// =========================================================
function cargarCuestionarioLocal() {
    const contenedor = document.getElementById('contenedorPreguntas');
    contenedor.innerHTML = ''; 

    // Verificamos que el archivo seccionX.js se haya cargado bien
    if (typeof CONFIG_SECCION === 'undefined') {
        contenedor.innerHTML = '<p style="color:red">Error: No se encontró la variable CONFIG_SECCION. Revisa que importaste el js de la sección.</p>';
        return;
    }

    // Dibujamos
    CONFIG_SECCION.preguntas.forEach(p => {
        contenedor.appendChild(crearHTMLPregunta(p));
    });
}

function crearHTMLPregunta(p) {
    const div = document.createElement('div');

    if (p.id) div.id = `pregunta-box-${p.id}`;
    
    // --- 1. TÍTULOS DE SUBSECCIÓN ---
    if (p.tipo === 'titulo_subseccion') {
        const h3 = document.createElement('h3');
        h3.innerText = p.texto;
        h3.style.color = '#0056b3';
        h3.style.borderBottom = '2px solid #ddd';
        h3.style.paddingBottom = '5px';
        h3.style.marginTop = '30px';
        div.appendChild(h3);
        return div;
    }

    // --- 2. TÍTULOS DE SECCIÓN PRINCIPAL ---
    if (p.tipo === 'titulo_seccion') {
        const h3 = document.createElement('h3');
        h3.innerText = p.texto; 
        h3.style.marginTop = '20px'; 
        h3.style.color = '#555';
        div.style.border = 'none'; 
        div.style.background = 'transparent';
        div.appendChild(h3);
        return div;
    }

    div.className = 'pregunta-box';

    // --- LABEL PRINCIPAL ---
    const label = document.createElement('label');
    label.className = 'titulo-pregunta';
    label.innerHTML = `${p.orden}. ${p.texto} ${p.obligatorio ? '<span style="color:red">*</span>' : ''}`;
    div.appendChild(label);

    if (p.ayuda) {
        const ayuda = document.createElement('small');
        ayuda.className = 'texto-ayuda';
        ayuda.textContent = p.ayuda;
        div.appendChild(ayuda);
    }

    // =========================================================
    // TIPOS DE INPUTS
    // =========================================================

    // --- A. RANGO DE FECHAS ---
    if (p.tipo === 'rango_fechas') {
        const containerFechas = document.createElement('div');
        containerFechas.style.display = 'flex';
        containerFechas.style.gap = '20px';
        
        // Input 1 (ESTE SÍ SE GUARDA)
        const input1 = document.createElement('input');
        input1.type = 'date'; 
        input1.className = 'input-respuesta'; // <--- ESTE SÍ TIENE LA CLASE
        input1.dataset.idPregunta = p.id; 
        input1.dataset.tipo = 'texto';
        input1.style.width = '48%'; 
        
        // Input 2 (ESTE ES SOLO VISUAL)
        const input2 = document.createElement('input');
        input2.type = 'date'; 
        // input2.className = 'input-respuesta'; 
        input2.className = 'input-auxiliar';    
        input2.style.width = '48%';
        
        const actualizarRango = () => { 
            if(input1.value && input2.value) {
                // Guardamos todo en el input 1
                input1.dataset.rangoValor = `${input1.value} al ${input2.value}`; 
            }
        };
        input1.addEventListener('change', actualizarRango);
        input2.addEventListener('change', actualizarRango);

        containerFechas.appendChild(input1);
        containerFechas.appendChild(input2);
        div.appendChild(containerFechas);
    }

    // --- B. BOOLEANOS (SÍ / NO) ---
    else if (p.tipo === 'booleano') {
        const divOpciones = document.createElement('div');
        divOpciones.style.display = 'flex'; 
        divOpciones.style.gap = '20px'; 
        divOpciones.style.marginTop = '10px';

        ['1', '0'].forEach(val => {
            const lbl = document.createElement('label');
            const rad = document.createElement('input');
            rad.type = 'radio'; 
            rad.name = `pregunta_${p.id}`; 
            rad.value = val;
            rad.className = 'input-respuesta'; 
            rad.dataset.idPregunta = p.id; 
            rad.dataset.tipo = 'opcion_unica';
            
            lbl.appendChild(rad); 
            lbl.appendChild(document.createTextNode(val === '1' ? " Sí" : " No"));
            divOpciones.appendChild(lbl);
        });
        div.appendChild(divOpciones);
    }

    // --- C. CATÁLOGOS (ÚNICO / MÚLTIPLE) ---
    else if (p.tipo === 'catalogo_unico' || p.tipo === 'catalogo_multiple') {
        
        const usarRadios = p.tipo === 'catalogo_unico' && (p.opciones.some(o => o.ayuda) || p.opciones.length <= 5);

        // OPCIÓN 1: SELECT
        if (p.tipo === 'catalogo_unico' && !usarRadios) {
            const select = document.createElement('select');
            select.className = 'input-respuesta'; 
            select.dataset.idPregunta = p.id; 
            select.dataset.tipo = 'opcion_unica';
            // Restauramos estilo ancho completo para selects también
            select.style.width = '100%';
            select.style.padding = '8px';
            
            const inputOtro = document.createElement('input');
            inputOtro.type = 'text'; 
            inputOtro.placeholder = 'Especifique...'; 
            inputOtro.style.display = 'none';
            inputOtro.className = 'input-especificar'; 
            inputOtro.dataset.idPregunta = p.id;
            inputOtro.style.marginTop = '10px';
            inputOtro.style.width = '100%';

            select.appendChild(new Option('Seleccione...', ''));
            p.opciones.forEach(opt => {
                const option = new Option(opt.texto, opt.id);
                if (opt.especificar) option.dataset.requiereTexto = "true";
                select.appendChild(option);
            });

            select.addEventListener('change', function() {
                const op = select.options[select.selectedIndex];
                inputOtro.style.display = (op && op.dataset.requiereTexto === "true") ? 'block' : 'none';
                if(inputOtro.style.display === 'none') inputOtro.value = '';
            });

            div.appendChild(select); 
            div.appendChild(inputOtro);
        } 
        
        // OPCIÓN 2: LISTA (Radios o Checkboxes)
        else {
            const container = document.createElement('div');
            p.opciones.forEach(opt => {
                const row = document.createElement('div');
                row.className = 'opcion-item'; 
                
                // Aumentamos margen inferior porque ahora la ayuda ocupa espacio arriba
                row.style.marginBottom = '15px'; 
                
                // 1. PRIMERO: TEXTO DE AYUDA (ARRIBA)
                if (opt.ayuda) {
                    const txtAyuda = document.createElement('div');
                    txtAyuda.innerHTML = `<span style="color:#555; font-size:0.95em;">${opt.ayuda}</span>`;
                    txtAyuda.style.marginBottom = '4px'; // Separación pequeña con el radio
                    txtAyuda.style.fontStyle = 'italic';
                    row.appendChild(txtAyuda);
                }

                // 2. SEGUNDO: RADIO/CHECKBOX + TÍTULO
                const labelOpt = document.createElement('label');
                labelOpt.style.fontWeight = 'normal'; 
                labelOpt.style.cursor = 'pointer'; 
                labelOpt.style.display = 'flex';      // Alineación
                labelOpt.style.alignItems = 'center'; // Centrado vertical
                
                const input = document.createElement('input');
                input.type = p.tipo === 'catalogo_multiple' ? 'checkbox' : 'radio';
                input.name = p.tipo === 'catalogo_unico' ? `pregunta_${p.id}` : null;
                input.value = opt.id;
                
                input.className = p.tipo === 'catalogo_multiple' ? 'input-multiple' : 'input-respuesta';
                input.dataset.idPregunta = p.id;
                if(p.tipo === 'catalogo_unico') input.dataset.tipo = 'opcion_unica';

                // Lógica de exclusividad
                input.addEventListener('change', function() {
                    const esExclusivo = (this.value == '99' || (this.value == '6' && p.puntaje_regla === 'acumulativo_max5'));
                    
                    if (this.checked && esExclusivo && p.tipo === 'catalogo_multiple') {
                        container.querySelectorAll('input').forEach(o => { 
                            if(o !== this) { 
                                o.checked = false; 
                                o.dispatchEvent(new Event('change'));
                            } 
                        });
                    } else if (this.checked && !esExclusivo && p.tipo === 'catalogo_multiple') {
                        container.querySelectorAll('input[value="99"], input[value="6"]').forEach(o => {
                            if(o.value == '99' || (o.value == '6' && p.puntaje_regla === 'acumulativo_max5')) o.checked = false;
                        });
                    }
                });

                labelOpt.appendChild(input); 
                labelOpt.appendChild(document.createTextNode(" " + opt.texto));
                row.appendChild(labelOpt);

                // 3. TERCERO: INPUT ESPECIFIQUE (Debajo del radio)
                if (opt.especificar) {
                    const inputOtro = document.createElement('input');
                    inputOtro.type = 'text'; 
                    inputOtro.placeholder = 'Especifique cuál...'; 
                    inputOtro.style.display = 'none';
                    inputOtro.className = 'input-especificar-multiple'; 
                    inputOtro.dataset.idPregunta = p.id; 
                    inputOtro.dataset.idOpcion = opt.id;
                    inputOtro.style.marginLeft = '20px';
                    inputOtro.style.marginTop = '5px';
                    
                    row.appendChild(inputOtro);
                    
                    input.addEventListener('change', function() { 
                        inputOtro.style.display = this.checked ? 'block' : 'none'; 
                        if(!this.checked) inputOtro.value='';
                    });
                }
                container.appendChild(row);
            });
            div.appendChild(container);
        }
    }

    // --- D. TABLA DE CONTACTOS ----
    else if (p.tipo === 'tabla_contactos') {
        const tableContainer = document.createElement('div');
        
        // Estilos del contenedor principal
        tableContainer.style.marginTop = '15px';
        tableContainer.style.border = '1px solid #e9ecef';
        tableContainer.style.borderRadius = '8px';
        tableContainer.style.overflow = 'hidden'; 
        tableContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';

        tableContainer.innerHTML = `
            <div style="overflow-x: auto; background: #fff;">
                <table class="tabla-contactos" id="tablaContactos" style="width:100%; border-collapse: collapse; min-width: 700px; font-family: sans-serif;">
                    <thead>
                        <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 12px 10px; text-align: left; color: #495057; font-weight: 600; width: 22%;">Nombre Completo</th>
                            <th style="padding: 12px 10px; text-align: left; color: #495057; font-weight: 600; width: 20%;">Cargo</th>
                            <th style="padding: 12px 10px; text-align: left; color: #495057; font-weight: 600; width: 22%;">Correo Electrónico</th>
                            <th style="padding: 12px 10px; text-align: left; color: #495057; font-weight: 600; width: 15%;">Tel. Institucional</th>
                            <th style="padding: 12px 10px; text-align: left; color: #495057; font-weight: 600; width: 15%;">Otro Teléfono</th>
                            <th style="width: 6%;"></th> 
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            
            <div style="padding: 15px; background: #fafafa; border-top: 1px solid #eee; text-align: left;">
                <button type="button" class="btn-agregar" onclick="agregarFilaContacto()" 
                    style="
                        padding: 8px 16px; 
                        background-color: #fff; 
                        border: 1px solid #7c1225; /* Borde Rojo Vino */
                        color: #7c1225;           /* Texto Rojo Vino */
                        border-radius: 5px; 
                        cursor: pointer; 
                        font-weight: 500;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.2s ease;
                    "
                    onmouseover="this.style.backgroundColor='#7c1225'; this.style.color='white';"
                    onmouseout="this.style.backgroundColor='#fff'; this.style.color='#7c1225';"
                >
                    <i class="fas fa-user-plus"></i> Agregar Contacto
                </button>
            </div>
        `;
        div.appendChild(tableContainer);
        
        // Cargar fila inicial si no hay datos
        if (!localStorage.getItem('datosCargados')) {
             setTimeout(() => agregarFilaContacto(), 100); 
        }
    }

    // --- E. LIGA MÚLTIPLE (REDES SOCIALES) ---
    else if (p.tipo === 'liga_multiple') {
        const container = document.createElement('div');
        
        p.opciones.forEach(opt => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.marginBottom = '10px';

            // 1. ETIQUETA (LABEL) IZQUIERDA
            // Usamos el mismo estilo para todos (incluido "Ninguno") para que alineen perfecto
            const label = document.createElement('label');
            label.innerText = opt.texto + (opt.id !== 99 ? ":" : ""); // Dos puntos solo si no es Ninguno
            label.style.width = '120px'; 
            label.style.fontWeight = 'bold';
            label.style.color = '#555';
            row.appendChild(label);

            // 2. CAMPO DERECHO (INPUT O CHECKBOX)
            if (opt.id === 99) {
                // --- CASO NINGUNO: CHECKBOX ---
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = 'Ninguna';
                
                // ⚠️ ESTO ES LO QUE FALTABA PARA GUARDAR/RECUPERAR:
                checkbox.className = 'input-ninguno-manual'; // Clase especial para identificarlo
                checkbox.dataset.idPregunta = p.id;
                checkbox.dataset.idOpcion = 99; 
                
                checkbox.style.marginLeft = '10px'; 
                checkbox.style.transform = "scale(1.2)";
                checkbox.style.cursor = "pointer";
                
                // Lógica de bloqueo
                checkbox.addEventListener('change', function() {
                    const inputsSociales = container.querySelectorAll('.input-social');
                    if (this.checked) {
                        inputsSociales.forEach(input => {
                            input.value = ''; 
                            input.disabled = true; 
                            input.style.backgroundColor = '#f0f0f0';
                        });
                    } else {
                        inputsSociales.forEach(input => {
                            input.disabled = false; 
                            input.style.backgroundColor = '#fff';
                        });
                    }
                });

                row.appendChild(checkbox);
                
                // (Opcional) Texto "(marca)" si lo quieres literal, o una indicación visual
                const small = document.createElement('small');
                small.innerText = "(Marcar si no cuenta con redes)";
                small.style.color = '#888';
                small.style.marginLeft = '10px';
                row.appendChild(small);

            } else {
                // --- CASO NORMAL: INPUT TEXTO ---
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'input-social input-respuesta'; 
                input.dataset.idPregunta = p.id;
                input.dataset.idOpcion = opt.id; 
                input.dataset.tipo = 'red_social'; 
                input.placeholder = "Pegue la URL aquí";
                
                input.style.flex = '1'; 
                input.style.padding = '8px';
                input.style.border = '1px solid #ccc';
                input.style.borderRadius = '4px';

                row.appendChild(input);
            }

            container.appendChild(row);
        });
        div.appendChild(container);
    }
    
    // --- F. INPUTS TEXTO Y FECHA (Individual) ---
    else if (['texto_corto', 'texto_largo', 'numero', 'fecha', 'direccion', 'liga', 'correo'].includes(p.tipo)) {
        if(p.tipo === 'texto_largo') {
            const textarea = document.createElement('textarea');
            textarea.rows = 4;
            textarea.className = 'input-respuesta';
            textarea.dataset.idPregunta = p.id;
            textarea.dataset.tipo = 'texto';
            // Estilos para textarea
            textarea.style.width = '100%';
            textarea.style.boxSizing = 'border-box';
            if(p.obligatorio) textarea.required = true;
            div.appendChild(textarea);
        } else {
            const input = document.createElement('input');
            input.type = p.tipo === 'numero' ? 'number' : (p.tipo === 'fecha' ? 'date' : 'text');
            input.className = 'input-respuesta';
            input.dataset.idPregunta = p.id;
            input.dataset.tipo = 'texto';
            
            // --- CORRECCIÓN FECHA: Restauramos los estilos completos ---
            input.style.width = '100%';
            input.style.padding = '10px';
            input.style.boxSizing = 'border-box'; // Para que el padding no desborde
            input.style.border = '1px solid #ccc';
            input.style.borderRadius = '4px';
            input.style.fontSize = '16px';
            
            if(p.obligatorio) input.required = true;
            div.appendChild(input);
        }
    }

    // --- G. MATRIZ DINÁMICA (NORMAL, INVERTIDA E INCREMENTAL) ---
    else if (p.tipo === 'matriz_dinamica') {
        
        // AVISO SCROLL
        const avisoScroll = document.createElement('div');
        avisoScroll.innerHTML = '↔ <b>Desliza horizontalmente</b> si no ves todas las columnas.';
        avisoScroll.style.cssText = 'font-size:0.85em; color:#856404; background:#fff3cd; border:1px solid #ffeeba; padding:8px; margin-bottom:5px; border-radius:4px; text-align:center; display:none;';
        div.appendChild(avisoScroll);

        // =========================================================
        // 1. CONTROLES DE MODO INCREMENTAL (SELECT + BOTÓN + AYUDA)
        // =========================================================
        let controlesIncremental = null;
        let divAyudaSeleccion = null; // Nuevo contenedor para la ayuda

        if (p.modo_incremental) {
            const wrapperControles = document.createElement('div');
            wrapperControles.style.marginBottom = '15px';
            wrapperControles.style.background = '#f9f9f9';
            wrapperControles.style.padding = '15px';
            wrapperControles.style.borderRadius = '8px';
            wrapperControles.style.border = '1px solid #eee';

            controlesIncremental = document.createElement('div');
            controlesIncremental.style.display = 'flex';
            controlesIncremental.style.gap = '10px';
            controlesIncremental.style.alignItems = 'center';
            
            // Select de Actividades
            const selectActividad = document.createElement('select');
            selectActividad.id = `select_actividad_${p.id}`;
            selectActividad.className = 'input-auxiliar'; 
            selectActividad.style.padding = '8px';
            selectActividad.style.borderRadius = '4px';
            selectActividad.style.border = '1px solid #ccc';
            selectActividad.style.flex = '1';

            selectActividad.appendChild(new Option('Seleccione una actividad para agregar...', ''));
            p.columnas.forEach(col => {
                const op = new Option(col.texto, col.id);
                // Guardamos la ayuda en un atributo de datos
                if(col.ayuda) op.dataset.ayuda = col.ayuda; 
                selectActividad.appendChild(op);
            });

            // Botón Agregar
            const btnAgregar = document.createElement('button');
            btnAgregar.type = 'button';
            btnAgregar.innerHTML = '<i class="fas fa-plus"></i> Agregar';
            btnAgregar.className = 'btn-agregar-fila';
            btnAgregar.style.padding = '8px 15px';
            btnAgregar.style.backgroundColor = '#28a745'; // Verde
            btnAgregar.style.color = 'white';
            btnAgregar.style.border = 'none';
            btnAgregar.style.borderRadius = '4px';
            btnAgregar.style.cursor = 'pointer';

            // --- NUEVO: DIV PARA MOSTRAR LA AYUDA AL SELECCIONAR ---
            divAyudaSeleccion = document.createElement('div');
            divAyudaSeleccion.style.marginTop = '10px';
            divAyudaSeleccion.style.fontSize = '0.9em';
            divAyudaSeleccion.style.color = '#555';
            divAyudaSeleccion.style.fontStyle = 'italic';
            divAyudaSeleccion.style.minHeight = '20px'; // Para que no brinque tanto
            divAyudaSeleccion.innerHTML = ''; // Inicia vacío

            // EVENTO: Al cambiar el select, mostramos la ayuda
            selectActividad.addEventListener('change', function() {
                const opcionSeleccionada = this.options[this.selectedIndex];
                const textoAyuda = opcionSeleccionada.dataset.ayuda;
                
                if (textoAyuda) {
                    divAyudaSeleccion.innerHTML = `<i class="fas fa-info-circle"></i> <b>Descripción:</b> ${textoAyuda}`;
                    divAyudaSeleccion.style.display = 'block';
                } else {
                    divAyudaSeleccion.innerHTML = '';
                    divAyudaSeleccion.style.display = 'none';
                }
            });

            controlesIncremental.appendChild(selectActividad);
            controlesIncremental.appendChild(btnAgregar);
            
            wrapperControles.appendChild(controlesIncremental);
            wrapperControles.appendChild(divAyudaSeleccion); // Añadimos la ayuda abajo
            div.appendChild(wrapperControles);
        }

        // =========================================================
        // 2. ESTRUCTURA DE LA TABLA
        // =========================================================
        const tableContainer = document.createElement('div');
        tableContainer.style.overflowX = 'auto'; 
        tableContainer.style.border = '1px solid #ddd';
        tableContainer.className = 'scroll-visible';

        const tabla = document.createElement('table');
        tabla.className = 'tabla-matriz';
        tabla.id = `matriz_${p.id}`; 
        tabla.dataset.idPregunta = p.id;
        tabla.dataset.origen = p.id_pregunta_origen;
        tabla.dataset.modo = p.modo || 'select';
        
        tabla.style.width = '100%';
        tabla.style.borderCollapse = 'collapse';
        tabla.style.fontSize = '0.85em';
        if (!p.invertir_ejes) tabla.style.minWidth = '800px'; 

        const thead = document.createElement('thead');
        tabla.appendChild(thead);
        const tbody = document.createElement('tbody');
        tbody.id = `tbody_matriz_${p.id}`;
        tabla.appendChild(tbody);

        tableContainer.appendChild(tabla);
        div.appendChild(tableContainer);

        // =========================================================
        // 3. LÓGICA DE RENDERIZADO Y RECUPERACIÓN
        // =========================================================
        setTimeout(() => {
            const inputsOrigen = document.querySelectorAll(`.input-multiple[data-id-pregunta="${p.id_pregunta_origen}"]`);
            const filasAgregadas = new Set(); // Set para control de duplicados

            // --- FUNCIÓN HELPER: CREAR FILA ---
            const crearFila = (idFila, textoFila, herramientasSeleccionadas, valoresPrevios = {}) => {
                const tr = document.createElement('tr');
                tr.dataset.idFila = idFila;

                // Nombre Actividad
                const tdNombre = document.createElement('td');
                // Si hay ayuda en el JSON, la mostramos también aquí chiquita
                const colData = p.columnas.find(c => c.id == idFila);
                let htmlNombre = `<b>${textoFila}</b>`;
                if(colData && colData.ayuda) htmlNombre += `<div style="font-size:0.75em; color:#888; font-weight:normal;">${colData.ayuda}</div>`;
                
                tdNombre.innerHTML = htmlNombre;
                tdNombre.style.cssText = 'padding:8px; border:1px solid #ddd; background:#fff; position:relative; min-width:180px;';
                
                // Botón Eliminar Fila (Solo Incremental)
                if (p.modo_incremental) {
                    const btnEliminar = document.createElement('button');
                    btnEliminar.innerHTML = '×';
                    btnEliminar.title = 'Quitar fila';
                    btnEliminar.style.cssText = 'position:absolute; right:5px; top:5px; background:#ffeeee; border:1px solid #ffcccc; color:red; font-weight:bold; cursor:pointer; width:20px; height:20px; line-height:18px; border-radius:50%;';
                    btnEliminar.onclick = () => {
                        tr.remove();
                        filasAgregadas.delete(String(idFila));
                        // Rehabilitar opción en el select
                        const select = document.getElementById(`select_actividad_${p.id}`);
                        if(select) {
                            const op = Array.from(select.options).find(o => o.value == idFila);
                            if(op) op.disabled = false;
                        }
                    };
                    tdNombre.appendChild(btnEliminar);
                }
                tr.appendChild(tdNombre);

                // Celdas (Herramientas)
                herramientasSeleccionadas.forEach(herr => {
                    const td = document.createElement('td');
                    td.style.cssText = 'border:1px solid #ddd; text-align:center; padding:5px;';
                    
                    const select = document.createElement('select');
                    select.className = 'input-matriz-celda';
                    select.dataset.idPregunta = p.id;
                    select.dataset.idFila = idFila;       
                    select.dataset.idColumna = herr.id;         

                    const optDef = new Option('-', '');
                    select.appendChild(optDef);
                    [1,2,3,4,5].forEach(num => select.appendChild(new Option(num, num)));
                    select.style.width = '100%';
                    
                    // Recuperar valor
                    const key = `${idFila}_${herr.id}`;
                    if (valoresPrevios[key]) select.value = valoresPrevios[key];

                    td.appendChild(select);
                    tr.appendChild(td);
                });

                return tr;
            };

            // --- FUNCIÓN PRINCIPAL: ACTUALIZAR TABLA CON LOGS ---
            const actualizarTabla = () => {
                console.group("🔍 DEPURACIÓN MATRIZ 39"); 
                
                const valoresPrevios = {};

                // 1. RECUPERAR DEL CACHE (BD)
                if (window.RESPUESTAS_PREVIAS_CACHE && Array.isArray(window.RESPUESTAS_PREVIAS_CACHE)) {
                    
                    window.RESPUESTAS_PREVIAS_CACHE.forEach(r => {
                        // 🔥 CORRECCIÓN AQUÍ: 
                        // El servidor a veces manda 'id_pregunta' y a veces 'id_pregunta_matriz'.
                        // Usamos || para que funcione con cualquiera de los dos.
                        const idPreguntaRegistro = r.id_pregunta || r.id_pregunta_matriz;

                        if (idPreguntaRegistro == p.id) {
                            const key = `${r.id_fila}_${r.id_columna}`;
                            const valor = String(r.valor);
                            valoresPrevios[key] = valor;
                            
                            console.log(`✅ Recuperado: Fila ${r.id_fila}, Col ${r.id_columna} = ${valor}`);
                        }
                    });
                }

                // 2. PRESERVAR LO QUE EL USUARIO YA ESCRIBIÓ EN PANTALLA
                tbody.querySelectorAll('.input-matriz-celda').forEach(select => {
                    if (select.value) {
                        const key = `${select.dataset.idFila}_${select.dataset.idColumna}`;
                        valoresPrevios[key] = String(select.value);
                    }
                });

                // 3. DETECTAR HERRAMIENTAS (COLUMNAS)
                const herramientasSeleccionadas = Array.from(inputsOrigen)
                    .filter(chk => chk.checked && chk.value != '99' && chk.value != '3899') 
                    .map(chk => ({ id: chk.value, texto: chk.parentElement.innerText.trim() }));

                if (herramientasSeleccionadas.length === 0) {
                    thead.innerHTML = '';
                    tbody.innerHTML = '';
                    if (controlesIncremental) controlesIncremental.parentElement.style.display = 'none';
                    console.groupEnd();
                    return;
                }
                
                if (controlesIncremental) controlesIncremental.parentElement.style.display = 'block';

                // 4. RECONSTRUIR HEADER
                thead.innerHTML = '';
                const trHead = document.createElement('tr');
                const thEsq = document.createElement('th');
                thEsq.innerText = "Actividad \\ Herramienta";
                thEsq.style.cssText = 'background:#e9ecef; padding:10px; border:1px solid #ccc; width: 30%; min-width: 200px;';
                trHead.appendChild(thEsq);

                herramientasSeleccionadas.forEach(herr => {
                    const th = document.createElement('th');
                    th.innerText = herr.texto;
                    th.style.cssText = 'background:#f8f9fa; padding:8px; border:1px solid #ddd; min-width:100px; font-weight:bold; text-align:center;';
                    trHead.appendChild(th);
                });
                thead.appendChild(trHead);

                // 5. RECONSTRUIR BODY
                if (p.modo_incremental) {
                    tbody.innerHTML = '';
                    
                    // REHIDRATACIÓN
                    Object.keys(valoresPrevios).forEach(key => {
                        const idFila = key.split('_')[0]; 
                        if (!filasAgregadas.has(idFila)) {
                            console.log(`➕ Rehidratando Actividad ID: ${idFila}`);
                            filasAgregadas.add(idFila);
                        }
                    });

                    filasAgregadas.forEach(idFila => {
                        const colConfig = p.columnas.find(c => c.id == idFila);
                        if (colConfig) {
                            // Crear fila pasando los valores
                            const tr = crearFila(idFila, colConfig.texto, herramientasSeleccionadas, valoresPrevios);
                            tbody.appendChild(tr);
                            
                            // Deshabilitar opción del select
                            const select = document.getElementById(`select_actividad_${p.id}`);
                            if(select) {
                                const op = Array.from(select.options).find(o => o.value == idFila);
                                if(op) op.disabled = true;
                            }
                        }
                    });

                    // Logica botón agregar (re-bind)
                    const btnAgregar = controlesIncremental.querySelector('.btn-agregar-fila');
                    const nuevoBtn = btnAgregar.cloneNode(true);
                    btnAgregar.parentNode.replaceChild(nuevoBtn, btnAgregar);
                    
                    nuevoBtn.onclick = () => {
                        const select = document.getElementById(`select_actividad_${p.id}`);
                        const idActividad = select.value;
                        if (!idActividad) return;

                        if (!filasAgregadas.has(idActividad)) {
                            const colConfig = p.columnas.find(c => c.id == idActividad);
                            const tr = crearFila(idActividad, colConfig.texto, herramientasSeleccionadas, valoresPrevios);
                            tbody.appendChild(tr);
                            filasAgregadas.add(idActividad);
                            
                            const op = Array.from(select.options).find(o => o.value == idActividad);
                            if(op) op.disabled = true;
                            select.value = '';
                            if(divAyudaSeleccion) divAyudaSeleccion.innerHTML = '';
                        }
                    };

                } else {
                    // MODO NORMAL
                    tbody.innerHTML = ''; 
                    p.columnas.forEach(actividad => {
                        const tr = crearFila(actividad.id, actividad.texto, herramientasSeleccionadas, valoresPrevios);
                        tbody.appendChild(tr);
                    });
                }
                console.groupEnd(); 
            };

            // Listeners
            inputsOrigen.forEach(chk => chk.addEventListener('change', actualizarTabla));
            
            // Ejecución inicial
            actualizarTabla(); 

        }, 600); // Un poco más de tiempo para asegurar carga de datos previos
    }

    // --- H. CATÁLOGO TIPO TABLA (HÍBRIDO + AYUDA EN COLUMNA DERECHA) ---
    else if (p.tipo === 'catalogo_tabla') {
        const tableContainer = document.createElement('div');
        tableContainer.style.overflowX = 'auto';

        const tabla = document.createElement('table');
        tabla.style.width = '100%';
        tabla.style.borderCollapse = 'collapse';
        tabla.style.marginTop = '10px';
        tabla.style.fontSize = '0.95em';

        // Cabecera
        const thead = document.createElement('thead');
        const titulos = p.encabezados || ["Herramienta", "Descripción / Detalles"];
        thead.innerHTML = `
            <tr style="background-color: #f4f4f4; text-align: left;">
                <th style="padding: 10px; border: 1px solid #ddd; width: 40%;">${titulos[0]}</th>
                <th style="padding: 10px; border: 1px solid #ddd; width: 60%;">${titulos[1]}</th>
            </tr>
        `;
        tabla.appendChild(thead);

        const tbody = document.createElement('tbody');
        
        p.opciones.forEach(opt => {
            const tr = document.createElement('tr');
            
            // =========================================
            // COLUMNA 1: PADRE (Siempre Checkbox)
            // =========================================
            const tdNombre = document.createElement('td');
            tdNombre.style.padding = '10px';
            tdNombre.style.border = '1px solid #ddd';
            tdNombre.style.verticalAlign = 'top';
            tdNombre.style.fontWeight = 'bold';

            const label = document.createElement('label');
            label.style.cursor = 'pointer';
            label.style.display = 'flex';
            label.style.gap = '10px';

            const checkboxPadre = document.createElement('input'); 
            checkboxPadre.type = 'checkbox';
            checkboxPadre.value = opt.id;
            checkboxPadre.className = 'input-multiple'; 
            checkboxPadre.dataset.idPregunta = p.id;

            label.appendChild(checkboxPadre);
            label.appendChild(document.createTextNode(opt.texto));
            tdNombre.appendChild(label);
            
            tr.appendChild(tdNombre);

            // =========================================
            // COLUMNA 2: DESCRIPCIÓN Y HIJOS
            // =========================================
            const tdDesc = document.createElement('td');
            tdDesc.style.padding = '10px';
            tdDesc.style.border = '1px solid #ddd';
            tdDesc.style.color = '#555';

            // 1. TEXTO DE AYUDA (Aquí es donde lo querías)
            if (opt.ayuda) {
                const divAyuda = document.createElement('div');
                divAyuda.innerText = opt.ayuda;
                // Estilos para que se vea bien como descripción
                divAyuda.style.marginBottom = '10px';
                divAyuda.style.fontStyle = 'italic';
                divAyuda.style.fontSize = '0.9em';
                tdDesc.appendChild(divAyuda);
            }

            // 2. SUB-OPCIONES (Lógica Híbrida Radio/Check)
            if (opt.sub_opciones) {
                const divSub = document.createElement('div');
                divSub.style.padding = '10px';
                divSub.style.backgroundColor = '#f9f9f9';
                divSub.style.border = '1px solid #eee';
                
                divSub.style.display = 'block'; 
                divSub.style.transition = 'opacity 0.3s ease'; 

                // --- DETECCIÓN DE MODO ---
                const esRadio = (opt.modo === 'unica');
                const tipoInput = esRadio ? 'radio' : 'checkbox';
                const nombreGrupo = esRadio ? `grupo_radio_${opt.id}` : null;

                const gridSoft = document.createElement('div');
                gridSoft.style.display = 'grid';
                gridSoft.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
                gridSoft.style.gap = '10px';

                opt.sub_opciones.forEach(sub => {
                    const esNinguno = sub.texto.trim().toLowerCase() === 'ninguno';

                    const labelSub = document.createElement('label');
                    labelSub.style.fontSize = '0.9em';
                    labelSub.style.display = 'flex';
                    labelSub.style.alignItems = 'center';
                    labelSub.style.gap = '5px';
                    labelSub.style.cursor = 'pointer';

                    const chkSub = document.createElement('input');
                    chkSub.type = tipoInput; 
                    chkSub.value = sub.id;
                    chkSub.className = 'input-multiple'; 
                    chkSub.dataset.idPregunta = p.id;
                    
                    if (esRadio) chkSub.name = nombreGrupo;
                    if (esNinguno) chkSub.dataset.esNinguno = 'true';

                    labelSub.appendChild(chkSub);
                    labelSub.appendChild(document.createTextNode(sub.texto));
                    
                    // Input "Otro"
                    let inputEsp = null;
                    if (sub.especificar) {
                        inputEsp = document.createElement('input');
                        inputEsp.type = 'text';
                        inputEsp.placeholder = '¿Cuál?';
                        inputEsp.className = 'input-especificar-multiple';
                        inputEsp.dataset.idPregunta = p.id;
                        inputEsp.dataset.idOpcion = sub.id;
                        inputEsp.style.display = 'none';
                        inputEsp.style.width = '100%';
                        inputEsp.style.marginTop = '5px';
                        
                        const divWrap = document.createElement('div');
                        divWrap.appendChild(labelSub);
                        divWrap.appendChild(inputEsp);
                        gridSoft.appendChild(divWrap);
                    } else {
                        gridSoft.appendChild(labelSub);
                    }

                    // --- EVENTOS ---
                    chkSub.addEventListener('change', function() {
                        // A. Mostrar/Ocultar "Otro"
                        if (inputEsp) {
                            inputEsp.style.display = this.checked ? 'block' : 'none';
                            if(!this.checked) inputEsp.value = '';
                        }
                        
                        // B. Limpieza de Radios (si marco uno, limpio los otros inputs de texto)
                        if (esRadio && this.checked) {
                             const otrosInputs = gridSoft.querySelectorAll('.input-especificar-multiple');
                             otrosInputs.forEach(inp => {
                                 if(inp !== inputEsp) {
                                     inp.style.display = 'none';
                                     inp.value = '';
                                 }
                             });
                        }

                        // C. Lógica "Ninguno" (Solo Checkbox)
                        if (!esRadio) {
                            const todosLosChecks = gridSoft.querySelectorAll('input[type="checkbox"]');
                            if (esNinguno && this.checked) {
                                todosLosChecks.forEach(c => { if (c !== this) { c.checked = false; c.dispatchEvent(new Event('change')); } });
                            } else if (!esNinguno && this.checked) {
                                todosLosChecks.forEach(c => { if (c.dataset.esNinguno === 'true') c.checked = false; });
                            }
                        }

                        // D. Activar Padre
                        if (checkboxPadre && this.checked) {
                            checkboxPadre.checked = true;
                            checkboxPadre.dispatchEvent(new Event('change'));
                        }
                    });
                });

                divSub.appendChild(gridSoft);
                tdDesc.appendChild(divSub);

                // --- BLOQUEO / DESBLOQUEO ---
                const actualizarEstado = () => {
                    if (checkboxPadre.checked) {
                        divSub.style.opacity = '1';
                        divSub.style.pointerEvents = 'auto';
                        divSub.querySelectorAll('input').forEach(i => i.disabled = false);
                    } else {
                        divSub.style.opacity = '0.6';
                        divSub.style.pointerEvents = 'none';
                        divSub.querySelectorAll('input').forEach(i => {
                            i.disabled = true;
                            if ((i.type === 'checkbox' || i.type === 'radio') && i.checked) {
                                i.checked = false;
                                i.dispatchEvent(new Event('change')); 
                            }
                        });
                    }
                };
                
                actualizarEstado();
                checkboxPadre.addEventListener('change', actualizarEstado);

            } else {
                 // Si no hay opciones, dejamos vacío
                 if(!opt.ayuda) { 
                     const span = document.createElement('span');
                     span.innerHTML = "&nbsp;"; 
                     tdDesc.appendChild(span);
                 }
            }

            tr.appendChild(tdDesc);
            tbody.appendChild(tr);
        });

        tabla.appendChild(tbody);
        tableContainer.appendChild(tabla);
        div.appendChild(tableContainer);
    }

    // --- I. LISTA DE INPUTS (TEXTO LIBRE MÚLTIPLE - PREGUNTA 21) ---
    else if (p.tipo === 'lista_inputs') {
        const container = document.createElement('div');
        
        p.opciones.forEach(opt => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.marginBottom = '10px';

            const label = document.createElement('label');
            label.innerText = opt.texto + ":";
            label.style.width = '170px'; // Un poco más ancho para que quepa "Fondo / Colección 1"
            label.style.fontWeight = 'bold';
            label.style.color = '#555';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-respuesta'; 
            input.dataset.idPregunta = p.id;
            input.dataset.idOpcion = opt.id; 
            
            // IMPORTANTE: Le damos un tipo especial para que 'enviarFormulario' sepa
            // que debe guardar el ID de la opción (1, 2 o 3) junto con el texto.
            input.dataset.tipo = 'texto_con_id'; 
            
            input.placeholder = "Nombre o descripción del fondo...";
            input.style.flex = '1'; 
            input.style.padding = '8px';
            input.style.border = '1px solid #ccc';
            input.style.borderRadius = '4px';

            row.appendChild(label);
            row.appendChild(input);
            container.appendChild(row);
        });
        div.appendChild(container);
    }

    // --- J. FECHA FLEXIBLE (AÑO OBLIGATORIO, MES/DIA OPCIONAL) ---
    else if (p.tipo === 'fecha_flexible') {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '10px';
        container.style.flexWrap = 'wrap'; // Para móviles

        // 1. INPUT OCULTO (Donde se guardará el valor final combinado YYYY-MM-DD)
        const inputFinal = document.createElement('input');
        inputFinal.type = 'hidden'; // Oculto
        inputFinal.className = 'input-respuesta'; // Clase para que lo detecte enviarFormulario
        inputFinal.dataset.idPregunta = p.id;
        inputFinal.dataset.tipo = 'texto'; // Lo trataremos como texto para guardar el string
        if(p.obligatorio) inputFinal.required = true;
        
        // 2. CAMPO AÑO (Obligatorio)
        const divAno = document.createElement('div');
        divAno.style.flex = '1';
        divAno.style.minWidth = '100px';
        divAno.innerHTML = '<label style="font-size:0.85em; display:block; margin-bottom:2px; color:#666;">Año <span style="color:red">*</span></label>';
        
        const inputAno = document.createElement('input');
        inputAno.type = 'number';
        inputAno.placeholder = "AAAA";
        inputAno.min = 1500;
        inputAno.max = new Date().getFullYear();
        inputAno.className = 'input-auxiliar-fecha'; // Clase auxiliar
        inputAno.style.width = '100%';
        inputAno.style.padding = '8px';
        inputAno.style.border = '1px solid #ccc';
        inputAno.style.borderRadius = '4px';

        divAno.appendChild(inputAno);

        // 3. CAMPO MES (Opcional)
        const divMes = document.createElement('div');
        divMes.style.flex = '1';
        divMes.style.minWidth = '120px';
        divMes.innerHTML = '<label style="font-size:0.85em; display:block; margin-bottom:2px; color:#666;">Mes (Opcional)</label>';
        
        const selectMes = document.createElement('select');
        selectMes.className = 'input-auxiliar-fecha';
        selectMes.style.width = '100%';
        selectMes.style.padding = '8px';
        selectMes.style.border = '1px solid #ccc';
        selectMes.style.borderRadius = '4px';
        
        selectMes.add(new Option('Sin mes', ''));
        ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].forEach((m, i) => {
            // Guardamos el mes como 01, 02, etc.
            const valor = (i + 1).toString().padStart(2, '0');
            selectMes.add(new Option(m, valor));
        });

        divMes.appendChild(selectMes);

        // 4. CAMPO DÍA (Opcional)
        const divDia = document.createElement('div');
        divDia.style.flex = '0.5';
        divDia.style.minWidth = '80px';
        divDia.innerHTML = '<label style="font-size:0.85em; display:block; margin-bottom:2px; color:#666;">Día (Opc)</label>';
        
        const inputDia = document.createElement('input');
        inputDia.type = 'number';
        inputDia.placeholder = "DD";
        inputDia.min = 1;
        inputDia.max = 31;
        inputDia.className = 'input-auxiliar-fecha';
        inputDia.style.width = '100%';
        inputDia.style.padding = '8px';
        inputDia.style.border = '1px solid #ccc';
        inputDia.style.borderRadius = '4px';

        divDia.appendChild(inputDia);

        // 5. LÓGICA DE UNIÓN
        const actualizarFecha = () => {
            const y = inputAno.value;
            const m = selectMes.value;
            let d = inputDia.value;
            
            if (!y) {
                inputFinal.value = ''; // Si no hay año, no hay fecha válida
                return;
            }

            // Formato inteligente
            let fechaTexto = y;
            
            if (m) {
                fechaTexto += `-${m}`;
                // Solo agregamos día si hay mes
                if (d) {
                    d = d.toString().padStart(2, '0'); // Asegurar dos dígitos (05)
                    fechaTexto += `-${d}`;
                }
            }

            inputFinal.value = fechaTexto;
            // Disparar evento para que el sistema detecte cambio
            inputFinal.dispatchEvent(new Event('change', { bubbles: true }));
        };

        // Listeners
        inputAno.addEventListener('input', actualizarFecha);
        selectMes.addEventListener('change', actualizarFecha);
        inputDia.addEventListener('input', actualizarFecha);

        container.appendChild(inputFinal); // El oculto
        container.appendChild(divAno);
        container.appendChild(divMes);
        container.appendChild(divDia);
        
        div.appendChild(container);
    }

   //-- K. RANGO DE FECHAS FLEXIBLE (MEJORADO) --
    else if (p.tipo === 'rango_fechas_flexibles') {
        const mainContainer = document.createElement('div');
        mainContainer.style.cssText = 'display: flex; flex-direction: column; gap: 15px;';

        const inputFinal = document.createElement('input');
        inputFinal.type = 'hidden';
        inputFinal.className = 'input-respuesta'; 
        inputFinal.dataset.idPregunta = p.id;
        inputFinal.dataset.tipo = 'rango_flexible'; 
        if(p.obligatorio) inputFinal.required = true;
        mainContainer.appendChild(inputFinal);

        const crearBloque = (titulo) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'rango-bloque-wrapper'; 
            wrapper.style.cssText = 'border:1px solid #eee; padding:10px; border-radius:8px; background:#f9f9f9;';
            wrapper.innerHTML = `<div style="font-weight:bold; margin-bottom:5px; color:#555; font-size:0.9em;">${titulo}</div>`;
            
            const row = document.createElement('div'); row.style.cssText='display:flex; gap:5px; flex-wrap:wrap;';
            
            // --- AÑO (Validación Anti-Negativos) ---
            const iAno = document.createElement('input'); 
            iAno.className='input-aux-ano'; 
            iAno.type='number'; 
            iAno.placeholder='AAAA'; 
            iAno.min = '1000'; // Mínimo razonable
            
            // Evitar escribir signo menos o 'e'
            iAno.onkeydown = (e) => { if(["-", "+", "e"].includes(e.key)) e.preventDefault(); };
            
            iAno.style.cssText='flex:1; min-width:80px; padding:5px; border:1px solid #ccc; border-radius:3px;';
            
            // --- MES ---
            const sMes = document.createElement('select'); 
            sMes.className='input-aux-mes'; 
            sMes.style.cssText='flex:1; min-width:100px; padding:5px; border:1px solid #ccc; border-radius:3px;';
            sMes.innerHTML = '<option value="">Mes</option>' + ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((m,i)=>`<option value="${(i+1).toString().padStart(2,'0')}">${m}</option>`).join('');
            
            // --- DÍA (Validación Anti-Negativos) ---
            const iDia = document.createElement('input'); 
            iDia.className='input-aux-dia'; 
            iDia.type='number'; 
            iDia.placeholder='DD'; 
            iDia.min = '1';
            iDia.max = '31';
            
            // Evitar escribir signo menos o 'e'
            iDia.onkeydown = (e) => { if(["-", "+", "e"].includes(e.key)) e.preventDefault(); };

            iDia.style.cssText='flex:0.5; min-width:60px; padding:5px; border:1px solid #ccc; border-radius:3px;';
            
            row.append(iAno, sMes, iDia); wrapper.appendChild(row);
            return { wrapper, iAno, sMes, iDia };
        };

        const b1 = crearBloque("Desde (Fecha Inicial)");
        const b2 = crearBloque("Hasta (Fecha Final)");

        const unir = () => {
            const f1 = b1.iAno.value ? (b1.iAno.value + (b1.sMes.value ? `-${b1.sMes.value}` + (b1.iDia.value ? `-${b1.iDia.value.toString().padStart(2,'0')}`:'') : '')) : '';
            const f2 = b2.iAno.value ? (b2.iAno.value + (b2.sMes.value ? `-${b2.sMes.value}` + (b2.iDia.value ? `-${b2.iDia.value.toString().padStart(2,'0')}`:'') : '')) : '';
            inputFinal.value = (f1 && f2) ? `${f1} al ${f2}` : '';
            inputFinal.dispatchEvent(new Event('change', {bubbles:true}));
        };

        [b1, b2].forEach(b => { 
            b.iAno.addEventListener('input', unir); 
            b.sMes.addEventListener('change', unir); 
            b.iDia.addEventListener('input', unir); 
        });

        mainContainer.append(b1.wrapper, b2.wrapper);
        div.appendChild(mainContainer);
    }

    return div;
}


// =========================================================
// FUNCIÓN: AGREGAR FILA (CORREGIDA Y ROBUSTA)
// =========================================================
window.agregarFilaContacto = function(datos = null) {
    // 🔍 DEBUG: Ver qué llega exactamente desde la base de datos
    if (datos) {
        console.log("📞 Datos recibidos para fila de contacto:", datos);
    }

    const tbody = document.querySelector('#tablaContactos tbody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #e9ecef';
    row.style.backgroundColor = '#fff';

    // --- MAPEO ROBUSTO DE DATOS ---
    // Intentamos buscar el valor en varias propiedades comunes por si la BD cambia
    const valNombre = datos ? (datos.nombre || datos.nombre_completo || '') : '';
    const valCargo  = datos ? (datos.cargo || datos.puesto || '') : '';
    const valCorreo = datos ? (datos.correo || datos.email || datos.correo_electronico || '') : '';
    
    // AQUÍ ESTABA EL PROBLEMA: Agregamos más opciones de nombres para los teléfonos
    const valTelInst = datos ? (
        datos.telefono_inst || 
        datos.telefono_institucional || 
        datos.telefono || 
        datos.tel || 
        datos.telefono1 || 
        ''
    ) : '';

    const valTelOtro = datos ? (
        datos.telefono_otro || 
        datos.telefono_secundario || 
        datos.celular || 
        datos.movil || 
        datos.telefono2 || 
        ''
    ) : '';

    const inputStyle = `
        width: 100%; padding: 8px 10px; border: 1px solid #ced4da; 
        border-radius: 4px; font-size: 0.95em; outline: none; box-sizing: border-box;
    `;

    // HTML de la fila
    row.innerHTML = `
        <td style="padding: 10px;">
            <input type="text" class="contacto-nombre input-respuesta-tabla" value="${valNombre}" placeholder="Nombre completo" style="${inputStyle}">
        </td>
        <td style="padding: 10px;">
            <input type="text" class="contacto-cargo input-respuesta-tabla" value="${valCargo}" placeholder="Cargo" style="${inputStyle}">
        </td>
        <td style="padding: 10px;">
            <input type="email" class="contacto-correo input-respuesta-tabla" value="${valCorreo}" placeholder="ejemplo@email.com" style="${inputStyle}">
        </td>
        <td style="padding: 10px;">
            <input type="tel" class="contacto-tel-inst input-respuesta-tabla" value="${valTelInst}" inputmode="numeric" maxlength="15" style="${inputStyle}">
        </td>
        <td style="padding: 10px;">
            <input type="tel" class="contacto-tel-otro input-respuesta-tabla" value="${valTelOtro}" inputmode="numeric" maxlength="15" style="${inputStyle}">
        </td>
        <td style="padding: 10px; text-align: center; vertical-align: middle;">
            <button type="button" 
                class="btn-eliminar-fila"
                style="color: #dc3545; border: none; background: transparent; font-size: 1.3em; cursor: pointer; opacity: 0.7; width: 30px; height: 30px; border-radius: 50%;"
                title="Eliminar fila">
                &times;
            </button>
        </td>
    `;

    // Asignar evento al botón eliminar (más seguro que onclick en línea)
    const btnEliminar = row.querySelector('.btn-eliminar-fila');
    btnEliminar.onclick = function() {
        if(document.querySelectorAll('#tablaContactos tbody tr').length > 1) {
            row.remove();
        } else {
            // Si es la última fila, solo limpiamos los inputs
            row.querySelectorAll('input').forEach(i => i.value = '');
        }
    };

    // --- RESTRICCIÓN NUMÉRICA ---
    const inputsTel = row.querySelectorAll('.contacto-tel-inst, .contacto-tel-otro');
    inputsTel.forEach(input => {
        // Focus styles
        input.addEventListener('focus', () => { input.style.borderColor = '#86b7fe'; input.style.boxShadow = '0 0 0 0.2rem rgba(13,110,253,.25)'; });
        input.addEventListener('blur', () => { input.style.borderColor = '#ced4da'; input.style.boxShadow = 'none'; });

        // Solo números al escribir
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });

    tbody.appendChild(row);
};

// =========================================================
// FUNCIÓN: CARGAR RESPUESTAS (CORREGIDA COMPLETA FINAL)
// =========================================================
async function cargarRespuestasPrevias(idUsuario) {
    try {
        const response = await fetch(`${API_URL_SAVE}/respuestas-usuario/${idUsuario}`);
        const data = await response.json();

        if (data.vacio) return; 

        console.log("Cargando datos previos...", data);
        localStorage.setItem('datosCargados', 'true'); 

        // Guardamos la matriz en caché global
        window.RESPUESTAS_PREVIAS_CACHE = data.matriz || []; 

        // ----------------------------------------------------
        // 1. RECUPERAR CHECKBOXES (MÚLTIPLES)
        // ----------------------------------------------------
        if (data.multiples) {
            data.multiples.forEach(r => {
                const chk = document.querySelector(`.input-multiple[data-id-pregunta="${r.id_pregunta}"][value="${r.id_opcion}"]`);
                if (chk) {
                    chk.checked = true;
                    // 🔥 Disparamos cambio para dibujar matriz o lógica visual
                    chk.dispatchEvent(new Event('change', { bubbles: true })); 
                }
            });
        }

        // ----------------------------------------------------
        // 2. RECUPERAR RESPUESTAS SIMPLES
        // ----------------------------------------------------
        if (data.simples) {
            data.simples.forEach(r => {

                // A. CASO "NINGUNO" (Checkbox manual)
                if (r.id_opcion_seleccionada == 99) {
                    const chkNinguno = document.querySelector(`.input-ninguno-manual[data-id-pregunta="${r.id_pregunta}"]`);
                    if (chkNinguno) {
                        chkNinguno.checked = true;
                        chkNinguno.dispatchEvent(new Event('change', { bubbles: true })); 
                        return;
                    }
                }

                // B. CASO TEXTO "OTRO" EN MÚLTIPLE
                if (r.id_opcion_seleccionada) {
                    const inputSpecMultiple = document.querySelector(`.input-especificar-multiple[data-id-pregunta="${r.id_pregunta}"][data-id-opcion="${r.id_opcion_seleccionada}"]`);
                    
                    if (inputSpecMultiple && r.respuesta_texto) {
                        inputSpecMultiple.value = r.respuesta_texto;
                        inputSpecMultiple.style.display = 'block'; 
                        
                        // Asegurar que el checkbox padre esté marcado
                        const parentDiv = inputSpecMultiple.closest('.opcion-item') || inputSpecMultiple.closest('div');
                        if (parentDiv) {
                            const chkPadre = parentDiv.querySelector(`input[type="checkbox"][value="${r.id_opcion_seleccionada}"]`);
                            if (chkPadre && !chkPadre.checked) chkPadre.checked = true;
                        }
                    }
                }

                // C. INPUTS ESTÁNDAR (Aquí procesamos todo lo demás)
                const inputs = document.querySelectorAll(`.input-respuesta[data-id-pregunta="${r.id_pregunta}"]`);
                
                inputs.forEach(input => {
                    // 1. Redes Sociales / Textos con ID
                    if (input.dataset.tipo === 'red_social' || input.dataset.tipo === 'texto_con_id') {
                        if (input.dataset.idOpcion == r.id_opcion_seleccionada) input.value = r.respuesta_texto;
                    } 
                    // 2. Selects
                    else if (input.tagName === 'SELECT') {
                        input.value = r.id_opcion_seleccionada;
                        input.dispatchEvent(new Event('change', { bubbles: true })); 
                    }
                    // 3. Radios (Booleano / Única)
                    else if (input.type === 'radio') {
                        if (input.value === r.respuesta_texto || input.value == r.id_opcion_seleccionada) {
                            input.checked = true;
                            input.dispatchEvent(new Event('change', { bubbles: true })); 
                        }
                    }
                    
                    // 🔥 [NUEVO] 4. RANGO DE FECHAS FLEXIBLES (SECCIÓN 3 - PREGUNTA 22/23) 🔥
                    else if (input.dataset.tipo === 'rango_flexible') {
                        input.value = r.respuesta_texto; // Llenamos el hidden
                        
                        if (r.respuesta_texto && r.respuesta_texto.includes(' al ')) {
                            const fechas = r.respuesta_texto.split(' al '); // [FechaInicio, FechaFin]
                            const bloques = input.parentElement.querySelectorAll('.rango-bloque-wrapper');

                            // Recorremos las dos partes (Inicio y Fin)
                            fechas.forEach((f, index) => {
                                if (bloques[index]) {
                                    const partes = f.split('-'); // [AAAA, MM, DD]
                                    
                                    // Año
                                    if (partes[0]) bloques[index].querySelector('.input-aux-ano').value = partes[0];
                                    // Mes (si existe)
                                    if (partes[1]) bloques[index].querySelector('.input-aux-mes').value = partes[1];
                                    // Día (si existe)
                                    if (partes[2]) bloques[index].querySelector('.input-aux-dia').value = partes[2];
                                }
                            });
                        }
                    }

                    // 5. Fecha Flexible Simple (Solo una fecha)
                    else if (input.type === 'hidden' && input.parentElement.querySelector('.input-auxiliar-fecha')) {
                        input.value = r.respuesta_texto;
                        if (r.respuesta_texto) {
                            const partes = r.respuesta_texto.split('-'); 
                            const contenedor = input.parentElement;
                            
                            const inAno = contenedor.querySelector('input[placeholder="AAAA"]');
                            if (inAno && partes[0]) inAno.value = partes[0];

                            const selMes = contenedor.querySelector('select');
                            if (selMes && partes[1]) selMes.value = partes[1];

                            const inDia = contenedor.querySelector('input[placeholder="DD"]');
                            if (inDia && partes[2]) inDia.value = partes[2];
                        }
                    }
                    // 6. Fechas Estándar (Date picker nativo)
                    else if (input.type === 'date') {
                        if (r.respuesta_texto && r.respuesta_texto.includes(' al ')) {
                            const partes = r.respuesta_texto.split(' al ');
                            input.value = partes[0]; 
                            const inputAuxiliar = input.nextElementSibling;
                            if (inputAuxiliar && inputAuxiliar.tagName === 'INPUT') inputAuxiliar.value = partes[1];
                        } else {
                            input.value = r.respuesta_texto;
                        }
                    }
                    // 7. Textos libres / Números genéricos
                    else if (input.dataset.tipo === 'texto' || input.type === 'number') {
                        input.value = r.respuesta_texto;
                    }
                });
                
                // D. RECUPERAR "ESPECIFIQUE" DE CATÁLOGO ÚNICO
                if (r.id_opcion_seleccionada) {
                     const inputSpecUnico = document.querySelector(`.input-especificar[data-id-pregunta="${r.id_pregunta}"]`);
                     if (inputSpecUnico && r.respuesta_texto) {
                         inputSpecUnico.value = r.respuesta_texto;
                         inputSpecUnico.style.display = 'block';
                     }
                }
            });
        }

        // ----------------------------------------------------
        // 3. RECUPERAR MATRIZ
        // ----------------------------------------------------
        if (data.matriz && data.matriz.length > 0) {
            setTimeout(() => {
                data.matriz.forEach(m => {
                    const idPreg = m.id_pregunta_matriz || m.id_pregunta;

                    // Selects
                    let elSelect = document.querySelector(`.input-matriz-celda[data-id-pregunta="${idPreg}"][data-id-fila="${m.id_fila}"][data-id-columna="${m.id_columna}"]`);
                    if (elSelect) elSelect.value = m.valor; 

                    // Radios
                    let elRadio = document.querySelector(`.input-matriz-radio[data-id-pregunta="${idPreg}"][data-id-fila="${m.id_fila}"][data-id-columna="${m.id_columna}"][value="${m.valor}"]`);
                    if (elRadio) elRadio.checked = true;
                });
            }, 600); 
        }

        // ----------------------------------------------------
        // 4. RECUPERAR CONTACTOS
        // ----------------------------------------------------
        const tbody = document.querySelector('#tablaContactos tbody');
        if (tbody) { 
            tbody.innerHTML = ''; 
            if (data.contactos && data.contactos.length > 0) {
                data.contactos.forEach(c => agregarFilaContacto(c));
            } else {
                agregarFilaContacto(); 
            }
        }

    } catch (error) {
        console.error("Error cargando progreso:", error);
    }
}


// =============================
// FUNCIÓN: ENVIAR FORMULARIO
// =============================

async function enviarFormulario(e) {
    e.preventDefault();

    // -----------------------------------------------------------------
    // CONFIGURACIÓN DE "MENSAJE FLOTANTE" (TOAST)
    // -----------------------------------------------------------------
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    const idUsuario = localStorage.getItem('idUsuario');

    // 0. VALIDACIÓN DE SESIÓN
    if (!idUsuario) {
        Swal.fire({
            icon: 'error',
            title: 'Sesión Expirada',
            text: 'Vuelve a iniciar sesión.',
            confirmButtonColor: '#2c3e50'
        }).then(() => window.location.href = 'login.html');
        return;
    }

    // =================================================================
    // 🛑 0.5 VALIDACIÓN DE CAMPOS OBLIGATORIOS (NUEVO BLOQUE)
    // =================================================================
    
    // A. LIMPIAR ERRORES PREVIOS VISUALES
    document.querySelectorAll('.error-borde').forEach(el => {
        el.classList.remove('error-borde');
        el.style.border = 'none'; // Limpia bordes rojos anteriores
        // Si usabas border-radius o padding extra, aquí se resetean visualmente
        // al estado normal definido en tu CSS.
    });

    let erroresObligatorios = [];
    let primeraFaltante = null;

    if (typeof CONFIG_SECCION !== 'undefined' && CONFIG_SECCION.preguntas) {
        CONFIG_SECCION.preguntas.forEach(p => {
            // Intentamos encontrar el contenedor de la pregunta
            // Nota: Asegúrate de que tu función 'crearHTMLPregunta' asigne este ID.
            // Si no, el fallback buscará por atributo.
            let container = document.getElementById(`pregunta-container-${p.id}`);
            
            if (!container) {
                // Fallback: Buscar cualquier input de esa pregunta y subir a su contenedor
                const inputCualquiera = document.querySelector(`[data-id-pregunta="${p.id}"]`);
                if (inputCualquiera) {
                    container = inputCualquiera.closest('.pregunta-box') || inputCualquiera.closest('.card') || inputCualquiera.closest('div');
                }
            }

            // Si no encontramos contenedor o está oculto (display: none), ignoramos (ej. lógica de "Ninguna")
            if (!container || container.style.display === 'none' || getComputedStyle(container).display === 'none') {
                return;
            }

            if (p.obligatorio) {
                let contestada = false;

                // 1. Checkbox / Radio / Catálogos / Booleanos
                if (['catalogo_unico', 'catalogo_multiple', 'booleano', 'radio'].includes(p.tipo)) {
                    
                    // A. Buscamos inputs marcados (Radio/Checkbox)
                    const hayInputs = container.querySelectorAll('input:checked').length > 0;
                    
                    // B. Buscamos Selects con valor (Para catálogos largos como la Pregunta 11)
                    const select = container.querySelector('select');
                    const haySelect = select && select.value !== '';

                    if (hayInputs || haySelect) contestada = true;
                }
                // 2. Matrices (Dinámicas, Normales, Invertidas)
                else if (p.tipo && p.tipo.includes('matriz')) {
                    const radios = container.querySelectorAll('input[type="radio"]:checked');
                    const selects = Array.from(container.querySelectorAll('select.input-matriz-celda')).filter(s => s.value !== '');
                    
                    if (radios.length > 0 || selects.length > 0) contestada = true;

                    // Caso especial: Tabla vacía (ej. filtro anterior ocultó todo) -> Se considera válida o inválida según lógica
                    if (!container.querySelector('table') && p.tipo === 'matriz_dinamica') contestada = false; 
                }
                // 3. Catálogo Tabla (Híbrido)
                else if (p.tipo === 'catalogo_tabla') {
                     if (container.querySelectorAll('input:checked').length > 0) contestada = true;
                }
                // 4. Liga Múltiple (Redes Sociales)
                else if (p.tipo === 'liga_multiple') {
                     const inputsTexto = Array.from(container.querySelectorAll('input[type="text"]')).filter(i => i.value.trim() !== '');
                     const ningunCheck = container.querySelector('.input-ninguno-manual:checked');
                     if (inputsTexto.length > 0 || ningunCheck) contestada = true;
                }
                // 5. Texto / Fecha / Número / Textarea
                else {
                    const inputs = container.querySelectorAll('input, textarea, select');
                    for (let inp of inputs) {
                        // Ignoramos inputs hidden o de tipo 'search' del navegador
                        if (inp.type !== 'hidden' && inp.value && inp.value.trim() !== '') {
                            contestada = true;
                            break;
                        }
                    }
                }

                if (!contestada) {
                    erroresObligatorios.push(p.texto);
                    
                    // Aplicar estilo de error
                    container.style.border = "2px solid #dc3545"; 
                    container.style.borderRadius = "8px";
                    container.style.padding = "15px"; // Padding para que no se vea apretado
                    container.classList.add('error-borde');
                    
                    if (!primeraFaltante) primeraFaltante = container;
                }
            }
        });
    }

    // SI HAY ERRORES OBLIGATORIOS, DETENEMOS AQUÍ
    if (erroresObligatorios.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos obligatorios faltantes',
            text: 'Por favor conteste las preguntas marcadas en rojo antes de continuar.',
            confirmButtonColor: '#7c1225'
        });
        
        if (primeraFaltante) {
            primeraFaltante.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return; // ⛔ DETIENE LA EJECUCIÓN DEL FORMULARIO
    }

    // =================================================================
    // 🛑 1. VALIDACIÓN DE INTEGRIDAD (PADRE -> HIJOS)
    // =================================================================
    const filasTabla = document.querySelectorAll('table tbody tr');
    let errorValidacion = false;

    for (const tr of filasTabla) {
        // A. Checkbox Padre
        const checkPadre = tr.querySelector('td:first-child input[type="checkbox"]');

        if (checkPadre && checkPadre.checked) {
            // B. Celda de Opciones
            const celdaHijos = tr.querySelector('td:last-child');
            const existenHijos = celdaHijos.querySelector('input[type="checkbox"]');
            
            if (existenHijos) {
                const hijosMarcados = celdaHijos.querySelectorAll('input[type="checkbox"]:checked');
                
                // SI FALTA SELECCIONAR HIJOS
                if (hijosMarcados.length === 0) {
                    const labelPadre = tr.querySelector('td:first-child label');
                    const textoPadre = labelPadre ? labelPadre.innerText.trim() : "la categoría";
                    
                    Toast.fire({
                        icon: 'warning',
                        title: 'Faltan detalles:',
                        text: `Selecciona una opción para: "${textoPadre}"`
                    });
                    
                    checkPadre.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    const contenedorVisual = celdaHijos.querySelector('div') || celdaHijos;
                    contenedorVisual.style.transition = "border 0.3s ease";
                    contenedorVisual.style.border = "2px solid #dc3545"; 
                    contenedorVisual.style.borderRadius = "5px";
                    contenedorVisual.style.padding = "5px";
                    
                    setTimeout(() => { 
                        contenedorVisual.style.border = "1px solid #eee"; 
                    }, 4000);

                    errorValidacion = true;
                    break; 
                }
            }
        }
    }

    if (errorValidacion) return;

    // =================================================================
    // 🟢 2. RECOLECCIÓN DE DATOS
    // =================================================================

    const respuestasSimples = [];
    const respuestasMultiples = [];
    const listaContactos = [];

    // --- Inputs Simples ---
    document.querySelectorAll('.input-respuesta').forEach(input => {
        if (!input.dataset.idPregunta) return; 
        let procesar = (input.type === 'radio') ? input.checked : true;
        if (input.dataset.tipo === 'red_social' && input.value.trim() === '') procesar = false;

        if (procesar) {
            const idPregunta = input.dataset.idPregunta;
            let valorFinal = input.value;
            if (input.dataset.rangoValor) valorFinal = input.dataset.rangoValor;

            let textoExtra = null;
            if (input.dataset.tipo === 'opcion_unica' && input.value) {
                 const inputSpec = document.querySelector(`.input-especificar[data-id-pregunta="${idPregunta}"]`);
                 if (inputSpec && inputSpec.style.display !== 'none') textoExtra = inputSpec.value;
            }

            let idOpcionParaEnviar = null;
            if (input.dataset.tipo === 'opcion_unica' || input.type === 'radio') {
                idOpcionParaEnviar = input.value; 
            } else if (input.dataset.tipo === 'red_social' || input.dataset.tipo === 'texto_con_id') {
                idOpcionParaEnviar = input.dataset.idOpcion; 
            }

            respuestasSimples.push({ 
                id_pregunta: idPregunta, 
                valor_texto: (['texto', 'red_social', 'texto_con_id'].includes(input.dataset.tipo)) ? valorFinal : textoExtra, 
                id_opcion: idOpcionParaEnviar 
            });
        }
    });

    // --- Ninguno Manual ---
    document.querySelectorAll('.input-ninguno-manual:checked').forEach(chk => {
        respuestasSimples.push({ id_pregunta: chk.dataset.idPregunta, valor_texto: "Ninguno", id_opcion: chk.dataset.idOpcion });
    });

    // --- Múltiples ---
    document.querySelectorAll('.input-multiple:checked').forEach(chk => {
        const idPregunta = chk.dataset.idPregunta;
        let textoExtra = null;
        const parentDiv = chk.closest('.opcion-item') || chk.closest('div') || chk.closest('td');

        if (parentDiv) {
            const inputSpec = parentDiv.querySelector(`.input-especificar-multiple[data-id-opcion="${chk.value}"]`);
            if (inputSpec) textoExtra = inputSpec.value;
        }

        respuestasMultiples.push({ id_pregunta: idPregunta, id_opcion: chk.value });
        if (textoExtra) {
             respuestasSimples.push({ id_pregunta: idPregunta, valor_texto: textoExtra, id_opcion: chk.value });
        }
    });

    // --- Limpieza Otros ---
    document.querySelectorAll('.input-especificar-multiple').forEach(inputSpec => {
        const parentDiv = inputSpec.closest('.opcion-item') || inputSpec.closest('div') || inputSpec.closest('td');
        if (parentDiv) {
            const checkbox = parentDiv.querySelector(`input[type="checkbox"][value="${inputSpec.dataset.idOpcion}"]`);
            if (checkbox && !checkbox.checked) {
                respuestasSimples.push({ id_pregunta: inputSpec.dataset.idPregunta, valor_texto: "", id_opcion: inputSpec.dataset.idOpcion });
            }
        }
    });

    // --- Matriz ---
    const respuestasMatriz = [];
    document.querySelectorAll('.input-matriz-celda').forEach(select => {
        if (select.value) respuestasMatriz.push({ id_pregunta: select.dataset.idPregunta, id_fila: select.dataset.idFila, id_columna: select.dataset.idColumna, valor: select.value });
    });
    document.querySelectorAll('.input-matriz-radio:checked').forEach(radio => {
        respuestasMatriz.push({ id_pregunta: radio.dataset.idPregunta, id_fila: radio.dataset.idFila, id_columna: radio.dataset.idColumna, valor: radio.value });
    });

    // --- Contactos ---
    const filasContactos = document.querySelectorAll('#tablaContactos tbody tr');
    filasContactos.forEach(fila => {
        const nombre = fila.querySelector('.contacto-nombre').value;
        // Solo guardamos si al menos puso el nombre
        if (nombre && nombre.trim() !== '') {
            listaContactos.push({
                nombre: nombre,
                cargo: fila.querySelector('.contacto-cargo').value,
                correo: fila.querySelector('.contacto-correo').value,
                // Guardamos los dos teléfonos con claves distintas
                telefono_inst: fila.querySelector('.contacto-tel-inst').value,
                telefono_otro: fila.querySelector('.contacto-tel-otro').value
            });
        }
    });

    // --- IDs Activos ---
    const idsMatricesActivas = [];
    const idsMultiplesActivas = [];
    if (typeof CONFIG_SECCION !== 'undefined') {
        CONFIG_SECCION.preguntas.forEach(p => {
            if (p.tipo === 'matriz_dinamica') idsMatricesActivas.push(p.id);
            if (p.tipo === 'catalogo_multiple' || p.tipo === 'catalogo_tabla') idsMultiplesActivas.push(p.id);
        });
    }

    // =================================================================
    // 🚀 3. ENVÍO AL SERVIDOR
    // =================================================================
    const datos = {
        id_usuario: idUsuario,
        datos_institucion: { nombre: "Usuario Sistema" }, 
        respuestas_simples: respuestasSimples,
        respuestas_multiples: respuestasMultiples,
        respuestas_matriz: respuestasMatriz, 
        ids_matrices_activas: idsMatricesActivas,   
        ids_multiples_activas: idsMultiplesActivas, 
        contactos: listaContactos
    };

    try {
        Swal.fire({
            title: 'Guardando...',
            text: 'Registrando respuestas',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // Asegúrate que API_URL_SAVE está definida en tu encuesta.js o config global
        // Si no, reemplaza por 'https://api-cuestionario.onrender.com/api'
        const response = await fetch(`${API_URL_SAVE}/guardar-encuesta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        const result = await response.json();
        
        if(response.ok) {
            
            // =========================================================
            // 🔥 NUEVO: LÓGICA DE FINALIZACIÓN (CANDADO)
            // =========================================================
            
            if (typeof CONFIG_SECCION !== 'undefined' && CONFIG_SECCION.es_final) {
                // CASO: SECCIÓN FINAL (SERVICIOS)
                
                // 1. Llamar a la API para cerrar (UPDATE finalizado=1)
                try {
                    await fetch(`${API_URL_SAVE}/finalizar-cuestionario`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_usuario: idUsuario })
                    });
                    
                    // 2. Bloquear localmente
                    localStorage.setItem('encuestaFinalizada', '1');

                    // 3. Alerta de éxito Final
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Encuesta Finalizada!',
                        text: 'Gracias por completar el cuestionario. Tus respuestas han sido enviadas.',
                        timer: 3000,
                        showConfirmButton: false
                    });

                } catch (errFin) {
                    console.error("Error al finalizar:", errFin);
                }

            } else {
                // CASO: SECCIÓN NORMAL
                await Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    timer: 1000,
                    showConfirmButton: false
                });
            }

            // --- REDIRECCIÓN ---
            if (typeof CONFIG_SECCION !== 'undefined' && CONFIG_SECCION.siguiente) {
                window.location.href = CONFIG_SECCION.siguiente;
            } else {
                Swal.fire('¡Listo!', 'Proceso completado.', 'success');
            }

        } else {
            Swal.fire('Error', result.error, 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
    }
}

// =========================================================
// FUNCIÓN: ACTIVAR MODO SOLO LECTURA (ADAPTADO A NUEVO DISEÑO)
// =========================================================
function activarModoSoloLectura() {
    console.log("🔒 Activando modo solo lectura...");

    // 1. BLOQUEAR TODOS LOS INPUTS
    const inputs = document.querySelectorAll('#formularioDinamico input, #formularioDinamico select, #formularioDinamico textarea');
    inputs.forEach(input => {
        input.disabled = true;
        input.style.backgroundColor = "#f9f9f9"; // Un gris más suave
        input.style.cursor = "not-allowed";
        input.style.opacity = "0.8";
        input.style.borderColor = "#ddd";
    });

    // 2. OCULTAR BOTONES DE EDICIÓN
    const botonesEdicion = document.querySelectorAll('.btn-agregar, .btn-eliminar');
    botonesEdicion.forEach(btn => btn.style.display = 'none');

    // 3. TRANSFORMAR EL BOTÓN PRINCIPAL (GUARDAR -> SIGUIENTE)
    const btnPrincipal = document.querySelector('.btn-guardar');
    
    if (btnPrincipal) {
        if (typeof CONFIG_SECCION !== 'undefined' && CONFIG_SECCION.siguiente) {
            
            const nuevoBoton = btnPrincipal.cloneNode(true);
            if(btnPrincipal.parentNode) {
                btnPrincipal.parentNode.replaceChild(nuevoBoton, btnPrincipal);
            }
            
            nuevoBoton.type = 'button';
            nuevoBoton.style.display = 'inline-flex'; 
            nuevoBoton.style.alignItems = 'center';
            nuevoBoton.style.justifyContent = 'center';
            nuevoBoton.style.gap = '8px';
            nuevoBoton.style.cursor = 'pointer';
            nuevoBoton.style.width = 'auto';       
            nuevoBoton.style.minWidth = '140px';   
            nuevoBoton.style.padding = '12px 25px'; 

            // CASO ESPECIAL: Última sección
            if (typeof CONFIG_SECCION !== 'undefined' && CONFIG_SECCION.es_final) {
                nuevoBoton.innerHTML = 'Ver Resumen Final <i class="fas fa-chart-pie"></i>'; 
                nuevoBoton.className = 'btn-guardar'; 
                nuevoBoton.style.backgroundColor = "#17a2b8"; // Azul informativo
            } else {
                nuevoBoton.innerHTML = 'Siguiente Sección <i class="fas fa-arrow-right"></i>';
                nuevoBoton.style.backgroundColor = "#6c757d"; // Gris neutro
            }

            // Evento click para navegar
            nuevoBoton.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = CONFIG_SECCION.siguiente;
            });

        } else {
            btnPrincipal.style.display = 'none';
        }
    }

    // 4. AVISO VISUAL (EL CANDADITO)
    // FIX: Ahora buscamos .container porque .card-body ya no existe en el nuevo HTML
    const contenedor = document.querySelector('.container');
    const tituloSeccion = contenedor.querySelector('h2'); // Buscamos el título h2

    if (contenedor && !document.getElementById('bannerSoloLectura')) {
        const banner = document.createElement('div');
        banner.id = 'bannerSoloLectura';
        banner.innerHTML = `
            <div style="
                background: #fff3cd; 
                color: #856404; 
                border: 1px solid #ffeeba; 
                padding: 15px 20px; 
                margin-bottom: 30px; 
                border-radius: 10px; 
                display: flex; 
                align-items: center; 
                gap: 15px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            ">
                <div style="
                    background: rgba(255,255,255,0.6); 
                    width: 45px; height: 45px; 
                    border-radius: 50%; 
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                ">
                    <i class="fas fa-lock" style="font-size: 1.4em; color: #856404;"></i>
                </div>
                <div>
                    <strong style="font-size: 1.05em; display:block;">Cuestionario Finalizado</strong>
                    <span style="font-size: 0.9em; opacity: 0.9;">Estás en modo visualización. Ya no es posible editar las respuestas.</span>
                </div>
            </div>
        `;
        
        // Insertamos el banner ANTES del título de la sección
        if (tituloSeccion) {
            contenedor.insertBefore(banner, tituloSeccion);
        } else {
            contenedor.insertBefore(banner, contenedor.firstChild);
        }
    }
}

// =========================================================
// 🧠 MOTOR LÓGICO CONDICIONAL (Necesario para Secc 6)
// =========================================================
function inicializarLogicaCondicional() {
    // Si no hay configuración o preguntas, no hacemos nada
    if (typeof CONFIG_SECCION === 'undefined' || !CONFIG_SECCION.preguntas) return;

    // 1. Filtramos las preguntas que tienen condiciones (Hijas)
    const preguntasCondicionales = CONFIG_SECCION.preguntas.filter(p => p.condicion);

    if (preguntasCondicionales.length === 0) return;

    console.log("🧠 Inicializando lógica condicional...");

    // 2. Función que evalúa si mostrar u ocultar
    const evaluar = () => {
        preguntasCondicionales.forEach(hija => {
            const padreId = hija.condicion.pregunta;
            const valorEsperado = String(hija.condicion.valor);
            
            // Buscamos el contenedor de la pregunta Hija
            const divHija = document.getElementById(`pregunta-box-${hija.id}`);
            
            // Si no lo encuentra por ID, intenta buscarlo por atributo (Fallback)
            const divHijaFallback = divHija || document.querySelector(`[data-id-pregunta="${hija.id}"]`)?.closest('.pregunta-box');

            if (!divHijaFallback) return;

            // Buscamos qué respondió el usuario en la pregunta Padre
            let valorActual = null;
            
            // Intento 1: Radio Buttons (Booleanos, Catálogo Único)
            const radioMarcado = document.querySelector(`input[name="pregunta_${padreId}"]:checked`);
            if (radioMarcado) {
                valorActual = radioMarcado.value;
            } 
            // Intento 2: Selects
            else {
                const select = document.querySelector(`select[data-id-pregunta="${padreId}"]`);
                if (select) valorActual = select.value;
            }

            // 3. Comparar y Actuar
            // Convertimos ambos a String para asegurar comparación ("1" == "1")
            if (String(valorActual) === valorEsperado) {
                // MOSTRAR
                divHijaFallback.style.display = 'block';
                // Reactivar inputs para que se guarden y sean obligatorios
                divHijaFallback.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
            } else {
                // OCULTAR
                divHijaFallback.style.display = 'none';
                // Desactivar inputs (ESTO ES LO QUE EVITA QUE TE PIDA OBLIGATORIO)
                divHijaFallback.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
            }
        });
    };

    // 3. Agregar "Listeners" a las preguntas Padre
    const idsPadres = [...new Set(preguntasCondicionales.map(p => p.condicion.pregunta))];

    idsPadres.forEach(idPadre => {
        // Escuchar cambios en Radios
        const radios = document.querySelectorAll(`input[name="pregunta_${idPadre}"]`);
        radios.forEach(r => r.addEventListener('change', evaluar));

        // Escuchar cambios en Selects
        const select = document.querySelector(`select[data-id-pregunta="${idPadre}"]`);
        if (select) select.addEventListener('change', evaluar);
    });

    // 4. Ejecutar una vez al inicio
    evaluar();
}