const reservasSection = document.getElementById('reservasSection');
const reservasContent = document.getElementById('reservasContent');
const reservaForm = document.getElementById('reservaForm');
const reservaFormElement = document.forms['reservaForm'];

// Mostrar sección de reservas
function mostrarReservas() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('mesasSection').style.display = 'none';
    document.getElementById('productosSection').style.display = 'none';
    document.getElementById('pedidosSection').style.display = 'none';
    reservasSection.style.display = 'block';
    consultarReservas();
}

// Consultar reservas
async function consultarReservas() {
    try {
        const response = await fetch(`${API_RESERVAS}/reservas`);
        const reservas = await response.json();
        
        if (reservas.length === 0) {
            reservasContent.innerHTML = '<p>No hay reservas registradas</p>';
            return;
        }
        
        let html = '<table><thead><tr><th>Cliente</th><th>Teléfono</th><th>Fecha</th><th>Hora</th><th>Mesa</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
        
        reservas.forEach(reserva => {
            html += `
                <tr>
                    <td>${reserva.nombre_cliente}</td>
                    <td>${reserva.telefono_cliente}</td>
                    <td>${reserva.fecha}</td>
                    <td>${reserva.hora}</td>
                    <td>${reserva.mesa_id}</td>
                    <td>${reserva.estado}</td>
                    <td>
                        <button onclick="editarReserva(${reserva.id})">Editar</button>
                        <button onclick="cancelarReservaEstado(${reserva.id})">Cancelar</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        reservasContent.innerHTML = html;
        
    } catch (error) {
        console.error(error);
        showMsg('Error al consultar reservas');
    }
}

// Mostrar formulario de reserva
function mostrarFormReserva() {
    reservaForm.style.display = 'block';
    reservaFormElement.reset();
    reservaFormElement['id'].value = '';
    document.getElementById('reservaFormTitle').textContent = 'Nueva Reserva';
    cargarMesasSelect();
}

// Cancelar formulario
function cancelarReserva() {
    reservaForm.style.display = 'none';
    reservaFormElement.reset();
}

// Cargar mesas en select
async function cargarMesasSelect() {
    try {
        const response = await fetch(`${API_RESERVAS}/mesas`);
        const mesas = await response.json();
        
        const select = reservaFormElement['mesa_id'];
        select.innerHTML = '';
        
        mesas.forEach(mesa => {
            if (mesa.estado === 'disponible') {
                const option = document.createElement('option');
                option.value = mesa.id;
                option.textContent = `${mesa.numero} (Capacidad: ${mesa.capacidad})`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// Guardar reserva
reservaFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // VALIDACIONES
    const nombreCliente = reservaFormElement['nombre_cliente'].value.trim();
    const telefono = reservaFormElement['telefono_cliente'].value.trim();
    const cantidadPersonas = parseInt(reservaFormElement['cantidad_personas'].value);
    const fecha = reservaFormElement['fecha'].value;
    const hora = reservaFormElement['hora'].value;
    
    if (nombreCliente === '') {
        showMsg('El nombre del cliente no puede estar vacío');
        return;
    }
    
    if (telefono === '') {
        showMsg('El teléfono no puede estar vacío');
        return;
    }
    
    if (isNaN(cantidadPersonas) || cantidadPersonas < 1) {
        showMsg('La cantidad de personas debe ser mayor a cero');
        return;
    }
    
    // Validar fecha no sea pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaReserva = new Date(fecha);
    
    if (fechaReserva < hoy) {
        showMsg('No se pueden hacer reservas en fechas pasadas');
        return;
    }
    
    if (hora === '') {
        showMsg('Debe seleccionar una hora');
        return;
    }
    
    const id = reservaFormElement['id'].value;
    const data = {
        nombre_cliente: nombreCliente,
        telefono_cliente: telefono,
        cantidad_personas: cantidadPersonas,
        fecha: fecha,
        hora: hora,
        mesa_id: parseInt(reservaFormElement['mesa_id'].value),
        observaciones: reservaFormElement['observaciones'].value
    };
    
    try {
        const url = id ? `${API_RESERVAS}/reserva/${id}` : `${API_RESERVAS}/reserva`;
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
            showMsg(id ? 'Reserva actualizada' : 'Reserva creada');
            cancelarReserva();
            consultarReservas();
        } else {
            showMsg(result.msg || 'Error al guardar');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión');
    }
});

// Editar reserva
async function editarReserva(id) {
    try {
        const response = await fetch(`${API_RESERVAS}/reserva/${id}`);
        const reserva = await response.json();
        
        if (response.status === 200) {
            reservaFormElement['id'].value = reserva.id;
            reservaFormElement['nombre_cliente'].value = reserva.nombre_cliente;
            reservaFormElement['telefono_cliente'].value = reserva.telefono_cliente;
            reservaFormElement['cantidad_personas'].value = reserva.cantidad_personas;
            reservaFormElement['fecha'].value = reserva.fecha;
            reservaFormElement['hora'].value = reserva.hora;
            reservaFormElement['mesa_id'].value = reserva.mesa_id;
            reservaFormElement['observaciones'].value = reserva.observaciones || '';
            
            document.getElementById('reservaFormTitle').textContent = 'Editar Reserva';
            reservaForm.style.display = 'block';
            cargarMesasSelect();
        }
    } catch (error) {
        console.error(error);
        showMsg('Error al cargar reserva');
    }
}

// Cancelar reserva (cambiar estado)
async function cancelarReservaEstado(id) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    
    try {
        const response = await fetch(`${API_RESERVAS}/reserva/${id}/cancelar`, {
            method: 'PUT'
        });
        
        const result = await response.json();
        
        if (response.status === 200) {
            showMsg('Reserva cancelada');
            consultarReservas();
        } else {
            showMsg(result.msg || 'Error al cancelar');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión');
    }
}