import Homepage from "./components/Homepage";
import Shop from "./components/Shop";
import "./theme.css";

// Simple export map that a renderer can use to resolve page components by name
export const storefrontTheme = {
  name: "Storefront",
  components: {
    Homepage,
    Shop
  }
};

export default storefrontTheme;