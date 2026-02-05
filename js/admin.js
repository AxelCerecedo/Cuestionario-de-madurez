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
    
    // 2. Cargar datos del servidor (Puede tardar)
    // Usamos Promise.all para cargar globales y lista al mismo tiempo
    // Además, agregamos un "sleep" artificial de 1.5 segundos para que la 
    // pantalla de bienvenida se luzca y no sea un parpadeo molesto si el server es muy rápido.
    
    const promesaTiempoMinimo = new Promise(resolve => setTimeout(resolve, 1500));
    
    await Promise.all([
        cargarGlobales(),
        cargarListaUsuarios(),
        promesaTiempoMinimo // Esperamos al menos 1.5 seg
    ]);
    
    // 3. Configurar UI
    configurarBuscador();
    mostrarVistaGlobal();

    // 4. OCULTAR PANTALLA DE BIENVENIDA (TRANSICIÓN)
    const splash = document.getElementById('splashScreen');
    if(splash) {
        splash.classList.add('hidden');
        
        // Opcional: Eliminar del DOM después de que termine la animación CSS (0.8s)
        setTimeout(() => {
            splash.remove();
        }, 1000);
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
    for (let i = 1; i <= 9; i++) {
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
    document.getElementById('g_promedio').innerText = Math.round(suma);
    
    const levels = globalData.niveles;
    const top = Object.keys(levels).reduce((a, b) => levels[a] > levels[b] ? a : b);
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

    // BARRAS PROMEDIO GLOBAL
    const ctxBar = document.getElementById('chartBarGlobal').getContext('2d');
    if(chartGlobalBar) chartGlobalBar.destroy();
    
    chartGlobalBar = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ["1.Iden", "2.Gest", "3.Acer", "4.Cons", "5.Info", "6.RRHH", "7.Tec", "8.Norm", "9.Serv"],
            datasets: [{
                label: 'Promedio Global',
                data: Object.values(globalData.promedios),
                backgroundColor: COLOR_BG_LIGHT,
                hoverBackgroundColor: COLOR_PRIMARY,
                borderRadius: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
}

// =========================================================
// 4. LISTA Y DASHBOARD
// =========================================================
async function cargarListaUsuarios() {
    try {
        const res = await fetch(`${API_URL}/admin/instituciones`);
        const lista = await res.json();
        console.log("4. Lista de usuarios:", lista);
        
        const ul = document.getElementById('listaUsuarios');
        ul.innerHTML = '';

        lista.forEach(inst => {
            const li = document.createElement('li');
            li.className = 'user-item';
            const iniciales = inst.nombre_usuario.substring(0,2).toUpperCase();
            li.innerHTML = `
                <div class="avatar-circle">${iniciales}</div>
                <div class="user-info">
                    <span class="user-name">${inst.nombre_usuario}</span>
                    <span class="user-score">${inst.puntaje_total} pts</span>
                </div>
            `;
            li.onclick = () => abrirDashboardInstitucion(inst, li);
            ul.appendChild(li);
        });
    } catch(e) { console.error("Error lista usuarios:", e); }
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
    document.getElementById('instTitulo').innerText = inst.nombre_usuario;
    document.getElementById('instPuntaje').innerText = inst.puntaje_total;
    
    let nivel = "Inicial";
    if(inst.puntaje_total >= 140) nivel = "Avanzado";
    else if(inst.puntaje_total >= 90) nivel = "Intermedio";
    else if(inst.puntaje_total >= 45) nivel = "Básico";
    document.getElementById('instNivel').innerText = nivel;

    const ctx = document.getElementById('chartComparativoInst').getContext('2d');
    if(chartInstComp) chartInstComp.destroy();

    chartInstComp = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["1.Iden", "2.Gest", "3.Acer", "4.Cons", "5.Info", "6.RRHH", "7.Tec", "8.Norm", "9.Serv"],
            datasets: [
                { label: 'Promedio Global', data: Object.values(globalData.promedios), backgroundColor: COLOR_BG_LIGHT, order: 2 },
                { label: 'Esta Institución', data: Object.values(datosSecciones), backgroundColor: COLOR_PRIMARY, order: 1, borderRadius: 4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
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
        // LOG EXTRA AL HACER CLICK EN TARJETA
        card.onclick = () => {
            console.log(`>>> Click en Sección ${num}: ${sec.seccion}`);
            abrirDetalleSeccion(sec, num);
        };
        grid.appendChild(card);
    });
}

// =========================================================
// 5. DETALLE SECCIÓN (AQUÍ ESTÁ EL DEBUGGING FUERTE)
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
        
        console.log("--- DATOS RECIBIDOS DEL SERVIDOR ---");
        console.log("Usuario Respuestas:", data.usuario);
        console.log("Globales:", data.globales);
        
        contenedor.innerHTML = ''; // Limpiar loading

        // === LÓGICA ESPECIAL POR SECCIÓN ===
        
        if (numSeccion === 1) {
            console.log("Renderizando Sección 1 (Ficha Técnica)");
            renderizarFichaTecnica(configSeccion, data.usuario, contenedor);
            return;
        } 
        
        if (numSeccion === 2) {
            console.log("Renderizando Sección 2 (Auditoría)");
            renderizarTablaAuditoria(configSeccion, data.usuario, contenedor);
            return;
        }

        // === CASO 3: GRÁFICAS NORMALES (Secciones 3 a 9) ===
        chartsDetalle.forEach(c => c.destroy());
        chartsDetalle = [];
        let count = 0;

        configSeccion.preguntas.forEach(p => {
            if(p.graficar) {
                crearGraficaDetalle(p, data.usuario, data.globales, contenedor, numSeccion);
                count++;
            }
            if(p.opciones) {
                p.opciones.forEach(op => {
                    if(op.graficar && op.sub_opciones) {
                        const fakeP = { id: p.id, texto: `Detalle: ${op.texto}`, opciones: op.sub_opciones };
                        crearGraficaDetalle(fakeP, data.usuario, data.globales, contenedor, numSeccion);
                        count++;
                    }
                });
            }
        });

        if(count === 0) {
            console.warn("No se encontraron preguntas configuradas con 'graficar: true' para esta sección.");
            contenedor.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">No hay datos gráficos disponibles para esta sección.</div>';
        }

    } catch (e) { 
        console.error("Error abriendo detalle sección:", e); 
        contenedor.innerHTML = '<p>Error al cargar datos.</p>'; 
    }
}

// ---------------------------------------------------------
// CORRECCIÓN: RENDERIZAR FICHA TÉCNICA (SECCIÓN 1)
// ---------------------------------------------------------
function renderizarFichaTecnica(config, respuestas, contenedor) {
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(350px, 1fr))';
    grid.style.gap = '20px';

    config.preguntas.forEach(p => {
        let contenidoHtml = '<span style="color:#ccc; font-style:italic;">Sin información registrada</span>';
        
        const respuestasP = respuestas.filter(r => r.id_pregunta == p.id);

        // --- CASO ESPECIAL: TABLA DE CONTACTOS ---
        if (p.tipo === 'tabla_contactos') {
            if (respuestasP.length > 0 && respuestasP[0].respuesta_texto) {
                try {
                    const contactos = JSON.parse(respuestasP[0].respuesta_texto);

                    if (Array.isArray(contactos) && contactos.length > 0) {
                        contenidoHtml = `
                            <table style="width:100%; font-size:0.85em; border-collapse:collapse; margin-top:5px;">
                                <thead style="background:#f1f1f1;">
                                    <tr>
                                        <th style="padding:6px; text-align:left; border-bottom:2px solid #ddd;">Nombre</th>
                                        <th style="padding:6px; text-align:left; border-bottom:2px solid #ddd;">Cargo</th>
                                        <th style="padding:6px; text-align:left; border-bottom:2px solid #ddd;">Contacto</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;
                        contactos.forEach(c => {
                            // 1. Obtenemos datos individuales con seguridad (probando mayúsculas/minúsculas)
                            const nombre = c.nombre || c.Nombre || '-';
                            const cargo = c.cargo || c.Cargo || '-';
                            
                            // 2. CORRECCIÓN AQUÍ: Obtenemos AMBOS valores por separado
                            // Probamos 'email' y 'correo' por si acaso
                            const email = c.email || c.Email || c.correo || c.Correo || '';
                            const telefono = c.telefono || c.Telefono || c.celular || '';

                            // 3. Construimos el HTML combinando ambos
                            let infoContacto = '';
                            
                            if (email) {
                                infoContacto += `<div style="margin-bottom:2px;">📧 ${email}</div>`;
                            }
                            if (telefono) {
                                infoContacto += `<div>📞 ${telefono}</div>`;
                            }
                            
                            // Si no hay nada, ponemos un guión
                            if (!infoContacto) infoContacto = '-';
                            
                            contenidoHtml += `
                                <tr style="border-bottom:1px solid #eee;">
                                    <td style="padding:6px; vertical-align:top;"><strong>${nombre}</strong></td>
                                    <td style="padding:6px; vertical-align:top;">${cargo}</td>
                                    <td style="padding:6px; vertical-align:top;">${infoContacto}</td>
                                </tr>
                            `;
                        });
                        contenidoHtml += `</tbody></table>`;
                    }
                } catch (e) {
                    console.error("Error parseando contactos:", e);
                    contenidoHtml = `<span style="color:red;">Error en formato de datos de contactos.</span>`;
                }
            } else {
                contenidoHtml = '<span style="color:#999; font-size:0.9em;">No se agregaron contactos adicionales.</span>';
            }
        } 
        // --- CASO NORMAL: TEXTO O LISTAS ---
        else if (respuestasP.length > 0) {
            const textos = respuestasP.map(r => {
                if (r.respuesta_texto && r.respuesta_texto.trim() !== "") return r.respuesta_texto;
                if (r.id_opcion && p.opciones) {
                    const op = p.opciones.find(o => o.id == r.id_opcion);
                    return op ? op.texto : null;
                }
                return null;
            }).filter(t => t !== null && t !== "");

            if (textos.length === 1) {
                contenidoHtml = `<span style="color:#333; font-weight:500;">${textos[0]}</span>`;
            } else if (textos.length > 1) {
                contenidoHtml = `<ul style="margin:0; padding-left:20px; color:#333;">`;
                textos.forEach(t => contenidoHtml += `<li style="margin-bottom:4px;">${t}</li>`);
                contenidoHtml += `</ul>`;
            }
        }

        const card = document.createElement('div');
        card.style.background = 'white';
        card.style.padding = '20px';
        card.style.borderRadius = '12px';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        card.style.borderLeft = `4px solid #7c1225`; // Usé tu color rojo institucional
        
        if (p.tipo === 'tabla_contactos') {
            card.style.gridColumn = '1 / -1'; 
        }

        card.innerHTML = `
            <div style="font-size: 0.85em; color: #666; text-transform: uppercase; margin-bottom: 10px; font-weight:700;">
                ${p.texto}
            </div>
            <div style="font-size: 1em; line-height: 1.5; word-wrap: break-word;">
                ${contenidoHtml}
            </div>
        `;
        grid.appendChild(card);
    });

    contenedor.appendChild(grid);
}

// ---------------------------------------------------------
// CORRECCIÓN: TABLA DE AUDITORÍA (SECCIÓN 2)
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
                <th style="padding: 15px 20px; text-align: left; color: #555; width: 60%;">Pregunta de Gestión</th>
                <th style="padding: 15px 20px; text-align: left; color: #555;">Estado / Respuesta</th>
            </tr>
        </thead>
        <tbody id="bodyTablaAuditoria"></tbody>
    `;

    const tbody = table.querySelector('tbody');

    config.preguntas.forEach(p => {
        // Filtrar respuestas para esta pregunta
        const respuestasP = respuestas.filter(r => r.id_pregunta == p.id);
        
        let htmlCelda = '<span style="color:#ccc;">-- Sin dato --</span>';
        let rowColor = 'transparent';

        if (respuestasP.length > 0) {
            
            // Recolectar textos
            const opcionesTexto = respuestasP.map(r => {
                // Prioridad 1: Buscar texto en Configuración (seccion2.js)
                if (r.id_opcion && p.opciones) {
                    const op = p.opciones.find(o => o.id == r.id_opcion);
                    if (op) return op.texto;
                    
                    // DEBUG VISUAL: Si hay ID en base de datos pero no en config
                    console.warn(`Pregunta ${p.id}: ID ${r.id_opcion} no encontrado en seccion2.js`);
                    return `(ID: ${r.id_opcion})`; 
                }
                // Prioridad 2: Texto abierto
                return r.respuesta_texto;
            }).filter(Boolean);

            // --- LÓGICA SEMÁFORO INTELIGENTE ---
            const primerTexto = opcionesTexto[0] ? opcionesTexto[0].toLowerCase() : '';
            
            // Solo aplicamos semáforo si detectamos palabras clave explícitas
            const esSi = primerTexto.includes('sí') || primerTexto.includes('si ') || primerTexto === 'si' || primerTexto.includes('totalmente');
            const esNo = primerTexto.includes('no') || primerTexto.includes('nunca');
            const esParcial = primerTexto.includes('parcial') || primerTexto.includes('proceso');

            // Si es una lista larga (financiamiento), NO aplicamos semáforo
            if (opcionesTexto.length > 1) {
                htmlCelda = `<ul style="margin:0; padding-left:20px; color:#333; font-size:0.9em;">`;
                opcionesTexto.forEach(t => htmlCelda += `<li style="margin-bottom:3px;">${t}</li>`);
                htmlCelda += `</ul>`;
            } 
            // Si es respuesta única
            else if (opcionesTexto.length === 1) {
                const textoMostrar = opcionesTexto[0];
                
                if (esSi) {
                    htmlCelda = `<span style="background:#d1e7dd; color:#0f5132; padding:6px 14px; border-radius:20px; font-size:0.85em; font-weight:700;">✅ CUMPLE</span>`;
                } else if (esNo) {
                    htmlCelda = `<span style="background:#f8d7da; color:#842029; padding:6px 14px; border-radius:20px; font-size:0.85em; font-weight:700;">❌ NO CUMPLE</span>`;
                    rowColor = '#fff5f5';
                } else if (esParcial) {
                    htmlCelda = `<span style="background:#fff3cd; color:#664d03; padding:6px 14px; border-radius:20px; font-size:0.85em; font-weight:700;">⚠️ PARCIAL</span>`;
                } else {
                    // Si no es ni Si ni No (ej. "ID: 5" o "Recursos Propios"), mostramos el texto tal cual
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

// ---------------------------------------------------------
// GRÁFICAS GENERALES
// ---------------------------------------------------------
function crearGraficaDetalle(pregunta, respuestasUsuario, datosGlobales, contenedor, numSeccion) {
    const card = document.createElement('div');
    card.className = 'chart-card';
    card.innerHTML = `
        <div class="chart-title-sm">${pregunta.texto}</div>
        <div style="height:300px; position: relative;">
            <canvas></canvas>
        </div>
    `;
    contenedor.appendChild(card);
    const canvas = card.querySelector('canvas');

    let labels = [];
    let ids = [];
    
    if (pregunta.opciones) {
        pregunta.opciones.forEach(o => { labels.push(o.texto); ids.push(o.id); });
    } else if (pregunta.columnas) { 
        pregunta.columnas.forEach(c => { labels.push(c.texto); ids.push(c.id); });
    }

    // DEBUG DE DATOS DE GRÁFICA
    // console.log(`[Gráfica] Prep datos para pregunta ${pregunta.id}`);
    
    const dataGlob = ids.map(id => {
        const f = datosGlobales.find(g => g.id_pregunta == pregunta.id && g.id_opcion == id);
        return f ? f.cantidad : 0;
    });

    const bgColors = ids.map(id => {
        const r = respuestasUsuario.find(u => u.id_pregunta == pregunta.id && u.id_opcion == id);
        return r ? COLOR_PRIMARY : '#d1d1d1';
    });
    
    // Configuración de Gráfica (Igual que antes)
    let chartConfig = {};

    if (numSeccion >= 7) {
        chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Instituciones',
                    data: dataGlob,
                    backgroundColor: bgColors,
                    borderRadius: 3,
                    barPercentage: 0.6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, ticks: { stepSize: 1 } },
                    y: { display: true, ticks: { autoSkip: false, font: {size: 11} } }
                }
            }
        };
    } else {
        chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: dataGlob,
                    backgroundColor: bgColors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: true, ticks: { autoSkip: false, maxRotation: 45 } },
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        };
    }

    const ch = new Chart(canvas, chartConfig);
    chartsDetalle.push(ch);
}


// =========================================================
// FUNCIÓN: CONFIGURAR BUSCADOR
// =========================================================
function configurarBuscador() {
    const input = document.getElementById('inputBusqueda');
    if (!input) return;

    input.addEventListener('input', function(e) {
        const texto = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.user-item'); // Los <li> de la lista

        items.forEach(item => {
            // Buscamos el nombre dentro del span con clase .user-name
            const nombre = item.querySelector('.user-name').innerText.toLowerCase();
            
            if (nombre.includes(texto)) {
                item.style.display = 'flex'; // Mostrar si coincide
            } else {
                item.style.display = 'none'; // Ocultar si no coincide
            }
        });
    });
}
