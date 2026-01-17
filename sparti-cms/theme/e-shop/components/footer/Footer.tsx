import logoSrc from "../../assets/Linea_Jewelry_Inc-2.svg";
import { useThemeBasePath, themeHref } from "../ThemeLink";

const Footer = () => {
  const basePath = useThemeBasePath();

  return (
    <footer className="w-full bg-white text-black pt-8 pb-2 px-6 border-t border-[#e5e5e5] mt-48">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          {/* Brand - Left side */}
          <div>
            <img src={logoSrc} alt="Linea Jewelry Inc." className="mb-4 h-6 w-auto" />
            <p className="text-sm font-light text-black/70 leading-relaxed max-w-md mb-6">
              Minimalist jewelry crafted for the modern individual
            </p>

            {/* Contact Information */}
            <div className="space-y-2 text-sm font-light text-black/70">
              <div>
                <p className="font-normal text-black mb-1">Visit Us</p>
                <p>123 Madison Avenue</p>
                <p>New York, NY 10016</p>
              </div>
              <div>
                <p className="font-normal text-black mb-1 mt-3">Contact</p>
                <p>+1 (212) 555-0123</p>
                <p>hello@lineajewelry.com</p>
              </div>
            </div>
          </div>

          {/* Link lists - Right side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shop */}
            <div>
              <h4 className="text-sm font-normal mb-4">Shop</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href={themeHref(basePath, "/category/new-in")}
                    className="text-sm font-light text-black/70 hover:text-black transition-colors"
                  >
                    New In
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/category/rings")}
                    className="text-sm font-light text-black/70 hover:text-black transition-colors"
                  >
                    Rings
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/category/earrings")}
                    className="text-sm font-light text-black/70 hover:text-black transition-colors"
                  >
                    Earrings
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/category/bracelets")}
                    className="text-sm font-light text-black/70 hover:text-black transition-colors"
                  >
                    Bracelets
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/category/necklaces")}
                    className="text-sm font-light text-black/70 hover:text-black transition-colors"
                  >
                    Necklaces
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-normal mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href={themeHref(basePath, "/about/size-guide")}
                    className="text-sm font-light text-black/70 hover:text-black transition-colors"
                  >
                    Size Guide
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/about/customer-care")}
                    className="text-sm font-light text-black/70 hover:text-black transition-colors"
                  >
                    Care Instructions
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/about/customer-care")}
                    className="text-sm font-light text-black/70 hover:text-black transition-colors"
                  >
                    Returns
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/about/customer-care")}
                    className="text-sm font-light text-black/70 hover:text-black transition-colors"
                  >
                    Shipping
                  </a>
                </li>
                <li>
                  <a
                    href={themeHref(basePath, "/about/customer-care")}
                    className="text-sm font-light text-black/70 hover:text-black transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-sm font-normal mb-4">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">
                    Pinterest
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">
                    Newsletter
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-[#e5e5e5] -mx-6 px-6 pt-2">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm font-light text-black mb-1 md:mb-0">
            © 2024 Linea. All rights reserved. Template made by{" "}
            <a
              href="https://www.liljeros.co"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black/70 transition-colors underline"
            >
              Rickard Liljeros
            </a>
          </p>
          <div className="flex space-x-6">
            <a
              href={themeHref(basePath, "/privacy-policy")}
              className="text-sm font-light text-black hover:text-black/70 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href={themeHref(basePath, "/terms-of-service")}
              className="text-sm font-light text-black hover:text-black/70 transition-colors"
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
