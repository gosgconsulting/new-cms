import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContactModal } from "@/contexts/ContactModalContext";

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { openModal } = useContactModal();

  // Show button after scrolling down a bit
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Initial check in case page is already scrolled
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleSendMessage = () => {
    // Close the chat bubble and open the contact modal
    setIsChatOpen(false);
    openModal();
  };
  
  const openWhatsApp = () => {
    window.open(`https://wa.me/6580246850`, '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Chat Bubble */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                className="bg-white rounded-lg shadow-lg mb-4 w-72 overflow-hidden"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Chat Header */}
                <div className="bg-green-500 p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-white font-medium">Have a question?</h3>
                      <p className="text-green-100 text-sm">Chat with us!</p>
                      <p className="text-green-100 text-xs">+65 8024 6850</p>
                    </div>
                  </div>
                  <button onClick={handleCloseChat} className="text-white hover:text-green-200">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Chat Body */}
                <div className="p-4 bg-gray-50">
                  <div className="bg-green-100 p-3 rounded-lg rounded-bl-none inline-block max-w-[80%] mb-2">
                    <p className="text-sm text-gray-800">How can we help you? :)</p>
                    <span className="text-xs text-gray-500 mt-1 block">10:59</span>
                  </div>
                  <div className="text-center mt-2">
                    <button 
                      onClick={openWhatsApp}
                      className="text-xs text-green-600 hover:text-green-800 font-medium"
                    >
                      Contact us directly on WhatsApp: +65 8024 6850
                    </button>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="p-3 border-t flex">
                  <input 
                    type="text" 
                    placeholder="Write your message..." 
                    className="flex-1 border rounded-l-full px-4 py-2 text-sm focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="bg-green-500 text-white rounded-r-full px-4 py-2 hover:bg-green-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* WhatsApp Button */}
          <motion.button
            onClick={isChatOpen ? handleSendMessage : handleOpenChat}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="h-8 w-8" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppButton;