// ==========================
// 1. Dependencias
// ==========================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const nodemailer = require('nodemailer');

// ==========================
// 2. Configuración general
// ==========================
const app = express();
const PORT = 3005; 

app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'mi-clave-secreta-muy-segura',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));


// ==========================
// LOGS INTELIGENTES (MEJORADO)
// ==========================
app.use((req, res, next) => {
    console.log(`\n🔔 [${req.method}] ${req.url}`);
    
    // Si es POST o PUT, mostramos el Body (si tiene algo)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (Object.keys(req.body).length > 0) {
            console.log('📦 Body:', JSON.stringify(req.body, null, 2)); // JSON bonito
        } else {
            console.log('Mw Body: (Vacío)');
        }
    } 
    
    // Si es GET, mostramos los parámetros de URL (si tiene)
    if (req.method === 'GET' && Object.keys(req.query).length > 0) {
        console.log('🔍 Query Params:', req.query);
    }

    next(); 
});

// ==========================
// 3. Conexión a MySQL (MODO HÍBRIDO: NUBE + LOCAL)
// ==========================
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',       // Si no hay variable de nube, usa local
  user: process.env.DB_USER || 'encuesta-dev',    // Tu usuario local
  password: process.env.DB_PASSWORD || '3YPmrkEdB4e7lctiqXR6', // Tu pass local
  database: process.env.DB_NAME || 'Encuesta',    // Tu base local
  port: process.env.DB_PORT || 3306,              // Puerto default
  
  // Configuración vital para la nube (Aiven cierra conexiones inactivas)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
      rejectUnauthorized: false // Obligatorio para Aiven
  }
});
const db = pool.promise();

// Probar conexión
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ [DB ERROR] Error al conectar con la base de datos:', err);
    process.exit(1);
  }
  console.log('✅ [DB] Conexión exitosa a MySQL');
  conn.release();
});

// ==========================
// 4. RUTAS
// ==========================

// 1. LISTA DE ADMINS (Pon aquí los correos autorizados)
const ADMIN_EMAILS = ['jcf_fcg@cultura.gob.mx', 'alberto.colef@gmail.com', 'lunam.liliana.dgtic@gmail.com'];

// =========================================================
// 🗺️ MAPA DE SECCIONES (Para reportes en consola)
// =========================================================
function identificarSeccion(idPregunta) {
    const id = parseInt(idPregunta);
    
    if (id >= 1 && id <= 13) return 1;  // Identificación
    if (id >= 14 && id <= 19) return 2; // Gestión Institucional
    if (id >= 20 && id <= 28) return 3; // Caracterización
    if (id >= 29 && id <= 37) return 4; // Conservación (Asumiendo rangos de tu log)
    if (id >= 38 && id <= 40) return 5; // Gestión de Información (La matriz)
    if (id >= 41 && id <= 47) return 6; // Sección 6 (Recursos Humanos) 
    if (id >= 48 && id <= 48) return 7; // Sección 7 
    if (id >= 49 && id <= 49) return 8; // Sección 8 (Processos)
    if (id >= 50 && id <= 50) return 9; // Sección 9 (Servicios)
    
    return 'Otra'; 
}

// =========================================================
// 📜 CONFIGURACIÓN DE REGLAS DE PUNTAJE (SERVER-SIDE)
// =========================================================
const REGLAS_PUNTAJE = {

    // --- SECCIÓN 2 ---
    16: { tipo: 'simple', valor: 1 }, 
    17: { tipo: 'booleano', valor: 1 },
    18: { tipo: 'booleano', valor: 1 },
    19: { tipo: 'unica_vez', valor: 1 }, 

    // --- SECCIÓN 3 ---
    24: { tipo: 'booleano', valor: 1 }, 
    25: { tipo: 'escala_directa' }, 
    26: { tipo: 'escala_directa' }, 
    27: { tipo: 'acumulativo_max5' },
    28: { tipo: 'conteo_mas_uno' }, 

    // --- SECCIÓN 4 --- 
    29: { tipo: 'escala_directa' }, 
    30: { tipo: 'escala_directa' }, 
    32: { tipo: 'escala_directa' },
    34: { tipo: 'escala_directa' },
    37: { tipo: 'escala_directa' },

    // --- SECCIÓN 5 --- 
    38: { tipo: 'puntos_por_opcion' },
    40: { tipo: 'escala_directa' },
    
    // --- SECCIÓN 7 (NUEVO) ---
    48: { tipo: 'puntos_por_opcion' },

    // --- SECCIÓN 8 (PROCESOS) ---
    49: { tipo: 'puntos_por_opcion' },

    //Sección 9 (Servicios)
    50: { tipo: 'puntos_por_opcion' }
   
};

const VALOR_OPCIONES = {

    // =================================
    // --- SECCIÓN 5 (PREGUNTA 38) ---
    // =================================
    381: 1, 
    382: 2,
    383: 3,
    384: 4,
    385: 5,
    386: 6,
    3899: 0,

    // ==========================================
    // --- SECCIÓN 7: INFRAESTRUCTURA (ID 48) ---
    // ==========================================
    
    // 🟢 PADRES (Suman 1 punto cada uno -> Máximo 5 posibles)
    481: 1, // Equipo cómputo
    482: 1, // Internet
    483: 1, // Servidor
    484: 1, // Digitalización
    485: 1, // Software Especializado (El check padre)

    // ⚪ HIJOS (Valen 0 puntos, no suman extra)
    4810: 0, 4811: 0, 4812: 0, 4813: 0, 4814: 0,
    4815: 0, 4816: 0, 4817: 0, 4818: 0, 4819: 0,
    4820: 0, 4821: 0, 4822: 0,
 
    // ==========================================
    // --- SECCIÓN 8: PROCESOS (ID 49) ---
    // ==========================================
    
    // 🟢 PADRES (Valen 1 punto cada uno)
    491: 1, // Proc. Ingreso
    492: 1, // Proc. Salida
    493: 1, // Plan Emergencia
    494: 1, // Docs Préstamo (Check Padre)
    495: 1, // Auditorías (Check Padre)
    496: 1, // Evaluación (Check Padre)
    497: 1, // Registro Daños (Check Padre)

    // ⚪ HIJOS (Valen 0 puntos - meramente informativos)
    // Hijos de Docs (494)
    4941: 0, 4942: 0, 4943: 0, 4944: 0, 4945: 0,
    
    // Hijos de Auditorías (495)
    4951: 0, 4952: 0, 4953: 0, 4954: 0, 4955: 0,

    // Hijos de Evaluación (496)
    4961: 0, 4962: 0, 4963: 0, 4964: 0,

    // Hijos de Registro (497)
    4971: 0, 4972: 0, 4973: 0, 4974: 0, 4975: 0,

    // --- SECCIÓN 9: SERVICIOS (PREGUNTA 50) ---
    // 🟢 PADRES (Valen 1 punto cada uno -> Máximo 4 puntos totales)
    91: 1, // Servicios Básicos
    92: 1, // Requisitos
    93: 1, // Educativos
    94: 1, // Difusión

    // ⚪ HIJOS (Valen 0 puntos, son solo descriptivos)
    // Servicios
    101: 0, 102: 0, 103: 0, 104: 0, 105: 0, 106: 0, 107: 0,
    // Requisitos
    110: 0, 111: 0, 112: 0, 113: 0, 114: 0, 115: 0, 116: 0, 117: 0,
    // Educativos
    120: 0, 121: 0, 122: 0, 123: 0, 124: 0, 125: 0,
    // Difusión
    130: 0, 131: 0, 132: 0, 133: 0, 134: 0, 135: 0, 136: 0
};


