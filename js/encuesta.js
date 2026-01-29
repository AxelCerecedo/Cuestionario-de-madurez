// js/encuesta.js

const API_URL_SAVE = 'https://api-cuestionario.onrender.com'; 

document.addEventListener('DOMContentLoaded', async function() { // <--- AHORA ES ASYNC
    
    // 1. VERIFICAR USUARIO
    const idUsuario = localStorage.getItem('idUsuario');
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    
    if (!idUsuario) {
        window.location.href = 'login.html';
        return;
    }

    // 2. BIENVENIDA (SOLO EN SECCIÓN 1)
    const divBienvenida = document.getElementById('mensajeBienvenida');
    const esSeccionUno = window.location.href.includes('seccion1.html');

    if (nombreUsuario && divBienvenida && esSeccionUno) {
        divBienvenida.innerHTML = `👋 ¡Hola, <b>${nombreUsuario}</b>! \n Tu progreso se guardará automáticamente.`;
        divBienvenida.style.display = 'block';
    } else if (divBienvenida) {
        divBienvenida.style.display = 'none';
    }

    // 3. CONFIGURAR BOTONES DE NAVEGACIÓN
    configurarBotonesNavegacion();

    // 4. CARGAR PREGUNTAS
    cargarCuestionarioLocal();

    // 5. RECUPERAR PROGRESO (Esperamos a que termine de llenar los datos)
    await cargarRespuestasPrevias(idUsuario); 

    // =========================================================
    // 🔒 6. VERIFICAR SI ESTÁ FINALIZADA (CANDADO)
    // =========================================================
    const estaFinalizada = localStorage.getItem('encuestaFinalizada');

    if (estaFinalizada === '1') {
        // Si ya acabó, bloqueamos todo visualmente
        activarModoSoloLectura();
    }
    
    // 7. EVENTO SUBMIT (Solo si no está finalizada, aunque ocultamos el botón)
    const form = document.getElementById('formularioDinamico');
    if (form) form.addEventListener('submit', enviarFormulario);
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
        // input2.className = 'input-respuesta'; // <--- ❌ BORRA O COMENTA ESTA LÍNEA
        input2.className = 'input-auxiliar';     // <--- ✅ PONLE OTRA CLASE QUE NO SEA 'input-respuesta'
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

    // --- D. TABLA DE CONTACTOS ---
    else if (p.tipo === 'tabla_contactos') {
        const tableContainer = document.createElement('div');
        tableContainer.innerHTML = `
            <table class="tabla-contactos" id="tablaContactos" style="width:100%; margin-top:10px; border-collapse: collapse;">
                <thead>
                    <tr style="background:#eee; text-align:left;">
                        <th style="padding:8px;">Nombre</th>
                        <th>Cargo</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <button type="button" class="btn-agregar" onclick="agregarFilaContacto()" style="margin-top:10px; padding:5px 10px; cursor:pointer;">
                + Agregar Contacto
            </button>
        `;
        div.appendChild(tableContainer);
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

    // --- G. MATRIZ DINÁMICA (NORMAL E INVERTIDA) ---
    else if (p.tipo === 'matriz_dinamica') {
        
        // AVISO SCROLL (Solo visible si la tabla es muy ancha)
        const avisoScroll = document.createElement('div');
        avisoScroll.innerHTML = '↔ <b>Desliza horizontalmente</b> si no ves todas las columnas.';
        avisoScroll.style.cssText = 'font-size:0.85em; color:#856404; background:#fff3cd; border:1px solid #ffeeba; padding:8px; margin-bottom:5px; border-radius:4px; text-align:center; display:none;';
        div.appendChild(avisoScroll);

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

        // CREAMOS ESTRUCTURA BASE
        const thead = document.createElement('thead');
        tabla.appendChild(thead);
        const tbody = document.createElement('tbody');
        tbody.id = `tbody_matriz_${p.id}`;
        tabla.appendChild(tbody);

        tableContainer.appendChild(tabla);
        div.appendChild(tableContainer);

        // LÓGICA DE ESCUCHA Y RENDERIZADO
        // Usamos setTimeout para asegurar que los inputs origen ya existan en el DOM
        setTimeout(() => {
            const inputsOrigen = document.querySelectorAll(`.input-multiple[data-id-pregunta="${p.id_pregunta_origen}"]`);
            
            const actualizarFilas = () => {
                // 1. BACKUP DE RESPUESTAS (Para no perder lo que el usuario ya llenó al redibujar)
                const valoresPrevios = {};
                if (p.modo === 'matriz_radio') {
                    tbody.querySelectorAll('input[type="radio"]:checked').forEach(rad => {
                        valoresPrevios[rad.name] = rad.value;
                    });
                } else {
                    tbody.querySelectorAll('.input-matriz-celda').forEach(select => {
                        const key = `${select.dataset.idFila}_${select.dataset.idColumna}`;
                        if (select.value) valoresPrevios[key] = select.value;
                    });
                }

                // 2. LIMPIEZA TOTAL
                thead.innerHTML = '';
                tbody.innerHTML = ''; 

                // 3. IDENTIFICAR HERRAMIENTAS SELECCIONADAS
                // 🔥 AQUÍ ESTÁ LA CORRECCIÓN CLAVE: Agregamos && chk.value != '3899'
                const herramientasSeleccionadas = Array.from(inputsOrigen)
                    .filter(chk => chk.checked && chk.value != '99' && chk.value != '3899') 
                    .map(chk => ({ id: chk.value, texto: chk.parentElement.innerText.trim() }));

                // Si no hay nada válido seleccionado (o solo marcó Ninguna), mostramos aviso
                if (herramientasSeleccionadas.length === 0) {
                    const tr = document.createElement('tr');
                    const td = document.createElement('td');
                    td.innerText = "Seleccione herramientas arriba para habilitar esta tabla.";
                    td.style.padding = '20px';
                    td.style.textAlign = 'center';
                    td.style.color = '#777';
                    td.style.fontStyle = 'italic';
                    tbody.appendChild(tr);
                    avisoScroll.style.display = 'none';
                    return;
                }

                // --- CASO 1: MATRIZ INVERTIDA (Eje Y: Actividades | Eje X: Herramientas) ---
                // * Usado en la Sección 5 *
                if (p.invertir_ejes) {
                    avisoScroll.style.display = (herramientasSeleccionadas.length > 3) ? 'block' : 'none';

                    // A. CONSTRUIR CABECERA (Columnas dinámicas = HERRAMIENTAS)
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

                    // B. CONSTRUIR CUERPO (Filas fijas = ACTIVIDADES del JSON)
                    p.columnas.forEach(actividad => {
                        const tr = document.createElement('tr');
                        
                        // Nombre Actividad
                        const tdNombre = document.createElement('td');
                        tdNombre.innerHTML = `<b>${actividad.texto}</b>`;
                        if(actividad.ayuda) tdNombre.innerHTML += `<br><small style='color:#666'>${actividad.ayuda}</small>`;
                        tdNombre.style.cssText = 'padding:8px; border:1px solid #ddd; background:#fff;';
                        tr.appendChild(tdNombre);

                        // Celdas para cada Herramienta
                        herramientasSeleccionadas.forEach(herr => {
                            const td = document.createElement('td');
                            td.style.cssText = 'border:1px solid #ddd; text-align:center; padding:5px;';
                            
                            const select = document.createElement('select');
                            select.className = 'input-matriz-celda';
                            select.dataset.idPregunta = p.id;
                            
                            // IMPORTANTE: En invertida -> idFila=Actividad, idColumna=Herramienta
                            select.dataset.idFila = actividad.id;       
                            select.dataset.idColumna = herr.id;         

                            const optDef = new Option('-', '');
                            select.appendChild(optDef);
                            [1,2,3,4,5].forEach(num => select.appendChild(new Option(num, num)));

                            select.style.width = '100%';
                            
                            // Restaurar valor previo si existe
                            const key = `${actividad.id}_${herr.id}`;
                            if (valoresPrevios[key]) select.value = valoresPrevios[key];

                            td.appendChild(select);
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                } 
                
                // --- CASO 2: MATRIZ NORMAL (Eje Y: Herramientas | Eje X: Criterios) ---
                else {
                    avisoScroll.style.display = (p.columnas.length > 5) ? 'block' : 'none';

                    // A. CONSTRUIR CABECERA (Columnas fijas del JSON)
                    const trHead = document.createElement('tr');
                    const thEsq = document.createElement('th');
                    thEsq.innerText = "Herramienta / Uso";
                    thEsq.style.cssText = 'background:#e9ecef; padding:10px; border:1px solid #ccc; position:sticky; left:0; z-index:10;';
                    trHead.appendChild(thEsq);

                    p.columnas.forEach(col => {
                        const th = document.createElement('th');
                        th.innerText = col.texto;
                        th.title = col.ayuda || "";
                        th.style.cssText = 'background:#f8f9fa; padding:8px; border:1px solid #ddd; min-width:80px; font-weight:bold;';
                        trHead.appendChild(th);
                    });
                    thead.appendChild(trHead);

                    // B. CONSTRUIR CUERPO (Filas dinámicas = HERRAMIENTAS)
                    herramientasSeleccionadas.forEach(herr => {
                        const tr = document.createElement('tr');
                        
                        const tdNombre = document.createElement('td');
                        tdNombre.innerText = herr.texto;
                        tdNombre.style.cssText = 'padding:8px; border:1px solid #ddd; font-weight:bold; background:#fff; position:sticky; left:0; z-index:5;';
                        tr.appendChild(tdNombre);

                        p.columnas.forEach(col => {
                            const td = document.createElement('td');
                            td.style.border = '1px solid #ddd';
                            td.style.textAlign = 'center';
                            
                            if (p.modo === 'matriz_radio') {
                                const radio = document.createElement('input');
                                radio.type = 'radio';
                                radio.name = `matriz_${p.id}_fila_${herr.id}`; 
                                radio.value = col.valor;
                                radio.className = 'input-matriz-radio';
                                radio.dataset.idPregunta = p.id;
                                radio.dataset.idFila = herr.id;
                                radio.dataset.idColumna = col.id;
                                if (valoresPrevios[radio.name] == radio.value) radio.checked = true;
                                td.appendChild(radio);
                            } else {
                                const select = document.createElement('select');
                                select.className = 'input-matriz-celda';
                                select.dataset.idPregunta = p.id;
                                select.dataset.idFila = herr.id;
                                select.dataset.idColumna = col.id;
                                const optDef = new Option('-', '');
                                select.appendChild(optDef);
                                [1,2,3,4,5].forEach(num => select.appendChild(new Option(num, num)));
                                select.style.width = '100%';
                                const key = `${herr.id}_${col.id}`;
                                if (valoresPrevios[key]) select.value = valoresPrevios[key];
                                td.appendChild(select);
                            }
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                }
            };

            // Escuchar cambios en los checkboxes de origen
            inputsOrigen.forEach(chk => chk.addEventListener('change', actualizarFilas));
            
            // Ejecución inicial por si ya hay datos cargados
            actualizarFilas(); 

        }, 500); // Retraso para asegurar carga del DOM
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

    return div;
}

// Función para agregar filas a la tabla (Soporta precarga de datos)
window.agregarFilaContacto = function(datos = null) {
    const tbody = document.querySelector('#tablaContactos tbody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="contacto-nombre" value="${datos ? datos.nombre : ''}" placeholder="Nombre" style="width:95%"></td>
        <td><input type="text" class="contacto-cargo" value="${datos ? datos.cargo : ''}" placeholder="Cargo" style="width:95%"></td>
        <td><input type="text" class="contacto-correo" value="${datos ? datos.correo : ''}" placeholder="Email" style="width:95%"></td>
        <td><input type="text" class="contacto-tel" value="${datos ? datos.telefono : ''}" placeholder="Tel" style="width:95%"></td>
        <td><button type="button" onclick="this.closest('tr').remove()" style="color:red; cursor:pointer; border:none; background:none; font-weight:bold;">X</button></td>
    `;
    tbody.appendChild(row);
};

// =========================================================
// FUNCIÓN: CARGAR RESPUESTAS (VERSIÓN FINAL COMPLETADA)
// =========================================================
async function cargarRespuestasPrevias(idUsuario) {
    try {
        const response = await fetch(`${API_URL_SAVE}/respuestas-usuario/${idUsuario}`);
        const data = await response.json();

        if (data.vacio) return; 

        console.log("Cargando datos previos...", data);
        localStorage.setItem('datosCargados', 'true'); 

        // =========================================================
        // 1. RECUPERAR RESPUESTAS SIMPLES
        // (Incluye: Textos, Fechas, Radios, Selects, Listas con ID y "Ninguno")
        // =========================================================
        data.simples.forEach(r => {
            
            // --- A. CASO ESPECIAL: Checkbox "Ninguno" (Redes Sociales - ID 99) ---
            if (r.id_opcion_seleccionada == 99) {
                const chkNinguno = document.querySelector(`.input-ninguno-manual[data-id-pregunta="${r.id_pregunta}"]`);
                if (chkNinguno) {
                    chkNinguno.checked = true;
                    // Importante: Disparar evento para que se bloqueen los inputs de texto
                    chkNinguno.dispatchEvent(new Event('change')); 
                    return; // Ya procesamos esta respuesta, pasamos a la siguiente
                }
            }

            // --- B. RECUPERAR INPUTS DE TEXTO / RADIOS / FECHAS ---
            const inputs = document.querySelectorAll(`.input-respuesta[data-id-pregunta="${r.id_pregunta}"]`);
            
            inputs.forEach(input => {
                // Caso 1: Redes Sociales Y Texto con ID (Pregunta 21)
                // Verificamos que coincida el ID de la opción (Fondo 1, Fondo 2, etc.)
                if (input.dataset.tipo === 'red_social' || input.dataset.tipo === 'texto_con_id') {
                    if (input.dataset.idOpcion == r.id_opcion_seleccionada) {
                        input.value = r.respuesta_texto;
                    }
                } 
                // Caso 2: Selects (Opción Única)
                else if (input.tagName === 'SELECT') {
                    input.value = r.id_opcion_seleccionada;
                    input.dispatchEvent(new Event('change')); 
                }
                // Caso 3: Radio Buttons (Booleanos)
                else if (input.type === 'radio') {
                    if (input.value === r.respuesta_texto || input.value == r.id_opcion_seleccionada) {
                        input.checked = true;
                    }
                }
                // Caso 4: Fechas (Rango o Individual)
                else if (input.type === 'date') {
                    if (r.respuesta_texto && r.respuesta_texto.includes(' al ')) {
                        // Es un rango: "2000-01-01 al 2023-01-01"
                        const partes = r.respuesta_texto.split(' al '); 
                        
                        // Input 1 (Principal)
                        if (partes[0]) input.value = partes[0].trim();
                        
                        // Input 2 (Auxiliar visual)
                        const parent = input.parentElement;
                        const input2 = parent.querySelector('.input-auxiliar'); 
                        if (input2 && partes[1]) input2.value = partes[1].trim();
                        
                        // Restaurar dataset para guardar correctamente
                        input.dataset.rangoValor = r.respuesta_texto;
                    } else {
                        // Fecha normal
                        input.value = r.respuesta_texto;
                    }
                }
                // Caso 5: Texto normal / Textarea
                else if (input.dataset.tipo === 'texto') {
                    input.value = r.respuesta_texto;
                }
            });

            // --- C. RECUPERAR CAMPOS "ESPECIFIQUE" (OTRO) ---
            // Buscamos si hay un input extra asociado a esta respuesta
            let inputSpec = null;

            // Opción 1: Es un Select con "Otro"
            if (r.id_opcion_seleccionada) {
                 inputSpec = document.querySelector(`.input-especificar[data-id-pregunta="${r.id_pregunta}"]`);
            }
            
            // Opción 2: Es un Checkbox con "Otro" (aunque estos suelen venir en 'multiples', a veces se guardan aquí)
            if (!inputSpec && r.id_opcion_seleccionada) {
                inputSpec = document.querySelector(`.input-especificar-multiple[data-id-pregunta="${r.id_pregunta}"][data-id-opcion="${r.id_opcion_seleccionada}"]`);
            }

            if (inputSpec && r.respuesta_texto) {
                inputSpec.value = r.respuesta_texto;
                inputSpec.style.display = 'inline-block'; // Hacerlo visible
                
                // Si es múltiple, aseguramos que el checkbox padre esté marcado
                if (inputSpec.classList.contains('input-especificar-multiple')) {
                    const parentLabel = inputSpec.closest('.opcion-item') || inputSpec.closest('div');
                    if (parentLabel) {
                        const checkbox = parentLabel.querySelector('input[type="checkbox"]');
                        if (checkbox) checkbox.checked = true;
                    }
                }
            }
        });

        // =========================================================
        // 2. RECUPERAR CHECKBOXES (MÚLTIPLES)
        // =========================================================
        data.multiples.forEach(r => {
            const chk = document.querySelector(`.input-multiple[data-id-pregunta="${r.id_pregunta}"][value="${r.id_opcion}"]`);
            if (chk) {
                chk.checked = true;
                chk.dispatchEvent(new Event('change')); // Dibuja filas de matriz si es necesario
                
                // Si este checkbox tenía un campo "Otro" (sub-opción de tabla)
                // nos aseguramos de que el contenedor del hijo sea visible (caso Sección 7)
                const parentRow = chk.closest('tr'); // Si está en tabla
                if (parentRow) {
                    // Lógica específica para tablas si fuera necesaria
                }
            }
        });

        // =========================================================
        // 3. RECUPERAR MATRIZ DINÁMICA (SELECTS Y RADIOS)
        // =========================================================
        if (data.matriz && data.matriz.length > 0) {
            // setTimeout para dar tiempo a que los checkboxes dibujen las filas
            setTimeout(() => {
                data.matriz.forEach(m => {
                    // Intento 1: Matriz con Selects (Sección 5)
                    let selectorSelect = `.input-matriz-celda[data-id-pregunta="${m.id_pregunta_matriz}"][data-id-fila="${m.id_fila}"][data-id-columna="${m.id_columna}"]`;
                    let elSelect = document.querySelector(selectorSelect);
                    if (elSelect) { 
                        elSelect.value = m.valor; 
                        return; 
                    }

                    // Intento 2: Matriz con Radios (Sección 6)
                    // Buscamos el radio específico de esa celda que tenga el valor guardado
                    // Nota: En Sección 6, m.valor contiene el puntaje (1,2,3,4,5), que coincide con el value del radio
                    let selectorRadio = `.input-matriz-radio[data-id-pregunta="${m.id_pregunta_matriz}"][data-id-fila="${m.id_fila}"][data-id-columna="${m.id_columna}"][value="${m.valor}"]`;
                    let elRadio = document.querySelector(selectorRadio);
                    if (elRadio) {
                        elRadio.checked = true;
                    }
                });
                console.log("✅ Datos de matriz restaurados.");
            }, 500); 
        }

        // =========================================================
        // 4. RECUPERAR CONTACTOS
        // =========================================================
        const tbody = document.querySelector('#tablaContactos tbody');
        if (tbody) { 
            tbody.innerHTML = ''; 
            if (data.contactos.length > 0) {
                data.contactos.forEach(c => agregarFilaContacto(c));
            } else {
                agregarFilaContacto(); // Fila vacía por defecto
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
        if (nombre) {
            listaContactos.push({
                nombre: nombre,
                cargo: fila.querySelector('.contacto-cargo').value,
                correo: fila.querySelector('.contacto-correo').value,
                telefono: fila.querySelector('.contacto-tel').value
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
// FUNCIÓN: ACTIVAR MODO SOLO LECTURA (CORREGIDO ANCHO)
// =========================================================
function activarModoSoloLectura() {
    console.log("🔒 Activando modo solo lectura...");

    // 1. BLOQUEAR TODOS LOS INPUTS
    const inputs = document.querySelectorAll('#formularioDinamico input, #formularioDinamico select, #formularioDinamico textarea');
    inputs.forEach(input => {
        input.disabled = true;
        input.style.backgroundColor = "#f2f2f2"; 
        input.style.cursor = "not-allowed";
        input.style.opacity = "0.7";
    });

    // 2. OCULTAR BOTONES DE EDICIÓN
    const botonesEdicion = document.querySelectorAll('.btn-agregar, .btn-eliminar');
    botonesEdicion.forEach(btn => btn.style.display = 'none');

    // 3. TRANSFORMAR EL BOTÓN PRINCIPAL
    const btnPrincipal = document.querySelector('.btn-guardar') || document.querySelector('.btn-finalizar');
    
    if (btnPrincipal) {
        if (typeof CONFIG_SECCION !== 'undefined' && CONFIG_SECCION.siguiente) {
            
            const nuevoBoton = btnPrincipal.cloneNode(true);
            btnPrincipal.parentNode.replaceChild(nuevoBoton, btnPrincipal);
            
            nuevoBoton.type = 'button';
            nuevoBoton.style.display = 'inline-flex'; // Usamos inline-flex para centrar icono y texto
            nuevoBoton.style.alignItems = 'center';
            nuevoBoton.style.justifyContent = 'center';
            nuevoBoton.style.gap = '8px';
            nuevoBoton.style.cursor = 'pointer';
            
            // --- 🔧 FIX VISUAL: CONTROLAR EL ANCHO ---
            nuevoBoton.style.width = 'auto';       // Importante: Que se ajuste al texto
            nuevoBoton.style.minWidth = '140px';   // Un mínimo para que se vea bien
            nuevoBoton.style.maxWidth = '200px';   // Un máximo para que no empuje al otro
            nuevoBoton.style.padding = '10px 20px'; // Padding equilibrado
            nuevoBoton.style.margin = '0';         // Quitar márgenes extraños
            // -----------------------------------------

            // CASO ESPECIAL: Última sección
            if (typeof CONFIG_SECCION !== 'undefined' && CONFIG_SECCION.es_final) {
                nuevoBoton.innerHTML = 'Resumen <i class="fas fa-file-alt"></i>'; // Texto más corto para ahorrar espacio
                nuevoBoton.className = 'btn-guardar'; 
                nuevoBoton.style.backgroundColor = "#17a2b8"; 
                nuevoBoton.style.borderColor = "#17a2b8";
            } else {
                nuevoBoton.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
                nuevoBoton.style.backgroundColor = "#6c757d"; 
                nuevoBoton.style.borderColor = "#6c757d";
            }

            // Evento
            nuevoBoton.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = CONFIG_SECCION.siguiente;
            });

        } else {
            btnPrincipal.style.display = 'none';
        }
    }

    // 4. AVISO VISUAL (BANNER)
    const cardBody = document.querySelector('.card-body');
    if (cardBody && !document.getElementById('bannerSoloLectura')) {
        const banner = document.createElement('div');
        banner.id = 'bannerSoloLectura';
        banner.innerHTML = `
            <div style="background: #e2e3e5; color: #383d41; border: 1px solid #d6d8db; padding: 15px; margin-bottom: 20px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-lock"></i>
                <div>
                    <strong>Modo Visualización</strong>
                    <br>Cuestionario finalizado.
                </div>
            </div>
        `;
        cardBody.insertBefore(banner, cardBody.firstChild);
    }
}
