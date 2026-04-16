
const API_URL = 'https://api-cuestionario.onrender.com';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('mensajeError');
    const btn = document.querySelector('.btn-login');

    if (!email || !password) {
        if(errorDiv) {
            errorDiv.textContent = 'Por favor ingresa tu correo y contraseña.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    // Limpiar errores previos y estado visual de carga
    if(errorDiv) errorDiv.style.display = 'none';
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
            // ==========================================
            // 🟢 LOGIN CORRECTO (Validado y Verificado)
            // ==========================================
            
            // 1. Guardar datos básicos de identidad
            localStorage.setItem('nombreUsuario', data.nombre);
            localStorage.setItem('idUsuario', data.userId);

            // 2. Guardar estatus de finalizado (CRUCIAL PARA EL CANDADO)
            localStorage.setItem('encuestaFinalizada', data.finalizado || 0); 

            // 3. Guardar bandera de admin
            if (data.esAdmin) {
                localStorage.setItem('esAdmin', 'true');
            } else {
                localStorage.removeItem('esAdmin');
            }

            console.log("Estado Finalizado:", data.finalizado);
            
            // 4. Lógica de Redirección Inteligente
            if (data.finalizado === 1 && !data.esAdmin) {
                window.location.href = 'seccion1.html';
            } else {
                window.location.href = data.redirect; 
            }

        } else {
            // ==========================================
            // 🔴 LOGIN FALLIDO
            // ==========================================
            
            // Caso A: El usuario no ha verificado su correo
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
                        pedirCodigoVerificacion(data.email);
                    }
                });
            } 
            // Caso B: Credenciales incorrectas u otros errores
            else {
                if(errorDiv) {
                    errorDiv.textContent = data.error || 'Error al iniciar sesión';
                    errorDiv.style.display = 'block';
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.error, confirmButtonColor: '#7c1225' });
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
        if(errorDiv) {
            errorDiv.textContent = 'Error de conexión con el servidor.';
            errorDiv.style.display = 'block';
        } else {
            Swal.fire({ icon: 'error', title: 'Error de red', text: 'No se pudo conectar con el servidor.', confirmButtonColor: '#7c1225' });
        }
    } finally {
        // Restaurar botón siempre al final del proceso
        btn.disabled = false;
        btn.textContent = 'Ingresar';
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
        Swal.fire({
            icon: 'success',
            title: '¡Cuenta Activada!',
            text: 'Tu cuenta ha sido verificada. Vuelve a iniciar sesión.',
            confirmButtonColor: '#7c1225'
        }).then(() => {
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        });
    }
}