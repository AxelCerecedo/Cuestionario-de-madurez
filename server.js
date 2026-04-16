// ==========================
// 1. Dependencias
// ==========================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.G_USER, 
        pass: process.env.G_PASS  
    }
});


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
// 🗺️ NUEVO MAPA DE SECCIONES (5 Secciones)
// =========================================================
function identificarSeccion(idPregunta) {
    const id = parseInt(idPregunta);
    
    if (id >= 1 && id <= 14) return 1;  // Gestión Institucional
    if (id >= 15 && id <= 21) return 2; // Recursos Humanos
    if (id >= 22 && id <= 37) return 3; // Características del Acervo
    if (id >= 38 && id <= 48) return 4; // Infraestructura
    if (id >= 49 && id <= 54) return 5; // Servicios al Público
    
    return 'Otra'; 
}

// =========================================================
// 📜 CONFIGURACIÓN DE REGLAS DE PUNTAJE (SIMPLIFICADA)
// =========================================================

const REGLAS_PUNTAJE = {
    14: { tipo: 'escala_directa' }, // Autoevaluación Sec 1
    21: { tipo: 'escala_directa' }, // Autoevaluación Sec 2
    37: { tipo: 'escala_directa' }, // Autoevaluación Sec 3
    48: { tipo: 'escala_directa' }, // Autoevaluación Sec 4
    54: { tipo: 'escala_directa' }  // Autoevaluación Sec 5
};


