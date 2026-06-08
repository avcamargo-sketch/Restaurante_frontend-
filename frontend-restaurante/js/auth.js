// URL del microservicio de autenticación
const API_AUTH = 'http://127.0.0.1:8001';

// Variables globales
let token = localStorage.getItem('token') || null;

// Referencias al DOM
const loginSection = document.getElementById('loginSection');
const menuSection = document.getElementById('menuSection');
const loginForm = document.forms['loginForm'];

// Verificar si hay sesión activa al cargar
if (token) {
    validarSesion();
}

// Evento de login
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const usuario = loginForm['usuario'].value;
    const contrasena = loginForm['contrasena'].value;
    
    try {
        const response = await fetch(`${API_AUTH}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: usuario,
                contrasena: contrasena
            })
        });
        
        const data = await response.json();
        
        if (response.status === 200) {
            token = data.token;
            localStorage.setItem('token', token);
            showMsg(`¡Bienvenido ${data.nombre}!`);
            mostrarMenu();
        } else {
            showMsg(data.msg || 'Error en login');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión con el servidor');
    }
});

// Validar sesión
async function validarSesion() {
    try {
        const response = await fetch(`${API_AUTH}/validar`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            mostrarMenu();
        } else {
            cerrarSesion();
        }
    } catch (error) {
        console.error(error);
        cerrarSesion();
    }
}

// Mostrar menú principal
function mostrarMenu() {
    loginSection.style.display = 'none';
    menuSection.style.display = 'block';
}

// Cerrar sesión
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
    loginForm.reset();
    showMsg('Sesión cerrada');
}

// Funciones para mostrar módulos (placeholder)
function mostrarMesas() {
    showMsg('Módulo de Mesas - En construcción');
}

function mostrarReservas() {
    showMsg('Módulo de Reservas - En construcción');
}

function mostrarProductos() {
    showMsg('Módulo de Productos - En construcción');
}

function mostrarPedidos() {
    showMsg('Módulo de Pedidos - En construcción');
}