import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  PenTool, 
  Settings as SettingsIcon, 
  LogOut, 
  Users,
  ChevronDown,
  ChevronRight,
  Code,
  Mail,
  Image as ImageIcon,
  FileInput,
  Shield,
  ArrowRight,
  Map,
  Building2,
  Palette,
  Store,
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { motion } from 'framer-motion';
import gosgLogo from "@/assets/go-sg-logo-official.png";
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

// Import existing components
import PagesManager from '../cms/PagesManager';
import FormsManager from '../cms/FormsManager';
import MediaManager from '../cms/MediaManager';

// Import blog management components
import PostsManager from '../cms/PostsManager';
import CategoriesManager from '../cms/CategoriesManager';
import TagsManager from '../cms/TagsManager';

// Import SEO management components
import RedirectsManager from '../seo/RedirectsManager';
import RobotsManager from '../seo/RobotsManager';
import SitemapManager from '../seo/SitemapManager';

// Import new components
import DeveloperManager from './DeveloperManager';
import ContactsManager from './ContactsManager';
import MyAccountPage from './MyAccountPage';
import UsersManager from './UsersManager';
import TenantsManager from './TenantsManager';
import ThemesManager from './ThemesManager';

import BrandingSettingsPage from './BrandingSettingsPage';
import StylesSettingsPage from './StylesSettingsPage';
import TenantSelector from './TenantSelector';
import ThemeSelector from './ThemeSelector';
import AccessKeysManager from './AccessKeysManager';

// Import shop components
import ProductsManager from './ProductsManager';
import ProductCategoriesManager from './ProductCategoriesManager';
import OrdersManager from './OrdersManager';
import PaymentsManager from './PaymentsManager';
import ShopSettingsManager from './ShopSettingsManager';

// Tenant type for local state
interface Tenant {
  id: string;
  name: string;
  isDevelopment?: boolean;
  theme_id?: string | null;
}

