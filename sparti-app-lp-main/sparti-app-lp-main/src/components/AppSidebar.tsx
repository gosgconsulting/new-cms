import { useState, useEffect } from "react";
import { Database, Bot, BarChart3, LogOut, Settings, Workflow, Building2, Coins, User, Search, FileText, Link2, Users, Target, CalendarDays, HelpCircle } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCopilot } from "@/contexts/CopilotContext";
import { Button } from "@/components/ui/button";
import LeadmapLogo from "@/components/LeadmapLogo";
import SidebarBrandDropdown from "@/components/SidebarBrandDropdown";
import { TokensModal } from "@/components/TokensModal";
import { useTokenContext } from "@/contexts/TokenContext";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// Base navigation items - removed copilot link since logo already navigates there
const getMainItems = (selectedCopilot: any) => [];

const footerItems = [
  { title: "Tokens", url: "#", icon: Coins },
  { title: "Get Help", url: "/app/support", icon: HelpCircle, highlight: true },
  { title: "Account", url: "/app/account", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const { selectedCopilot, isLaunched } = useCopilot();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showTokensModal, setShowTokensModal] = useState(false);
  const { tokenUsage, isLoading } = useTokenContext();
  const [isAdmin, setIsAdmin] = useState(false);

  const isActive = (path: string) => currentPath === path;
  
  // Get main items with dynamic copilot name
  const mainItems = getMainItems(selectedCopilot).filter(item => {
    if (item.title === "Workflow") {
      return isAdmin;
    }
    return true; // Show all other items
  });
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      }
    };
    
    checkAdminStatus();
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <SidebarTrigger />
          <LeadmapLogo size="sm" onClick={() => navigate('/app/copilot')} />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dynamic Copilot Menu Items */}
        {isLaunched && selectedCopilot && (
          <SidebarGroup>
            {/* Brand Selector - directly below copilot name */}
            <div className="px-2 py-2">
              <SidebarBrandDropdown />
            </div>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {selectedCopilot.menuItems.map((item) => {
                  const isCurrentPath = currentPath.split('?')[0] === item.path.split('?')[0];
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isCurrentPath}>
                        <NavLink to={item.path}>
                          <item.icon />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Token Usage Bar */}
          {state !== "collapsed" && !isLoading && tokenUsage && (
            <div 
              className="px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-md mx-2 mb-2 border border-border/50"
              onClick={() => setShowTokensModal(true)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">{tokenUsage?.plan_name || 'Free Trial'}</span>
                <span className="text-sm font-semibold text-foreground">
                  {tokenUsage?.tokens_used.toFixed(2) || '0.00'} / {tokenUsage?.token_limit || 5}
                </span>
              </div>
              
              {/* Days remaining message */}
              {tokenUsage?.days_remaining !== null && tokenUsage?.days_remaining !== undefined && (
                <div className="text-xs text-muted-foreground mb-2">
                  {tokenUsage.reset_date ? (
                    <>Tokens reset in {tokenUsage.days_remaining} {tokenUsage.days_remaining === 1 ? 'day' : 'days'}</>
                  ) : (
                    <>Trial ends in {tokenUsage.days_remaining} {tokenUsage.days_remaining === 1 ? 'day' : 'days'}</>
                  )}
                </div>
              )}
              
              {isAdmin ? (
                <div className="text-xs text-muted-foreground">Unlimited</div>
              ) : (
                <Progress 
                  value={tokenUsage?.usage_percentage || 0} 
                  className="h-1.5"
                />
              )}
            </div>
          )}
          
          {footerItems.filter(item => item.title !== "Tokens").map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive(item.url)}
                className={(item as any).highlight ? 'bg-primary/10 hover:bg-primary/20 text-primary font-semibold' : ''}
              >
                <NavLink to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
      
      <TokensModal isOpen={showTokensModal} onClose={() => setShowTokensModal(false)} />
    </Sidebar>
  );
}