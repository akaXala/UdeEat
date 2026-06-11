import { type FoodItem, type Restaurant } from '@/constants/restaurants';

const API_BASE_URL = 'https://nq99z2pp-8080.use.devtunnels.ms/api/v1';

export type { FoodItem, Restaurant };

export type SizeOption = {
  id: string;
  label: string;
  multiplier: number;
};

export type IngredientOption = {
  id: string;
  label: string;
  extraCop: number;
};

export type IngredientGroup = {
  id: string;
  title: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: IngredientOption[];
};

export type FoodDetail = FoodItem & {
  descripcion: string;
  sizeOptions: SizeOption[];
  ingredientGroups: IngredientGroup[];
  restaurantName?: string;
};

function mapBackendDishToFrontend(backendDish: any): FoodItem {
  return {
    // Si Go manda el ID dentro de un objeto (como hace bson a veces), lo extraemos
    id: backendDish?.id || backendDish?._id || Math.random().toString(),
    nombre: backendDish?.name || backendDish?.nombre || 'Platillo sin nombre',
    // Agregamos 'price_cop' que es como lo envía tu base de datos ahora
    precioCop: backendDish?.price_cop || backendDish?.price || backendDish?.precioCop || 0,
    calorias: backendDish?.calories || backendDish?.calorias || 0,
    rating: backendDish?.rating || 0,
    imagen: backendDish?.image || backendDish?.imagen || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop',
  };
}

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 15000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function getRestaurants(): Promise<Restaurant[]> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/restaurants/`);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const backendData = await response.json();

    // 2. Aseguramos que el ID del restaurante se guarde correctamente
    return backendData.map((rest: any) => {
      // Extraemos el ID real, ya sea que venga como rest.id, rest._id, o un objeto
      const realId = rest.id || rest._id;

      return {
        id: typeof realId === 'object' ? realId.toString() : realId,
        nombre: rest.name,
        categoria: rest.category,
        rating: rest.rating,
        tiempo: rest.time,
        imagen: rest.image,
        location: rest.location,
        menu: []
      };
    });

  } catch (error) {
    console.error('Error obteniendo restaurantes:', error);
    return [];
  }
}

export async function getRestaurantById(id: string): Promise<Restaurant | undefined> {
  try {
    // Hacemos las dos peticiones al mismo tiempo
    const [restRes, menuRes] = await Promise.all([
      fetchWithTimeout(`${API_BASE_URL}/restaurants/${id}`),
      fetchWithTimeout(`${API_BASE_URL}/restaurants/menu/${id}`)
    ]);

    if (!restRes.ok) {
      console.warn(`[getRestaurantById] Error cargando restaurante: ${restRes.status}`);
      return undefined;
    }

    const backendRest = await restRes.json();
    let backendMenu = [];

    if (menuRes.ok) {
      const menuData = await menuRes.json();
      // Verificamos que sea un arreglo válido (evitamos que un null de Go rompa la app)
      backendMenu = Array.isArray(menuData) ? menuData : [];
    }

    // Unimos los datos
    return {
      id: backendRest.id || backendRest._id,
      nombre: backendRest.name,
      categoria: backendRest.category,
      rating: backendRest.rating,
      tiempo: backendRest.time,
      imagen: backendRest.image,
      location: backendRest.location,
      // Aplicamos la traducción segura
      menu: backendMenu.map(mapBackendDishToFrontend)
    };

  } catch (error) {
    console.error(`Error crítico obteniendo restaurante ${id}:`, error);
    return undefined;
  }
}

export async function getMenuByRestaurant(restaurantId: string): Promise<FoodItem[]> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/restaurants/menu/${restaurantId}`);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    return data.map(mapBackendDishToFrontend);
  } catch (error) {
    console.error(`Error obteniendo menú de ${restaurantId}:`, error);
    return [];
  }
}

