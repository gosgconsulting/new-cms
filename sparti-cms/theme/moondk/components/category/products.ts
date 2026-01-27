export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  isNew?: boolean;
}

// MoonDK: curated list for the shop page (4 products)
export const products: Product[] = [
  {
    id: 1,
    name: "옥수수수염차",
    category: "Tea",
    price: "",
    image: "/uploads/옥수수수염차-대표이미지-01-300x300.jpg",
  },
  {
    id: 2,
    name: "검은콩차",
    category: "Tea",
    price: "",
    image: "/uploads/검은콩차-대표이미지-01-300x300.jpg",
  },
  {
    id: 3,
    name: "보리차",
    category: "Tea",
    price: "",
    image: "/uploads/BEOK-Barleytea5-300x300.jpg",
  },
  {
    id: 4,
    name: "헛개차",
    category: "Tea",
    price: "",
    image: "/uploads/헛개차-420g-대표이미지-01-300x300.jpg",
  },
];

export const categoryTabs = ["All", "Tea"];