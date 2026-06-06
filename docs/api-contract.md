# UdeEat API Contract

Este documento resume los endpoints que la app necesita cuando reemplace los mocks por una DB real.

## Base

- Base URL sugerida: `https://api.udeeat.com`
- Formato: JSON
- Autenticación: `Authorization: Bearer <token>` cuando aplique
- Identificadores: `id` en string

## 1. Restaurantes

### `GET /restaurants`
Devuelve el listado completo de restaurants.

Respuesta:
```json
[
  {
    "id": "parrilla-udea",
    "nombre": "La Parrilla de la UdeA",
    "categoria": "Comida Internacional",
    "rating": 4.8,
    "tiempo": "15-25 min",
    "imagen": "https://...",
    "location": {
      "latitude": 6.2669,
      "longitude": -75.5677,
      "label": "Cerca de la entrada principal de la escuela"
    }
  }
]
```

### `GET /restaurants/:id`
Devuelve el detalle de un restaurant por id.

### `GET /restaurants/:id/menu`
Devuelve el menú del restaurant.

## 2. Platillos

### `GET /restaurants/:restaurantId/menu/:foodId`
Devuelve el detalle de un platillo, incluyendo descripción y opciones de personalización.

Respuesta sugerida:
```json
{
  "id": "parrilla-mixta",
  "nombre": "Parrilla Mixta UdeA",
  "precioCop": 28900,
  "calorias": 840,
  "rating": 4.8,
  "imagen": "https://...",
  "descripcion": "...",
  "sizeOptions": [
    { "id": "size-s", "label": "Personal", "multiplier": 0.9 }
  ],
  "ingredientGroups": [
    {
      "id": "base-default-required",
      "title": "Ingredientes obligatorios",
      "required": true,
      "minSelect": 2,
      "maxSelect": 2,
      "options": [
        { "id": "base-principal", "label": "Ingrediente principal", "extraCop": 0 }
      ]
    }
  ]
}
```

## 3. Carrito

La app maneja el carrito en cliente, pero si después se desea persistir en backend, estos endpoints serían suficientes:

### `GET /cart`
### `POST /cart/items`
### `PATCH /cart/items/:id`
### `DELETE /cart/items/:id`

Payload recomendado para agregar item:
```json
{
  "restaurantId": "parrilla-udea",
  "foodId": "parrilla-mixta",
  "quantity": 1,
  "sizeLabel": "Regular",
  "ingredients": ["Huevo", "Queso"],
  "extras": ["Salsa picante"],
  "unitPrice": 28900
}
```

## 4. Órdenes

### `GET /orders`
Lista de órdenes del usuario.

Filtros sugeridos:
- `status=waiting|preparing|ready|delivered|cancelled`
- `ratingStatus=pending|rated`

### `GET /orders/:id`
Detalle completo de una orden.

### `POST /orders`
Crea una nueva orden a partir del carrito.

### `PATCH /orders/:id/status`
Actualiza el estado de la orden.

Payload sugerido:
```json
{
  "status": "preparing"
}
```

## 5. Calificaciones

### `GET /orders/:id/rating`
Consulta si una orden ya fue calificada.

### `POST /orders/:id/rating`
Guarda una calificación única para la orden.

Regla:
- Solo debe permitirse una calificación por orden.
- Si el backend recibe una segunda calificación, debe responder `409 Conflict`.

Payload sugerido:
```json
{
  "restaurantRating": 5,
  "itemRatings": {
    "f-1": 5,
    "f-2": 4
  }
}
```

## 6. Configuración y estado local

No requiere backend en primera fase:
- Tema de la app
- Notificaciones
- Sonido
- Vibración
- Ahorro de datos
- Carga automática de imágenes

Si se quiere sincronizar con backend:
### `GET /users/me/preferences`
### `PATCH /users/me/preferences`

## 7. Proceso de Compra y Modelo de Órdenes

El proceso de compra en la app está diseñado como **Pago Contra Entrega (efectivo al recoger)**.
Para que el proceso de compra funcione completamente en el backend, el desarrollador del backend debe implementar el endpoint `POST /orders` recibiendo y retornando la siguiente estructura de objetos:

