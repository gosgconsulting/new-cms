import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContactModal } from "@/contexts/ContactModalContext";

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
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
    // Send message directly to WhatsApp
    if (userMessage.trim()) {
      window.open(`https://wa.me/6580246850?text=${encodeURIComponent(userMessage)}`, '_blank');
      setUserMessage("");
    } else {
      // If no message, just open WhatsApp
      window.open(`https://wa.me/6580246850`, '_blank');
    }
    setIsChatOpen(false);
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" className="h-6 w-6">
                        <defs><linearGradient id="a" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#57d163"/><stop offset="1" stopColor="#23b33a"/></linearGradient></defs>
                        <path fill="url(#a)" d="M87.4 175.5c-35.6 0-67-26.5-72.3-62-2.8-18.6 1.8-36.7 12.4-51.4l-9.5-32 31.8 9.5c13.8-8.2 29.8-11.1 45.6-8.3 35.5 6.2 61.7 37.9 61 73.8-.8 39.3-32.6 70.4-69 70.4zM87.7 17c-5.5 0-10.9.8-16.2 2.3-35.3 10.5-55.7 47.3-45.6 83 10.1 35.8 46.8 56.7 82.8 47.5 34.8-8.9 57.2-43.4 52-78.7-4.3-29.2-30-54.1-73-54.1z"/>
                        <path fill="#fff" d="M128.4 105.7c-.5-.2-17.6-8.8-20.3-9.8-2.8-1-4.8-1.5-6.8 1.5-2 3-7.7 9.8-9.5 11.8-1.7 2-3.5 2.3-6.5 .8-17.6-8.8-29.2-15.8-40.8-35.8-3.1-5.3 3-4.9 8.6-16.3 1-2 .5-3.8-.3-5.3-.8-1.5-6.8-16.3-9.3-22.3-2.4-5.9-4.9-5-6.7-5.1-1.7-.1-3.7-.1-5.7-.1-2 0-5.3 .8-8 3.8-2.7 3-10.3 10.1-10.3 24.7 0 14.6 10.6 28.7 12.1 30.7 1.5 2 21 32 51 44.9 30 12.9 30 8.6 35.5 8 5.5-.6 17.6-7.2 20.1-14.2 2.5-7 2.5-13 1.8-14.2-.8-1.3-2.8-2-5.8-3.5z"/>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-white font-medium">Have a question?</h3>
                      <p className="text-green-100 text-sm">Chat with us on WhatsApp!</p>
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
                      Contact us directly on WhatsApp
                    </button>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="p-3 border-t flex">
                  <input 
                    type="text" 
                    placeholder="Write your message..." 
                    className="flex-1 border rounded-l-full px-4 py-2 text-sm focus:outline-none"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    ref={inputRef}
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" className="h-8 w-8">
              <defs><linearGradient id="whatsapp-icon" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#57d163"/><stop offset="1" stopColor="#23b33a"/></linearGradient></defs>
              <path fill="white" d="M87.4 175.5c-35.6 0-67-26.5-72.3-62-2.8-18.6 1.8-36.7 12.4-51.4l-9.5-32 31.8 9.5c13.8-8.2 29.8-11.1 45.6-8.3 35.5 6.2 61.7 37.9 61 73.8-.8 39.3-32.6 70.4-69 70.4zM87.7 17c-5.5 0-10.9.8-16.2 2.3-35.3 10.5-55.7 47.3-45.6 83 10.1 35.8 46.8 56.7 82.8 47.5 34.8-8.9 57.2-43.4 52-78.7-4.3-29.2-30-54.1-73-54.1z"/>
              <path fill="white" d="M128.4 105.7c-.5-.2-17.6-8.8-20.3-9.8-2.8-1-4.8-1.5-6.8 1.5-2 3-7.7 9.8-9.5 11.8-1.7 2-3.5 2.3-6.5 .8-17.6-8.8-29.2-15.8-40.8-35.8-3.1-5.3 3-4.9 8.6-16.3 1-2 .5-3.8-.3-5.3-.8-1.5-6.8-16.3-9.3-22.3-2.4-5.9-4.9-5-6.7-5.1-1.7-.1-3.7-.1-5.7-.1-2 0-5.3 .8-8 3.8-2.7 3-10.3 10.1-10.3 24.7 0 14.6 10.6 28.7 12.1 30.7 1.5 2 21 32 51 44.9 30 12.9 30 8.6 35.5 8 5.5-.6 17.6-7.2 20.1-14.2 2.5-7 2.5-13 1.8-14.2-.8-1.3-2.8-2-5.8-3.5z"/>
            </svg>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppButton;