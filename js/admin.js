const API_URL = 'https://api-cuestionario.onrender.com'; 

// COLORES
const COLOR_PRIMARY = '#7c1225'; 
const COLOR_PRIMARY_ALPHA = 'rgba(124, 18, 37, 0.6)'; 
const COLOR_BG_LIGHT = '#e9ecef'; 
const COLOR_TEXT = '#333';

// VARIABLES
let globalData = null;
let TODAS_LAS_SECCIONES = []; 
let chartGlobalPie = null;
let chartGlobalBar = null;
let chartInstComp = null;
let chartsDetalle = [];
let institucionActual = null; 

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cargar configuraciones (Rápido)
    await cargarConfiguracionesDeSecciones();
    
    // 2. Cargar datos del servidor
    const promesaTiempoMinimo = new Promise(resolve => setTimeout(resolve, 1500));
    
    await Promise.all([
        cargarGlobales(),
        cargarListaUsuarios(),
        promesaTiempoMinimo 
    ]);
    
    // 3. Configurar UI
    configurarBuscador();
    mostrarVistaGlobal();

    // 4. OCULTAR PANTALLA DE BIENVENIDA
    const splash = document.getElementById('splashScreen');
    if(splash) {
        splash.classList.add('hidden');
        setTimeout(() => { splash.remove(); }, 1000);
    }
});

// =========================================================
// 1. GESTIÓN DE VISTAS
// =========================================================
function mostrarVista(idVista) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(idVista).classList.add('active');
}

function mostrarVistaGlobal() {
    document.querySelectorAll('.user-item').forEach(i => i.classList.remove('active'));
    mostrarVista('vistaGlobal');
}

function volverADashboardInst() {
    mostrarVista('vistaInstitucion');
}

// =========================================================
// 2. CARGA DE CONFIG Y GLOBALES
// =========================================================
async function cargarConfiguracionesDeSecciones() {
    // 🔥 ACTUALIZADO: Solo cargamos del 1 al 5
    for (let i = 1; i <= 5; i++) {
        try {
            const res = await fetch(`js/seccion${i}.js`);
            if (res.ok) {
                let txt = await res.text();
                txt = txt.replace(/const\s+CONFIG_SECCION\s*=\s*/, 'return ');
                TODAS_LAS_SECCIONES.push(new Function(txt)());
            }
        } catch (e) { console.error(`Error cargando config sección ${i}`, e); }
    }
    console.log("2. Configuraciones cargadas:", TODAS_LAS_SECCIONES);
}

async function cargarGlobales() {
    try {
        const res = await fetch(`${API_URL}/admin/globales`);
        globalData = await res.json();
        console.log("3. Globales cargados:", globalData);
        renderizarVistaGlobal();
    } catch (e) { console.error("Error cargando globales:", e); }
}

