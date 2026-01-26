import pantheonImage from "../../../e-shop/assets/pantheon.jpg";
import eclipseImage from "../../../e-shop/assets/eclipse.jpg";
import haloImage from "../../../e-shop/assets/halo.jpg";
import obliqueImage from "../../../e-shop/assets/oblique.jpg";
import lintelImage from "../../../e-shop/assets/lintel.jpg";
import shadowlineImage from "../../../e-shop/assets/shadowline.jpg";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  isNew?: boolean;
}

export const products: Product[] = [
  { id: 1, name: "Chef's Selection Box", category: "Curated Sets", price: "€45", image: pantheonImage, isNew: true },
  { id: 2, name: "Korean Essentials Kit", category: "Essentials", price: "€32", image: eclipseImage },
  { id: 3, name: "Premium Gochujang", category: "Ingredients", price: "€18", image: haloImage, isNew: true },
  { id: 4, name: "Traditional Kimchi", category: "Ingredients", price: "€22", image: obliqueImage },
  { id: 5, name: "Chef's Tool Set", category: "Tools", price: "€65", image: lintelImage },
  { id: 6, name: "Recipe Collection", category: "Recipe Collections", price: "€28", image: shadowlineImage },
  { id: 7, name: "Sesame Oil Premium", category: "Ingredients", price: "€24", image: pantheonImage },
  { id: 8, name: "Doenjang Paste", category: "Ingredients", price: "€19", image: eclipseImage },
  { id: 9, name: "Bamboo Steamer", category: "Tools", price: "€42", image: haloImage },
  { id: 10, name: "Stone Bowl Set", category: "Tools", price: "€58", image: obliqueImage },
  { id: 11, name: "Korean BBQ Set", category: "Curated Sets", price: "€75", image: lintelImage },
  { id: 12, name: "Fermentation Kit", category: "Essentials", price: "€38", image: shadowlineImage },
  { id: 13, name: "Rice Vinegar", category: "Ingredients", price: "€15", image: pantheonImage },
  { id: 14, name: "Seaweed Snacks", category: "Ingredients", price: "€12", image: eclipseImage },
  { id: 15, name: "Chef's Knife", category: "Tools", price: "€85", image: haloImage },
  { id: 16, name: "Banchan Collection", category: "Curated Sets", price: "€52", image: obliqueImage },
  { id: 17, name: "Soy Sauce Premium", category: "Ingredients", price: "€16", image: lintelImage },
  { id: 18, name: "Korean Spice Mix", category: "Ingredients", price: "€14", image: shadowlineImage },
  { id: 19, name: "Clay Pot", category: "Tools", price: "€48", image: pantheonImage },
  { id: 20, name: "Home Dining Starter", category: "Essentials", price: "€68", image: eclipseImage },
  { id: 21, name: "Miso Paste", category: "Ingredients", price: "€21", image: haloImage },
  { id: 22, name: "Korean Tea Set", category: "Recipe Collections", price: "€55", image: obliqueImage },
  { id: 23, name: "Rice Cooker Premium", category: "Tools", price: "€95", image: lintelImage },
  { id: 24, name: "Chef's Recipe Book", category: "Recipe Collections", price: "€35", image: shadowlineImage },
];

export const categoryTabs = [
  "All",
  "Curated Sets",
  "Ingredients",
  "Tools",
  "Essentials",
  "Recipe Collections",
];