function mapBackendDishToFoodDetail(backendDish: any): FoodDetail {
  const food = mapBackendDishToFrontend(backendDish);

  const descripcion = backendDish.description || backendDish.descripcion || 'Plato preparado al momento.';

  const backendSizes = backendDish.size_options || backendDish.sizeOptions;
  let sizeOptions: SizeOption[] = [];
  if (Array.isArray(backendSizes) && backendSizes.length > 0) {
    sizeOptions = backendSizes.map((size: any) => ({
      id: size.id || Math.random().toString(),
      label: size.label || 'Tamaño',
      multiplier: size.multiplier || 1,
    }));
  } else {
    sizeOptions = [
      { id: 'size-s', label: 'Personal', multiplier: 0.9 },
      { id: 'size-m', label: 'Regular', multiplier: 1 },
      { id: 'size-l', label: 'Grande', multiplier: 1.18 },
    ];
  }

  const backendGroups = backendDish.ingredient_groups || backendDish.ingredientGroups;
  let ingredientGroups: IngredientGroup[] = [];
  if (Array.isArray(backendGroups) && backendGroups.length > 0) {
    ingredientGroups = backendGroups.map((group: any) => ({
      id: group.id || Math.random().toString(),
      title: group.title || 'Personalización',
      required: group.required ?? false,
      minSelect: group.minSelect ?? 0,
      maxSelect: group.maxSelect ?? 0,
      options: (group.options || []).map((opt: any) => ({
        id: opt.id || Math.random().toString(),
        label: opt.label || '',
        extraCop: opt.extraCop || opt.extra_cop || 0,
      })),
    }));
  } else {
    const detailFallback = buildFoodDetail(food);
    ingredientGroups = detailFallback.ingredientGroups;
  }

  return {
    ...food,
    descripcion,
    sizeOptions,
    ingredientGroups,
  };
}

export async function getFoodDetail(restaurantId: string, foodId: string): Promise<FoodDetail | undefined> {
  try {
    const [restRes, menuRes] = await Promise.all([
      fetchWithTimeout(`${API_BASE_URL}/restaurants/${restaurantId}`),
      fetchWithTimeout(`${API_BASE_URL}/restaurants/menu/${restaurantId}`)
    ]);

    if (!menuRes.ok) throw new Error(`HTTP Error on Menu: ${menuRes.status}`);

    const data = await menuRes.json();
    const menuArray = Array.isArray(data) ? data : [];

    const backendDish = menuArray.find(
      (item: any) =>
        (item.id && String(item.id) === foodId) ||
        (item._id && String(item._id) === foodId)
    );

    if (!backendDish) return undefined;

    let restaurantName = '';
    if (restRes.ok) {
      const restData = await restRes.json();
      restaurantName = restData?.name || '';
    }

    const foodDetail = mapBackendDishToFoodDetail(backendDish);
    foodDetail.restaurantName = restaurantName;
    return foodDetail;
  } catch (error) {
    console.error(`Error obteniendo detalle de comida ${foodId}:`, error);
    return undefined;
  }
}


