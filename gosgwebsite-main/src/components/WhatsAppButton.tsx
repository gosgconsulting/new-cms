import { useState } from "react";
import { Button } from "@/components/ui/button";
const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  return isVisible ? <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      
    </div> : null;
};
export default WhatsAppButton;