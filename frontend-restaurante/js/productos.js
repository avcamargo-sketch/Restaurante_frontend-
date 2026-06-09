const productosSection = document.getElementById('productosSection');
const productosContent = document.getElementById('productosContent');
const productoForm = document.getElementById('productoForm');
const productoFormElement = document.forms['productoForm'];

// Mostrar sección de productos
function mostrarProductos() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('mesasSection').style.display = 'none';
    document.getElementById('reservasSection').style.display = 'none';
    document.getElementById('pedidosSection').style.display = 'none';
    productosSection.style.display = 'block';
    consultarProductos();
}

// Consultar productos
async function consultarProductos() {
    try {
        const response = await fetch(`${API_PRODUCTOS}/productos`);
        const productos = await response.json();
        
        if (productos.length === 0) {
            productosContent.innerHTML = '<p>No hay productos registrados</p>';
            return;
        }
        
       let html = '<div class="table-container"><table><thead><tr><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Disponible</th><th>Acciones</th></tr></thead><tbody>';
        productos.forEach(producto => {
            html += `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>$${producto.precio}</td>
                    <td>${producto.categoria_id}</td>
                    <td>${producto.disponible ? 'Sí' : 'No'}</td>
                    <td>
                        <button onclick="editarProducto(${producto.id})">Editar</button>
                        <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table></div>';
        productosContent.innerHTML = html;
        
    } catch (error) {
        console.error(error);
        showMsg('Error al consultar productos');
    }
}

// Mostrar formulario de producto
function mostrarFormProducto() {
    productoForm.style.display = 'block';
    productoFormElement.reset();
    productoFormElement['id'].value = '';
    document.getElementById('productoFormTitle').textContent = 'Nuevo Producto';
    cargarCategoriasSelect();
}

// Cancelar formulario
function cancelarProducto() {
    productoForm.style.display = 'none';
    productoFormElement.reset();
}

// Cargar categorías en select
async function cargarCategoriasSelect() {
    try {
        const response = await fetch(`${API_PRODUCTOS}/categorias`);
        const categorias = await response.json();
        
        const select = productoFormElement['categoria_id'];
        select.innerHTML = '';
        
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}

// Guardar producto
productoFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // VALIDACIONES
    const nombre = productoFormElement['nombre'].value.trim();
    const precio = parseFloat(productoFormElement['precio'].value);
    
    if (nombre === '') {
        showMsg('El nombre del producto no puede estar vacío');
        return;
    }
    
    if (isNaN(precio) || precio <= 0) {
        showMsg('El precio debe ser mayor a cero');
        return;
    }
    
    const id = productoFormElement['id'].value;
    const data = {
        nombre: nombre,
        descripcion: productoFormElement['descripcion'].value,
        precio: precio,
        categoria_id: parseInt(productoFormElement['categoria_id'].value),
        disponible: productoFormElement['disponible'].value === '1'
    };
    
    try {
        const url = id ? `${API_PRODUCTOS}/producto/${id}` : `${API_PRODUCTOS}/producto`;
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
            showMsg(id ? 'Producto actualizado' : 'Producto creado');
            cancelarProducto();
            consultarProductos();
        } else {
            showMsg(result.msg || 'Error al guardar');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión');
    }
});

// Editar producto
async function editarProducto(id) {
    try {
        const response = await fetch(`${API_PRODUCTOS}/producto/${id}`);
        const producto = await response.json();
        
        if (response.status === 200) {
            productoFormElement['id'].value = producto.id;
            productoFormElement['nombre'].value = producto.nombre;
            productoFormElement['descripcion'].value = producto.descripcion || '';
            productoFormElement['precio'].value = producto.precio;
            productoFormElement['categoria_id'].value = producto.categoria_id;
            productoFormElement['disponible'].value = producto.disponible ? '1' : '0';
            
            document.getElementById('productoFormTitle').textContent = 'Editar Producto';
            productoForm.style.display = 'block';
            cargarCategoriasSelect();
        }
    } catch (error) {
        console.error(error);
        showMsg('Error al cargar producto');
    }
}

// Eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    
    try {
        const response = await fetch(`${API_PRODUCTOS}/producto/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.status === 200) {
            showMsg('Producto eliminado');
            consultarProductos();
        } else {
            showMsg(result.msg || 'Error al eliminar');
        }
    } catch (error) {
        console.error(error);
        showMsg('Error de conexión');
    }
}