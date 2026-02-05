// Product service to fetch product data
// For now, using mock data from moondk theme products
// In production, this would fetch from API

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  imageUrl: string;
  description: string;
  details: string;
  chefsNotes: string;
  breadcrumbs: string[];
}

// Mock product data - in production, fetch from API
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Hovenia Dulcis Extract (헛개수)",
    category: "Ingredients",
    price: "€24",
    imageUrl: "/theme/e-shop/assets/hovenia-dulcis.png",
    description: "Premium Hovenia Dulcis extract (헛개수), a traditional Korean beverage concentrate known for its refreshing taste and health benefits. This premium extract is made from 100% domestic Hovenia Dulcis fruit, carefully processed to preserve its natural flavor and nutrients.",
    details: "Net Weight: 420g (875kcal). Made with 100% domestic Korean Hovenia Dulcis. Ready to mix with water for a refreshing traditional Korean beverage.",
    chefsNotes: "Hovenia Dulcis has been cherished in Korean tradition for generations. This premium extract captures the essence of this unique fruit, perfect for creating authentic Korean home dining experiences.",
    breadcrumbs: ["Home", "Ingredients", "Hovenia Dulcis Extract (헛개수)"],
  },
  {
    id: 2,
    name: "Corn Extract (옥미수)",
    category: "Ingredients",
    price: "€28",
    imageUrl: "/theme/e-shop/assets/corn-extract.png",
    description: "Premium corn extract (옥미수), a traditional Korean beverage concentrate made from the finest Korean corn. This extract offers a naturally sweet and refreshing taste, perfect for creating authentic Korean beverages at home.",
    details: "Net Weight: 450g (920kcal). Made with 100% domestic Korean corn. Ready to mix with water for a refreshing traditional Korean beverage.",
    chefsNotes: "Corn extract brings the authentic taste of Korean tradition to your home. This premium concentrate allows you to create restaurant-quality beverages with ease.",
    breadcrumbs: ["Home", "Ingredients", "Corn Extract (옥미수)"],
  },
  {
    id: 3,
    name: "Black Bean Tea Extract (검은콩차 진액)",
    category: "Ingredients",
    price: "€22",
    imageUrl: "/theme/e-shop/assets/black-bean-tea.png",
    description: "Premium black bean tea extract (검은콩차 진액), a traditional Korean beverage concentrate known for its rich, nutty flavor and health benefits. Made from carefully selected black beans, this extract preserves the authentic taste of Korean tradition.",
    details: "Net Weight: 400g (850kcal). Made with 100% domestic Korean black beans. Ready to mix with water for a rich, traditional Korean beverage.",
    chefsNotes: "Black bean tea has been a staple in Korean households for centuries. This premium extract makes it easy to enjoy this traditional beverage at home.",
    breadcrumbs: ["Home", "Ingredients", "Black Bean Tea Extract (검은콩차 진액)"],
  },
  {
    id: 4,
    name: "Barley Tea Extract (보리차 진액)",
    category: "Ingredients",
    price: "€18",
    imageUrl: "/theme/e-shop/assets/barley-tea.png",
    description: "Premium barley tea extract (보리차 진액), a traditional Korean beverage concentrate with a light, refreshing taste. This extract is made from the finest Korean barley, carefully processed to maintain its natural flavor and aroma.",
    details: "Net Weight: 380g (780kcal). Made with 100% domestic Korean barley. Ready to mix with water for a light, refreshing traditional Korean beverage.",
    chefsNotes: "Barley tea is one of Korea's most beloved traditional beverages. This premium extract brings that authentic taste to your home with just a simple mix.",
    breadcrumbs: ["Home", "Ingredients", "Barley Tea Extract (보리차 진액)"],
  },
];

/**
 * Get a product by ID
 * @param id - Product ID
 * @returns Product or null if not found
 */
export async function getProduct(id: string | number): Promise<Product | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  const productId = typeof id === 'string' ? parseInt(id, 10) : id;
  const product = mockProducts.find((p) => p.id === productId);
  
  if (!product) {
    return null;
  }
  
  return product;
}

/**
 * Get all products
 * @returns Array of all products
 */
export async function getAllProducts(): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockProducts;
}
