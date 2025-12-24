import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { Coins, HelpCircle, User } from 'lucide-react';
import SpartiLogo from '@/components/LeadmapLogo';
import { useCopilot } from '@/contexts/CopilotContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { TokensModal } from '@/components/TokensModal';
import { useTokenContext } from '@/contexts/TokenContext';

export const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCopilot } = useCopilot();
  const [showTokensModal, setShowTokensModal] = useState(false);
  const { tokenUsage } = useTokenContext();

  return (
    <>
      <nav className="w-full h-16 border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/app/copilot')}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <SpartiLogo size="sm" />
            </button>
          </div>

          {/* Center: Menu Items */}
          <div className="flex items-center gap-6">
            {selectedCopilot && (
              <div className="flex items-center gap-1">
                {selectedCopilot.menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Right: Icon Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTokensModal(true)}
              className="relative"
              title="Tokens"
            >
              <Coins className="h-5 w-5" />
              {tokenUsage && (
                <span className="absolute -top-1 -right-1 h-4 px-1.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full">
                  {(tokenUsage.token_limit - tokenUsage.tokens_used).toFixed(0)}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/support')}
              title="Get Help"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/account')}
              title="Account"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <TokensModal 
        isOpen={showTokensModal} 
        onClose={() => setShowTokensModal(false)} 
      />
    </>
  );
};