### Modelo de Objeto `Order` (Orden)
```json
{
  "id": "string",            // Identificador único (ej. autogenerado en DB o UUID)
  "userId": "string",        // Identificador del usuario (ej. Clerk User ID) para aislar datos
  "number": 1234,            // Número correlativo de orden para el cliente (entero de 4+ dígitos)
  "status": "waiting",       // Estado de la orden: "waiting" | "preparing" | "ready" | "delivered" | "cancelled"
  "placedAt": "2026-06-06T15:30:00Z", // Fecha de creación en formato ISO string
  "restaurantName": "Nombre",// Nombre del restaurante al que se le compra
  "total": 45000,            // Total de la orden en COP (entero)
  "paymentMethod": "cash_on_pickup", // Método de pago fijo: "cash_on_pickup" (contra entrega)
  "items": [                 // Lista de platillos contenidos en la orden
    {
      "id": "string",        // ID del alimento
      "name": "string",      // Nombre del platillo
      "image": "string",     // URL de la imagen del platillo (opcional)
      "quantity": 2,         // Cantidad comprada (entero)
      "unitPrice": 22500,    // Precio unitario en COP (entero)
      "ingredients": ["A", "B"], // Ingredientes elegidos (obligatorios u opcionales)
      "extras": ["X", "Y"]   // Adiciones/Extras elegidos (opcional)
    }
  ]
}
```

### Reglas de Aislamiento y Seguridad en el Backend
> [!IMPORTANT]
> El backend **debe** asegurar el aislamiento de los datos del usuario:
> - **Autenticación obligatoria:** Todos los endpoints de órdenes (`/orders`) deben requerir el token JWT en la cabecera `Authorization: Bearer <token>` provisto por Clerk.
> - **Asociación de la orden:** Al guardar una orden (`POST /orders`), el backend debe extraer el `userId` directamente desde los claims del token decodificado y guardarlo en el campo `userId` de la base de datos (evitando confiar únicamente en lo que mande el cliente por body).
> - **Filtro de consultas:** El endpoint `GET /orders` debe filtrar la base de datos para retornar **únicamente** las órdenes donde el campo `userId` coincida con el ID del usuario del token actual.
> - **Acceso al detalle:** El endpoint `GET /orders/:id` debe verificar que la orden solicitada pertenezca al `userId` del token antes de responder con los datos del pedido. Si pertenece a otro usuario, debe retornar `403 Forbidden` o `404 Not Found`.

### Endpoints Requeridos para Órdenes
1. **`POST /orders`**: Crea un nuevo registro de orden.
   * **Recibe:** El objeto de la orden estructurado anteriormente (puede excluir `id`, `number`, `placedAt` y `userId` si el backend los autogenera o resuelve de forma automática).
   * **Retorna:** El objeto `Order` completo creado, incluyendo su ID y número asignados.
2. **`GET /orders`**: Devuelve la lista de todas las órdenes asociadas al usuario actual.
3. **`GET /orders/:id`**: Devuelve los detalles individuales de una orden por su ID.
4. **`PATCH /orders/:id/status`**: Cambia el estado de la orden (ej. de `"waiting"` a `"preparing"`, luego a `"ready"` para recoger).
   * **Payload recibido:** `{ "status": "preparing" }`

## 8. Notas de implementación

- Las rutas actuales de la app ya están pensadas para migrar los mocks a DB.
- Conviene mantener contratos estables para `restaurants`, `menu`, `orders` y `ratings`.
- Si vas a usar PostgreSQL, MongoDB o Firebase, el shape puede quedarse igual y solo cambiar la capa de persistencia.
- Se implementó un mecanismo de **Fallback Local** mediante `SecureStore`: si los endpoints de `/orders` fallan o no se encuentran implementados aún, la app guardará y cargará las órdenes localmente en el dispositivo. De este modo, la app es completamente funcional desde ya y migrará automáticamente al backend en cuanto esté listo.
