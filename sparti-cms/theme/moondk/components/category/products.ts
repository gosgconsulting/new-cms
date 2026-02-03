import hoveniaDulcisImage from "../../../e-shop/assets/hovenia-dulcis.png";
import cornExtractImage from "../../../e-shop/assets/corn-extract.png";
import blackBeanTeaImage from "../../../e-shop/assets/black-bean-tea.png";
import barleyTeaImage from "../../../e-shop/assets/barley-tea.png";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  isNew?: boolean;
}

export const products: Product[] = [
  { id: 1, name: "Hovenia Dulcis Extract (헛개수)", category: "Ingredients", price: "€24", image: hoveniaDulcisImage, isNew: true },
  { id: 2, name: "Corn Extract (옥미수)", category: "Ingredients", price: "€28", image: cornExtractImage, isNew: true },
  { id: 3, name: "Black Bean Tea Extract (검은콩차 진액)", category: "Ingredients", price: "€22", image: blackBeanTeaImage, isNew: true },
  { id: 4, name: "Barley Tea Extract (보리차 진액)", category: "Ingredients", price: "€18", image: barleyTeaImage, isNew: true },
];

export const categoryTabs = [
  "All",
  "Ingredients",
];