// =========================================================
// FUNCIÓN: CALCULAR PUNTOS (LÓGICA CENTRAL SIMPLIFICADA)
// =========================================================
function calcularPuntosPregunta(idPregunta, idOpcion, valorTexto) {
    const regla = REGLAS_PUNTAJE[idPregunta];
    
    // Si no hay regla configurada para esta pregunta (ej. preguntas 1 a la 13), vale 0 puntos.
    if (!regla) return 0;

    // ---------------------------------------------------------
    // ÚNICA REGLA: ESCALA DIRECTA (El ID de la opción es el puntaje)
    // ---------------------------------------------------------
    // Ejemplo: 
    // Opción ID 1 (Incipiente) = 1 pto 
    // Opción ID 5 (Avanzado) = 5 ptos
    if (regla.tipo === 'escala_directa') {
        return parseInt(idOpcion) || 0;
    }

    // Por seguridad, si llegara a existir una regla rara, retorna 0.
    return 0;
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

        // --- B. RESPUESTAS MÚLTIPLES 
        const { ids_multiples_activas } = req.body; 
        if (ids_multiples_activas && ids_multiples_activas.length > 0) {
            await db.query(`DELETE FROM respuestas_multiples WHERE id_institucion=? AND id_pregunta IN (?)`, [idInstitucion, ids_multiples_activas]);
        }

        if (respuestas_multiples && respuestas_multiples.length > 0) {
            const valuesMulti = respuestas_multiples.map(r => {
                // Como las múltiples ya no dan puntos en el nuevo modelo, siempre es 0
                return [idInstitucion, r.id_pregunta, r.id_opcion, 0];
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

// RUTA B: REGISTRO DE USUARIO (CON GEOLOCALIZACIÓN Y NUEVOS CAMPOS)
app.post('/auth/registro', async (req, res) => {
    try {
        const { institucion, nombre, email, password, ubicacion, latitud, longitud, tipo_institucion, adscripcion } = req.body;

        console.log(`👤 [REGISTRO] Intentando registrar a: ${email}`);
        
        // 1. Generar código aleatorio de 6 dígitos
        const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();

        console.log('💾 Insertando nuevo usuario en BD...');
        
        // 2. Insertamos en la BD (Asegúrate de incluir 'codigo_verificacion' y 'correo_verificado')
        await db.query(`
            INSERT INTO usuarios_registrados 
            (institucion_procedencia, nombre_completo, email, password, ubicacion_texto, latitud, longitud, tipo_institucion, adscripcion, codigo_verificacion, correo_verificado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
            [institucion, nombre, email, password, ubicacion, latitud, longitud, tipo_institucion, adscripcion, codigoVerificacion]
        );

        // 3. ENVIAR EL CORREO
        console.log(`✉️ Enviando correo de verificación a: ${email}...`);
        
        const mailOptions = {
            from: `"Sistema de Diagnóstico" <${process.env.EMAIL_USER}>`,
            to: email, // El correo del usuario que se está registrando
            subject: 'Código de Verificación - Diagnóstico Institucional',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #333;">¡Hola, ${nombre}!</h2>
                    <p>Gracias por registrar tu institución. Para activar tu cuenta, ingresa el siguiente código de 6 dígitos en la pantalla de registro:</p>
                    <div style="margin: 20px auto; padding: 15px; max-width: 250px; background-color: #f4f6f9; border: 2px dashed #7c1225; border-radius: 8px;">
                        <h1 style="color: #7c1225; letter-spacing: 8px; margin: 0;">${codigoVerificacion}</h1>
                    </div>
                    <p style="color: #777; font-size: 0.9em;">Si tú no solicitaste este registro, ignora este mensaje.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        
        console.log('✅ [REGISTRO] ¡Éxito! Usuario guardado y correo enviado.');
        
        // 4. Respondemos al frontend para que abra el modal
        res.json({ message: "Registro exitoso. Revisa tu correo." });

    } catch (error) {
        console.error("❌ Error en registro:", error);
        
        // Si el correo falla (por contraseña incorrecta o falta de variables en Render), esto lo atrapará
        res.status(500).json({ error: "Error interno. No se pudo completar el registro o enviar el correo." });
    }
});

// RUTA C: LOGIN (CORREGIDA)
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. LISTA DE ADMINS (Correos autorizados para ver el Panel de Administrador)
    const ADMIN_EMAILS = [
        'jcf_fcg@cultura.gob.mx', 
        'alberto.colef@gmail.com', 
        'lunam.liliana.dgtic@gmail.com',
        'asesordit11@cultura.gob.mx'
    ];

    try {
        // Buscamos al usuario en la base de datos
        const [rows] = await db.query('SELECT * FROM usuarios_registrados WHERE email = ? AND password = ?', [email, password]);

        if (rows.length === 0) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos." });
        }

        const usuarioEncontrado = rows[0];

        // ==========================================
        // 🛑 CANDADO DE VERIFICACIÓN (Nivel Seguridad)
        // ==========================================
        if (usuarioEncontrado.correo_verificado == 0) {
            return res.status(403).json({ 
                error: "Cuenta no verificada", 
                requiereVerificacion: true, 
                email: usuarioEncontrado.email 
            });
        }

        // ==========================================
        // ✅ MOTOR DE REDIRECCIÓN INTELIGENTE
        // ==========================================
        
        // Verificamos si el correo está en nuestra lista de administradores
        const esAdmin = ADMIN_EMAILS.includes(usuarioEncontrado.email); 
        
        let rutaDestino = 'seccion1.html'; // Ruta por defecto para usuarios nuevos

        if (esAdmin) {
            rutaDestino = 'admin.html';
        } else if (usuarioEncontrado.finalizado === 1) {
            rutaDestino = 'seccion1.html'; // Si ya terminó, va a la sección 1 en modo lectura
        } else {
            // Buscamos progreso real en la base de datos para usuarios normales
            const [respuestas] = await db.query(`
                SELECT MAX(id_pregunta) as ultima_preg 
                FROM respuestas r 
                INNER JOIN instituciones i ON r.id_institucion = i.id_institucion 
                WHERE i.id_usuario = ?
            `, [usuarioEncontrado.id]);

            const ultimaPregunta = respuestas[0]?.ultima_preg || 0;

            // Mapeo de secciones según el número de pregunta
            if (ultimaPregunta >= 46) {
                rutaDestino = 'seccion4.html';
            } else if (ultimaPregunta >= 23) {
                rutaDestino = 'seccion3.html';
            } else if (ultimaPregunta >= 15) {
                rutaDestino = 'seccion2.html';
            }
        }

        // ==========================================
        // 🚀 RESPUESTA AL NAVEGADOR
        // ==========================================
        res.json({
            message: "Login exitoso",
            userId: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre_completo,
            finalizado: usuarioEncontrado.finalizado,
            esAdmin: esAdmin,
            redirect: rutaDestino
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Error interno del servidor" });
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

        // =================================================================
        // 🔥 EL ARREGLO ESTÁ AQUÍ: Buscar si el usuario ya finalizó
        // =================================================================
        let estatusFinalizado = 0;
        try {
            // OJO: Asumimos que la columna de ID en usuarios_registrados es "id".
            // Si en tu base de datos se llama "id_usuario", cambia el WHERE a "WHERE id_usuario = ?"
            const [usuarioData] = await db.query('SELECT finalizado FROM usuarios_registrados WHERE id = ?', [id_usuario]);
            if (usuarioData.length > 0) {
                estatusFinalizado = usuarioData[0].finalizado || 0;
            }
        } catch (errDB) {
            console.error("⚠️ Error SQL al buscar 'finalizado':", errDB.message);
            // No detenemos el servidor, solo mandamos 0
        }

        // 2. Traer respuestas
        const [simples] = await db.query('SELECT * FROM respuestas WHERE id_institucion = ?', [idInstitucion]);
        const [multiples] = await db.query('SELECT * FROM respuestas_multiples WHERE id_institucion = ?', [idInstitucion]);
        const [matriz] = await db.query('SELECT * FROM respuestas_matriz WHERE id_institucion = ?', [idInstitucion]);
        const [contactos] = await db.query('SELECT * FROM contactos_institucion WHERE id_institucion = ?', [idInstitucion]);

        // =================================================================
        // 🔥 ENVIAR JSON COMPLETO AL FRONTEND
        // =================================================================
        res.json({
            vacio: false,
            simples,
            multiples,
            matriz,    
            contactos,
            finalizado: estatusFinalizado // <-- ¡ESTO EVITARÁ QUE SE DESBLOQUEE AL INICIAR SESIÓN!
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
        const [rows] = await db.query('SELECT id_institucion, nombre_usuario, puntaje_total, analisis_ia FROM instituciones WHERE id_usuario = ?', [idUsuario]);

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
        // 4. NUEVA LÓGICA DE NIVELES (Máximo 25 puntos)
        // =========================================================
        const MAX_PUNTAJE = 25; 
        const porcentaje = MAX_PUNTAJE > 0 ? Math.round((puntajeTotal / MAX_PUNTAJE) * 100) : 0;

        let nivel = "Incipiente";
        let mensaje = "El nivel de madurez es incipiente. Se requiere iniciar procesos básicos de formalización.";
        let color = "#dc3545"; // Rojo

        // Umbrales proporcionales sobre 25 puntos
        if (puntajeTotal >= 21) { 
            nivel = "Avanzado"; 
            mensaje = "¡Excelente! Prácticas consolidadas y estandarizadas en todas las áreas."; 
            color = "#198754"; // Verde fuerte
        } 
        else if (puntajeTotal >= 16) { 
            nivel = "Consolidado"; 
            mensaje = "Nivel sólido. Mantenga el seguimiento estratégico y la mejora continua."; 
            color = "#20c997"; // Verde claro
        } 
        else if (puntajeTotal >= 11) { 
            nivel = "Intermedio"; 
            mensaje = "Buen nivel de control básico. Enfoque sus esfuerzos en la estandarización."; 
            color = "#ffc107"; // Amarillo
        } 
        else if (puntajeTotal >= 6) { 
            nivel = "Básico estructural"; 
            mensaje = "Existen procesos esenciales, pero se requiere mayor formalización documentada."; 
            color = "#fd7e14"; // Naranja
        }

        // =========================================================
        // 🖨️ IMPRIMIR EN CONSOLA CUANDO ALGUIEN VE SU RESUMEN
        // =========================================================
        //console.log(`\n🔔 [GET] /resumen/${idUsuario}`);
        console.log(`   🏢 Institución: ${rows[0].nombre_usuario}`);
        console.log(`   ⭐ Puntaje Total: ${puntajeTotal} / ${MAX_PUNTAJE} (${porcentaje}%)`);
        console.log(`   🚦 Nivel Calculado: ${nivel}`);
        console.log("---------------------------------------------------\n");

        // Enviar respuesta
        res.json({
            institucion: rows[0].nombre_usuario,
            total: puntajeTotal,
            maximo: MAX_PUNTAJE,
            porcentaje: porcentaje,
            secciones: reporteSecciones,
            nivel: nivel,
            mensaje: mensaje,
            color: color,
            analisis_ia: rows[0].analisis_ia 
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

// =========================================================
// RUTA PARA FINALIZAR EL CUESTIONARIO (CANDADO)
// =========================================================
app.post('/finalizar-cuestionario', async (req, res) => {
    try {
        const { id_usuario } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ error: "Falta el ID del usuario" });
        }

        // Actualizamos la columna 'finalizado' a 1
        // OJO: Si tu llave primaria se llama 'id_usuario', cambia "WHERE id =" por "WHERE id_usuario ="
        await db.query('UPDATE usuarios_registrados SET finalizado = 1 WHERE id = ?', [id_usuario]);

        console.log(`🔒 [CANDADO] El usuario ID: ${id_usuario} ha finalizado su cuestionario.`);
        res.json({ message: "Cuestionario bloqueado exitosamente" });

    } catch (error) {
        console.error("Error al finalizar cuestionario:", error);
        res.status(500).json({ error: "Error interno al aplicar candado" });
    }
});

// =========================================================
// RUTA: OBTENER UBICACIONES PARA EL MAPA (CORREGIDA)
// =========================================================

app.get('/api/ubicaciones', async (req, res) => {
    try {
        // 🔥 Nombres de columnas exactamente iguales a tu tabla usuarios_registrados
        const [ubicaciones] = await db.query(`
            SELECT 
                u.id AS id_usuario,
                u.nombre_completo AS nombre_usuario,
                u.ubicacion_texto,
                u.latitud,
                u.longitud,
                u.institucion_procedencia AS institucion
            FROM usuarios_registrados u
            WHERE u.ubicacion_texto IS NOT NULL AND u.ubicacion_texto != ''
        `);

        res.json(ubicaciones);
    } catch (error) {
        console.error("Error al obtener ubicaciones de registro:", error);
        res.status(500).json({ error: "Error al cargar ubicaciones" });
    }
});

app.post('/api/actualizar-ubicacion', async (req, res) => {
    const { id_usuario, latitud, longitud, ubicacion_texto } = req.body;
    
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

// =========================================================
// 📧 ENDPOINT: CORREO (CORREGIDO - TEXTOS VISIBLES)
// =========================================================
app.post('/api/enviar-correo-resultados', async (req, res) => {
    const { idUsuario } = req.body;

    console.log(`📩 Iniciando proceso de correo para Usuario ID: ${idUsuario}`);

    const NOMBRES_SECCIONES = {
        1: "Gestión Institucional",
        2: "Recursos Humanos",
        3: "Características del Acervo",
        4: "Infraestructura Física y Tecnológica",
        5: "Servicios al Público"
    };

    const MAXIMOS_SECCION = { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 };

    function identificarSeccion(idPregunta) {
        const id = parseInt(idPregunta);
        if (id >= 1 && id <= 14) return 1;
        if (id >= 15 && id <= 21) return 2;
        if (id >= 22 && id <= 37) return 3;
        if (id >= 38 && id <= 48) return 4;
        if (id >= 49 && id <= 54) return 5;
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
        let colorFondoGlobal = "#dc3545"; 
        let textoNivelGlobal = "Diagnóstico Finalizado";

        if (puntajeTotal >= 140) { 
            colorFondoGlobal = "#28a745"; 
        } else if (puntajeTotal >= 45) { 
            colorFondoGlobal = "#ffc107"; 
        } 

        // 5. GENERAR HTML 
        let filasHTML = '';
        
        for (let i = 1; i <= 5; i++) {
            const puntos = reporteSecciones[i];
            const maximo = MAXIMOS_SECCION[i] || 1;
            const porcentaje = (puntos / maximo) * 100;

            let colorSeccion = '#6c757d'; 
            let textoRecomendacion = ""; 
            let iconoEstado = "";

            if (i === 1) {
                colorSeccion = '#28a745'; 
                textoRecomendacion = "Datos de contacto y ubicación.";
                iconoEstado = "ℹ️ Información";
            } else {
                if (porcentaje >= 100) { 
                    colorSeccion = '#28a745'; 
                    textoRecomendacion = "✅ <b>Nivel Consolidado:</b> La institución cumple satisfactoriamente con los estándares.";
                    iconoEstado = "✅ Consolidado";
                } else if (porcentaje >= 50) {
                    colorSeccion = '#ffc107'; 
                    textoRecomendacion = "⚠️ <b>Nivel en Desarrollo:</b> La institución muestra avances, pero aún hay áreas que requieren atención para alcanzar un nivel óptimo.";
                    iconoEstado = "⚠️ En Desarrollo";
                } else {
                    colorSeccion = '#dc3545'; 
                    textoRecomendacion = "🛑 <b>Nivel mínimo:</b> Se han identificado carencias que comprometen la gestión. Se recomienda implementar un plan de acción para mejorar las condiciones mínimas de operación.";
                    iconoEstado = "🛑 Atención Prioritaria";
                }
            }

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

        // 6. ENVIAR CON BREVO
        const brevoUrl = 'https://api.brevo.com/v3/smtp/email';
        const emailData = {
            sender: { name: "Diagnóstico de la institución", email: "axelcerecedo117@gmail.com" },
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
                                                <tbody>${filasHTML}</tbody>
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

// =========================================================
// 🧠 ENDPOINT: GENERAR ANÁLISIS CON IA (VERSIÓN FINAL + SEMÁFORO)
// =========================================================
app.post('/api/generar-analisis-ia', async (req, res) => {
    const { id_usuario } = req.body;
    console.log(`\n🤖 [GEMINI] Iniciando análisis sincronizado para usuario ID: ${id_usuario}`);

    // --- 1. DICCIONARIOS Y CONSTANTES ---
    const MAXIMOS_SECCION = { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 };
    
    // --- NUEVO DICCIONARIO UNIVERSAL (54 PREGUNTAS) ---
    const DICCIONARIO = {
        // SECCIÓN 1: Gestión Institucional
        1: { pregunta: "¿Cuenta con planeación estratégica?", opciones: { 1: "Sí", 0: "No" } },
        2: { pregunta: "Misión institucional", opciones: {} },
        3: { pregunta: "Visión institucional", opciones: {} },
        4: { pregunta: "¿Cuenta con organigrama?", opciones: { 1: "Sí", 0: "No" } },
        5: { pregunta: "¿Cuenta con manuales de procedimiento?", opciones: { 1: "Sí", 0: "No" } },
        6: { pregunta: "Política formal de adquisiciones", opciones: { 1: "Sí", 0: "No" } },
        7: { pregunta: "Proceso formal de ingreso al acervo", opciones: { 1: "Sí", 0: "No" } },
        8: { pregunta: "Proceso formal de salida del acervo", opciones: { 1: "Sí", 0: "No" } },
        9: { pregunta: "Plan de emergencias", opciones: { 1: "Sí", 0: "No" } },
        10: { pregunta: "Frecuencia de auditorías", opciones: { 1: "No se realizan", 2: "Trimestrales", 3: "Semestrales", 4: "Anuales", 5: "Cada dos años o más" } },
        11: { pregunta: "Registro de daños o pérdidas", opciones: { 1: "No se lleva registro", 2: "Por cada incidente", 3: "Mensual o bimestral", 4: "Trimestral o semestral" } },
        12: { pregunta: "Diagnóstico legal (Derechos de autor)", opciones: { 1: "No identificada", 2: "Identificada parcialmente", 3: "Identificada en su totalidad" } },
        13: { pregunta: "Fuentes de financiamiento", opciones: { 1: "Gubernamental nacional", 2: "Estatal", 3: "Municipal", 4: "Recursos propios", 5: "Particular nacional", 6: "Particular extranjero", 7: "Organismo internacional", 8: "Otro", 99: "Ninguno" } },
        14: { pregunta: "RÚBRICA: GESTIÓN INSTITUCIONAL", opciones: { 1: "Incipiente", 2: "Básico estructural", 3: "Intermedio", 4: "Consolidado", 5: "Avanzado" } },

        // SECCIÓN 2: Recursos Humanos
        15: { pregunta: "Número total de personas en el acervo", opciones: {} },
        16: { pregunta: "Antigüedad promedio del personal", opciones: { 1: "0-2 años", 2: "3-5 años", 3: "6-10 años", 4: "11-20 años", 5: "Más de 20 años" } },
        17: { pregunta: "Nivel educativo del personal", opciones: {} },
        18: { pregunta: "¿El personal recibe capacitación alineada?", opciones: { 1: "No se imparte", 2: "Por propios medios", 3: "Interna", 4: "Externa" } },
        19: { pregunta: "Personal para evaluación de conservación", opciones: { 1: "Interna", 2: "Externa", 3: "Ambas" } },
        20: { pregunta: "Áreas de capacitación recibida", opciones: { 1: "Archivística", 2: "Catalogación", 3: "Fotografía", 4: "Conservación", 5: "Restauración", 6: "Digitalización", 7: "Cómputo", 8: "Historia/Arte", 9: "Manipulación física", 10: "Otro" } },
        21: { pregunta: "RÚBRICA: RECURSOS HUMANOS", opciones: { 1: "Incipiente", 2: "Básico estructural", 3: "Intermedio", 4: "Consolidado", 5: "Avanzado" } },

        // SECCIÓN 3: Características del Acervo
        22: { pregunta: "Volumen del acervo fotográfico", opciones: { 1: "Hasta 500", 2: "Hasta 5,000", 3: "Hasta 50,000", 4: "Más de 50,000" } },
        23: { pregunta: "Fondos representativos", opciones: {} },
        24: { pregunta: "Tipos de materiales", opciones: { 1: "Positivos papel", 2: "Diapositivas", 3: "Negativos", 4: "Digitales", 5: "Digitalizadas", 6: "Documentos asociados", 7: "Dispositivos fotográficos", 8: "Otro" } },
        25: { pregunta: "Materiales originales o reproducciones", opciones: { 1: "Originales", 2: "Reproducciones", 3: "Principalmente reproducciones", 4: "Principalmente originales" } },
        26: { pregunta: "Soportes en riesgo químico", opciones: { 1: "Nitrato de celulosa", 2: "Acetato (síndrome vinagre)", 3: "Impresiones térmicas", 99: "Ninguno" } },
        27: { pregunta: "Estado de conservación general", opciones: { 1: "Malo", 2: "Regular", 3: "Bueno" } },
        28: { pregunta: "Período temporal", opciones: {} },
        29: { pregunta: "Porcentaje inventariado", opciones: { 1: "1-20%", 2: "21-40%", 3: "41-60%", 4: "61-80%", 5: "81-100%" } },
        30: { pregunta: "Porcentaje catalogado", opciones: { 1: "1-20%", 2: "21-40%", 3: "41-60%", 4: "61-80%", 5: "81-100%" } },
        31: { pregunta: "Reglas de catalogación empleadas", opciones: { 1: "MARC21", 2: "ISAD-G", 3: "ISBD", 4: "Norma Mexicana", 5: "RDA", 6: "CCO", 7: "ObjectID", 8: "VRA", 9: "Otra", 99: "Ninguna" } },
        32: { pregunta: "Nivel de dominio en catalogación", opciones: { 1: "Inexperto", 2: "Básico", 3: "Intermedio", 4: "Avanzado", 5: "Experto" } },
        33: { pregunta: "Unidad de descripción usada", opciones: { 1: "Por fotografía", 2: "Unidad documental compuesta", 3: "Ambas", 99: "Ninguna" } },
        34: { pregunta: "Porcentaje digitalizado", opciones: { 1: "1-20%", 2: "21-40%", 3: "41-60%", 4: "61-80%", 5: "81-100%" } },
        35: { pregunta: "Procesos de digitalización", opciones: { 1: "Por escaneo", 2: "Por reprografía", 3: "Plan escrito", 4: "Plan para conservación", 5: "Bajo demanda" } },
        36: { pregunta: "Calidad de digitalización", opciones: { 1: "No se digitaliza", 2: "Sin estándar", 3: "Estándar básico", 4: "Estándar intermedio", 5: "Estándar de preservación" } },
        37: { pregunta: "RÚBRICA: CARACTERÍSTICAS DEL ACERVO", opciones: { 1: "Incipiente", 2: "Básico estructural", 3: "Intermedio", 4: "Consolidado", 5: "Avanzado" } },

        // SECCIÓN 4: Infraestructura Física y Tecnológica
        38: { pregunta: "Nivel de adecuación de espacios", opciones: { 1: "Inadecuado", 2: "Básico estructural", 3: "Adecuado", 4: "Bueno", 5: "Óptimo" } },
        39: { pregunta: "Nivel de equipamiento", opciones: { 1: "Inadecuado", 2: "Básico", 3: "Adecuado", 4: "Bueno", 5: "Óptimo" } },
        40: { pregunta: "Almacenamiento acondicionado", opciones: { 1: "Temperatura", 2: "Humedad", 3: "Iluminación", 4: "Mobiliario", 5: "Protección riesgos", 6: "Todas" } },
        41: { pregunta: "Instalaciones fotográficas", opciones: { 1: "Laboratorio", 2: "Estudio", 3: "Área reprografía", 4: "Estación digitalización", 99: "Ninguna" } },
        42: { pregunta: "Infraestructura tecnológica", opciones: { 1: "Cómputo", 2: "Internet", 3: "Servidor", 4: "Hosting", 5: "Equipo digitalización" } },
        43: { pregunta: "Herramientas de gestión de información", opciones: { 1: "Papel", 2: "Hojas de cálculo", 3: "BD Local", 4: "BD en línea", 5: "Sistema DAM", 6: "Repositorio digital", 99: "Ninguna" } },
        44: { pregunta: "Software empleado", opciones: { 1: "Access", 2: "Airtable", 3: "AtoM", 4: "Collective Access", 5: "Collector", 6: "A la medida", 7: "DSpace", 8: "Filemaker", 9: "Koha", 10: "Omeka", 11: "Tainacan", 12: "Otro", 99: "Ninguno" } },
        45: { pregunta: "Métodos de resguardo digital", opciones: { 1: "Computadoras", 2: "Unidades externas", 3: "Nube gratuita", 4: "Nube pago", 5: "Servidor/NAS", 6: "Sistema DAM", 7: "Repositorio", 99: "Ninguna" } },
        46: { pregunta: "Porcentaje disponible en internet", opciones: { 1: "1-20%", 2: "21-40%", 3: "41-60%", 4: "61-80%", 5: "81-100%" } },
        47: { pregunta: "Dirección web del acervo", opciones: {} },
        48: { pregunta: "RÚBRICA: INFRAESTRUCTURA", opciones: { 1: "Inadecuado", 2: "Básico", 3: "Intermedio", 4: "Consolidado", 5: "Avanzado" } },

        // SECCIÓN 5: Servicios al Público
        49: { pregunta: "Servicios al público", opciones: { 1: "Consulta", 2: "Préstamos", 3: "Reprografía", 4: "Investigación", 5: "Gestión de permisos", 6: "Otros" } },
        50: { pregunta: "Requisitos de consulta", opciones: { 1: "Libre", 2: "Cita previa", 3: "Carta solicitud", 4: "Autorización interna", 5: "Supervisada", 6: "Restringida", 7: "Sin condiciones", 8: "Otra" } },
        51: { pregunta: "Servicios educativos", opciones: { 1: "Cursos", 2: "Talleres", 3: "Conferencias", 4: "Visitas guiadas", 5: "Otros", 99: "Ninguno" } },
        52: { pregunta: "Mecanismos de difusión", opciones: { 1: "Exposiciones", 2: "Prensa", 3: "Publicaciones", 4: "Venta obra", 5: "Redes sociales", 6: "Otros", 99: "Ninguno" } },
        53: { pregunta: "Estudios de usuarios/satisfacción", opciones: { 1: "No se realizan", 2: "Esporádica", 3: "Anualmente" } },
        54: { pregunta: "RÚBRICA: SERVICIOS AL PÚBLICO", opciones: { 1: "Incipiente", 2: "Básico estructural", 3: "Intermedio", 4: "Consolidado", 5: "Avanzado" } }
    };

    try {
        const [instRows] = await db.query('SELECT id_institucion FROM instituciones WHERE id_usuario = ?', [id_usuario]);
        if (instRows.length === 0) return res.status(404).json({ error: "Institución no encontrada" });
        const idInstitucion = instRows[0].id_institucion;

        // --- 2. OBTENER RESPUESTAS Y PUNTAJES ---
        // (Modificamos la consulta para traer también los 'puntos_otorgados')
        const queryRespuestas = `
            SELECT id_pregunta, respuesta_texto, id_opcion_seleccionada AS id_opcion, puntos_otorgados FROM respuestas WHERE id_institucion = ?
            UNION ALL
            SELECT id_pregunta, NULL AS respuesta_texto, id_opcion, puntos_otorgados FROM respuestas_multiples WHERE id_institucion = ?
            UNION ALL
            SELECT id_pregunta_matriz AS id_pregunta, NULL AS respuesta_texto, valor AS id_opcion, 0 AS puntos_otorgados FROM respuestas_matriz WHERE id_institucion = ?
        `;
        const [respuestasRaw] = await db.query(queryRespuestas, [idInstitucion, idInstitucion, idInstitucion]);

        if (respuestasRaw.length === 0) return res.status(400).json({ error: "No hay respuestas." });

        // Calculamos los puntos totales por sección para el semáforo
        const puntosPorSeccion = { 1:0, 2:0, 3:0, 4:0, 5:0 };
        const respuestasAgrupadas = { 1: [], 2: [], 3: [], 4: [], 5: [] };

        respuestasRaw.forEach(r => {
            const numSec = identificarSeccion(r.id_pregunta); 
            
            // Sumar puntos
            const pts = parseInt(r.puntos_otorgados) || 0;
            if (puntosPorSeccion[numSec] !== undefined) puntosPorSeccion[numSec] += pts;

            // Traducir texto
            const infoPregunta = DICCIONARIO[r.id_pregunta] || { pregunta: `Pregunta ID ${r.id_pregunta}`, opciones: {} };
            let textoRespuesta = r.respuesta_texto || "";
            if (r.id_opcion !== null && r.id_opcion !== undefined) {
                const textoOpcion = infoPregunta.opciones[r.id_opcion] || `ID: ${r.id_opcion}`;
                textoRespuesta = textoRespuesta ? `${textoOpcion} (${textoRespuesta})` : textoOpcion;
            }

            if (textoRespuesta.trim() !== "" && numSec >= 1 && numSec <= 9) {
                respuestasAgrupadas[numSec].push(`- ${infoPregunta.pregunta}: ${textoRespuesta}`);
            }
        });

        // Sumar bono a la Sección 2 si aplica (Igual que en tu código original)
        const sqlBono = `SELECT COUNT(*) as c FROM respuestas WHERE id_institucion=? AND id_pregunta IN (14,15) AND respuesta_texto IS NOT NULL AND respuesta_texto != ''`;
        const [rowsBono] = await db.query(sqlBono, [idInstitucion]);
        if(rowsBono[0].c === 2) puntosPorSeccion[2] += 1;

        // --- 3. ARMAR EL CONTEXTO INYECTANDO EL SEMÁFORO ---
        let contextoParaIA = "A continuación, las respuestas del diagnóstico por sección y su nivel de desempeño matemático:\n\n";
        
        for (let i = 1; i <= 5; i++) {
            if (respuestasAgrupadas[i].length > 0) {
                // Cálculo matemático
                const ptsObtenidos = puntosPorSeccion[i];
                const ptsMaximos = MAXIMOS_SECCION[i] || 1;
                const porcentaje = (i === 1) ? 100 : Math.round((ptsObtenidos / ptsMaximos) * 100);
                
                // Determinar el "Tono" que debe usar la IA
                let tonoIA = "";
                if (i === 1) {
                    tonoIA = "INFORMATIVA (Solo resume brevemente, sin juzgar).";
                } else if (porcentaje >= 80) {
                    tonoIA = `CONSOLIDADO (${porcentaje}%). El tono debe ser de felicitación y confirmación de buenas prácticas.`;
                } else if (porcentaje >= 50) {
                    tonoIA = `EN DESARROLLO (${porcentaje}%). El tono debe ser neutral-constructivo. Tienen algunas cosas bien, pero necesitan mejorar.`;
                } else {
                    tonoIA = `ATENCIÓN PRIORITARIA (${porcentaje}%). El tono debe ser de advertencia constructiva. Su puntaje es muy bajo. Señala las deficiencias críticas y urge tomar medidas.`;
                }

                contextoParaIA += `[Sección ${i}] -> RESULTADO MATEMÁTICO: ${tonoIA}\nRespuestas dadas por la institución:\n${respuestasAgrupadas[i].join('\n')}\n\n`;
            }
        }

        // =========================================================
        // 🖨️ IMPRIMIR REPORTE EN LA TERMINAL (Para depuración)
        // =========================================================
        console.log(`\n📊 [PUNTAJES ENVIADOS A GEMINI - USUARIO ${id_usuario}]`);
        for (let i = 1; i <= 5; i++) {
            const ptsObtenidos = puntosPorSeccion[i] || 0;
            const ptsMaximos = MAXIMOS_SECCION[i] || 1;
            const porcentaje = (i === 1) ? 100 : Math.round((ptsObtenidos / ptsMaximos) * 100);
            
            // Un pequeño semáforo visual para la terminal
            let icono = porcentaje >= 80 ? '🟢' : (porcentaje >= 50 ? '🟡' : '🔴');
            //if (i === 1) icono = '🔵'; 

            console.log(`   ${icono} Sección ${i}: ${ptsObtenidos}/${ptsMaximos} pts (${porcentaje}%)`);
        }
        console.log("---------------------------------------------------\n");

        // --- 4. LLAMADA A GEMINI CON INSTRUCCIONES ESTRICTAS ---
        if (!process.env.GEMINI_API_KEY) throw new Error("Falta GEMINI_API_KEY");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Actúa como un consultor experto. Analiza estos resultados de un diagnóstico institucional.
        
        INFORMACIÓN IMPORTANTE: 
        Para cada sección, te he proporcionado el "RESULTADO MATEMÁTICO" (Consolidado, En Desarrollo o Atención Prioritaria).
        TU ANÁLISIS DEBE COINCIDIR ESTRICTAMENTE CON ESE TONO. 
        Si el resultado es "Atención Prioritaria", no los felicites aunque tengan posgrados o herramientas aisladas; enfócate en advertir por qué su desempeño global en esa sección fue deficiente y qué les falta.
        
        ${contextoParaIA}
        
        Genera un JSON con esta estructura exacta:
        {
          "resumen_general": "Un párrafo de MÁXIMO 40 PALABRAS. Comienza agradeciendo la participación y luego resume el estado global con una fortaleza y el riesgo más grande.",
          "secciones": {
            "1": "Máximo 20 palabras adaptadas a su Resultado Matemático.",
            "2": "Máximo 20 palabras adaptadas a su Resultado Matemático.",
            "3": "Máximo 20 palabras adaptadas a su Resultado Matemático.",
            "4": "Máximo 20 palabras adaptadas a su Resultado Matemático.",
            "5": "Máximo 20 palabras adaptadas a su Resultado Matemático."
          }
        }
        
        REGLAS ESTRICTAS: 
        1. No uses Markdown, devuelve SOLO el objeto JSON puro.
        2. ESTÁ ESTRICTAMENTE PROHIBIDO mencionar porcentajes (ej. 0%, 50%), números de calificación, o decir las frases "Atención Prioritaria", "En Desarrollo" o "Consolidado" en tu redacción. Usa esa información ÚNICAMENTE en tu mente para adaptar el tono del texto de forma natural y humana.
        `;

        const result = await model.generateContent(prompt);
        const jsonLimpio = result.response.text().replace(/```json/gi, '').replace(/```/gi, '').trim();
        const analisisParseado = JSON.parse(jsonLimpio);

        await db.query('UPDATE instituciones SET analisis_ia = ? WHERE id_institucion = ?', [JSON.stringify(analisisParseado), idInstitucion]);
        res.json({ message: "Análisis sincronizado generado y guardado." });

    } catch (error) {
        console.error("❌ ERROR GEMINI:", error);
        res.status(500).json({ error: "Error interno en la IA" });
    }
});

// =========================================================
//Verificación de correo electrónico con código de 6 dígitos
// =========================================================

app.post('/auth/registro', async (req, res) => {
    const { institucion, nombre, email, password, ubicacion, latitud, longitud, tipo_institucion, adscripcion } = req.body;

    try {
        // 1. Generar código de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Insertar usuario con el código y verificado = 0
        await db.query(
            `INSERT INTO usuarios_registrados 
            (institucion_procedencia, nombre_completo, email, password, ubicacion_texto, latitud, longitud, tipo_institucion, adscripcion, codigo_verificacion, correo_verificado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [institucion, nombre, email, password, ubicacion, latitud, longitud, tipo_institucion, adscripcion, codigo]
        );

        // 3. Enviar el correo con el código
        const mailOptions = {
            from: `"Sistema de Diagnóstico" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Código de Verificación',
            html: `
                <div style="font-family: sans-serif; text-align: center;">
                    <h2>¡Ya casi terminas!</h2>
                    <p>Ingresa el siguiente código en la página de registro para activar tu cuenta:</p>
                    <h1 style="color: #7c1225; letter-spacing: 5px;">${codigo}</h1>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Registro exitoso. Código enviado." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar o enviar el correo." });
    }
});



app.post('/auth/verificar-codigo', async (req, res) => {
    const { email, codigo } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT id, nombre_completo FROM usuarios_registrados WHERE email = ? AND codigo_verificacion = ?',
            [email, codigo]
        );

        if (rows.length > 0) {
            const usuario = rows[0];

            // 1. Activamos la cuenta
            await db.query(
                'UPDATE usuarios_registrados SET correo_verificado = 1, codigo_verificacion = NULL WHERE id = ?',
                [usuario.id]
            );

            // ==========================================
            // 🔥 SOLUCIÓN 1: CREAR EL EXPEDIENTE INSTITUCIONAL
            // ==========================================
            // Revisamos que no exista ya para evitar duplicados
            const [existeInst] = await db.query('SELECT id_institucion FROM instituciones WHERE id_usuario = ?', [usuario.id]);
            
            if (existeInst.length === 0) {
                await db.query(
                    'INSERT INTO instituciones (id_usuario, nombre_usuario) VALUES (?, ?)', 
                    [usuario.id, usuario.nombre_completo]
                );
            }

            res.json({ success: true, message: "Cuenta verificada." });
        } else {
            res.status(400).json({ success: false, error: "Código incorrecto." });
        }
    } catch (error) {
        console.error("Error al verificar código:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
});

// ==========================
// 5. INICIAR SERVIDOR
// ==========================
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://172.17.175.137:${PORT}`);
    console.log(`   Esperando peticiones...`);
});