// =========================================================
// FUNCIÓN: CALCULAR PUNTOS (LÓGICA CENTRAL)
// =========================================================
function calcularPuntosPregunta(idPregunta, idOpcion, valorTexto) {
    const regla = REGLAS_PUNTAJE[idPregunta];
    
    // Si no hay regla configurada para esta pregunta, vale 0
    if (!regla) return 0;

    // ---------------------------------------------------------
    // 1. REGLA: PUNTOS POR OPCIÓN ESPECÍFICA (NUEVO - SECCIÓN 8)
    // ---------------------------------------------------------

    if (regla.tipo === 'puntos_por_opcion') {
        if (typeof VALOR_OPCIONES !== 'undefined') {
            const puntos = VALOR_OPCIONES[idOpcion];
            // Verificamos !== undefined porque el puntaje puede ser 0
            return (puntos !== undefined) ? puntos : 0;
        }
        return 0;
    }

    // ---------------------------------------------------------
    // 2. REGLA: BOOLEANO (Sí=1, No=0)
    // ---------------------------------------------------------
    if (regla.tipo === 'booleano') {
        // Acepta tanto ID como texto "1"
        return (idOpcion == '1' || valorTexto == '1') ? 1 : 0;
    }

    // ---------------------------------------------------------
    // 3. REGLA: SIMPLE (Cualquier selección válida suma X)
    // ---------------------------------------------------------
    if (regla.tipo === 'simple') {
        // A. Excepción: Si es "Ninguno" (ID 99), vale 0
        if (idOpcion == '99') return 0;

        // B. Caso Opción: Si hay un ID seleccionado válido
        if (idOpcion) return regla.valor;

        // C. Caso Texto: Si no hay ID, pero hay texto escrito (ej. Preguntas abiertas)
        if (valorTexto && valorTexto.trim() !== '') {
            return regla.valor;
        }

        return 0;
    }

    // ---------------------------------------------------------
    // 4. REGLA: ESCALA DIRECTA (El ID es el puntaje)
    // ---------------------------------------------------------
    // Ejemplo: ID 1 = 1 pto ... ID 5 = 5 ptos
    if (regla.tipo === 'escala_directa') {
        return parseInt(idOpcion) || 0;
    }

    // ---------------------------------------------------------
    // 5. REGLA: ACUMULATIVO MAX 5
    // ---------------------------------------------------------

    if (regla.tipo === 'acumulativo_max5') {
        // Si es "Ninguno", 0
        if (idOpcion == '99') return 0;
        
        // Si tienes un caso especial donde una sola opción vale los 5 puntos (ej "Todos")
        if (idOpcion == '6') return 5; 
        
        // Lo normal: cada check vale 1 punto
        return 1; 
    }

    // ---------------------------------------------------------
    // 6. REGLA: UNICA VEZ
    // ---------------------------------------------------------
    // Para preguntas múltiples donde solo cuenta la primera selección
    // (Aunque marque 3 cosas, solo damos puntos una vez).
    if (regla.tipo === 'unica_vez') {
        if (idOpcion == '99') return 0;
        return regla.valor;
    }

    // ---------------------------------------------------------
    // 7. REGLA: CONTEO + 1 (Para Pregunta 28)
    // ---------------------------------------------------------
    if (regla.tipo === 'conteo_mas_uno') {
        // Truco visual:
        // Decimos que cada opción vale 1 punto.
        // La suma visual será "4" si marcan 4, o "1" si marcan ninguna.
        // El servidor corregirá la suma final agregando el +1 restante.
        
        if (idOpcion == '99') return 1; // Visualmente "Ninguna" vale 1
        return 1; // Cada check vale 1 visualmente
    }

    return 0;
}

// =========================================================
// FUNCIÓN ESPECIAL SECCIÓN 9: PUNTOS POR CATEGORÍAS ACTIVAS
// =========================================================
function calcularPuntosSeccion9(respuestasMultiples) {
    const respuestasSeccion9 = respuestasMultiples.filter(r => r.id_pregunta == 60);
    const categoriasEncontradas = new Set();

    respuestasSeccion9.forEach(r => {
        const id = parseInt(r.id_opcion);
        
        // Ignorar "Ninguno"
        if (id === 107 || id === 116 || id === 125 || id === 135) return;

        // Categoría 1: ID Padre 91 O Hijos 100-109
        if (id === 91 || (id >= 100 && id <= 109)) categoriasEncontradas.add(1);

        // Categoría 2: ID Padre 92 O Hijos 110-119
        if (id === 92 || (id >= 110 && id <= 119)) categoriasEncontradas.add(2);

        // Categoría 3: ID Padre 93 O Hijos 120-129
        if (id === 93 || (id >= 120 && id <= 129)) categoriasEncontradas.add(3);

        // Categoría 4: ID Padre 94 O Hijos 130-139
        if (id === 94 || (id >= 130 && id <= 139)) categoriasEncontradas.add(4);
    });

    return categoriasEncontradas.size; // Retorna 0, 1, 2, 3 o 4
}


