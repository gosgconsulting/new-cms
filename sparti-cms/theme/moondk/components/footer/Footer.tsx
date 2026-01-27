import logoSrc from "../../assets/logo.svg";
import { useThemeBasePath, themeHref } from "../ThemeLink";

const Footer = () => {
  const basePath = useThemeBasePath();

  return (
    <footer className="w-full bg-background text-foreground pt-16 pb-8 px-6 border-t border-border-light mt-24">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Brand - Left side */}
          <div>
            <img src={logoSrc} alt="MOONDK" className="mb-6 h-10 w-auto object-contain block" />
            <p className="text-sm font-body font-light text-foreground/70 leading-relaxed max-w-md mb-6">
              Korean home dining, chef-led, curated products. Cook like a chef at home with our premium selection of ingredients, tools, and recipe collections.
            </p>

            {/* Contact Information */}
            <div className="space-y-3 text-sm font-body font-light text-foreground/70">
              <div>
                <p className="font-heading font-medium text-foreground mb-1">Visit Us</p>
                <p>Seoul, South Korea</p>
              </div>
              <div>
                <p className="font-heading font-medium text-foreground mb-1 mt-4">Contact</p>
                <p>hello@moondk.com</p>
              </div>
            </div>
          </div>

          {/* Link lists - Right side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shop */}
            <div>
              <h4 className="text-sm font-heading font-medium mb-4 text-foreground">Shop</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href={themeHref(basePath, "/category/new-in")}
                    className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
                  >
                    New In
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/category/curated-sets")}
                    className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
                  >
                    Curated Sets
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/category/ingredients")}
                    className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
                  >
                    Ingredients
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/category/tools")}
                    className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
                  >
                    Tools
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/category/recipe-collections")}
                    className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
                  >
                    Recipe Collections
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-heading font-medium mb-4 text-foreground">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href={themeHref(basePath, "/about/customer-care")}
                    className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
                  >
                    Customer Care
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/about/customer-care")}
                    className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
                  >
                    Returns
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/about/customer-care")}
                    className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
                  >
                    Shipping
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/about/customer-care")}
                    className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-sm font-heading font-medium mb-4 text-foreground">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors">
                    Newsletter
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-border-light pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm font-body font-light text-foreground/60 mb-4 md:mb-0">
            © 2024 MOONDK. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href={themeHref(basePath, "/privacy-policy")}
              className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href={themeHref(basePath, "/terms-of-service")}
              className="text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;