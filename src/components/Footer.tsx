import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-surface-variant text-on-surface py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="text-center">
          <div className="mb-6">
            <img 
              src="/lovable-uploads/d2d7d623-f729-433e-b350-0e40b4a32b91.png" 
              alt="GO SG CONSULTING Logo" 
              className="h-12 mx-auto"
            />
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
            <Link to="/privacy-policy" className="text-on-surface-variant hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <span className="hidden md:block text-muted-foreground">|</span>
            <Link to="/terms-of-service" className="text-on-surface-variant hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
          
          <div className="text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} GO SG CONSULTING. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;