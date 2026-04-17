import { restaurants, type FoodItem, type Restaurant } from '@/constants/restaurants';

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
};

// This service is intentionally async to ease migration to a real backend.
// Replace the Promise.resolve(...) calls with API/DB requests when backend is ready.
export async function getRestaurants(): Promise<Restaurant[]> {
  return Promise.resolve(restaurants);
}

export async function getRestaurantById(id: string): Promise<Restaurant | undefined> {
  return Promise.resolve(restaurants.find((item) => item.id === id));
}

export async function getFoodDetail(restaurantId: string, foodId: string): Promise<FoodDetail | undefined> {
  const restaurant = restaurants.find((item) => item.id === restaurantId);
  if (!restaurant) {
    return Promise.resolve(undefined);
  }

  const food = restaurant.menu.find((item) => item.id === foodId);
  if (!food) {
    return Promise.resolve(undefined);
  }

  return Promise.resolve(buildFoodDetail(food));
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
