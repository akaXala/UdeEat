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

## 7. Notas de implementación

- Las rutas actuales de la app ya están pensadas para migrar los mocks a DB.
- Conviene mantener contratos estables para `restaurants`, `menu`, `orders` y `ratings`.
- Si vas a usar PostgreSQL, MongoDB o Firebase, el shape puede quedarse igual y solo cambiar la capa de persistencia.