// =========================================================
// 3. RENDER VISTA GLOBAL
// =========================================================
function renderizarVistaGlobal() {
    if(!globalData) return;

    document.getElementById('g_totalInst').innerText = globalData.totalInstituciones;
    let suma = Object.values(globalData.promedios).reduce((a,b)=>a+parseFloat(b),0);
    // Para el nuevo modelo, sacamos un promedio general real (dividido entre 5 secciones)
    let promGlobal = (suma / 5).toFixed(1);
    document.getElementById('g_promedio').innerText = promGlobal;
    
    const levels = globalData.niveles;
    const top = Object.keys(levels).length > 0 ? Object.keys(levels).reduce((a, b) => levels[a] > levels[b] ? a : b) : '--';
    document.getElementById('g_nivelTop').innerText = top;

    // PASTEL
    const ctxPie = document.getElementById('chartPieGlobal').getContext('2d');
    if(chartGlobalPie) chartGlobalPie.destroy();
    chartGlobalPie = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: Object.keys(levels),
            datasets: [{
                data: Object.values(levels),
                backgroundColor: ['#dc3545', '#ffc107', '#17a2b8', '#28a745'], 
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });

    // BARRAS / RADAR PROMEDIO GLOBAL
    const ctxBar = document.getElementById('chartBarGlobal').getContext('2d');
    if(chartGlobalBar) chartGlobalBar.destroy();
    
    // Transformamos las claves del backend (ej "1", "2") a los arrays de datos en orden
    const promediosOrdenados = [];
    for(let i=1; i<=5; i++) {
        promediosOrdenados.push(globalData.promedios[i] || 0);
    }
    
    // 🔥 ACTUALIZADO: Etiquetas para 5 secciones
    const labelsCortos = ["1. Gestión", "2. RRHH", "3. Acervo", "4. Infraestructura", "5. Servicios"];

    chartGlobalBar = new Chart(ctxBar, {
        type: 'radar', // Cambiado a radar para que coincida con el reporte de la institución
        data: {
            labels: labelsCortos,
            datasets: [{
                label: 'Madurez Promedio Nacional',
                data: promediosOrdenados,
                backgroundColor: COLOR_PRIMARY_ALPHA,
                borderColor: COLOR_PRIMARY,
                borderWidth: 2,
                pointBackgroundColor: COLOR_PRIMARY,
                pointRadius: 4
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

// =========================================================
// 4. LISTA Y DASHBOARD (ACTUALIZADA: FILTRADA POR ADMINS)
// =========================================================

async function cargarListaUsuarios() {
    const ADMIN_EMAILS = [
        'jcf_fcg@cultura.gob.mx', 
        'alberto.colef@gmail.com', 
        'lunam.liliana.dgtic@gmail.com',
        'asesordit11@cultura.gob.mx'
    ].map(email => email.toLowerCase().trim()); // Limpiamos la lista de admins

    try {
        const res = await fetch(`${API_URL}/admin/instituciones`);
        const lista = await res.json();
        
        const ul = document.getElementById('listaUsuarios');
        ul.innerHTML = '';

        // Filtramos comparando en minúsculas
        const listaFiltrada = lista.filter(inst => {
            const correo = (inst.correo_contacto || "").toLowerCase().trim();
            return !ADMIN_EMAILS.includes(correo);
        });

        listaFiltrada.forEach(inst => {
            const li = document.createElement('li');
            li.className = 'user-item';
            
            // Preferimos el nombre de la Institución, si no, el del Usuario
            const nombreInstitucion = inst.institucion_procedencia || "Institución no especificada";
            const nombreResponsable = inst.nombre_usuario || "Sin nombre";
            
            const iniciales = nombreInstitucion.substring(0, 2).toUpperCase();
            const promInst = (inst.puntaje_total / 5).toFixed(1);

            li.innerHTML = `
                <div class="avatar-circle">${iniciales}</div>
                <div class="user-info">
                    <span class="user-name" style="font-weight: bold; color: #7c1225;">${nombreInstitucion}</span>
                    <span class="user-subname" style="font-size: 0.8em; color: #666; display: block;">Resp: ${nombreResponsable}</span>
                    <span class="user-score">${promInst} / 5 pts</span>
                </div>
            `;
            li.onclick = () => abrirDashboardInstitucion(inst, li);
            ul.appendChild(li);
        });
        
        console.log(`4. Lista cargada: ${listaFiltrada.length} instituciones.`);
    } catch(e) { 
        console.error("Error lista usuarios:", e); 
    }
}

async function abrirDashboardInstitucion(inst, liElement) {
    console.log("--- SELECCIONANDO INSTITUCIÓN ---", inst);
    institucionActual = inst;
    document.querySelectorAll('.user-item').forEach(i => i.classList.remove('active'));
    liElement.classList.add('active');

    try {
        const resGraf = await fetch(`${API_URL}/admin/datos-grafica/${inst.id_institucion}`);
        const datosSecciones = await resGraf.json();
        renderizarDashboardInstitucion(inst, datosSecciones);
        mostrarVista('vistaInstitucion');
    } catch (e) { console.error(e); }
}

function renderizarDashboardInstitucion(inst, datosSecciones) {
    document.getElementById('instTitulo').innerText = inst.institucion_procedencia || inst.nombre_usuario;
    
    // Calcular promedio real para la UI
    const prom = (inst.puntaje_total / 5).toFixed(1);
    document.getElementById('instPuntaje').innerText = prom;
    
    // Nombres de niveles actualizados a la nueva rúbrica
    let nivel = "Sin Evaluar";
    let colorTag = "#6c757d";

    if(prom >= 4) { nivel = "Consolidado / Avanzado"; colorTag = "#28a745"; }
    else if(prom >= 3) { nivel = "Intermedio"; colorTag = "#ffc107"; }
    else if(prom >= 2) { nivel = "Básico"; colorTag = "#fd7e14"; }
    else if(prom > 0) { nivel = "Incipiente"; colorTag = "#dc3545"; }
    
    const tagNivel = document.getElementById('instNivel');
    tagNivel.innerText = nivel;
    tagNivel.style.backgroundColor = colorTag;

    const ctx = document.getElementById('chartComparativoInst').getContext('2d');
    if(chartInstComp) chartInstComp.destroy();

    const promediosGlobalesArr = [];
    const promediosInstArr = [];
    for(let i=1; i<=5; i++) {
        promediosGlobalesArr.push(globalData.promedios[i] || 0);
        promediosInstArr.push(datosSecciones[i] || 0);
    }

    const labelsCortos = [
        ["1. Gestión", "Institucional"],
        ["2. Recursos", "Humanos"],
        ["3. Características", "del Acervo"],
        ["4. Infraestructura", "y Tecnología"],
        ["5. Servicios", "al Público"]
    ];

    chartInstComp = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labelsCortos,
            datasets: [
                { 
                    label: 'Esta Institución', 
                    data: promediosInstArr, 
                    backgroundColor: COLOR_PRIMARY_ALPHA, 
                    borderColor: COLOR_PRIMARY,
                    borderWidth: 2,
                    pointBackgroundColor: COLOR_PRIMARY,
                    pointRadius: 5
                },
                { 
                    label: 'Promedio Nacional', 
                    data: promediosGlobalesArr, 
                    backgroundColor: 'rgba(108, 117, 125, 0.2)', 
                    borderColor: '#6c757d',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#6c757d',
                    pointRadius: 3
                }
            ]
        },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, display: false } } },
            plugins: { legend: { position: 'top' } }
        }
    });

    const grid = document.getElementById('gridSecciones');
    grid.innerHTML = '';

    TODAS_LAS_SECCIONES.forEach((sec, index) => {
        const num = index + 1;
        const card = document.createElement('div');
        card.className = 'section-nav-card';
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <div class="section-icon">${num}</div>
                <div>
                    <div style="font-weight:600; font-size:0.95em;">${sec.seccion.split('.')[1] || sec.seccion}</div>
                    <div style="font-size:0.8em; color:#888;">Ver detalle</div>
                </div>
            </div>
            <div class="section-arrow">➔</div>
        `;
        card.onclick = () => {
            console.log(`>>> Click en Sección ${num}: ${sec.seccion}`);
            abrirDetalleSeccion(sec, num);
        };
        grid.appendChild(card);
    });
}

// =========================================================
// 5. DETALLE SECCIÓN (AUDITORÍA)
// =========================================================
async function abrirDetalleSeccion(configSeccion, numSeccion) {
    if(!institucionActual) return;

    mostrarVista('vistaDetalleSeccion');
    document.getElementById('secTitulo').innerText = configSeccion.seccion;
    const contenedor = document.getElementById('contenedorGraficasDetalle');
    contenedor.innerHTML = '<p>Cargando datos...</p>';

    try {
        console.log(`Obteniendo datos para institución ID: ${institucionActual.id_institucion}`);
        const res = await fetch(`${API_URL}/admin/detalle-graficas/${institucionActual.id_institucion}`);
        const data = await res.json();
        
        contenedor.innerHTML = ''; // Limpiar loading

        // Como solo hay 5 secciones ahora y movimos contactos al registro,
        // convertiremos todas las secciones en Tablas de Auditoría Visual (Semáforo)
        // Ya que graficar pregunta por pregunta (barras) pierde sentido en un modelo madurez de 5 pasos
        
        console.log(`Renderizando Sección ${numSeccion} (Auditoría visual)`);
        renderizarTablaAuditoria(configSeccion, data.usuario, contenedor);

    } catch (e) { 
        console.error("Error abriendo detalle sección:", e); 
        contenedor.innerHTML = '<p>Error al cargar datos.</p>'; 
    }
}

// ---------------------------------------------------------
// TABLA DE AUDITORÍA INTELIGENTE
// ---------------------------------------------------------
function renderizarTablaAuditoria(config, respuestas, contenedor) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.background = 'white';
    table.style.borderRadius = '12px';
    table.style.overflow = 'hidden';
    table.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';

    table.innerHTML = `
        <thead style="background: #f8f9fa; border-bottom: 2px solid #e9ecef;">
            <tr>
                <th style="padding: 15px 20px; text-align: left; color: #555; width: 60%;">Concepto Evaluado</th>
                <th style="padding: 15px 20px; text-align: left; color: #555;">Estado / Respuesta</th>
            </tr>
        </thead>
        <tbody id="bodyTablaAuditoria"></tbody>
    `;

    const tbody = table.querySelector('tbody');

    config.preguntas.forEach(p => {
        const respuestasP = respuestas.filter(r => r.id_pregunta == p.id);
        
        let htmlCelda = '<span style="color:#ccc;">-- Sin dato --</span>';
        let rowColor = 'transparent';

        if (respuestasP.length > 0) {
            
            const opcionesTexto = respuestasP.map(r => {
                if (r.id_opcion && p.opciones) {
                    const op = p.opciones.find(o => o.id == r.id_opcion);
                    if (op) return op.texto;
                    return `(ID: ${r.id_opcion})`; 
                }
                return r.respuesta_texto;
            }).filter(Boolean);

            const primerTexto = opcionesTexto[0] ? opcionesTexto[0].toLowerCase() : '';
            
            const esSi = primerTexto.includes('sí') || primerTexto.includes('si ') || primerTexto === 'si' || primerTexto.includes('totalmente');
            const esNo = primerTexto.includes('no') || primerTexto.includes('nunca') || primerTexto.includes('ninguno');
            const esParcial = primerTexto.includes('parcial') || primerTexto.includes('proceso') || primerTexto.includes('basico');

            if (opcionesTexto.length > 1) {
                htmlCelda = `<ul style="margin:0; padding-left:20px; color:#333; font-size:0.9em;">`;
                opcionesTexto.forEach(t => htmlCelda += `<li style="margin-bottom:3px;">${t}</li>`);
                htmlCelda += `</ul>`;
            } 
            else if (opcionesTexto.length === 1) {
                const textoMostrar = opcionesTexto[0];
                
                if (esSi) {
                    htmlCelda = `<span style="background:#d1e7dd; color:#0f5132; padding:6px 14px; border-radius:20px; font-size:0.85em; font-weight:700;">✅ CUMPLE</span>`;
                } else if (esNo) {
                    htmlCelda = `<span style="background:#f8d7da; color:#842029; padding:6px 14px; border-radius:20px; font-size:0.85em; font-weight:700;">❌ NO CUMPLE / CARENCIA</span>`;
                    rowColor = '#fff5f5';
                } else if (esParcial) {
                    htmlCelda = `<span style="background:#fff3cd; color:#664d03; padding:6px 14px; border-radius:20px; font-size:0.85em; font-weight:700;">⚠️ EN PROCESO / PARCIAL</span>`;
                } else {
                    htmlCelda = `<span style="color:#333; font-weight:500;">${textoMostrar}</span>`;
                }
            }
        }

        const tr = document.createElement('tr');
        tr.style.backgroundColor = rowColor;
        tr.style.borderBottom = '1px solid #eee';
        tr.innerHTML = `
            <td style="padding: 15px 20px; font-size: 0.95em;">${p.texto}</td>
            <td style="padding: 15px 20px;">${htmlCelda}</td>
        `;
        tbody.appendChild(tr);
    });

    contenedor.appendChild(table);
}


// =========================================================
// FUNCIÓN: CONFIGURAR BUSCADOR
// =========================================================
function configurarBuscador() {
    const input = document.getElementById('inputBusqueda');
    if (!input) return;

    input.addEventListener('input', function(e) {
        const texto = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.user-item'); 

        items.forEach(item => {
            const nombre = item.querySelector('.user-name').innerText.toLowerCase();
            if (nombre.includes(texto)) {
                item.style.display = 'flex'; 
            } else {
                item.style.display = 'none'; 
            }
        });
    });
}

// =========================================================
// 📥 EXPORTAR A CSV
// =========================================================
async function descargarCSVInstitucion() {
    if (!institucionActual) return;

    Swal.fire({ 
        title: 'Generando archivo Excel...', 
        text: 'Traduciendo respuestas...',
        allowOutsideClick: false, 
        didOpen: () => Swal.showLoading() 
    });

    try {
        const res = await fetch(`${API_URL}/admin/detalle-graficas/${institucionActual.id_institucion}`);
        const data = await res.json();
        const respuestasUsuario = data.usuario;

        let csvContent = "\uFEFFSección,ID Pregunta,Pregunta,Respuesta\n";

        TODAS_LAS_SECCIONES.forEach(sec => {
            const nombreSeccion = sec.seccion.replace(/"/g, '""'); 

            sec.preguntas.forEach(p => {
                const preguntaTexto = p.texto ? p.texto.replace(/"/g, '""') : `Pregunta ${p.id}`;
                const respuestasP = respuestasUsuario.filter(r => r.id_pregunta == p.id);
                
                let textoRespuestaFinal = "Sin respuesta";

                if (respuestasP.length > 0) {
                    if (p.tipo === 'tabla_contactos' && respuestasP[0].respuesta_texto) {
                        try {
                            const contactos = JSON.parse(respuestasP[0].respuesta_texto);
                            if (Array.isArray(contactos)) {
                                textoRespuestaFinal = contactos.map(c => {
                                    const nombre = c.nombre || c.Nombre || '-';
                                    const cargo = c.cargo || c.Cargo || '-';
                                    const email = c.email || c.correo || c.Email || c.Correo || '';
                                    const tel = c.telefono || c.Telefono || '';
                                    return `${nombre} (${cargo}) Correo: ${email} Tel: ${tel}`;
                                }).join(" | ");
                            }
                        } catch(e) {}
                    } 
                    else {
                        const textosObtenidos = respuestasP.map(r => {
                            if (r.respuesta_texto) return r.respuesta_texto;

                            if (r.id_opcion && p.opciones) {
                                const op = p.opciones.find(o => o.id == r.id_opcion);
                                if (op) return op.texto;
                                
                                for (let opPrincipal of p.opciones) {
                                    if (opPrincipal.sub_opciones) {
                                        const sub = opPrincipal.sub_opciones.find(s => s.id == r.id_opcion);
                                        if (sub) return sub.texto;
                                    }
                                }
                            }

                            if (r.id_opcion && p.columnas) {
                                const col = p.columnas.find(c => c.id == r.id_opcion);
                                if (col) return col.texto;
                            }

                            return `Opción seleccionada (ID: ${r.id_opcion})`;
                        });

                        textoRespuestaFinal = textosObtenidos.filter(Boolean).join(" | ");
                    }
                }

                const celdaSeccion = `"${nombreSeccion}"`;
                const celdaID = `"${p.id}"`;
                const celdaPregunta = `"${preguntaTexto}"`;
                const celdaRespuesta = `"${textoRespuestaFinal.replace(/"/g, '""')}"`; 

                csvContent += `${celdaSeccion},${celdaID},${celdaPregunta},${celdaRespuesta}\n`;
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        const nombreArchivo = `Respuestas_${institucionActual.nombre_usuario.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
        link.setAttribute("download", nombreArchivo);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.close();

    } catch (error) {
        console.error("Error generando CSV:", error);
        Swal.fire('Error', 'No se pudo generar el archivo CSV', 'error');
    }
}