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
    await cargarRespuestasPrevias(idUsuario); 

    // --- REFRESCAR MATRICES SI HAY DATOS PREVIOS ---
    const inputsOrigenActivados = document.querySelectorAll('.input-multiple:checked');
    if (inputsOrigenActivados.length > 0) {
        inputsOrigenActivados[0].dispatchEvent(new Event('change'));
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

    // --- G. MATRIZ DINÁMICA (CORREGIDA: RADIOS ÚNICOS POR FILA) ---
    else if (p.tipo === 'matriz_dinamica') {
        
        // AVISO SCROLL
        const avisoScroll = document.createElement('div');
        avisoScroll.innerHTML = '↔ <b>Desliza horizontalmente</b> si no ves todas las columnas.';
        avisoScroll.style.cssText = 'font-size:0.85em; color:#856404; background:#fff3cd; border:1px solid #ffeeba; padding:8px; margin-bottom:5px; border-radius:4px; text-align:center; display:none;';
        div.appendChild(avisoScroll);

        // CONTENEDOR DE LA TABLA
        const tableContainer = document.createElement('div');
        tableContainer.style.overflowX = 'auto'; 
        tableContainer.style.border = '1px solid #ddd';
        tableContainer.className = 'scroll-visible';

        const tabla = document.createElement('table');
        tabla.className = 'tabla-matriz';
        tabla.id = `matriz_${p.id}`; 
        tabla.dataset.idPregunta = p.id;
        tabla.dataset.origen = p.id_pregunta_origen;
        
        tabla.style.width = '100%';
        tabla.style.borderCollapse = 'collapse';
        tabla.style.fontSize = '0.9em';
        if (!p.invertir_ejes) tabla.style.minWidth = '800px'; 

        const thead = document.createElement('thead');
        tabla.appendChild(thead);
        const tbody = document.createElement('tbody');
        tbody.id = `tbody_matriz_${p.id}`;
        tabla.appendChild(tbody);

        tableContainer.appendChild(tabla);
        div.appendChild(tableContainer);

        // =========================================================
        // LÓGICA DE RENDERIZADO
        // =========================================================
        setTimeout(() => {
            const inputsOrigen = document.querySelectorAll(`.input-multiple[data-id-pregunta="${p.id_pregunta_origen}"]`);
            
            const actualizarTabla = () => {
                const valoresPrevios = {};

                // 1. RECUPERAR DATOS PREVIOS
                if (window.RESPUESTAS_PREVIAS_CACHE && Array.isArray(window.RESPUESTAS_PREVIAS_CACHE)) {
                    window.RESPUESTAS_PREVIAS_CACHE.forEach(r => {
                        const idPreguntaRegistro = r.id_pregunta || r.id_pregunta_matriz;
                        if (idPreguntaRegistro == p.id) {
                            const key = `${r.id_fila}_${r.id_columna}`;
                            valoresPrevios[key] = String(r.valor);
                        }
                    });
                }
                
                // Preservar selección actual en pantalla
                tbody.querySelectorAll('input:checked').forEach(rad => {
                    const key = `${rad.dataset.idFila}_${rad.dataset.idColumna}`;
                    valoresPrevios[key] = String(rad.value);
                });

                // 2. DETECTAR FILAS (TEMAS)
                const herramientasSeleccionadas = Array.from(inputsOrigen)
                    .filter(chk => chk.checked && chk.value != '99' && chk.value != '3899') 
                    .map(chk => ({ id: chk.value, texto: chk.parentElement.innerText.trim() }));

                if (herramientasSeleccionadas.length === 0) {
                    // EN LUGAR DE BORRAR TODO, MOSTRAMOS UN AVISO
                    thead.innerHTML = '';
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="100%" style="text-align:center; padding: 20px; color:#888; background:#f9f9f9; border:1px dashed #ccc;">
                                <i>(Seleccione opciones en la pregunta anterior para habilitar esta tabla)</i>
                            </td>
                        </tr>
                    `;
                    return; 
                }

                // =========================================================
                // 🟢 MODO: MATRIZ RADIO (SOLUCIÓN CHECK ÚNICO)
                // =========================================================
                if (p.modo === 'matriz_radio') {
                    
                    // HEADER
                    thead.innerHTML = '';
                    const trHead = document.createElement('tr');
                    const thEsq = document.createElement('th');
                    thEsq.innerText = "Tema / Capacitación";
                    thEsq.style.cssText = 'background:#e9ecef; padding:10px; border:1px solid #ccc; width: 30%; text-align: left;';
                    trHead.appendChild(thEsq);

                    p.columnas.forEach(col => {
                        const th = document.createElement('th');
                        th.innerText = col.texto;
                        th.style.cssText = 'background:#f8f9fa; padding:8px; border:1px solid #ddd; text-align:center; min-width:80px;';
                        trHead.appendChild(th);
                    });
                    thead.appendChild(trHead);

                    // BODY
                    tbody.innerHTML = '';
                    
                    herramientasSeleccionadas.forEach(filaTema => {
                        const tr = document.createElement('tr');
                        tr.style.borderBottom = '1px solid #eee';
                        tr.style.backgroundColor = '#fff';

                        // Columna Nombre
                        const tdNombre = document.createElement('td');
                        tdNombre.innerText = filaTema.texto;
                        tdNombre.style.cssText = 'padding:10px; border-right:1px solid #ddd; font-weight:500;';
                        tr.appendChild(tdNombre);

                        // Celdas Radios
                        p.columnas.forEach(colFrecuencia => {
                            const td = document.createElement('td');
                            td.style.cssText = 'text-align:center; padding:8px; border-right:1px solid #f0f0f0; vertical-align: middle;';
                            
                            const radio = document.createElement('input');
                            radio.type = 'radio'; 
                            radio.className = 'input-matriz-radio'; // Clase para recolección
                            
                            // 🔥 CORRECCIÓN CLAVE: El name debe ser ÚNICO por FILA
                            // Esto agrupa los radios horizontalmente. Si marco uno, se desmarca el otro de la misma fila.
                            radio.name = `radio_grupo_p${p.id}_fila${filaTema.id}`; 
                            
                            radio.value = colFrecuencia.id; 
                            
                            // Metadata para guardar
                            radio.dataset.idPregunta = p.id;
                            radio.dataset.idFila = filaTema.id;       
                            radio.dataset.idColumna = colFrecuencia.id; 

                            // Recuperar valor
                            const key = `${filaTema.id}_${colFrecuencia.id}`;
                            if (valoresPrevios[key]) {
                                radio.checked = true;
                            }

                            radio.style.transform = "scale(1.3)";
                            radio.style.cursor = "pointer";

                            td.appendChild(radio);
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });

                } else {
                    // MODO SELECT (Respaldo por si usas el otro modo en otra pregunta)
                    thead.innerHTML = '';
                    const trHead = document.createElement('tr');
                    const thEsq = document.createElement('th');
                    thEsq.innerText = "Actividad \\ Herramienta";
                    thEsq.style.cssText = 'background:#e9ecef; padding:10px; border:1px solid #ccc; width: 30%;';
                    trHead.appendChild(thEsq);

                    herramientasSeleccionadas.forEach(herr => {
                        const th = document.createElement('th');
                        th.innerText = herr.texto;
                        th.style.cssText = 'background:#f8f9fa; padding:8px; border:1px solid #ddd;';
                        trHead.appendChild(th);
                    });
                    thead.appendChild(trHead);

                    tbody.innerHTML = ''; 
                    p.columnas.forEach(actividad => {
                        const tr = document.createElement('tr');
                        const tdNombre = document.createElement('td');
                        tdNombre.innerHTML = `<b>${actividad.texto}</b>`;
                        tdNombre.style.padding = '8px';
                        tr.appendChild(tdNombre);

                        herramientasSeleccionadas.forEach(herr => {
                            const td = document.createElement('td');
                            const select = document.createElement('select');
                            select.className = 'input-matriz-celda';
                            select.dataset.idPregunta = p.id;
                            select.dataset.idFila = actividad.id;       
                            select.dataset.idColumna = herr.id;         
                            
                            const optDef = new Option('-', '');
                            select.appendChild(optDef);
                            [1,2,3,4,5].forEach(num => select.appendChild(new Option(num, num)));
                            
                            const key = `${actividad.id}_${herr.id}`;
                            if (valoresPrevios[key]) select.value = valoresPrevios[key];

                            td.appendChild(select);
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                }
            };

            inputsOrigen.forEach(chk => chk.addEventListener('change', actualizarTabla));
            actualizarTabla(); 

        }, 600);
    }

    // --- H. CATÁLOGO TIPO TABLA (DINÁMICO: 1 o 2 ENCABEZADOS) ---
    else if (p.tipo === 'catalogo_tabla') {
        const tableContainer = document.createElement('div');
        tableContainer.style.overflowX = 'auto';

        const tabla = document.createElement('table');
        tabla.style.width = '100%';
        tabla.style.borderCollapse = 'collapse';
        tabla.style.marginTop = '10px';
        tabla.style.fontSize = '0.95em';

        // =========================================================
        // 1. CABECERA INTELIGENTE (1 vs 2 Columnas) - CENTRADA
        // =========================================================
        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');
        trHead.style.backgroundColor = "#f4f4f4";
        trHead.style.textAlign = "center"; // <--- AQUÍ CAMBIAMOS A CENTER

        // Definimos los títulos (Si no hay en JSON, usamos uno genérico)
        const misTitulos = p.encabezados || ["Opciones"];

        // LÓGICA DINÁMICA:
        if (misTitulos.length === 2) {
            // CASO 2 COLUMNAS (Ideal para Secciones 7, 8, 9)
            trHead.innerHTML = `
                <th style="padding: 10px; border: 1px solid #ddd; width: 40%; color:#333; text-align: center;">${misTitulos[0]}</th>
                <th style="padding: 10px; border: 1px solid #ddd; width: 60%; color:#333; text-align: center;">${misTitulos[1]}</th>
            `;
        } else {
            // CASO 1 COLUMNA UNIFICADA (Ideal para Sección 6)
            trHead.innerHTML = `
                <th colspan="2" style="padding: 12px; border: 1px solid #ddd; color: #333; font-weight: bold; text-align: center;">
                    ${misTitulos[0]}
                </th>
            `;
        }
        thead.appendChild(trHead);
        tabla.appendChild(thead);

        // =========================================================
        // 2. CUERPO DE LA TABLA
        // =========================================================
        const tbody = document.createElement('tbody');
        
        p.opciones.forEach(opt => {
            const tr = document.createElement('tr');
            
            // --- CASO A: FILA SIMPLE (SIN SUB-OPCIONES) -> COMBINAR CELDAS ---
            if (!opt.sub_opciones) {
                const tdUnico = document.createElement('td');
                tdUnico.colSpan = 2; 
                tdUnico.style.padding = '12px';
                tdUnico.style.border = '1px solid #ddd';
                tdUnico.style.backgroundColor = '#fff';

                // Contenedor Flex
                const divPrincipal = document.createElement('div');
                divPrincipal.style.display = 'flex';
                divPrincipal.style.alignItems = 'center';
                divPrincipal.style.fontWeight = 'bold';
                divPrincipal.style.gap = '10px';

                const checkbox = document.createElement('input'); 
                checkbox.type = 'checkbox';
                checkbox.value = opt.id;
                checkbox.className = 'input-multiple'; 
                checkbox.dataset.idPregunta = p.id;
                checkbox.style.transform = "scale(1.2)";
                checkbox.style.cursor = "pointer";

                const labelTexto = document.createElement('label');
                labelTexto.style.cursor = 'pointer';
                labelTexto.innerText = opt.texto;
                labelTexto.onclick = () => { checkbox.checked = !checkbox.checked; checkbox.dispatchEvent(new Event('change')); };

                divPrincipal.appendChild(checkbox);
                divPrincipal.appendChild(labelTexto);
                tdUnico.appendChild(divPrincipal);

                // Ayuda
                if (opt.ayuda) {
                    const divAyuda = document.createElement('div');
                    divAyuda.innerText = opt.ayuda;
                    divAyuda.style.marginTop = '5px';
                    divAyuda.style.marginLeft = '26px';
                    divAyuda.style.fontSize = '0.9em';
                    divAyuda.style.color = '#666';
                    divAyuda.style.fontStyle = 'italic';
                    tdUnico.appendChild(divAyuda);
                }
                tr.appendChild(tdUnico);
            }

            // --- CASO B: FILA COMPLEJA (CON SUB-OPCIONES) -> 2 COLUMNAS ---
            else {
                // COLUMNA 1 (IZQUIERDA)
                const tdIzq = document.createElement('td');
                tdIzq.style.padding = '12px';
                tdIzq.style.border = '1px solid #ddd';
                tdIzq.style.verticalAlign = 'top';
                // Si usamos 2 columnas en el header, respetamos el ancho, si no, 40/60
                tdIzq.style.width = '40%'; 
                tdIzq.style.backgroundColor = '#fdfdfd';
                
                const divHeader = document.createElement('div');
                divHeader.style.display = 'flex';
                divHeader.style.gap = '10px';
                divHeader.style.fontWeight = 'bold';
                divHeader.style.marginBottom = '8px';

                const checkboxPadre = document.createElement('input'); 
                checkboxPadre.type = 'checkbox';
                checkboxPadre.value = opt.id;
                checkboxPadre.className = 'input-multiple'; 
                checkboxPadre.dataset.idPregunta = p.id;
                checkboxPadre.style.marginTop = '3px'; 

                divHeader.appendChild(checkboxPadre);
                divHeader.appendChild(document.createTextNode(opt.texto));
                tdIzq.appendChild(divHeader);

                if (opt.ayuda) {
                    const divAyuda = document.createElement('div');
                    divAyuda.innerText = opt.ayuda;
                    divAyuda.style.marginLeft = '26px';
                    divAyuda.style.fontSize = '0.85em';
                    divAyuda.style.color = '#666';
                    divAyuda.style.fontStyle = 'italic';
                    tdIzq.appendChild(divAyuda);
                }
                tr.appendChild(tdIzq);

                // COLUMNA 2 (DERECHA)
                const tdDer = document.createElement('td');
                tdDer.style.padding = '12px';
                tdDer.style.border = '1px solid #ddd';
                tdDer.style.verticalAlign = 'middle';
                tdDer.style.width = '60%';

                const divSub = document.createElement('div');
                divSub.style.padding = '10px';
                divSub.style.backgroundColor = '#f9f9f9';
                divSub.style.borderRadius = '6px';
                divSub.style.border = '1px solid #eee';
                
                const esRadio = (opt.modo === 'unica');
                const tipoInput = esRadio ? 'radio' : 'checkbox';
                const nombreGrupo = esRadio ? `grupo_radio_${opt.id}` : null;

                const gridSoft = document.createElement('div');
                gridSoft.style.display = 'grid';
                gridSoft.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
                gridSoft.style.gap = '10px';

                opt.sub_opciones.forEach(sub => {
                    const esNinguno = sub.texto.trim().toLowerCase().includes('ningun') || sub.texto.includes("No se realizan") || sub.texto.includes("No se lleva");

                    const labelSub = document.createElement('label');
                    labelSub.style.fontSize = '0.9em';
                    labelSub.style.display = 'flex';
                    labelSub.style.alignItems = 'center';
                    labelSub.style.gap = '6px';
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

                    // Eventos
                    chkSub.addEventListener('change', function() {
                        if (inputEsp) {
                            inputEsp.style.display = this.checked ? 'block' : 'none';
                            if(!this.checked) inputEsp.value = '';
                        }
                        if (esRadio && this.checked) {
                             const otrosInputs = gridSoft.querySelectorAll('.input-especificar-multiple');
                             otrosInputs.forEach(inp => { if(inp !== inputEsp) { inp.style.display='none'; inp.value=''; } });
                        }
                        if (!esRadio) {
                            const todos = gridSoft.querySelectorAll('input[type="checkbox"]');
                            if (esNinguno && this.checked) {
                                todos.forEach(c => { if (c !== this) { c.checked = false; c.dispatchEvent(new Event('change')); } });
                            } else if (!esNinguno && this.checked) {
                                todos.forEach(c => { if (c.dataset.esNinguno === 'true') c.checked = false; });
                            }
                        }
                        if (checkboxPadre && this.checked && !checkboxPadre.checked) {
                            checkboxPadre.checked = true;
                            checkboxPadre.dispatchEvent(new Event('change'));
                        }
                    });
                });

                divSub.appendChild(gridSoft);
                tdDer.appendChild(divSub);
                tr.appendChild(tdDer);

                // Bloqueo
                const actualizarEstado = () => {
                    if (checkboxPadre.checked) {
                        divSub.style.opacity = '1'; divSub.style.pointerEvents = 'auto';
                        divSub.querySelectorAll('input').forEach(i => i.disabled = false);
                    } else {
                        divSub.style.opacity = '0.5'; divSub.style.pointerEvents = 'none';
                        divSub.querySelectorAll('input').forEach(i => {
                            i.disabled = true;
                            if (i.checked) { i.checked = false; i.dispatchEvent(new Event('change')); }
                        });
                    }
                };
                actualizarEstado();
                checkboxPadre.addEventListener('change', actualizarEstado);
            }
            tbody.appendChild(tr);
        });

        tabla.appendChild(tbody);
        tableContainer.appendChild(tabla);
        div.appendChild(tableContainer);
    }

    // --- I. LISTA DE INPUTS ---
    else if (p.tipo === 'lista_inputs') {
        const container = document.createElement('div');
        
        // 1. GENERAR LOS INPUTS DE TEXTO
        p.opciones.forEach(opt => {
            const row = document.createElement('div');
            row.className = 'fila-input-lista'; // Clase para referenciarlos luego
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.marginBottom = '10px';

            const label = document.createElement('label');
            label.innerText = opt.texto + ":";
            label.style.width = '170px'; 
            label.style.fontWeight = 'bold';
            label.style.color = '#555';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-respuesta input-lista-texto'; // Clase extra para lógica
            input.dataset.idPregunta = p.id;
            input.dataset.idOpcion = opt.id; 
            input.dataset.tipo = 'texto_con_id'; 
            
            input.placeholder = "Nombre o descripción...";
            input.style.flex = '1'; 
            input.style.padding = '8px';
            input.style.border = '1px solid #ccc';
            input.style.borderRadius = '4px';

            row.appendChild(label);
            row.appendChild(input);
            container.appendChild(row);
        });

        // 2. GENERAR EL CHECKBOX "NO APLICA" (SI EXISTE EN EL JSON)
        if (p.texto_ninguno) {
            const rowCheck = document.createElement('div');
            rowCheck.style.marginTop = '15px';
            rowCheck.style.padding = '10px';
            rowCheck.style.backgroundColor = '#f9f9f9';
            rowCheck.style.border = '1px solid #eee';
            rowCheck.style.borderRadius = '5px';
            rowCheck.style.display = 'flex';
            rowCheck.style.alignItems = 'center';

            const labelCheck = document.createElement('label');
            labelCheck.style.cursor = 'pointer';
            labelCheck.style.display = 'flex';
            labelCheck.style.alignItems = 'center';
            labelCheck.style.width = '100%';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'input-ninguno-manual'; // 🔥 CLAVE: Para que Guardar/Cargar funcione solo
            checkbox.dataset.idPregunta = p.id;
            checkbox.dataset.idOpcion = 99; // ID estándar para "Ninguno"
            checkbox.style.marginRight = '10px';
            checkbox.style.transform = "scale(1.2)";

            // --- LÓGICA DE BLOQUEO ---
            const toggleInputs = () => {
                const inputsTexto = container.querySelectorAll('.input-lista-texto');
                inputsTexto.forEach(inp => {
                    if (checkbox.checked) {
                        inp.value = '';        // Borrar texto
                        inp.disabled = true;   // Bloquear
                        inp.style.backgroundColor = '#f0f0f0';
                    } else {
                        inp.disabled = false;  // Desbloquear
                        inp.style.backgroundColor = '#fff';
                    }
                });
            };

            // Evento al marcar el checkbox
            checkbox.addEventListener('change', toggleInputs);

            // Evento inverso: Si escriben en un input, desmarcar el checkbox
            const inputsTexto = container.querySelectorAll('.input-lista-texto');
            inputsTexto.forEach(inp => {
                inp.addEventListener('input', () => {
                    if (inp.value.trim() !== '' && checkbox.checked) {
                        checkbox.checked = false;
                        toggleInputs(); // Reactivar los demás
                    }
                });
            });

            labelCheck.appendChild(checkbox);
            labelCheck.appendChild(document.createTextNode(p.texto_ninguno));
            rowCheck.appendChild(labelCheck);
            container.appendChild(rowCheck);
        }

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

   //-- K. RANGO DE FECHAS FLEXIBLE (OBLIGATORIO AMBOS AÑOS) --
    else if (p.tipo === 'rango_fechas_flexibles') {
        const mainContainer = document.createElement('div');
        mainContainer.style.cssText = 'display: flex; flex-direction: column; gap: 15px;';

        // Input oculto (solo recibe valor si ambos lados están llenos)
        const inputFinal = document.createElement('input');
        inputFinal.type = 'hidden';
        inputFinal.className = 'input-respuesta'; 
        inputFinal.dataset.idPregunta = p.id;
        inputFinal.dataset.tipo = 'rango_flexible'; 
        mainContainer.appendChild(inputFinal);

        const crearBloque = (titulo, esObligatorio) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'rango-bloque-wrapper'; 
            wrapper.style.cssText = 'border:1px solid #eee; padding:10px; border-radius:8px; background:#f9f9f9;';
            wrapper.innerHTML = `<div style="font-weight:bold; margin-bottom:5px; color:#555; font-size:0.9em;">${titulo} <span style="color:red">*</span></div>`;
            
            const row = document.createElement('div'); row.style.cssText='display:flex; gap:5px; flex-wrap:wrap;';
            
            // --- AÑO (OBLIGATORIO) ---
            const iAno = document.createElement('input'); 
            iAno.className='input-aux-ano'; 
            iAno.type='number'; 
            iAno.placeholder='AAAA'; 
            iAno.min = '1000'; 
            
            // 🔥 CLAVE: Hacemos obligatorio el input VISIBLE del año
            if (esObligatorio) iAno.required = true;

            // Bloqueo de negativos y caracteres no numéricos
            iAno.onkeydown = (e) => { if(["-", "+", "e", "."].includes(e.key)) e.preventDefault(); };
            iAno.style.cssText='flex:1; min-width:80px; padding:5px; border:1px solid #ccc; border-radius:3px;';
            
            // --- MES ---
            const sMes = document.createElement('select'); 
            sMes.className='input-aux-mes'; 
            sMes.style.cssText='flex:1; min-width:100px; padding:5px; border:1px solid #ccc; border-radius:3px;';
            sMes.innerHTML = '<option value="">Mes</option>' + ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m,i)=>`<option value="${(i+1).toString().padStart(2,'0')}">${m}</option>`).join('');
            
            // --- DÍA ---
            const iDia = document.createElement('input'); 
            iDia.className='input-aux-dia'; 
            iDia.type='number'; 
            iDia.placeholder='DD'; 
            iDia.min = '1'; iDia.max = '31';
            iDia.onkeydown = (e) => { if(["-", "+", "e", "."].includes(e.key)) e.preventDefault(); };
            iDia.style.cssText='flex:0.5; min-width:60px; padding:5px; border:1px solid #ccc; border-radius:3px;';
            
            row.append(iAno, sMes, iDia); wrapper.appendChild(row);
            return { wrapper, iAno, sMes, iDia };
        };

        // Creamos los dos bloques obligatorios
        const b1 = crearBloque("Desde (Fecha Inicial)", p.obligatorio);
        const b2 = crearBloque("Hasta (Fecha Final)", p.obligatorio);

        const unir = () => {
            console.group("🕵️‍♂️ DEBUG: Uniendo Fechas (Pregunta " + p.id + ")");

            // 1. Ver qué valores brutos tienen los inputs
            console.log("   Inicio -> Año:", b1.iAno.value, "Mes:", b1.sMes.value, "Día:", b1.iDia.value);
            console.log("   Fin    -> Año:", b2.iAno.value, "Mes:", b2.sMes.value, "Día:", b2.iDia.value);

            // Construimos Fecha 1
            const f1 = b1.iAno.value ? (b1.iAno.value + (b1.sMes.value ? `-${b1.sMes.value}` + (b1.iDia.value ? `-${b1.iDia.value.toString().padStart(2,'0')}`:'') : '')) : '';
            
            // Construimos Fecha 2
            const f2 = b2.iAno.value ? (b2.iAno.value + (b2.sMes.value ? `-${b2.sMes.value}` + (b2.iDia.value ? `-${b2.iDia.value.toString().padStart(2,'0')}`:'') : '')) : '';
            
            console.log("   Fecha 1 armada:", f1);
            console.log("   Fecha 2 armada:", f2);

            // LÓGICA DE ASIGNACIÓN
            if (f1 && f2) {
                inputFinal.value = `${f1} al ${f2}`;
                console.log("   ✅ ¡AMBAS FECHAS LISTAS! Valor asignado al hidden:", inputFinal.value);
            } else {
                inputFinal.value = ''; 
                console.warn("   ⚠️ Faltan datos. El hidden se queda VACÍO.");
                if(!f1) console.log("      Falta Fecha Inicio completa (mínimo el año)");
                if(!f2) console.log("      Falta Fecha Fin completa (mínimo el año)");
            }

            console.groupEnd();

            // Avisamos cambio
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
                    
                    // 🔥 4. RANGO DE FECHAS FLEXIBLES (CON LOGS COMPLETOS) 🔥
                    else if (input.dataset.tipo === 'rango_flexible') {
                        console.group("📥 DEBUG RECUPERACIÓN (Pregunta 23)");
                        console.log("1. Texto recibido de la BD:", r.respuesta_texto);
                        
                        input.value = r.respuesta_texto; // Llenamos el hidden
                        
                        if (r.respuesta_texto && r.respuesta_texto.includes(' al ')) {
                            console.log("2. Formato correcto detectado (' al '). Separando...");
                            const fechas = r.respuesta_texto.split(' al '); // [FechaInicio, FechaFin]
                            console.log("3. Fechas separadas:", fechas);

                            const bloques = input.parentElement.querySelectorAll('.rango-bloque-wrapper');
                            console.log("4. Bloques inputs encontrados en el DOM:", bloques.length);

                            // Recorremos las dos partes (Inicio y Fin)
                            fechas.forEach((f, index) => {
                                if (bloques[index]) {
                                    const partes = f.split('-'); // [AAAA, MM, DD]
                                    console.log(`   👉 Llenando Bloque ${index}:`, partes);
                                    
                                    // Referencias a los inputs
                                    const iAno = bloques[index].querySelector('.input-aux-ano');
                                    const iMes = bloques[index].querySelector('.input-aux-mes');
                                    const iDia = bloques[index].querySelector('.input-aux-dia');

                                    // Año
                                    if (partes[0]) {
                                        if(iAno) { iAno.value = partes[0]; console.log("      Año seteado:", partes[0]); }
                                        else console.error("      ❌ No encuentro el input del Año en el DOM");
                                    }
                                    // Mes
                                    if (partes[1]) {
                                        if(iMes) { iMes.value = partes[1]; console.log("      Mes seteado:", partes[1]); }
                                    }
                                    // Día
                                    if (partes[2]) {
                                        if(iDia) { iDia.value = partes[2]; console.log("      Día seteado:", partes[2]); }
                                    }
                                } else {
                                    console.error(`   ❌ No existe el bloque visual número ${index}`);
                                }
                            });
                        } else {
                            console.warn("⚠️ La respuesta de la BD está vacía o no tiene el formato 'YYYY al YYYY'");
                        }
                        console.groupEnd();
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
    // 🛑 0.5 VALIDACIÓN DE CAMPOS OBLIGATORIOS (BLOQUE FINAL CORREGIDO)
    // =================================================================
    
    // A. LIMPIAR ERRORES PREVIOS VISUALES
    document.querySelectorAll('.error-borde').forEach(el => {
        el.classList.remove('error-borde');
        el.style.border = 'none'; 
        el.style.padding = ''; // Restaurar padding original si es necesario
    });

    let erroresObligatorios = [];
    let primeraFaltante = null;

    if (typeof CONFIG_SECCION !== 'undefined' && CONFIG_SECCION.preguntas) {
        CONFIG_SECCION.preguntas.forEach(p => {
            
            // 1. ENCONTRAR CONTENEDOR
            let container = document.getElementById(`pregunta-container-${p.id}`);
            
            if (!container) {
                const inputCualquiera = document.querySelector(`[data-id-pregunta="${p.id}"]`);
                if (inputCualquiera) {
                    container = inputCualquiera.closest('.pregunta-box') || inputCualquiera.closest('.card') || inputCualquiera.closest('div');
                }
            }

            // 2. DESCARTAR SI NO EXISTE O ESTÁ OCULTO (display: none)
            if (!container || container.style.display === 'none' || getComputedStyle(container).display === 'none') {
                return;
            }

            // 🔥 🔥 🔥 NUEVO: ESCUDO ANTI-GRIS 🔥 🔥 🔥
            // Si la pregunta tiene la clase de bloqueo visual, NO la validamos (aunque sea obligatoria)
            if (container.classList.contains('pregunta-deshabilitada')) {
                return; // Salta esta pregunta y pasa a la siguiente
            }
            // -----------------------------------------------------------

            // 3. VALIDACIÓN DE OBLIGATORIEDAD
            if (p.obligatorio) {
                let contestada = false;

                // A. Checkbox / Radio / Catálogos / Booleanos
                if (['catalogo_unico', 'catalogo_multiple', 'booleano', 'radio'].includes(p.tipo)) {
                    const hayInputs = container.querySelectorAll('input:checked').length > 0;
                    const select = container.querySelector('select');
                    const haySelect = select && select.value !== '';

                    if (hayInputs || haySelect) contestada = true;
                }
                // B. Matrices
                else if (p.tipo && p.tipo.includes('matriz')) {
                    const radios = container.querySelectorAll('input[type="radio"]:checked');
                    const selects = Array.from(container.querySelectorAll('select.input-matriz-celda')).filter(s => s.value !== '');
                    
                    if (radios.length > 0 || selects.length > 0) contestada = true;
                    // Si es tabla vacía dinámica, podría considerarse no contestada
                    if (!container.querySelector('table') && p.tipo === 'matriz_dinamica') contestada = false; 
                }
                // C. Catálogo Tabla
                else if (p.tipo === 'catalogo_tabla') {
                     if (container.querySelectorAll('input:checked').length > 0) contestada = true;
                }
                // D. Liga Múltiple
                else if (p.tipo === 'liga_multiple') {
                     const inputsTexto = Array.from(container.querySelectorAll('input[type="text"]')).filter(i => i.value.trim() !== '');
                     const ningunCheck = container.querySelector('.input-ninguno-manual:checked');
                     if (inputsTexto.length > 0 || ningunCheck) contestada = true;
                }
                // E. Texto / Fecha / Número / Textarea (INCLUYE PARCHE PARA FECHA FLEXIBLE)
                else {
                    const inputs = container.querySelectorAll('input, textarea, select');
                    for (let inp of inputs) {
                        // 1. Inputs normales con texto
                        if (inp.type !== 'hidden' && inp.value && inp.value.trim() !== '') {
                            contestada = true;
                            break;
                        }
                        // 2. 🔥 EXCEPCIÓN: Input Hidden de Rango/Fecha Flexible (que sí tiene valor)
                        if (inp.type === 'hidden' && (inp.dataset.tipo === 'rango_flexible' || inp.dataset.tipo === 'fecha_flexible') && inp.value !== '') {
                            contestada = true;
                            break;
                        }
                    }
                }

                // SI NO SE CONTESTÓ, MARCAR ERROR
                if (!contestada) {
                    erroresObligatorios.push(p.texto);
                    
                    container.style.border = "2px solid #dc3545"; 
                    container.style.borderRadius = "8px";
                    container.style.padding = "15px"; 
                    container.classList.add('error-borde');
                    
                    if (!primeraFaltante) primeraFaltante = container;
                }
            }
        });
    }

    // SI HAY ERRORES, DETENER Y AVISAR
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
        return; 
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
    // 🟢 2. RECOLECCIÓN DE DATOS (CORREGIDO)
    // =================================================================

    const respuestasSimples = [];
    const respuestasMultiples = [];
    const listaContactos = [];
    
    // 🔥 SOLUCIÓN: Definimos la lista AQUÍ ARRIBA para que siempre exista
    const tiposDirectos = ['texto', 'red_social', 'texto_con_id', 'rango_flexible', 'fecha_flexible', 'texto_largo', 'numero', 'fecha', 'direccion', 'liga', 'correo'];

    // --- Inputs Simples ---
    document.querySelectorAll('.input-respuesta').forEach(input => {
        if (!input.dataset.idPregunta) return; 

        let procesar = (input.type === 'radio') ? input.checked : true;
        if (input.dataset.tipo === 'red_social' && input.value.trim() === '') procesar = false;

        if (procesar) {
            const idPregunta = input.dataset.idPregunta;
            let valorFinal = input.value;
            
            // Si es rango de fechas, tomamos el valor compuesto
            if (input.dataset.rangoValor) valorFinal = input.dataset.rangoValor;

            let textoExtra = null;
            // Recuperar texto "Especifique" si es opción única
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

            // Aquí es donde te daba el error antes. Ahora ya funcionará porque 'tiposDirectos' está definida arriba.
            respuestasSimples.push({ 
                id_pregunta: idPregunta, 
                valor_texto: (tiposDirectos.includes(input.dataset.tipo)) ? valorFinal : textoExtra, 
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