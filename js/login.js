
const API_URL = 'https://api-cuestionario.onrender.com';

// =========================================================
// LÓGICA DE INICIO DE SESIÓN
// =========================================================
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Por favor ingresa tu correo y contraseña.', confirmButtonColor: '#7c1225' });
        return;
    }

    try {
        Swal.fire({ title: 'Iniciando sesión...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Login exitoso normal
            localStorage.setItem('idUsuario', data.id_usuario);
            localStorage.setItem('nombreUsuario', data.nombre_completo);
            window.location.href = 'index.html'; 
            
        } else {
            // ❌ Login fallido (Revisamos si es por falta de verificación)
            if (data.requiereVerificacion) {
                Swal.fire({
                    title: 'Cuenta inactiva',
                    text: 'No terminaste de verificar tu correo. Revisa tu bandeja de entrada o spam.',
                    icon: 'warning',
                    confirmButtonText: 'Ingresar código',
                    confirmButtonColor: '#7c1225',
                    showCancelButton: true,
                    cancelButtonText: 'Cerrar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Lanzamos el modal para pedir el código
                        pedirCodigoVerificacion(data.email);
                    }
                });
            } else {
                // Otro error (contraseña incorrecta, no existe, etc.)
                Swal.fire({ icon: 'error', title: 'Error', text: data.error, confirmButtonColor: '#7c1225' });
            }
        }
    } catch (error) {
        console.error("Error en login:", error);
        Swal.fire({ icon: 'error', title: 'Error de red', text: 'No se pudo conectar con el servidor.', confirmButtonColor: '#7c1225' });
    }
});


// =========================================================
// MODAL PARA RESCATAR USUARIOS NO VERIFICADOS
// =========================================================
async function pedirCodigoVerificacion(emailUsuario) {
    const { value: codigo } = await Swal.fire({
        title: 'Verifica tu correo',
        text: `Ingresa el código de 6 dígitos que enviamos a ${emailUsuario}`,
        input: 'text',
        inputPlaceholder: '000000',
        allowOutsideClick: false,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Verificar cuenta',
        confirmButtonColor: '#7c1225',
        showLoaderOnConfirm: true,
        preConfirm: async (codigoIngresado) => {
            try {
                const response = await fetch(`${API_URL}/auth/verificar-codigo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailUsuario, codigo: codigoIngresado })
                });
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Código inválido o caducado.');
                }
                return data;
            } catch (error) {
                Swal.showValidationMessage(`Error: ${error.message}`);
            }
        }
    });

    if (codigo) {
        // Si la verificación fue un éxito
        Swal.fire({
            icon: 'success',
            title: '¡Cuenta Activada!',
            text: 'Tu cuenta ha sido verificada. Vuelve a iniciar sesión.',
            confirmButtonColor: '#7c1225'
        }).then(() => {
            // Limpiamos la contraseña por seguridad para que la vuelva a poner
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        });
    }
}
