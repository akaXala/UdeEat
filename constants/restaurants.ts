export type FoodItem = {
  id: string;
  nombre: string;
  precioCop: number;
  calorias: number;
  rating: number;
  imagen: string;
};

export type Restaurant = {
  id: string;
  nombre: string;
  categoria: string;
  rating: number;
  tiempo: string;
  imagen: string;
  location: {
    latitude: number;
    longitude: number;
    label: string;
  };
  menu: FoodItem[];
};

// export const restaurants: Restaurant[] = [
//   {
//     id: 'parrilla-udea',
//     nombre: 'La Parrilla de la UdeA',
//     categoria: 'Comida Internacional',
//     rating: 4.8,
//     tiempo: '15-25 min',
//     imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
//     location: {
//       latitude: 6.2669,
//       longitude: -75.5677,
//       label: 'Cerca de la entrada principal de la escuela',
//     },
//     menu: [
//       {
//         id: 'parrilla-mixta',
//         nombre: 'Parrilla Mixta UdeA',
//         precioCop: 28900,
//         calorias: 840,
//         rating: 4.8,
//         imagen: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'hamburguesa-angus',
//         nombre: 'Hamburguesa Angus',
//         precioCop: 23900,
//         calorias: 760,
//         rating: 4.7,
//         imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'costillas-bbq',
//         nombre: 'Costillas BBQ',
//         precioCop: 31900,
//         calorias: 910,
//         rating: 4.9,
//         imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
//       },
//     ],
//   },
//   {
//     id: 'sabor-udea',
//     nombre: 'Sabor UdeA',
//     categoria: 'Comida Colombiana',
//     rating: 4.7,
//     tiempo: '18-28 min',
//     imagen: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1200&auto=format&fit=crop',
//     location: {
//       latitude: 6.2664,
//       longitude: -75.5668,
//       label: 'Bloque de cafeterías, junto al patio central',
//     },
//     menu: [
//       {
//         id: 'bandeja-paisa',
//         nombre: 'Bandeja Paisa',
//         precioCop: 25900,
//         calorias: 980,
//         rating: 4.8,
//         imagen: 'https://images.unsplash.com/photo-1630916759095-c297635511f7?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'ajiaco-santafere',
//         nombre: 'Ajiaco Santafere',
//         precioCop: 21900,
//         calorias: 620,
//         rating: 4.6,
//         imagen: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'sancocho-pollo',
//         nombre: 'Sancocho de Pollo',
//         precioCop: 20900,
//         calorias: 570,
//         rating: 4.5,
//         imagen: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200&auto=format&fit=crop',
//       },
//     ],
//   },
//   {
//     id: 'nori-udea',
//     nombre: 'Nori UdeA',
//     categoria: 'Sushi y Japonesa',
//     rating: 4.9,
//     tiempo: '20-30 min',
//     imagen: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1200&auto=format&fit=crop',
//     location: {
//       latitude: 6.2672,
//       longitude: -75.5684,
//       label: 'Frente a la plazoleta de la escuela',
//     },
//     menu: [
//       {
//         id: 'roll-salmon',
//         nombre: 'Roll Salmon Deluxe',
//         precioCop: 27900,
//         calorias: 520,
//         rating: 4.9,
//         imagen: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'poke-atun',
//         nombre: 'Poke Bowl de Atun',
//         precioCop: 24900,
//         calorias: 460,
//         rating: 4.7,
//         imagen: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'ramen-miso',
//         nombre: 'Ramen Miso',
//         precioCop: 26900,
//         calorias: 640,
//         rating: 4.8,
//         imagen: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=1200&auto=format&fit=crop',
//       },
//     ],
//   },
//   {
//     id: 'trattoria-udea',
//     nombre: 'Trattoria Universitaria UdeA',
//     categoria: 'Italiana',
//     rating: 4.6,
//     tiempo: '25-35 min',
//     imagen: 'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8d70?q=80&w=1200&auto=format&fit=crop',
//     location: {
//       latitude: 6.2658,
//       longitude: -75.5672,
//       label: 'Zona sur, al lado de las escaleras principales',
//     },
//     menu: [
//       {
//         id: 'pasta-alfredo',
//         nombre: 'Pasta Alfredo',
//         precioCop: 23900,
//         calorias: 710,
//         rating: 4.6,
//         imagen: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'lasagna-carne',
//         nombre: 'Lasagna de Carne',
//         precioCop: 26900,
//         calorias: 830,
//         rating: 4.7,
//         imagen: 'https://images.unsplash.com/photo-1619894991209-5c7f5f8a31a9?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'pizza-margherita',
//         nombre: 'Pizza Margherita',
//         precioCop: 32900,
//         calorias: 960,
//         rating: 4.5,
//         imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1200&auto=format&fit=crop',
//       },
//     ],
//   },
//   {
//     id: 'taco-udea',
//     nombre: 'Taco UdeA',
//     categoria: 'Mexicana',
//     rating: 4.5,
//     tiempo: '15-22 min',
//     imagen: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?q=80&w=1200&auto=format&fit=crop',
//     location: {
//       latitude: 6.2661,
//       longitude: -75.5689,
//       label: 'Cerca al acceso lateral de la escuela',
//     },
//     menu: [
//       {
//         id: 'tacos-birria',
//         nombre: 'Tacos de Birria',
//         precioCop: 21900,
//         calorias: 650,
//         rating: 4.8,
//         imagen: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'burrito-pollo',
//         nombre: 'Burrito de Pollo',
//         precioCop: 20900,
//         calorias: 730,
//         rating: 4.6,
//         imagen: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'nachos-queso',
//         nombre: 'Nachos con Queso',
//         precioCop: 18900,
//         calorias: 690,
//         rating: 4.4,
//         imagen: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=1200&auto=format&fit=crop',
//       },
//     ],
//   },
//   {
//     id: 'green-udea-bowl',
//     nombre: 'Green UdeA Bowl',
//     categoria: 'Saludable y Bowls',
//     rating: 4.8,
//     tiempo: '12-20 min',
//     imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop',
//     location: {
//       latitude: 6.2676,
//       longitude: -75.5679,
//       label: 'Junto al jardín central de la escuela',
//     },
//     menu: [
//       {
//         id: 'bowl-proteina',
//         nombre: 'Bowl de Proteina',
//         precioCop: 22900,
//         calorias: 510,
//         rating: 4.8,
//         imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'ensalada-mediterranea',
//         nombre: 'Ensalada Mediterranea',
//         precioCop: 19900,
//         calorias: 380,
//         rating: 4.7,
//         imagen: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop',
//       },
//       {
//         id: 'wrap-veggie',
//         nombre: 'Wrap Veggie',
//         precioCop: 18900,
//         calorias: 430,
//         rating: 4.6,
//         imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
//       },
//     ],
//   },
// ];
