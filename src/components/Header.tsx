import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  return (
    <header className={`w-full py-6 px-4 md:px-8 ${isHomepage ? 'bg-transparent absolute top-0 left-0 right-0 z-50' : 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100'}`}>
      <div className="container mx-auto">
        <div className="flex items-center justify-center">
          {/* Logo */}
          <Link to="/" className="text-3xl font-bold">
            <span className="text-deepBlue">GO</span> <span className="text-coral">SG</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;