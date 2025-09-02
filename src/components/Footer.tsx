import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-800 py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="text-center">
          <div className="mb-6">
            <img 
              src="/lovable-uploads/d6e7a1ca-229a-4c34-83fc-e9bdf106b683.png" 
              alt="GO SG CONSULTING Logo" 
              className="h-12 mx-auto"
            />
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6 py-4 px-8 rounded-lg bg-gradient-to-r from-gray-200/50 to-gray-300/50">
            <Link to="/privacy-policy" className="text-gray-600 hover:text-coral transition-colors">
              Privacy Policy
            </Link>
            <span className="hidden md:block text-gray-400">|</span>
            <Link to="/terms-of-service" className="text-gray-600 hover:text-coral transition-colors">
              Terms of Service
            </Link>
          </div>
          
          <div className="text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} GO SG CONSULTING. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;