// =================================================================
// RUTA A: GUARDAR ENCUESTA (CON LOGICA ESPECIAL PREGUNTA 28)
// =================================================================
app.post('/guardar-encuesta', async (req, res) => {
    try {
        const { id_usuario, respuestas_simples, respuestas_multiples, contactos } = req.body;

        if (!id_usuario) return res.status(400).json({ error: "No se identificó al usuario." });

        // =============================================================
        // PASO PREVIO: OBTENER EL NOMBRE REAL
        // =============================================================
        let nombreReal = "Usuario"; 
        const [users] = await db.query('SELECT nombre_completo FROM usuarios_registrados WHERE id = ?', [id_usuario]);
        if (users.length > 0 && users[0].nombre_completo) {
            nombreReal = users[0].nombre_completo;
        }

        // =============================================================
        // 1. BUSCAR O CREAR INSTITUCIÓN
        // =============================================================
        let idInstitucion;
        const [rows] = await db.query('SELECT id_institucion FROM instituciones WHERE id_usuario = ?', [id_usuario]);
        
        if (rows.length > 0) {
            idInstitucion = rows[0].id_institucion;
            await db.query('UPDATE instituciones SET nombre_usuario = ? WHERE id_institucion = ?', [nombreReal, idInstitucion]);
        } else {
            const [result] = await db.query('INSERT INTO instituciones (id_usuario, nombre_usuario) VALUES (?, ?)', [id_usuario, nombreReal]);
            idInstitucion = result.insertId;
        }

        // =============================================================
        // HELPER LOCAL
        // =============================================================
        const preguntasYaPuntuadas = new Set();
        const obtenerPuntos = (idPregunta, idOpcion, valorTexto) => {
            const regla = REGLAS_PUNTAJE[idPregunta];
            // Regla: ÚNICA VEZ 
            if (regla && regla.tipo === 'unica_vez') {
                if (idOpcion == '99') return 0; 
                if (preguntasYaPuntuadas.has(String(idPregunta))) return 0; 
                preguntasYaPuntuadas.add(String(idPregunta)); 
                return regla.valor; 
            }
            return calcularPuntosPregunta(idPregunta, idOpcion, valorTexto);
        };

        // =============================================================
        // 2. ACTUALIZACIÓN DE DATOS (GUARDAR EN BD)
        // =============================================================
        
        // --- A. RESPUESTAS SIMPLES ---
        if (respuestas_simples && respuestas_simples.length > 0) {
            const ids = respuestas_simples.map(r => r.id_pregunta);
            if(ids.length > 0) await db.query(`DELETE FROM respuestas WHERE id_institucion=? AND id_pregunta IN (?)`, [idInstitucion, ids]);
            
            const values = respuestas_simples.map(r => {
                let puntosCalculados = 0;
                if (r.valor_texto === '' && !r.id_opcion) {
                    puntosCalculados = 0; 
                } else {
                    puntosCalculados = obtenerPuntos(r.id_pregunta, r.id_opcion, r.valor_texto);
                }
                return [idInstitucion, r.id_pregunta, r.valor_texto, r.id_opcion, puntosCalculados];
            });

            await db.query('INSERT INTO respuestas (id_institucion, id_pregunta, respuesta_texto, id_opcion_seleccionada, puntos_otorgados) VALUES ?', [values]);
        }

        // --- B. RESPUESTAS MÚLTIPLES (AQUÍ ESTÁ EL CAMBIO CLAVE ⭐) ---
        const { ids_multiples_activas } = req.body; 

        // 1. Limpieza preventiva
        if (ids_multiples_activas && ids_multiples_activas.length > 0) {
            await db.query(`DELETE FROM respuestas_multiples WHERE id_institucion=? AND id_pregunta IN (?)`, [idInstitucion, ids_multiples_activas]);
        }

        // 2. Insertar lo nuevo con lógica especial para Q28
        if (respuestas_multiples && respuestas_multiples.length > 0) {
            
            // --- 🟢 LÓGICA ESPECIAL PREGUNTA 28: CONTEO + 1 ---
            let puntosTotal28 = 0;
            let flagPuntos28Asignados = false; // Para dar los puntos solo al primer registro

            // Filtramos las respuestas de la 28 para calcular su total antes de guardar
            const respuestas28 = respuestas_multiples.filter(r => r.id_pregunta == 28);
            if (respuestas28.length > 0) {
                // Contamos las que NO son "Ninguna" (ID 99)
                const validas = respuestas28.filter(r => r.id_opcion != 99);
                // Fórmula: Cantidad + 1
                puntosTotal28 = validas.length + 1;
                // Tope máximo (por si acaso)
                if (puntosTotal28 > 5) puntosTotal28 = 5;
            }
            // --------------------------------------------------

            const valuesMulti = respuestas_multiples.map(r => {
                let puntosCalculados = 0;

                // CASO ESPECIAL: Es la Pregunta 28
                if (r.id_pregunta == 28) {
                    if (!flagPuntos28Asignados) {
                        // Al PRIMER registro le asignamos TODO el puntaje acumulado
                        puntosCalculados = puntosTotal28;
                        flagPuntos28Asignados = true;
                    } else {
                        // A los siguientes registros les ponemos 0 (para no duplicar suma)
                        puntosCalculados = 0;
                    }
                } 
                // CASO NORMAL: Cualquier otra pregunta
                else {
                    puntosCalculados = obtenerPuntos(r.id_pregunta, r.id_opcion, null);
                }

                return [idInstitucion, r.id_pregunta, r.id_opcion, puntosCalculados];
            });

            await db.query('INSERT INTO respuestas_multiples (id_institucion, id_pregunta, id_opcion, puntos_otorgados) VALUES ?', [valuesMulti]);
        }

        // --- C. MATRIZ DINÁMICA ---
        const { respuestas_matriz, ids_matrices_activas } = req.body; 
        
        if (ids_matrices_activas && ids_matrices_activas.length > 0) {
            await db.query('DELETE FROM respuestas_matriz WHERE id_institucion = ? AND id_pregunta_matriz IN (?)', [idInstitucion, ids_matrices_activas]);
        }

        if (respuestas_matriz && respuestas_matriz.length > 0) {
            const valuesMatriz = respuestas_matriz.map(r => [idInstitucion, r.id_pregunta, r.id_fila, r.id_columna, r.valor]);
            await db.query('INSERT INTO respuestas_matriz (id_institucion, id_pregunta_matriz, id_fila, id_columna, valor) VALUES ?', [valuesMatriz]);
        }

        // --- D. CONTACTOS ---
        if (contactos && contactos.length > 0) {
            
            // 🛑 CORRECCIÓN AQUÍ: Usamos el nombre real de tu tabla
            const NOMBRE_TABLA = 'contactos_institucion'; 

            console.log(`📞 Guardando ${contactos.length} contactos en la tabla: ${NOMBRE_TABLA}`);

            // 1. Borramos los anteriores
            await db.query(`DELETE FROM ${NOMBRE_TABLA} WHERE id_institucion = ?`, [idInstitucion]);
            
            // 2. Preparamos los datos
            const valuesContactos = contactos.map(c => [
                idInstitucion, 
                c.nombre || '', 
                c.cargo || '', 
                c.correo || '', 
                c.telefono_inst || c.telefono || '', // Teléfono 1
                c.telefono_otro || ''                // Teléfono 2 (Nuevo)
            ]);

            // 3. Insertamos
            // Asegúrate de que las columnas coincidan con la tabla 'contactos_institucion'
            await db.query(
                `INSERT INTO ${NOMBRE_TABLA} (id_institucion, nombre, cargo, correo, telefono, telefono_otro) VALUES ?`, 
                [valuesContactos]
            );
        }

        // =============================================================
        // 3. CÁLCULO DE PUNTAJE TOTAL (LECTURA SIMPLE)
        // =============================================================
        // Como ya guardamos los puntos correctos en la BD, la suma SQL funcionará perfecta.
        
        console.log("---------------------------------------------------");
        console.log(`📊 REPORTE DE PUNTAJE - INSTITUCIÓN ${idInstitucion}`);

        const sqlDetalle = `
            SELECT id_pregunta, SUM(puntos_otorgados) as puntos 
            FROM (
                SELECT id_pregunta, puntos_otorgados FROM respuestas WHERE id_institucion = ? 
                UNION ALL
                SELECT id_pregunta, puntos_otorgados FROM respuestas_multiples WHERE id_institucion = ? 
                UNION ALL
                SELECT id_pregunta_matriz as id_pregunta, valor as puntos FROM respuestas_matriz WHERE id_institucion = ?
            ) as t
            GROUP BY id_pregunta
        `;

        const [filasPuntos] = await db.query(sqlDetalle, [idInstitucion, idInstitucion, idInstitucion]);

        const reporteSecciones = {};
        let granTotal = 0;

        filasPuntos.forEach(fila => {
            const numSeccion = identificarSeccion(fila.id_pregunta);
            const pts = parseInt(fila.puntos) || 0;
            
            if (!reporteSecciones[numSeccion]) reporteSecciones[numSeccion] = 0;
            reporteSecciones[numSeccion] += pts;
            granTotal += pts;
        });

        // B. BONO SECCIÓN 2
        const sqlBono = `SELECT COUNT(*) as c FROM respuestas WHERE id_institucion=? AND id_pregunta IN (14,15) AND respuesta_texto IS NOT NULL AND respuesta_texto != ''`;
        const [rowsBono] = await db.query(sqlBono, [idInstitucion]);
        
        if(rowsBono[0].c === 2) {
            if (!reporteSecciones[2]) reporteSecciones[2] = 0;
            reporteSecciones[2] += 1;
            granTotal += 1;
            console.log(`   ✨ Bono aplicado en Sección 2 (+1)`);
        }

        // C. IMPRIMIR REPORTE
        Object.keys(reporteSecciones).sort().forEach(sec => {
            console.log(`   📂 Sección ${sec}: ${reporteSecciones[sec]} puntos`);
        });

        // D. ACTUALIZAR PUNTAJE TOTAL
        await db.query('UPDATE instituciones SET puntaje_total = ? WHERE id_institucion = ?', [granTotal, idInstitucion]);
        
        console.log(`⭐ [TOTAL FINAL]: ${granTotal} puntos.`);
        console.log("---------------------------------------------------");

        res.status(200).json({ message: 'Guardado exitoso', id: idInstitucion, puntajeTotal: granTotal });

    } catch (error) {
        console.error("❌ ERROR:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// RUTA B: REGISTRO DE USUARIO (CON GEOLOCALIZACIÓN 🌍)
app.post('/auth/registro', async (req, res) => {
    // 1. Recibimos los nuevos campos del frontend (ubicacion, latitud, longitud)
    const { institucion, nombre, email, password, ubicacion, latitud, longitud } = req.body;
    
    console.log(`👤 [REGISTRO] Intentando registrar a: ${email}`);
    if(ubicacion) console.log(`   📍 Ubicación detectada: ${ubicacion} (${latitud}, ${longitud})`);

    try {
        // 2. Verificar si el correo ya existe
        console.log('   🔍 Verificando existencia del correo...');
        const [existe] = await db.query('SELECT id FROM usuarios_registrados WHERE email = ?', [email]);
        
        if (existe.length > 0) {
            console.log('   ⚠️ [REGISTRO] El correo ya existe en BD.');
            return res.status(400).json({ error: 'Este correo ya está registrado.' });
        }

        // 3. Insertar usuario (ACTUALIZADO CON COORDENADAS)
        console.log('   💾 Insertando nuevo usuario en BD...');
        
        const sql = `
            INSERT INTO usuarios_registrados 
            (institucion_procedencia, nombre_completo, email, password, ubicacion_texto, latitud, longitud) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        // Pasamos los valores en el orden exacto de la consulta
        await db.query(sql, [institucion, nombre, email, password, ubicacion, latitud, longitud]);

        console.log('   ✅ [REGISTRO] ¡Éxito! Usuario registrado con ubicación.');
        res.json({ message: 'Usuario registrado exitosamente' });

    } catch (error) {
        console.error("❌ [ERROR REGISTRO]:", error);
        res.status(500).json({ error: 'Error en el servidor al registrar.' });
    }
});

// RUTA C: LOGIN (CORREGIDA)
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`🔑 [LOGIN] Intento de acceso: ${email}`);

    try {
        // 🛑 CAMBIO IMPORTANTE EN LA CONSULTA SQL:
        // Unimos usuarios con instituciones para obtener el campo 'finalizado'
        const sql = `
            SELECT U.id, U.nombre_completo, U.email, U.password, I.finalizado 
            FROM usuarios_registrados U 
            LEFT JOIN instituciones I ON U.id = I.id_usuario 
            WHERE U.email = ? AND U.password = ?
        `;
        
        const [users] = await db.query(sql, [email, password]);

        if (users.length > 0) {
            const usuario = users[0];
            console.log(`   ✅ [LOGIN] Bienvenido ${usuario.nombre_completo} (Finalizado: ${usuario.finalizado})`);
            
            const esAdmin = ADMIN_EMAILS.includes(email);
            const rutaDestino = esAdmin ? 'admin.html' : 'seccion1.html'; 

            res.json({ 
                message: 'Bienvenido', 
                redirect: rutaDestino,
                nombre: usuario.nombre_completo,
                userId: usuario.id,
                esAdmin: esAdmin,
                
                // 🛑 IMPORTANTE: Enviamos el estado al frontend
                // Si es null (primera vez que entra), lo ponemos en 0
                finalizado: usuario.finalizado || 0 
            });

        } else {
            console.log('   ⛔ [LOGIN] Credenciales incorrectas.');
            res.status(401).json({ error: 'Credenciales incorrectas' });
        }

    } catch (error) {
        console.error("❌ [ERROR LOGIN]:", error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ---------------------------------------------------------
// NUEVAS RUTAS PARA EL ADMIN DASHBOARD
// ---------------------------------------------------------

// A. OBTENER LISTA DE INSTITUCIONES QUE HAN RESPONDIDO
app.get('/admin/instituciones', async (req, res) => {
    try {
        // CORRECCIÓN: Quitamos el "WHERE" para que traiga también a los de 0 puntos.
        // Y ordenamos por fecha para que los nuevos salgan arriba.
        const sql = `
            SELECT id_institucion, nombre_usuario, puntaje_total, fecha_registro 
            FROM instituciones 
            ORDER BY fecha_registro DESC
        `;
        
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener instituciones" });
    }
});

// B. OBTENER DATOS DE UNA INSTITUCIÓN PARA GRAFICAR
// (Reutilizamos la lógica del resumen, pero accesible por ID de institución)
app.get('/admin/datos-grafica/:idInstitucion', async (req, res) => {
    try {
        const { idInstitucion } = req.params;
        
        // Esta query suma los puntos agrupados por sección (ID Pregunta -> Sección)
        // (Es la misma lógica que usamos en el Resumen)
        const sqlDetalle = `
            SELECT id_pregunta, SUM(puntos_otorgados) as puntos 
            FROM (
                SELECT id_pregunta, puntos_otorgados FROM respuestas WHERE id_institucion = ? 
                UNION ALL
                SELECT id_pregunta, puntos_otorgados FROM respuestas_multiples WHERE id_institucion = ? 
                UNION ALL
                SELECT id_pregunta_matriz as id_pregunta, valor as puntos FROM respuestas_matriz WHERE id_institucion = ?
            ) as t
            GROUP BY id_pregunta
        `;

        const [filasPuntos] = await db.query(sqlDetalle, [idInstitucion, idInstitucion, idInstitucion]);

        const datosSecciones = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
        
        filasPuntos.forEach(fila => {
            const numSeccion = identificarSeccion(fila.id_pregunta); // Tu función auxiliar
            const pts = parseInt(fila.puntos) || 0;
            if (datosSecciones[numSeccion] !== undefined) datosSecciones[numSeccion] += pts;
        });

        // Bonos y ajustes (igual que en resumen)
        const sqlBono = `SELECT COUNT(*) as c FROM respuestas WHERE id_institucion=? AND id_pregunta IN (14,15) AND respuesta_texto IS NOT NULL AND respuesta_texto != ''`;
        const [rowsBono] = await db.query(sqlBono, [idInstitucion]);
        if(rowsBono[0].c === 2) datosSecciones[2] += 1;

        res.json(datosSecciones);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener datos" });
    }
});

// =========================================================
// 📊 ENDPOINT: ESTADÍSTICAS GLOBALES PARA EL DASHBOARD
// =========================================================
app.get('/admin/globales', async (req, res) => {
    try {
        // 1. Obtener todas las instituciones con puntaje > 0
        const [inst] = await db.query('SELECT puntaje_total FROM instituciones WHERE puntaje_total > 0');
        const totalInstituciones = inst.length;

        if (totalInstituciones === 0) return res.json({ vacio: true });

        // 2. Calcular Distribución de Niveles (AJUSTADO A MAX ~200)
        const niveles = { "Inicial": 0, "Básico": 0, "Intermedio": 0, "Avanzado": 0 };
        
        inst.forEach(i => {
            const pts = i.puntaje_total;

            // CRITERIO AJUSTADO:
            // Avanzado: > 75% del total real (aprox 140 pts)
            // Intermedio: > 48% del total (aprox 90 pts)
            // Básico: > 24% del total (aprox 45 pts)
            
            if (pts >= 140) niveles["Avanzado"]++;
            else if (pts >= 90) niveles["Intermedio"]++;
            else if (pts >= 45) niveles["Básico"]++;
            else niveles["Inicial"]++;
        });

        // 3. Calcular Promedio por Sección (Para las barras grises de fondo)
        // Traemos TODAS las respuestas de TODAS las instituciones
        const sqlTodas = `
            SELECT id_pregunta, SUM(puntos_otorgados) as suma_puntos 
            FROM (
                SELECT id_pregunta, puntos_otorgados FROM respuestas 
                UNION ALL
                SELECT id_pregunta, puntos_otorgados FROM respuestas_multiples 
                UNION ALL
                SELECT id_pregunta_matriz as id_pregunta, valor as puntos FROM respuestas_matriz
            ) as t
            GROUP BY id_pregunta
        `;
        
        const [filas] = await db.query(sqlTodas);

        // Agrupar por Sección (1 a 9)
        const sumaSecciones = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
        
        filas.forEach(fila => {
            const numSeccion = identificarSeccion(fila.id_pregunta); // Tu función auxiliar existente
            const pts = parseFloat(fila.suma_puntos) || 0;
            if (sumaSecciones[numSeccion] !== undefined) {
                sumaSecciones[numSeccion] += pts;
            }
        });

        // Calcular promedios (Suma Total / Num Instituciones)
        const promedios = {};
        Object.keys(sumaSecciones).forEach(k => {
            promedios[k] = (sumaSecciones[k] / totalInstituciones).toFixed(1); 
        });

        res.json({
            totalInstituciones,
            niveles,
            promedios
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error calculando globales" });
    }
});


// ==================================================
// RUTA: OBTENER PREGUNTAS (Corregida con Orden y Opciones)
// ==================================================
app.get('/preguntas/:seccion', async (req, res) => {
    const seccion = req.params.seccion;

    try {
        const query = `
            SELECT 
                p.id_pregunta, p.orden, p.texto_pregunta, p.texto_ayuda, p.tipo_campo, p.es_obligatorio,
                o.id_opcion, o.texto_opcion
            FROM preguntas p
            LEFT JOIN opciones_catalogo o ON p.id_pregunta = o.id_pregunta
            WHERE p.seccion = ?
            ORDER BY p.orden, o.id_opcion;
        `;

        const [rows] = await db.query(query, [seccion]);

        // Mapa para agrupar preguntas duplicadas (por el JOIN)
        const preguntasMap = new Map();

        rows.forEach(row => {
            // 1. Si la pregunta no existe en el mapa, la creamos
            if (!preguntasMap.has(row.id_pregunta)) {
                preguntasMap.set(row.id_pregunta, {
                    id: row.id_pregunta,
                    orden: row.orden,         // <--- AQUÍ ESTÁ EL ORDEN
                    texto: row.texto_pregunta,
                    ayuda: row.texto_ayuda,
                    tipo: row.tipo_campo,
                    obligatorio: row.es_obligatorio,
                    opciones: []              // <--- INICIAMOS EL ARRAY VACÍO
                });
            }
            
            // 2. IMPORTANTE: Si la fila tiene datos de opción, la agregamos al array
            // Esto se ejecuta para CADA fila, no solo la primera vez
            if (row.id_opcion) {
                preguntasMap.get(row.id_pregunta).opciones.push({
                    id: row.id_opcion,
                    texto: row.texto_opcion
                });
            }
        });

        const preguntasArray = Array.from(preguntasMap.values());
        res.json(preguntasArray);

    } catch (error) {
        console.error("Error al obtener preguntas:", error);
        res.status(500).json({ error: "Error al cargar el cuestionario" });
    }
});

// =========================================================
// RUTA: RECUPERAR DATOS DEL USUARIO (GET)
// =========================================================
app.get('/respuestas-usuario/:id_usuario', async (req, res) => {
    try {
        const { id_usuario } = req.params;

        // 1. Obtener ID Institución
        const [inst] = await db.query('SELECT id_institucion FROM instituciones WHERE id_usuario = ?', [id_usuario]);
        
        if (inst.length === 0) {
            return res.json({ vacio: true });
        }
        
        const idInstitucion = inst[0].id_institucion;

        // 2. Traer respuestas simples
        const [simples] = await db.query('SELECT * FROM respuestas WHERE id_institucion = ?', [idInstitucion]);

        // 3. Traer respuestas múltiples
        const [multiples] = await db.query('SELECT * FROM respuestas_multiples WHERE id_institucion = ?', [idInstitucion]);

        // 4. Traer respuestas de la matriz (NUEVO)
        const [matriz] = await db.query('SELECT * FROM respuestas_matriz WHERE id_institucion = ?', [idInstitucion]);

        // 5. Traer contactos
        const [contactos] = await db.query('SELECT * FROM contactos_institucion WHERE id_institucion = ?', [idInstitucion]);

        res.json({
            vacio: false,
            simples,
            multiples,
            matriz,    // <--- Enviamos la matriz
            contactos
        });

    } catch (error) {
        console.error("Error al recuperar datos:", error);
        res.status(500).json({ error: "Error al cargar datos" });
    }
});

// =========================================================
// 👤 ENDPOINT: OBTENER DATOS BÁSICOS DEL USUARIO
// =========================================================
app.get('/api/usuario-basico/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT nombre_completo, email FROM usuarios_registrados WHERE id = ?', [id]);
        
        if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// =========================================================
// 📊 ENDPOINT: OBTENER RESUMEN FINAL
// =========================================================
app.get('/resumen/:idUsuario', async (req, res) => {
    try {
        const { idUsuario } = req.params;

        // 1. Obtener datos generales
        const [rows] = await db.query('SELECT id_institucion, nombre_usuario, puntaje_total FROM instituciones WHERE id_usuario = ?', [idUsuario]);
        
        if (rows.length === 0) return res.status(404).json({ error: "Institución no encontrada" });
        
        const idInstitucion = rows[0].id_institucion;
        let puntajeTotal = rows[0].puntaje_total || 0; 

        // 2. Obtener desglose detallado por secciones
        const sqlDetalle = `
            SELECT id_pregunta, SUM(puntos_otorgados) as puntos 
            FROM (
                SELECT id_pregunta, puntos_otorgados FROM respuestas WHERE id_institucion = ? 
                UNION ALL
                SELECT id_pregunta, puntos_otorgados FROM respuestas_multiples WHERE id_institucion = ? 
                UNION ALL
                SELECT id_pregunta_matriz as id_pregunta, valor as puntos FROM respuestas_matriz WHERE id_institucion = ?
            ) as t
            GROUP BY id_pregunta
        `;

        const [filasPuntos] = await db.query(sqlDetalle, [idInstitucion, idInstitucion, idInstitucion]);

        const reporteSecciones = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
        
        filasPuntos.forEach(fila => {
            const numSeccion = identificarSeccion(fila.id_pregunta);
            const pts = parseInt(fila.puntos) || 0; // Usamos parseInt porque tus reglas devuelve enteros
            if (reporteSecciones[numSeccion] !== undefined) {
                reporteSecciones[numSeccion] += pts;
            }
        });

        // 3. Verificar Bono Sección 2 (Solo visual para la gráfica)
        const sqlBono = `SELECT COUNT(*) as c FROM respuestas WHERE id_institucion=? AND id_pregunta IN (14,15) AND respuesta_texto IS NOT NULL AND respuesta_texto != ''`;
        const [rowsBono] = await db.query(sqlBono, [idInstitucion]);
        if(rowsBono[0].c === 2) {
            reporteSecciones[2] += 1;
        }

        // =========================================================
        // 4. LÓGICA DE NIVELES (SINCRONIZADA CON EL ADMIN)
        // =========================================================

        // Establecemos el tope teórico en 187 
        const MAX_PUNTAJE = 200; 
        
        // Calculamos porcentaje solo para mostrar la barrita de progreso visual
        const porcentaje = MAX_PUNTAJE > 0 ? Math.round((puntajeTotal / MAX_PUNTAJE) * 100) : 0;

        let nivel = "Inicial";
        let mensaje = "El nivel de madurez es muy bajo. Se requiere iniciar procesos básicos.";
        let color = "#dc3545"; // Rojo (Danger)

        // USAMOS PUNTOS DIRECTOS (IGUAL QUE EN /admin/globales)
        // Avanzado: > 140 pts
        // Intermedio: > 90 pts
        // Básico: > 45 pts

        if (puntajeTotal >= 140) { 
            nivel = "Avanzado"; 
            mensaje = "¡Excelente! Nivel óptimo de cumplimiento, conservación y gestión digital."; 
            color = "#28a745"; // Verde (Success)
        } 
        else if (puntajeTotal >= 90) { 
            nivel = "Intermedio"; 
            mensaje = "Buen nivel de gestión y control. Enfoque sus esfuerzos en la mejora continua."; 
            color = "#17a2b8"; // Azul Cian (Info)
        } 
        else if (puntajeTotal >= 45) { 
            nivel = "Básico"; 
            mensaje = "Existen procesos incipientes. Se requiere formalización y estandarización."; 
            color = "#ffc107"; // Amarillo (Warning)
        } 
        // Si es menor a 45, se queda en "Inicial" (Rojo)

        // Enviar respuesta
        res.json({
            institucion: rows[0].nombre_usuario,
            total: puntajeTotal,
            maximo: MAX_PUNTAJE,
            porcentaje: porcentaje, // Para pintar la dona o barra de progreso
            secciones: reporteSecciones,
            nivel: nivel,
            mensaje: mensaje,
            color: color
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener resumen" });
    }
});


// =========================================================
// 📊 ENDPOINT: DATOS DETALLADOS (CORREGIDO FINAL)
// =========================================================

app.get('/admin/detalle-graficas/:idInstitucion', async (req, res) => {
    try {
        const { idInstitucion } = req.params;

        // 1. OBTENER RESPUESTAS NORMALES, MÚLTIPLES Y MATRIZ
        const sqlUsuario = `
            SELECT id_pregunta, id_opcion_seleccionada AS id_opcion, respuesta_texto FROM respuestas WHERE id_institucion = ?
            UNION ALL
            SELECT id_pregunta, id_opcion, NULL AS respuesta_texto FROM respuestas_multiples WHERE id_institucion = ?
            UNION ALL
            SELECT id_pregunta_matriz AS id_pregunta, valor AS id_opcion, NULL AS respuesta_texto FROM respuestas_matriz WHERE id_institucion = ?
        `;

        const [resUsuario] = await db.query(sqlUsuario, [idInstitucion, idInstitucion, idInstitucion]);

        // ---------------------------------------------------------
        // 🟢 FIX: OBTENER CONTACTOS Y SIMULAR RESPUESTA PREGUNTA 6
        // ---------------------------------------------------------
        const [contactosDB] = await db.query('SELECT * FROM contactos_institucion WHERE id_institucion = ?', [idInstitucion]);
        
        if (contactosDB.length > 0) {
            resUsuario.push({
                id_pregunta: 6, 
                id_opcion: null, 
                respuesta_texto: JSON.stringify(contactosDB) // <--- ESTO ES LA CLAVE
            });
        }
        // ---------------------------------------------------------


        // 2. OBTENER ESTADÍSTICAS GLOBALES
        const sqlGlobales = `
            SELECT id_pregunta, id_opcion, COUNT(*) as cantidad 
            FROM (
                 SELECT id_pregunta, id_opcion_seleccionada AS id_opcion FROM respuestas WHERE id_opcion_seleccionada IS NOT NULL
                 UNION ALL
                 SELECT id_pregunta, id_opcion FROM respuestas_multiples
                 UNION ALL
                 SELECT id_pregunta_matriz AS id_pregunta, valor AS id_opcion FROM respuestas_matriz
            ) as t
            GROUP BY id_pregunta, id_opcion
        `;
        
        const [resGlobales] = await db.query(sqlGlobales);

        res.json({
            usuario: resUsuario, 
            globales: resGlobales
        });

    } catch (error) {
        console.error("❌ ERROR SQL DETALLE:", error);
        res.status(500).json({ error: "Error en servidor: " + error.message });
    }
});

// RUTA: FINALIZAR CUESTIONARIO (CANDADO)
app.post('/finalizar-cuestionario', async (req, res) => {
    const { id_usuario } = req.body;
    console.log(`🔒 [FINALIZAR] Cerrando cuestionario para usuario ID: ${id_usuario}`);

    try {
        // Actualizamos la bandera 'finalizado' a 1
        const sql = 'UPDATE instituciones SET finalizado = 1 WHERE id_usuario = ?';
        await db.query(sql, [id_usuario]);

        res.json({ mensaje: 'Cuestionario finalizado correctamente' });
    } catch (error) {
        console.error("❌ [ERROR FINALIZAR]:", error);
        res.status(500).json({ error: 'Error al finalizar el cuestionario' });
    }
});

// RUTA: FINALIZAR CUESTIONARIO (CANDADO)
app.post('/finalizar-cuestionario', async (req, res) => {
    const { id_usuario } = req.body;
    console.log(`🔒 [FINALIZAR] Cerrando cuestionario para usuario ID: ${id_usuario}`);

    try {
        // Actualizamos la bandera 'finalizado' a 1
        const sql = 'UPDATE instituciones SET finalizado = 1 WHERE id_usuario = ?';
        await db.query(sql, [id_usuario]);

        res.json({ mensaje: 'Cuestionario finalizado correctamente' });
    } catch (error) {
        console.error("❌ [ERROR FINALIZAR]:", error);
        res.status(500).json({ error: 'Error al finalizar el cuestionario' });
    }
});


// =========================================================
// 📍 ENDPOINT: OBTENER UBICACIONES PARA EL MAPA
// =========================================================

// 1. RUTA PARA QUE EL ADMIN VEA EL MAPA (GET)
app.get('/api/ubicaciones', async (req, res) => {
    try {
        const sql = `
            SELECT 
                u.nombre_completo AS nombre, 
                u.ubicacion_texto AS ubicacion, 
                u.latitud, 
                u.longitud,
                COALESCE(i.puntaje_total, 0) AS puntaje
            FROM usuarios_registrados u
            LEFT JOIN instituciones i ON u.id = i.id_usuario
            WHERE u.latitud IS NOT NULL AND u.latitud != ''
        `;
        
        const [usuarios] = await db.query(sql);
        res.json(usuarios);

    } catch (error) {
        console.error("Error al obtener mapa:", error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// 2. RUTA PARA GUARDAR COORDENADAS DESDE SECCIÓN 1 (POST)
app.post('/api/actualizar-ubicacion', async (req, res) => {
    const { id_usuario, latitud, longitud, ubicacion_texto } = req.body;
    
    // Validación básica
    if (!id_usuario || !latitud) {
        return res.status(400).json({ error: 'Faltan datos de ubicación' });
    }

    try {
        const sql = `
            UPDATE usuarios_registrados 
            SET latitud = ?, longitud = ?, ubicacion_texto = ? 
            WHERE id = ?
        `;
        await db.query(sql, [latitud, longitud, ubicacion_texto, id_usuario]);
        
        console.log(`📍 Ubicación actualizada para usuario ${id_usuario}`);
        res.json({ message: 'Ubicación guardada correctamente' });
    } catch (error) {
        console.error("Error actualizando ubicación:", error);
        res.status(500).json({ error: 'Error interno de base de datos' });
    }
});

// =======================
// 📧 ENDPOINT: CORREO (CORREGIDO Y SIN ERRORES)
// =======================
app.post('/api/enviar-correo-resultados', async (req, res) => {
    const { idUsuario } = req.body;

    console.log(`📩 Iniciando proceso de correo para Usuario ID: ${idUsuario}`);

    const NOMBRES_SECCIONES = {
        1: "Identificación de la Institución",
        2: "Gestión Institucional",
        3: "Caracterización del Acervo",
        4: "Inventario y Catalogación",
        5: "Gestión de información",
        6: "Recursos Humanos",
        7: "Infraestructura Tecnológica",
        8: "Normatividad y Procesos",
        9: "Servicios"
    };

    const MAXIMOS_SECCION = {
        1: 0, 2: 5, 3: 21, 4: 34, 5: 81, 6: 40, 7: 5, 8: 7, 9: 4
    };

    function identificarSeccion(idPregunta) {
        const id = parseInt(idPregunta);
        if (id >= 1 && id <= 13) return 1;
        if (id >= 14 && id <= 19) return 2;
        if (id >= 20 && id <= 28) return 3;
        if (id >= 29 && id <= 37) return 4;
        if (id >= 38 && id <= 40) return 5;
        if (id >= 41 && id <= 47) return 6;
        if (id >= 48 && id <= 48) return 7;
        if (id >= 49 && id <= 49) return 8;
        if (id >= 50 && id <= 50) return 9;
        return 0;
    }

    try {
        // 1. OBTENER DATOS
        const queryUsuario = `
            SELECT u.nombre_completo, u.email, i.id_institucion, i.puntaje_total 
            FROM usuarios_registrados u
            JOIN instituciones i ON u.id = i.id_usuario
            WHERE u.id = ?
        `;
        const [rows] = await db.query(queryUsuario, [idUsuario]);
        
        if (rows.length === 0) return res.status(404).json({ error: "Institución no encontrada" });
        
        const usuario = rows[0];
        const idInstitucion = usuario.id_institucion;
        const puntajeTotal = usuario.puntaje_total || 0; 

        // 2. OBTENER DESGLOSE
        const sqlDetalle = `
            SELECT id_pregunta, SUM(puntos_otorgados) as puntos 
            FROM (
                SELECT id_pregunta, puntos_otorgados FROM respuestas WHERE id_institucion = ? 
                UNION ALL
                SELECT id_pregunta, puntos_otorgados FROM respuestas_multiples WHERE id_institucion = ? 
                UNION ALL
                SELECT id_pregunta_matriz as id_pregunta, valor as puntos FROM respuestas_matriz WHERE id_institucion = ?
            ) as t
            GROUP BY id_pregunta
        `;

        const [filasPuntos] = await db.query(sqlDetalle, [idInstitucion, idInstitucion, idInstitucion]);
        const reporteSecciones = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
        
        filasPuntos.forEach(fila => {
            const numSeccion = identificarSeccion(fila.id_pregunta);
            const pts = parseInt(fila.puntos) || 0;
            if (reporteSecciones[numSeccion] !== undefined) {
                reporteSecciones[numSeccion] += pts;
            }
        });

        // 3. APLICAR BONO
        const sqlBono = `SELECT COUNT(*) as c FROM respuestas WHERE id_institucion=? AND id_pregunta IN (14,15) AND respuesta_texto IS NOT NULL AND respuesta_texto != ''`;
        const [rowsBono] = await db.query(sqlBono, [idInstitucion]);
        if(rowsBono[0].c === 2) { reporteSecciones[2] += 1; }

        // 4. COLOR GLOBAL (TARJETA PRINCIPAL)
        let colorFondoGlobal = "#dc3545"; // Rojo
        let textoNivelGlobal = "Diagnóstico Finalizado";

        if (puntajeTotal >= 140) { 
            colorFondoGlobal = "#28a745"; // Verde
        } else if (puntajeTotal >= 45) { 
            colorFondoGlobal = "#ffc107"; // Amarillo
        } 

        // 5. GENERAR HTML DE LA TABLA (AQUÍ ESTABA EL ERROR)
        let filasHTML = '';
        
        // Usamos 'i' como iterador
        for (let i = 1; i <= 9; i++) {
            const puntos = reporteSecciones[i];
            const maximo = MAXIMOS_SECCION[i] || 1;
            const porcentaje = (puntos / maximo) * 100;

            let colorSeccion = '#6c757d'; 
            let textoRecomendacion = "";
            let iconoEstado = "";

            // --- CORRECCIÓN: Usamos 'i' en lugar de 'numSec' ---
            if (i === 1) {
                colorSeccion = '#17a2b8'; // Azul
                textoRecomendacion = "Verifique que los datos de contacto estén actualizados.";
                iconoEstado = "ℹ️ Información";
            } else {
                if (porcentaje >= 80) {
                    colorSeccion = '#28a745'; 
                    textoRecomendacion = "Cumple satisfactoriamente con los estándares. Se sugiere mantener la documentación.";
                    iconoEstado = "✅ Consolidado";
                } else if (porcentaje >= 50) {
                    colorSeccion = '#ffc107'; 
                    textoRecomendacion = "Existen avances pero se detectaron carencias normativas o técnicas.";
                    iconoEstado = "⚠️ En Desarrollo";
                } else {
                    colorSeccion = '#dc3545'; 
                    textoRecomendacion = "Se identificaron debilidades críticas. Requiere plan de acción inmediato.";
                    iconoEstado = "🛑 Atención Prioritaria";
                }
            }

            // Construimos la fila para el correo
            filasHTML += `
                <tr>
                    <td style="padding: 15px; border-bottom: 1px solid #eee;">
                        <div style="margin-bottom: 5px;">
                            <span style="display:inline-block; width:12px; height:12px; background-color:${colorSeccion}; border-radius:3px; margin-right:8px;"></span>
                            <strong style="color: #333; font-size: 14px;">${i}. ${NOMBRES_SECCIONES[i]}</strong>
                        </div>
                        <div style="font-size: 13px; color: #666; margin-left: 24px; line-height: 1.4;">
                            ${textoRecomendacion}
                        </div>
                    </td>
                    <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
                        <span style="font-size: 11px; font-weight: 600; color: #555; background: #f4f4f4; padding: 4px 8px; border-radius: 4px; white-space: nowrap; border: 1px solid #e0e0e0;">
                            ${iconoEstado}
                        </span>
                    </td>
                </tr>
            `;
        }

        // 6. ENVIAR CORREO
        const brevoUrl = 'https://api.brevo.com/v3/smtp/email';
        const emailData = {
            sender: { name: "Diagnóstico de Archivos", email: "axelcerecedo117@gmail.com" },
            to: [{ email: usuario.email, name: usuario.nombre_completo }],
            subject: `📊 Resultados de su Diagnóstico`,
            htmlContent: `
            <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" style="padding: 40px 10px;">
                            <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                                
                                <tr>
                                    <td align="center" style="background-color: ${colorFondoGlobal}; padding: 40px 30px; color: #ffffff;">
                                        <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
                                        <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">${textoNivelGlobal}</h2>
                                        <hr style="width: 50%; border: 0; border-top: 1px solid rgba(255,255,255,0.4); margin: 20px auto;">
                                        <p style="font-size: 16px; line-height: 1.6; margin: 0; opacity: 0.95;">
                                            Agradecemos su tiempo y colaboración.<br>
                                            La información ha sido procesada exitosamente. A continuación encontrará el desglose detallado.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 30px;">
                                        <h3 style="color: ${colorFondoGlobal}; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
                                            Reporte Detallado por Área
                                        </h3>
                                        
                                        <div style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tbody>
                                                    ${filasHTML}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 30px;">
                                            Reporte generado para <strong>${usuario.nombre_completo}</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `
        };

        const response = await fetch(brevoUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(500).json({ error: errorData.message });
        }

        res.json({ message: 'Correo enviado correctamente', email: usuario.email });

    } catch (error) {
        console.error("❌ Error interno:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================
// 5. INICIAR SERVIDOR
// ==========================
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://172.17.175.137:${PORT}`);
    console.log(`   Esperando peticiones...`);
});

