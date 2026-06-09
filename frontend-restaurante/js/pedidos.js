const pedidosSection = document.getElementById('pedidosSection');
const pedidosContent = document.getElementById('pedidosContent');
const pedidoForm = document.getElementById('pedidoForm');
const pedidoFormElement = document.forms['pedidoForm'];

// Mostrar sección de pedidos
function mostrarPedidos() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('mesasSection').style.display = 'none';
    document.getElementById('reservasSection').style.display = 'none';
    document.getElementById('productosSection').style.display = 'none';
    pedidosSection.style.display = 'block';
    consultarPedidos();
}

// Consultar pedidos
async function consultarPedidos() {
    try {
        const response = await fetch(`${API_PEDIDOS}/pedidos`);
        const pedidos = await response.json();
        
        if (pedidos.length === 0) {
            pedidosContent.innerHTML = '<p>No hay pedidos registrados</p>';
            return;
        }
        
        let html = '<div class="table-container"><table><thead><tr><th>Mesa</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
        
        pedidos.forEach(pedido => {
            html += `
                <tr>
                    <td>${pedido.mesa_id}</td>
                    <td>${pedido.fecha} ${pedido.hora}</td>
                    <td>$${pedido.total}</td>
                    <td>${pedido.estado}</td>
                    <td>
                        <button onclick="verPedido(${pedido.id})">Ver</button>
                        <button onclick="cambiarEstadoPedido(${pedido.id})">Estado</button>
                    </td>
                </tr>
            `;
        });
        
     html += '</tbody></table></div>';
     pedidosContent.innerHTML = html;
        
    } catch (error) {
        console.error(error);
        showMsg('Error al consultar pedidos');
    }
}

// Mostrar formulario de pedido
async function mostrarFormPedido() {
    pedidoForm.style.display = 'block';
    pedidoFormElement.reset();
    await cargarMesasPedido();
    await cargarProductosPedido();
}

// Cancelar formulario
function cancelarPedido() {
    pedidoForm.style.display = 'none';
    pedidoFormElement.reset();
    
    // Resetear productos a solo uno
    const container = document.getElementById('productosPedido');
    container.innerHTML = `
        <h4>Productos</h4>
        <div class="producto-item">
            <select class="producto-select"></select>
            <input type="number" class="cantidad" value="1" min="1">
            <button type="button" onclick="agregarProductoPedido()">+</button>
        </div>
    `;
}

// Cargar mesas en select (solo ocupadas o reservadas)
async function cargarMesasPedido() {
    try {
        const response = await fetch(`${API_RESERVAS}/mesas`);
        const mesas = await response.json();
        
        const select = pedidoFormElement['mesa_id'];
        select.innerHTML = '';
        
        let mesasValidas = 0;
        mesas.forEach(mesa => {
            if (mesa.estado === 'ocupada' || mesa.estado === 'reservada') {
                const option = document.createElement('option');
                option.value = mesa.id;
                option.textContent = `${mesa.numero} (${mesa.estado})`;
                select.appendChild(option);
                mesasValidas++;
            }
        });
        
        if (mesasValidas === 0) {
            showMsg('No hay mesas ocupadas o reservadas disponibles');
        }
    } catch (error) {
        console.error(error);
    }
}

// Cargar productos en select
async function cargarProductosPedido() {
    try {
        const response = await fetch(`${API_PRODUCTOS}/productos`);
        const productos = await response.json();
        
        const selects = document.querySelectorAll('.producto-select');
        selects.forEach(select => {
            select.innerHTML = '';
            productos.forEach(producto => {
                if (producto.disponible) {
                    const option = document.createElement('option');
                    option.value = producto.id;
                    option.textContent = `${producto.nombre} ($${producto.precio})`;
                    option.dataset.precio = producto.precio;
                    option.dataset.nombre = producto.nombre;
                    select.appendChild(option);
                }
            });
        });
    } catch (error) {
        console.error(error);
    }
}

// Agregar producto al pedido
function agregarProductoPedido() {
    const div = document.createElement('div');
    div.className = 'producto-item';
    div.innerHTML = `
        <select class="producto-select"></select>
        <input type="number" class="cantidad" value="1" min="1">
        <button type="button" onclick="this.parentElement.remove()">-</button>
    `;
    document.getElementById('productosPedido').appendChild(div);
    cargarProductosPedido();
}

// Guardar pedido
pedidoFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // VALIDACIONES
    const mesaId = pedidoFormElement['mesa_id'].value;
    if (!mesaId) {
        showMsg('Debe seleccionar una mesa');
        return;
    }
    
    const items = document.querySelectorAll('.producto-item');
    if (items.length === 0) {
        showMsg('El pedido debe tener al menos un producto');
        return;
    }
    
    const productos = [];
    
    for (const item of items) {
        const select = item.querySelector('.producto-select');
        const cantidad = item.querySelector('.cantidad');
        const option = select.options[select.selectedIndex];
        
        const cantidadValor = parseInt(cantidad.value);
        
        if (isNaN(cantidadValor) || cantidadValor < 1) {
            showMsg('La cantidad debe ser mayor o igual a uno');
            return;
        }
        
        productos.push({
            producto_id: parseInt(select.value),
            nombre_producto: option.dataset.nombre,
            cantidad: cantidadValor,
            precio_unitario: parseFloat(option.dataset.precio)
        });
    }
    
    const data = {
        mesa_id: parseInt(mesaId),
        productos: productos
    };
    
    try {
        const response = await fetch(`${API_PEDIDOS}/pedido`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.status === 201) {
            showMsg('Pedido creado');
            cancelarPedido();
            consultarPedidos();
        } else {
            showMsg(result.msg || 'Error al guardar');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión');
    }
});

// Ver pedido
async function verPedido(id) {
    try {
        const response = await fetch(`${API_PEDIDOS}/pedido/${id}`);
        const pedido = await response.json();
        
        if (response.status === 200) {
            let html = `<h4>Pedido #${pedido.id}</h4>`;
            html += `<p>Mesa: ${pedido.mesa_id}</p>`;
            html += `<p>Total: $${pedido.total}</p>`;
            html += `<p>Estado: ${pedido.estado}</p>`;
            html += '<h5>Productos:</h5><ul>';
            
            pedido.detalles.forEach(detalle => {
                html += `<li>${detalle.nombre_producto} x${detalle.cantidad} = $${detalle.subtotal}</li>`;
            });
            
            html += '</ul>';
            showMsg(html);
        }
    } catch (error) {
        console.error(error);
        showMsg('Error al cargar pedido');
    }
}

// Cambiar estado de pedido
async function cambiarEstadoPedido(id) {
    const estado = prompt('Nuevo estado (pendiente, en_preparacion, entregado, pagado, cancelado):');
    if (!estado) return;
    
    // Validar estado válido
    const estadosValidos = ['pendiente', 'en_preparacion', 'entregado', 'pagado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
        showMsg('Estado no válido');
        return;
    }
    
    try {
        const response = await fetch(`${API_PEDIDOS}/pedido/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: estado })
        });
        
        const result = await response.json();
        
        if (response.status === 200) {
            showMsg('Estado actualizado');
            consultarPedidos();
        } else {
            showMsg(result.msg || 'Error al cambiar estado');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión');
    }
}