// Blog Management Component
const BlogManager = () => {
  const [activeBlogTab, setActiveBlogTab] = useState('posts');

  const renderBlogContent = () => {
    switch (activeBlogTab) {
      case 'posts':
        return <PostsManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'tags':
        return <TagsManager />;
      default:
        return <PostsManager />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-semibold text-foreground">Blog Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your blog content, categories, and tags
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex space-x-2 border-b border-border mb-6">
            <button 
              onClick={() => setActiveBlogTab('posts')}
              className={`px-4 py-2 text-sm font-medium ${activeBlogTab === 'posts' 
                ? 'text-brandPurple border-b-2 border-brandPurple' 
                : 'text-muted-foreground hover:text-foreground'}`}
            >
              Posts
            </button>
            <button 
              onClick={() => setActiveBlogTab('categories')}
              className={`px-4 py-2 text-sm font-medium ${activeBlogTab === 'categories' 
                ? 'text-brandPurple border-b-2 border-brandPurple' 
                : 'text-muted-foreground hover:text-foreground'}`}
            >
              Categories
            </button>
            <button 
              onClick={() => setActiveBlogTab('tags')}
              className={`px-4 py-2 text-sm font-medium ${activeBlogTab === 'tags' 
                ? 'text-brandPurple border-b-2 border-brandPurple' 
                : 'text-muted-foreground hover:text-foreground'}`}
            >
              Tags
            </button>
          </div>
          
          {renderBlogContent()}
        </div>
      </div>
    </div>
  );
};

interface SettingsManagerProps {
  currentTenantId: string;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ currentTenantId }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('branding');

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'branding':
        return <BrandingSettingsPage currentTenantId={currentTenantId} />;
      case 'styles':
        return <StylesSettingsPage currentTenantId={currentTenantId} />;
      case 'access-keys':
        return <AccessKeysManager />;
      default:
        return <BrandingSettingsPage currentTenantId={currentTenantId} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your site settings and appearance
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex space-x-2 border-b border-border mb-6">
            <button 
              onClick={() => setActiveSettingsTab('branding')}
              className={`px-4 py-2.5 text-sm font-medium transition-all ${activeSettingsTab === 'branding' 
                ? 'text-brandPurple border-b-2 border-brandPurple bg-brandPurple/5' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              Branding
            </button>
            <button 
              onClick={() => setActiveSettingsTab('styles')}
              className={`px-4 py-2.5 text-sm font-medium transition-all ${activeSettingsTab === 'styles' 
                ? 'text-brandPurple border-b-2 border-brandPurple bg-brandPurple/5' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              Styles
            </button>
            <button 
              onClick={() => setActiveSettingsTab('access-keys')}
              className={`px-4 py-2.5 text-sm font-medium transition-all ${activeSettingsTab === 'access-keys' 
                ? 'text-brandPurple border-b-2 border-brandPurple bg-brandPurple/5' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              Access Keys
            </button>
          </div>
          
          {renderSettingsContent()}
        </div>
      </div>
    </div>
  );
};

interface CMSDashboardProps {
  hideSidebar?: boolean;
}

const CMSDashboard: React.FC<CMSDashboardProps> = ({ hideSidebar = false }) => {
  const [activeTab, setActiveTab] = useState<string>('pages');
  const [mode, setMode] = useState<'cms' | 'shop'>('cms');
  const [crmExpanded, setCrmExpanded] = useState<boolean>(false);
  const [usersExpanded, setUsersExpanded] = useState<boolean>(false);
  const [seoExpanded, setSeoExpanded] = useState<boolean>(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentThemeId, setCurrentThemeId] = useState<string>('custom');
  const { signOut, user, currentTenantId, handleTenantChange } = useAuth();
  const navigate = useNavigate();

  // Reset activeTab when switching modes
  useEffect(() => {
    if (mode === 'cms') {
      setActiveTab('pages');
    } else {
      setActiveTab('products');
    }
  }, [mode]);
  
  // Handle theme change
  const handleThemeChange = (themeId: string) => {
    setCurrentThemeId(themeId);
    // Store in localStorage for persistence
    localStorage.setItem('sparti-current-theme-id', themeId);
  };

  // Fetch all tenants (returns full tenant data including database and API keys)
  // For super admins: returns all tenants
  // For regular users: returns their single tenant if currentTenantId is set
  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/tenants`);
        if (response.ok) {
          const data = await response.json();
          // Add isDevelopment flag based on tenant id
          return data.map((t: any) => ({
            ...t,
            isDevelopment: t.id === 'tenant-dev' || !!t.isDevelopment,
          }));
        } else {
          console.error(`Failed to fetch tenants`);
          return [];
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Automatically set currentThemeId based on tenant's theme_id when tenant changes
  // This runs after tenants are loaded and when currentTenantId changes
  useEffect(() => {
    try {
      if (currentTenantId && Array.isArray(tenants) && tenants.length > 0) {
        const currentTenant = tenants.find(t => t && t.id === currentTenantId);
        if (currentTenant) {
          // If tenant has a theme_id, use it; otherwise use 'custom'
          const themeIdToUse = currentTenant.theme_id || 'custom';
          console.log(`[testing] Setting theme based on tenant ${currentTenant.id}: theme_id=${currentTenant.theme_id}, using=${themeIdToUse}`);
          setCurrentThemeId(themeIdToUse);
          localStorage.setItem('sparti-current-theme-id', themeIdToUse);
          return;
        }
      }
      
      // No tenant selected or tenant not found, default to 'custom'
      // Only update if not already 'custom' to avoid unnecessary updates
      const currentSavedTheme = localStorage.getItem('sparti-current-theme-id');
      if (!currentSavedTheme || currentSavedTheme !== 'custom') {
        setCurrentThemeId('custom');
        localStorage.setItem('sparti-current-theme-id', 'custom');
      }
    } catch (error) {
      console.error('[testing] Error in theme selection useEffect:', error);
      // Fallback to 'custom' on error
      setCurrentThemeId('custom');
      localStorage.setItem('sparti-current-theme-id', 'custom');
    }
  }, [currentTenantId, tenants]);

  // Find current tenant from the tenants array
  const tenant = currentTenantId 
    ? tenants.find(t => t.id === currentTenantId) || null
    : null;

  const renderContent = () => {
    // Shop mode content
    if (mode === 'shop') {
      switch (activeTab) {
        case 'products':
          return <ProductsManager currentTenantId={currentTenantId || ''} />;
        case 'categories':
          return <ProductCategoriesManager currentTenantId={currentTenantId || ''} />;
        case 'orders':
          return <OrdersManager currentTenantId={currentTenantId || ''} />;
        case 'payments':
          return <PaymentsManager currentTenantId={currentTenantId || ''} />;
        case 'shop-settings':
          return <ShopSettingsManager currentTenantId={currentTenantId || ''} />;
        default:
          return <div className="text-muted-foreground">Select a section from the sidebar</div>;
      }
    }

    // CMS mode content
    switch (activeTab) {
      case 'pages':
        return <PagesManager 
          onEditModeChange={setIsEditMode} 
          currentTenantId={currentTenantId || ''}
          currentThemeId={currentThemeId}
        />;
      case 'blog':
        return <BlogManager />;
      case 'media':
        return <MediaManager />;
      case 'contacts':
        return <ContactsManager 
          currentTenantId={currentTenantId || ''}
        />;
      case 'forms':
        return <FormsManager />;
      case 'my-account':
        return <MyAccountPage />;
      case 'users':
        return <UsersManager />;
      case 'settings':
        return <SettingsManager 
          currentTenantId={currentTenantId || ''}
        />;
      case 'developer':
        return <DeveloperManager 
          currentTenantId={currentTenantId || ''}
          currentThemeId={currentThemeId}
        />;
      case 'redirects':
        return <RedirectsManager />;
      case 'robots':
        return <RobotsManager />;
      case 'sitemap':
        return <SitemapManager />;
      case 'tenants':
        return <TenantsManager />;
      case 'themes':
        return <ThemesManager />;
      default:
        return <div className="text-muted-foreground">Select a section from the sidebar</div>;
    }
  };

  const cmsNavItems = [
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'blog', label: 'Blog', icon: PenTool },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'developer', label: 'Developer', icon: Code },
    { id: 'tenants', label: 'Tenants', icon: Building2 },
    { id: 'themes', label: 'Themes', icon: Palette },
  ].filter(item => user?.is_super_admin || (item.id !== 'tenants' && item.id !== 'themes'));

  const shopNavItems = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'shop-settings', label: 'Shop Settings', icon: SettingsIcon },
  ];

  const navItems = mode === 'cms' ? cmsNavItems : shopNavItems;

  const usersItems = [
    { id: 'my-account', label: 'My Account', icon: Users },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const crmItems = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'forms', label: 'Forms', icon: FileInput },
  ];

  const seoItems = [
    { id: 'redirects', label: 'Redirects', icon: ArrowRight },
    { id: 'robots', label: 'Robots.txt', icon: Shield },
    { id: 'sitemap', label: 'Sitemap', icon: Map },
  ];

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.id === activeTab) || 
                      crmItems.find(item => item.id === activeTab) ||
                      usersItems.find(item => item.id === activeTab) ||
                      seoItems.find(item => item.id === activeTab);
    return currentItem ? currentItem.label : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Fixed for desktop, hidden in edit mode */}
      <motion.div 
        className="fixed left-0 top-0 w-64 h-screen bg-white/80 backdrop-blur-md shadow-md border-r border-border z-40"
        initial={{ x: -20, opacity: 0 }}
        animate={{ 
          x: (hideSidebar || isEditMode) ? -256 : 0, 
          opacity: (hideSidebar || isEditMode) ? 0 : 1 
        }}
        transition={{ duration: 0.3 }}
      >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <img 
              src={gosgLogo} 
              alt="GO SG Digital Marketing Agency" 
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-bold text-foreground">Admin</h1>
          </div>
        </div>
        
        {/* Mode Switcher */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setMode('cms')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md transition-all ${
                mode === 'cms'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">CMS</span>
            </button>
            <button
              onClick={() => setMode('shop')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md transition-all ${
                mode === 'shop'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Store className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Shop</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-secondary text-foreground font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-brandPurple' : ''}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
            
            {/* Users Submenu */}
            <li>
              <button
                onClick={() => setUsersExpanded(!usersExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                  usersItems.some(item => item.id === activeTab)
                    ? 'bg-secondary text-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center">
                  <Users className={`mr-3 h-5 w-5 ${usersItems.some(item => item.id === activeTab) ? 'text-brandPurple' : ''}`} />
                  Users
                </div>
                {usersExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {usersExpanded && (
                <ul className="mt-1 ml-4 space-y-1">
                  {usersItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    if (item.id === 'users' && user?.role !== 'admin') {
                      return null;
                    }
                    
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-secondary text-foreground font-medium shadow-sm'
                              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                          }`}
                        >
                          <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-brandTeal' : ''}`} />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>

            {/* CRM Submenu */}
            <li>
              <button
                onClick={() => setCrmExpanded(!crmExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                  crmItems.some(item => item.id === activeTab)
                    ? 'bg-secondary text-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center">
                  <Mail className={`mr-3 h-5 w-5 ${crmItems.some(item => item.id === activeTab) ? 'text-brandPurple' : ''}`} />
                  CRM
                </div>
                {crmExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {crmExpanded && (
                <ul className="mt-1 ml-4 space-y-1">
                  {crmItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-secondary text-foreground font-medium shadow-sm'
                              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                          }`}
                        >
                          <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-brandTeal' : ''}`} />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>

            {/* SEO Submenu */}
            <li>
              <button
                onClick={() => setSeoExpanded(!seoExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                  seoItems.some(item => item.id === activeTab)
                    ? 'bg-secondary text-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center">
                  <Shield className={`mr-3 h-5 w-5 ${seoItems.some(item => item.id === activeTab) ? 'text-brandPurple' : ''}`} />
                  SEO
                </div>
                {seoExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {seoExpanded && (
                <ul className="mt-1 ml-4 space-y-1">
                  {seoItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-secondary text-foreground font-medium shadow-sm'
                              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                          }`}
                        >
                          <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-brandTeal' : ''}`} />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
            
            {/* Remaining navigation items */}
            {navItems.slice(2).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-secondary text-foreground font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-brandPurple' : ''}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer with Tenant Switcher */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Sign Out Button */}
          {user ? (
            <button
              onClick={() => signOut()}
              className="w-full flex items-center px-3 py-2 text-left rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="w-full flex items-center px-3 py-2 text-left rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200"
            >
              <Users className="mr-3 h-5 w-5" />
              Sign In
            </button>
          )}
        </div>
      </div>
      </motion.div>

      {/* Main Content - Offset for fixed sidebar, full width in edit mode */}
      <motion.div 
        className="flex flex-col min-h-screen"
        animate={{ 
          marginLeft: (hideSidebar || isEditMode) ? 0 : 256 
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Top Bar */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md shadow-sm border-b border-border p-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
              {user?.is_super_admin && tenant && (
                <div className="px-2 py-1 rounded bg-secondary/50 text-xs font-medium flex items-center">
                  <span>Tenant: {tenant.name}</span>
                  {tenant.isDevelopment && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Dev</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <TenantSelector
                currentTenantId={currentTenantId || ''}
                onTenantChange={handleTenantChange}
                isSuperAdmin={user?.is_super_admin || false}
                onAddNewTenant={() => setActiveTab('tenants')}
              />
              <ThemeSelector
                currentThemeId={currentThemeId}
                onThemeChange={handleThemeChange}
                isSuperAdmin={user?.is_super_admin || false}
              />
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div 
          className={`flex-1 overflow-auto ${isEditMode ? 'p-0' : 'p-6'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CMSDashboard;