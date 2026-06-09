# Restaurante_frontend-
# Frontend Restaurante XYZ

Aplicación frontend para la gestión de reservas y pedidos de un restaurante, desarrollada con HTML5, CSS3 y JavaScript Vanilla.

## Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript Vanilla (sin frameworks)

## Estructura del Proyecto
frontend-restaurante/
├── index.html          # Página principal con login y menú
├── css/
│   ├── base.css        # Estilos base de la aplicación
│   └── modals.css      # Estilos de modales/mensajes
├── js/
│   ├── config.js       # Configuración centralizada de APIs
│   ├── modal.js        # Manejo de mensajes modales
│   ├── auth.js         # Autenticación (login/logout)
│   ├── mesas.js        # Gestión de mesas
│   ├── reservas.js     # Gestión de reservas
│   ├── productos.js    # Gestión de productos
│   └── pedidos.js      # Gestión de pedidos
└── README.md           # Este archivo

## APIs Consumidas

| Módulo | URL Base | Endpoints | Métodos |
|--------|----------|-----------|---------|
| **Auth** | http://127.0.0.1:8001 | /login | POST |
| | | /logout | POST |
| | | /validar | GET |
| **Mesas** | http://127.0.0.1:8002 | /mesas | GET |
| | | /mesa | POST |
| | | /mesa/:id | PUT, DELETE |
| | | /mesa/:id/estado | PUT |
| **Reservas** | http://127.0.0.1:8002 | /reservas | GET |
| | | /reserva | POST |
| | | /reserva/:id | PUT |
| | | /reserva/:id/cancelar | PUT |
| **Productos** | http://127.0.0.1:8003 | /productos | GET |
| | | /categorias | GET |
| | | /producto | POST |
| | | /producto/:id | PUT, DELETE |
| **Pedidos** | http://127.0.0.1:8004 | /pedidos | GET |
| | | /pedido | POST |
| | | /pedido/:id | GET |
| | | /pedido/:id/estado | PUT |

## Funcionalidades Implementadas

### Autenticación
- Login con usuario/correo y contraseña
- Almacenamiento de token en localStorage
- Validación de sesión activa
- Cierre de sesión

### Mesas
- Listar mesas con número, capacidad y estado
- Crear nueva mesa
- Editar mesa (capacidad y estado)
- Cambiar estado (disponible, reservada, ocupada, fuera de servicio)
- Eliminar mesa

### Reservas
- Listar reservas con cliente, fecha, hora y mesa
- Crear nueva reserva (solo mesas disponibles)
- Editar reserva
- Cancelar reserva
- Validaciones: fecha no pasada, capacidad > 0

### Productos
- Listar productos con nombre, precio y categoría
- Crear nuevo producto
- Editar producto
- Eliminar producto
- Validaciones: precio > 0, nombre no vacío

### Pedidos
- Listar pedidos con mesa, fecha, total y estado
- Crear pedido (seleccionar mesa ocupada/reservada + productos)
- Ver detalle de pedido
- Cambiar estado (pendiente, en_preparacion, entregado, pagado, cancelado)
- Validaciones: al menos un producto, cantidad >= 1

## Validaciones en Cliente

- Campos obligatorios (HTML5 required)
- Capacidad de mesa > 0
- Precio de producto > 0
- Fecha de reserva no pasada
- Cantidad de personas > 0
- Pedido con al menos un producto
- Cantidad de productos >= 1

## Ejecución

### Requisitos Previos
- Backend ejecutándose en puertos 8001-8004
- Navegador moderno con soporte ES6

### Pasos
1. Iniciar los microservicios backend:
   - ms-auth: `php -S 127.0.0.1:8001`
   - ms-reservas: `php -S 127.0.0.1:8002`
   - ms-productos: `php -S 127.0.0.1:8003`
   - ms-pedidos: `php -S 127.0.0.1:8004`

2. Abrir frontend con Live Server en VS Code:
   - Click derecho en `index.html` → "Open with Live Server"

3. Acceder con credenciales:
   - Usuario: `admin`
   - Contraseña: `admin123`

## Notas

- La comunicación entre frontend y backend se realiza mediante fetch API
- Los tokens de sesión se almacenan en localStorage
- No se utiliza jQuery ni frameworks frontend
- Los estilos son responsive y adaptables