// ==========================
// 1. Dependencias
// ==========================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');

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
// LOGS GLOBALES (NUEVO)
// Esto imprimirá en la consola CADA petición que llegue
// ==========================
app.use((req, res, next) => {
    console.log(`\n🔔 [PETICIÓN RECIBIDA] Método: ${req.method} | URL: ${req.url}`);
    console.log('📦 Datos recibidos (Body):', req.body);
    next(); // Deja pasar la petición a las siguientes rutas
});

// ==========================
// 3. Conexión a MySQL (MODO PROMESA)
// ==========================
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'encuesta-dev',
  password: '3YPmrkEdB4e7lctiqXR6',
  database: 'Encuesta',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
    28: { tipo: 'acumulativo_max5' }, 

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
// RUTA A: GUARDAR ENCUESTA (CORREGIDA: EVITA DOBLE SUMA EN MIXTAS)
// =================================================================
app.post('/guardar-encuesta', async (req, res) => {
    try {
        const { id_usuario, respuestas_simples, respuestas_multiples, contactos } = req.body;

        if (!id_usuario) return res.status(400).json({ error: "No se identificó al usuario." });

        // =============================================================
        // PASO PREVIO: OBTENER EL NOMBRE REAL
        // (Consultamos la tabla de usuarios registrados para saber quién es)
        // =============================================================
        let nombreReal = "Usuario"; // Default por si falla
        const [users] = await db.query('SELECT nombre_completo FROM usuarios_registrados WHERE id = ?', [id_usuario]);
        
        if (users.length > 0 && users[0].nombre_completo) {
            nombreReal = users[0].nombre_completo;
        }

        // =============================================================
        // 1. BUSCAR O CREAR INSTITUCIÓN (CON NOMBRE CORREGIDO)
        // =============================================================
        let idInstitucion;
        const [rows] = await db.query('SELECT id_institucion FROM instituciones WHERE id_usuario = ?', [id_usuario]);
        
        if (rows.length > 0) {
            idInstitucion = rows[0].id_institucion;
            
            // 🛠️ CORRECCIÓN AUTOMÁTICA: 
            // Si ya existe, actualizamos el nombre por si antes se guardó como "Usuario" o "UsuarioTemp"
            await db.query('UPDATE instituciones SET nombre_usuario = ? WHERE id_institucion = ?', [nombreReal, idInstitucion]);
            
        } else {
            // Si es nueva, la creamos con el nombre correcto desde el principio
            const [result] = await db.query('INSERT INTO instituciones (id_usuario, nombre_usuario) VALUES (?, ?)', [id_usuario, nombreReal]);
            idInstitucion = result.insertId;
        }

        // =============================================================
        // 🧠 HISTORIAL LOCAL PARA "ÚNICA VEZ" 
        // =============================================================
        // Esto evita que si marcan 2 opciones en una pregunta de "única vez", sumen doble.
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
            
            // Para las demás (incluida la Sección 9 con 'puntos_por_opcion')
            // usará la tabla VALOR_OPCIONES que definimos arriba (Padres=1, Hijos=0)
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
                // Si es texto vacío y sin opción, 0 puntos
                if (r.valor_texto === '' && !r.id_opcion) {
                    puntosCalculados = 0; 
                } else {
                    puntosCalculados = obtenerPuntos(r.id_pregunta, r.id_opcion, r.valor_texto);
                }
                return [idInstitucion, r.id_pregunta, r.valor_texto, r.id_opcion, puntosCalculados];
            });

            await db.query('INSERT INTO respuestas (id_institucion, id_pregunta, respuesta_texto, id_opcion_seleccionada, puntos_otorgados) VALUES ?', [values]);
        }

        // --- B. RESPUESTAS MÚLTIPLES ---
        const { ids_multiples_activas } = req.body; 

        // 1. Limpieza preventiva (lo que se desmarcó)
        if (ids_multiples_activas && ids_multiples_activas.length > 0) {
            await db.query(`DELETE FROM respuestas_multiples WHERE id_institucion=? AND id_pregunta IN (?)`, [idInstitucion, ids_multiples_activas]);
        }

        // 2. Insertar lo nuevo
        if (respuestas_multiples && respuestas_multiples.length > 0) {
            const valuesMulti = respuestas_multiples.map(r => {
                // AQUÍ OCURRE LA MAGIA PARA LA SECCIÓN 9:
                // Si es un Padre (ID 91-94) -> obtenerPuntos devuelve 1.
                // Si es un Hijo (ID 100+) -> obtenerPuntos devuelve 0.
                const puntosCalculados = obtenerPuntos(r.id_pregunta, r.id_opcion, null);
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
            await db.query('DELETE FROM contactos_institucion WHERE id_institucion = ?', [idInstitucion]);
            const valuesContactos = contactos.map(c => [idInstitucion, c.nombre, c.cargo, c.correo, c.telefono]);
            await db.query('INSERT INTO contactos_institucion (id_institucion, nombre, cargo, correo, telefono) VALUES ?', [valuesContactos]);
        }

        // =============================================================
        // 3. CÁLCULO DE PUNTAJE TOTAL (LECTURA SIMPLE)
        // =============================================================
        
        console.log("---------------------------------------------------");
        console.log(`📊 REPORTE DE PUNTAJE - INSTITUCIÓN ${idInstitucion}`);

        // A. Sumar todo lo que está guardado en la BD
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

// RUTA B: REGISTRO DE USUARIO (CON LOGS)
app.post('/auth/registro', async (req, res) => {
    const { institucion, nombre, email, password } = req.body;
    console.log(`👤 [REGISTRO] Intentando registrar a: ${email}`);

    try {
        // 1. Verificar si el correo ya existe
        console.log('   🔍 Verificando existencia del correo...');
        const [existe] = await db.query('SELECT id FROM usuarios_registrados WHERE email = ?', [email]);
        
        if (existe.length > 0) {
            console.log('   ⚠️ [REGISTRO] El correo ya existe en BD.');
            return res.status(400).json({ error: 'Este correo ya está registrado.' });
        }

        // 2. Insertar usuario
        console.log('   💾 Insertando nuevo usuario en BD...');
        const sql = 'INSERT INTO usuarios_registrados (institucion_procedencia, nombre_completo, email, password) VALUES (?, ?, ?, ?)';
        await db.query(sql, [institucion, nombre, email, password]);

        console.log('   ✅ [REGISTRO] ¡Éxito! Usuario registrado.');
        res.json({ message: 'Usuario registrado exitosamente' });

    } catch (error) {
        console.error("❌ [ERROR REGISTRO]:", error);
        // Esto te mostrará el error exacto de SQL en la terminal
        res.status(500).json({ error: 'Error en el servidor al registrar.' });
    }
});

// RUTA C: LOGIN
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`🔑 [LOGIN] Intento de acceso: ${email}`);

    try {
        const sql = 'SELECT * FROM usuarios_registrados WHERE email = ? AND password = ?';
        const [users] = await db.query(sql, [email, password]);

        if (users.length > 0) {
            const usuario = users[0];
            console.log(`   ✅ [LOGIN] Bienvenido ${usuario.nombre_completo}`);
            
            // --- LÓGICA DE ADMINISTRADOR ---
            // Verificamos si el correo está en la lista VIP
            const esAdmin = ADMIN_EMAILS.includes(email);

            // Si es admin, va a admin.html, si no, a la encuesta normal
            const rutaDestino = esAdmin ? 'admin.html' : 'seccion1.html'; 
            // NOTA: Ajusta 'admin.html' si está dentro de carpetas, ej: '/encuesta/Programa/admin.html'

            res.json({ 
                message: 'Bienvenido', 
                redirect: rutaDestino,  // <--- REDIRECCIÓN DINÁMICA
                nombre: usuario.nombre_completo,
                userId: usuario.id,
                esAdmin: esAdmin // <--- Enviamos esto por si el front lo necesita
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
        // Traemos solo instituciones que tengan algún puntaje guardado
        const sql = `
            SELECT id_institucion, nombre_usuario, puntaje_total, fecha_registro 
            FROM instituciones 
            WHERE puntaje_total > 0 
            ORDER BY puntaje_total DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
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

        // 2. Calcular Distribución de Niveles (AJUSTADO A MAX ~187)
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

        // Establecemos el tope teórico en 187 (según tu cálculo reciente)
        const MAX_PUNTAJE = 187; 
        
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
// =========================================================
// 📊 ENDPOINT: DATOS DETALLADOS (CORREGIDO PARA CONTACTOS)
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
            // Convertimos la tabla de contactos en un string JSON para que el frontend lo entienda
            // Asignamos manualmente el id_pregunta 6 (que es la de contactos en seccion1.js)
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


// ==========================
// 5. INICIAR SERVIDOR
// ==========================
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://172.17.175.137:${PORT}`);
    console.log(`   Esperando peticiones...`);
});