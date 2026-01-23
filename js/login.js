document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('mensajeError');
    const btn = document.querySelector('.btn-login');

    // Limpiar errores previos
    errorDiv.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Verificando...';

    try {
        // Asegúrate de que la IP sea la correcta
        const response = await fetch('http://172.17.175.137:3005/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // --- LOGIN CORRECTO ---
            
            // 1. Guardar datos básicos
            localStorage.setItem('nombreUsuario', data.nombre);
            localStorage.setItem('idUsuario', data.userId);
            
            // 2. Guardar bandera de admin (útil para proteger admin.html)
            if (data.esAdmin) {
                localStorage.setItem('esAdmin', 'true');
            } else {
                localStorage.removeItem('esAdmin'); // Limpiar por seguridad
            }

            // 3. Redirigir (El servidor decide a dónde: admin.html o seccion1.html)
            console.log("Redirigiendo a:", data.redirect);
            window.location.href = data.redirect; 

        } else {
            // Error (contraseña mal, usuario no existe)
            errorDiv.textContent = data.error;
            errorDiv.style.display = 'block';
        }

    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error de conexión con el servidor.';
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Ingresar';
    }
});