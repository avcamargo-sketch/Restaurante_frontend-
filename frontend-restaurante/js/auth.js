// Variables globales
let token = localStorage.getItem('token') || null;

// Referencias al DOM
const loginSection = document.getElementById('loginSection');
const menuSection = document.getElementById('menuSection');
const loginForm = document.forms['loginForm'];

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

function mostrarLogin() {
    loginSection.style.display = 'block';
    menuSection.style.display = 'none';
    document.getElementById('mesasSection').style.display = 'none';
    document.getElementById('reservasSection').style.display = 'none';
    document.getElementById('productosSection').style.display = 'none';
    document.getElementById('pedidosSection').style.display = 'none';
    
    if (document.getElementById('mesaForm')) {
        document.getElementById('mesaForm').style.display = 'none';
    }
    if (document.getElementById('reservaForm')) {
        document.getElementById('reservaForm').style.display = 'none';
    }
    if (document.getElementById('productoForm')) {
        document.getElementById('productoForm').style.display = 'none';
    }
    if (document.getElementById('pedidoForm')) {
        document.getElementById('pedidoForm').style.display = 'none';
    }
}

function mostrarMenu() {
    loginSection.style.display = 'none';
    menuSection.style.display = 'block';
}

// ============================================
// VALIDACIÓN DE SESIÓN
// ============================================

async function validarSesion() {
    if (!token) {
        mostrarLogin();
        return;
    }
    
    try {
        const response = await fetch(`${API_AUTH}/validar`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            mostrarMenu();
        } else {
            console.log('Token inválido, cerrando sesión...');
            await cerrarSesionSilenciosa();
            mostrarLogin();
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarLogin();
    }
}

async function cerrarSesionSilenciosa() {
    try {
        await fetch(`${API_AUTH}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        // Ignorar errores de conexión
    }
    
    token = null;
    localStorage.removeItem('token');
}

// ============================================
// LOGIN CORREGIDO - ACEPTA USUARIO O CORREO
// ============================================

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const usuarioInput = loginForm['usuario'].value.trim();
    const contrasena = loginForm['contrasena'].value;
    
    // Detectar si es correo o usuario
    const esCorreo = usuarioInput.includes('@');
    
    const data = esCorreo 
        ? { correo: usuarioInput, contrasena: contrasena }
        : { usuario: usuarioInput, contrasena: contrasena };
    
    try {
        const response = await fetch(`${API_AUTH}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.status === 200) {
            token = result.token;
            localStorage.setItem('token', token);
            showMsg(`¡Bienvenido ${result.nombre}!`);
            mostrarMenu();
        } else {
            showMsg(result.msg || 'Credenciales incorrectas');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión con el servidor');
    }
});

// ============================================
// OTRAS FUNCIONES
// ============================================

function volverMenu() {
    document.getElementById('mesasSection').style.display = 'none';
    document.getElementById('reservasSection').style.display = 'none';
    document.getElementById('productosSection').style.display = 'none';
    document.getElementById('pedidosSection').style.display = 'none';
    
    if (document.getElementById('mesaForm')) {
        document.getElementById('mesaForm').style.display = 'none';
    }
    if (document.getElementById('reservaForm')) {
        document.getElementById('reservaForm').style.display = 'none';
    }
    if (document.getElementById('productoForm')) {
        document.getElementById('productoForm').style.display = 'none';
    }
    if (document.getElementById('pedidoForm')) {
        document.getElementById('pedidoForm').style.display = 'none';
    }
    
    document.getElementById('menuSection').style.display = 'block';
}

async function cerrarSesion() {
    try {
        await fetch(`${API_AUTH}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error(error);
    }
    
    token = null;
    localStorage.removeItem('token');
    loginSection.style.display = 'block';
    menuSection.style.display = 'none';
    
    document.getElementById('mesasSection').style.display = 'none';
    document.getElementById('reservasSection').style.display = 'none';
    document.getElementById('productosSection').style.display = 'none';
    document.getElementById('pedidosSection').style.display = 'none';
    
    loginForm.reset();
    showMsg('Sesión cerrada');
}

// Verificar sesión al cargar
if (token) {
    validarSesion();
} else {
    mostrarLogin();
}