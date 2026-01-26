
const API_URL = 'https://api-cuestionario.onrender.com';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('mensajeError');
    const btn = document.querySelector('.btn-login');

    // Limpiar errores previos y estado visual de carga
    errorDiv.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Verificando...';

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // --- LOGIN CORRECTO ---
            
            // 1. Guardar datos básicos de identidad
            localStorage.setItem('nombreUsuario', data.nombre);
            localStorage.setItem('idUsuario', data.userId);

            // 2. Guardar estatus de finalizado (CRUCIAL PARA EL CANDADO)
            // Si data.finalizado es 1, encuesta.js bloqueará la edición.
            localStorage.setItem('encuestaFinalizada', data.finalizado); 

            // 3. Guardar bandera de admin
            if (data.esAdmin) {
                localStorage.setItem('esAdmin', 'true');
            } else {
                localStorage.removeItem('esAdmin');
            }

            // 4. Lógica de Redirección Inteligente
            console.log("Estado Finalizado:", data.finalizado);
            console.log("Redirigiendo por defecto a:", data.redirect);
            
            // SI ya finalizó Y NO es administrador -> Forzar a Sección 1 (Modo Lectura)
            if (data.finalizado === 1 && !data.esAdmin) {
                window.location.href = 'seccion1.html';
            } else {
                // SI no ha finalizado O es admin -> Ir a donde diga el servidor (seccion1 o admin)
                window.location.href = data.redirect; 
            }

        } else {
            // Error de credenciales
            errorDiv.textContent = data.error;
            errorDiv.style.display = 'block';
        }

    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error de conexión con el servidor.';
        errorDiv.style.display = 'block';
    } finally {
        // Restaurar botón
        btn.disabled = false;
        btn.textContent = 'Ingresar';
    }
});
