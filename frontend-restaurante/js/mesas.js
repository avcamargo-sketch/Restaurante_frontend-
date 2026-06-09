const mesasSection = document.getElementById('mesasSection');
const mesasContent = document.getElementById('mesasContent');
const mesaForm = document.getElementById('mesaForm');
const mesaFormElement = document.forms['mesaForm'];

// Mostrar sección de mesas
function mostrarMesas() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('reservasSection').style.display = 'none';
    document.getElementById('productosSection').style.display = 'none';
    document.getElementById('pedidosSection').style.display = 'none';
    mesasSection.style.display = 'block';
    consultarMesas();
}

// Consultar mesas
async function consultarMesas() {
    try {
        const response = await fetch(`${API_RESERVAS}/mesas`);
        const mesas = await response.json();
        
        if (mesas.length === 0) {
            mesasContent.innerHTML = '<p>No hay mesas registradas</p>';
            return;
        }
        
        let html = '<table><thead><tr><th>Número</th><th>Capacidad</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
        
        mesas.forEach(mesa => {
            html += `
                <tr>
                    <td>${mesa.numero}</td>
                    <td>${mesa.capacidad}</td>
                    <td>${mesa.estado}</td>
                    <td>
                        <button onclick="editarMesa(${mesa.id})">Editar</button>
                        <button onclick="cambiarEstadoMesa(${mesa.id})">Estado</button>
                        <button onclick="eliminarMesa(${mesa.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        mesasContent.innerHTML = html;
        
    } catch (error) {
        console.error(error);
        showMsg('Error al consultar mesas');
    }
}

// Mostrar formulario de mesa
function mostrarFormMesa() {
    mesaForm.style.display = 'block';
    mesaFormElement.reset();
    mesaFormElement['id'].value = '';
    document.getElementById('mesaFormTitle').textContent = 'Nueva Mesa';
}

// Cancelar formulario
function cancelarMesa() {
    mesaForm.style.display = 'none';
    mesaFormElement.reset();
}

// Guardar mesa (crear o editar)
mesaFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const id = mesaFormElement['id'].value;
    const data = {
        numero: mesaFormElement['numero'].value,
        capacidad: parseInt(mesaFormElement['capacidad'].value),
        estado: mesaFormElement['estado'].value
    };
    
    try {
        const url = id ? `${API_RESERVAS}/mesa/${id}` : `${API_RESERVAS}/mesa`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.status === 200 || response.status === 201) {
            showMsg(id ? 'Mesa actualizada' : 'Mesa creada');
            cancelarMesa();
            consultarMesas();
        } else {
            showMsg(result.msg || 'Error al guardar');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión');
    }
});

// Editar mesa
async function editarMesa(id) {
    try {
        const response = await fetch(`${API_RESERVAS}/mesa/${id}`);
        const mesa = await response.json();
        
        if (response.status === 200) {
            mesaFormElement['id'].value = mesa.id;
            mesaFormElement['numero'].value = mesa.numero;
            mesaFormElement['capacidad'].value = mesa.capacidad;
            mesaFormElement['estado'].value = mesa.estado;
            
            document.getElementById('mesaFormTitle').textContent = 'Editar Mesa';
            mesaForm.style.display = 'block';
        }
    } catch (error) {
        console.error(error);
        showMsg('Error al cargar mesa');
    }
}

// Cambiar estado de mesa
async function cambiarEstadoMesa(id) {
    const estado = prompt('Nuevo estado (disponible, reservada, ocupada, fuera_servicio):');
    if (!estado) return;
    
    try {
        const response = await fetch(`${API_RESERVAS}/mesa/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: estado })
        });
        
        const result = await response.json();
        
        if (response.status === 200) {
            showMsg('Estado actualizado');
            consultarMesas();
        } else {
            showMsg(result.msg || 'Error al cambiar estado');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión');
    }
}

// Eliminar mesa
async function eliminarMesa(id) {
    if (!confirm('¿Eliminar esta mesa?')) return;
    
    try {
        const response = await fetch(`${API_RESERVAS}/mesa/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.status === 200) {
            showMsg('Mesa eliminada');
            consultarMesas();
        } else {
            showMsg(result.msg || 'Error al eliminar');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión');
    }
}