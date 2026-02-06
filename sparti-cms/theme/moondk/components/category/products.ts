import hoveniaDulcisImage from "../../../e-shop/assets/hovenia-dulcis.png";
import cornExtractImage from "../../../e-shop/assets/corn-extract.png";
import blackBeanTeaImage from "../../../e-shop/assets/black-bean-tea.png";
import barleyTeaImage from "../../../e-shop/assets/barley-tea.png";

// Oil products
import sesameOilImage from "../../assets/oil/BEOK-sesameoil1.jpg";
import meatImage from "../../assets/oil/BEOK-meat1.jpg";
import perillaOilImage from "../../assets/oil/BEOK-perillaoil3.jpg";
import saucesImage from "../../assets/oil/BEOK-sauces2.jpg";

  // Soju products
  import seorijuImage from "../../assets/alcohol/BEOK-seoriju3.jpg";

// Noodles products
import wheatNoodleImage from "../../assets/noodles/IMG_1701.png";
import giftSetImage from "../../assets/noodles/IMG_1700.jpg";
import potatoNoodleImage from "../../assets/noodles/BEOK-Potatonoodle3.jpg";
import hanrabongNoodleImage from "../../assets/noodles/BEOK-Hanrabongnoodle3.jpg";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  isNew?: boolean;
}

export const products: Product[] = [
  // Tea products
  { id: 1, name: "Hovenia Dulcis Extract (헛개수)", category: "Tea", price: "€37", image: hoveniaDulcisImage, isNew: true },
  { id: 2, name: "Corn Silk Tea Extract", category: "Tea", price: "€58", image: cornExtractImage, isNew: true },
  { id: 3, name: "Black Bean Tea Extract (검은콩차 진액)", category: "Tea", price: "€58", image: blackBeanTeaImage, isNew: true },
  { id: 4, name: "Barley Tea Extract (보리차 진액)", category: "Tea", price: "€32", image: barleyTeaImage, isNew: true },
  
  // Oil products
  { id: 5, name: "BEOK Sesame Oil", category: "Oil", price: "€20", image: sesameOilImage },
  { id: 6, name: "BEOK Meat", category: "Oil", price: "€50", image: meatImage },
  { id: 7, name: "BEOK Perilla Oil", category: "Oil", price: "€20", image: perillaOilImage },
  { id: 8, name: "Oil Package", category: "Oil", price: "€68", image: saucesImage },
  
  // Soju products
  { id: 9, name: "Seoriju", category: "Soju", price: "€58", image: seorijuImage },
  
  // Noodles products
  { id: 10, name: "Myeongawon Korean Wheat Red Rice Sooyeon Noodles", category: "Noodles", price: "€12", image: wheatNoodleImage },
  { id: 11, name: "Myeongawon Special Gift Set", category: "Noodles", price: "€26", image: giftSetImage },
  { id: 12, name: "Potato Noodle", category: "Noodles", price: "€22", image: potatoNoodleImage },
  { id: 13, name: "Hanrabong Noodle", category: "Noodles", price: "€20", image: hanrabongNoodleImage },
];

export const categoryTabs = [
  "All",
  "Tea",
  "Oil",
  "Noodles",
  "Soju",
  "Foods",
  "Drinks",
];