function buildFoodDetail(food: FoodItem): FoodDetail {
  const lowerName = food.nombre.toLowerCase();

  const commonSizes: SizeOption[] = [
    { id: 'size-s', label: 'Personal', multiplier: 0.9 },
    { id: 'size-m', label: 'Regular', multiplier: 1 },
    { id: 'size-l', label: 'Grande', multiplier: 1.18 },
  ];

  if (lowerName.includes('taco') || lowerName.includes('burrito') || lowerName.includes('nachos')) {
    return {
      ...food,
      descripcion:
        'Sabor intenso con ingredientes frescos. Personalizalo a tu gusto y disfruta cada bocado al estilo UdeEat.',
      sizeOptions: commonSizes,
      ingredientGroups: [
        {
          id: 'base-mex-required',
          title: 'Ingredientes obligatorios',
          required: true,
          minSelect: 2,
          maxSelect: 2,
          options: [
            { id: 'base-tortilla', label: 'Tortilla de maiz', extraCop: 0 },
            { id: 'base-proteina', label: 'Proteina principal', extraCop: 0 },
          ],
        },
        {
          id: 'base-mex-optional',
          title: 'Ingredientes opcionales',
          required: false,
          minSelect: 0,
          maxSelect: 4,
          options: [
            { id: 'opt-cebolla', label: 'Cebolla', extraCop: 0 },
            { id: 'opt-cilantro', label: 'Cilantro', extraCop: 0 },
            { id: 'opt-guacamole', label: 'Guacamole', extraCop: 2500 },
            { id: 'opt-queso', label: 'Queso fundido', extraCop: 2200 },
          ],
        },
      ],
    };
  }

  if (lowerName.includes('roll') || lowerName.includes('sushi') || lowerName.includes('poke') || lowerName.includes('ramen')) {
    return {
      ...food,
      descripcion:
        'Preparacion inspirada en cocina asiatica con balance de textura y frescura. Ajusta los toppings como prefieras.',
      sizeOptions: commonSizes,
      ingredientGroups: [
        {
          id: 'base-jp-required',
          title: 'Ingredientes obligatorios',
          required: true,
          minSelect: 2,
          maxSelect: 2,
          options: [
            { id: 'base-arroz', label: 'Base de arroz o fideos', extraCop: 0 },
            { id: 'base-proteina-jp', label: 'Proteina principal', extraCop: 0 },
          ],
        },
        {
          id: 'base-jp-optional',
          title: 'Ingredientes opcionales',
          required: false,
          minSelect: 0,
          maxSelect: 4,
          options: [
            { id: 'opt-ajonjoli', label: 'Ajonjoli', extraCop: 0 },
            { id: 'opt-cream-cheese', label: 'Cream cheese', extraCop: 1800 },
            { id: 'opt-salsa-anguila', label: 'Salsa anguila', extraCop: 1200 },
            { id: 'opt-wakame', label: 'Wakame', extraCop: 2300 },
          ],
        },
      ],
    };
  }

  if (lowerName.includes('pasta') || lowerName.includes('lasagna') || lowerName.includes('pizza')) {
    return {
      ...food,
      descripcion:
        'Receta italiana con ingredientes de alta calidad. Puedes personalizar extras para hacerlo a tu estilo.',
      sizeOptions: commonSizes,
      ingredientGroups: [
        {
          id: 'base-it-required',
          title: 'Ingredientes obligatorios',
          required: true,
          minSelect: 2,
          maxSelect: 2,
          options: [
            { id: 'base-masa-pasta', label: 'Base de masa o pasta', extraCop: 0 },
            { id: 'base-salsa', label: 'Salsa tradicional', extraCop: 0 },
          ],
        },
        {
          id: 'base-it-optional',
          title: 'Ingredientes opcionales',
          required: false,
          minSelect: 0,
          maxSelect: 4,
          options: [
            { id: 'opt-parmesano', label: 'Queso parmesano', extraCop: 2000 },
            { id: 'opt-pepperoni', label: 'Pepperoni', extraCop: 2600 },
            { id: 'opt-champi', label: 'Champinones', extraCop: 1800 },
            { id: 'opt-albahaca', label: 'Albahaca extra', extraCop: 900 },
          ],
        },
      ],
    };
  }

  if (lowerName.includes('ensalada') || lowerName.includes('bowl') || lowerName.includes('wrap')) {
    return {
      ...food,
      descripcion:
        'Opcion balanceada y fresca para mantener el ritmo del dia. Elige complementos saludables a tu medida.',
      sizeOptions: commonSizes,
      ingredientGroups: [
        {
          id: 'base-fit-required',
          title: 'Ingredientes obligatorios',
          required: true,
          minSelect: 2,
          maxSelect: 2,
          options: [
            { id: 'base-verde', label: 'Base verde o cereal', extraCop: 0 },
            { id: 'base-proteina-fit', label: 'Proteina principal', extraCop: 0 },
          ],
        },
        {
          id: 'base-fit-optional',
          title: 'Ingredientes opcionales',
          required: false,
          minSelect: 0,
          maxSelect: 4,
          options: [
            { id: 'opt-aguacate', label: 'Aguacate', extraCop: 2200 },
            { id: 'opt-semillas', label: 'Mix de semillas', extraCop: 1300 },
            { id: 'opt-hummus', label: 'Hummus', extraCop: 1800 },
            { id: 'opt-aceite-oliva', label: 'Aceite de oliva', extraCop: 900 },
          ],
        },
      ],
    };
  }

  return {
    ...food,
    descripcion:
      'Plato preparado al momento con ingredientes seleccionados. Personaliza tu pedido para una experiencia perfecta.',
    sizeOptions: commonSizes,
    ingredientGroups: [
      {
        id: 'base-default-required',
        title: 'Ingredientes obligatorios',
        required: true,
        minSelect: 2,
        maxSelect: 2,
        options: [
          { id: 'base-principal', label: 'Ingrediente principal', extraCop: 0 },
          { id: 'base-acompanante', label: 'Acompanante base', extraCop: 0 },
        ],
      },
      {
        id: 'base-default-optional',
        title: 'Ingredientes opcionales',
        required: false,
        minSelect: 0,
        maxSelect: 4,
        options: [
          { id: 'opt-salsa', label: 'Salsa de la casa', extraCop: 1000 },
          { id: 'opt-queso-extra', label: 'Queso extra', extraCop: 1800 },
          { id: 'opt-topping-crunch', label: 'Topping crunchy', extraCop: 1500 },
        ],
      },
    ],
  };
}