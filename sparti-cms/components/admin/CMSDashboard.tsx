import React, { useState } from 'react';
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
  Check,
  ChevronsUpDown,
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
import SMTPManager from './SMTPManager';
import MyAccountPage from './MyAccountPage';
import UsersManager from './UsersManager';
import TenantsManager from './TenantsManager';

import BrandingSettingsPage from './BrandingSettingsPage';
import ButtonSettingsPage from './ButtonSettingsPage';
import TenantSelector from './TenantSelector';
import TypographySettingsPage from './TypographySettingsPage';
import ColorSettingsPage from './ColorSettingsPage';
import AccessKeysManager from './AccessKeysManager';

// Tenant type for local state
interface Tenant {
  id: string;
  name: string;
  isDevelopment?: boolean;
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

const SettingsManager = () => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('branding');

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'branding':
        return <BrandingSettingsPage />;
      case 'buttons':
        return <ButtonSettingsPage />;
      case 'typography':
        return <TypographySettingsPage />;
      case 'colors':
        return <ColorSettingsPage />;
      case 'access-keys':
        return <AccessKeysManager />;
      default:
        return <BrandingSettingsPage />;
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
              className={`px-4 py-2 text-sm font-medium ${activeSettingsTab === 'branding' 
                ? 'text-brandPurple border-b-2 border-brandPurple' 
                : 'text-muted-foreground hover:text-foreground'}`}
            >
              Branding
            </button>
            <button 
              onClick={() => setActiveSettingsTab('buttons')}
              className={`px-4 py-2 text-sm font-medium ${activeSettingsTab === 'buttons' 
                ? 'text-brandPurple border-b-2 border-brandPurple' 
                : 'text-muted-foreground hover:text-foreground'}`}
            >
              Buttons
            </button>
            <button 
              onClick={() => setActiveSettingsTab('typography')}
              className={`px-4 py-2 text-sm font-medium ${activeSettingsTab === 'typography' 
                ? 'text-brandPurple border-b-2 border-brandPurple' 
                : 'text-muted-foreground hover:text-foreground'}`}
            >
              Typography
            </button>
            <button 
              onClick={() => setActiveSettingsTab('colors')}
              className={`px-4 py-2 text-sm font-medium ${activeSettingsTab === 'colors' 
                ? 'text-brandPurple border-b-2 border-brandPurple' 
                : 'text-muted-foreground hover:text-foreground'}`}
            >
              Colors
            </button>
            <button 
              onClick={() => setActiveSettingsTab('access-keys')}
              className={`px-4 py-2 text-sm font-medium ${activeSettingsTab === 'access-keys' 
                ? 'text-brandPurple border-b-2 border-brandPurple' 
                : 'text-muted-foreground hover:text-foreground'}`}
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

const CMSDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pages');
  const [crmExpanded, setCrmExpanded] = useState<boolean>(false);
  const [usersExpanded, setUsersExpanded] = useState<boolean>(false);
  const [seoExpanded, setSeoExpanded] = useState<boolean>(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState<boolean>(false);
  const { signOut, user, currentTenantId, handleTenantChange } = useAuth();
  const navigate = useNavigate();

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

  // Find current tenant from the tenants array
  const tenant = currentTenantId 
    ? tenants.find(t => t.id === currentTenantId) || null
    : null;

  const renderContent = () => {
    switch (activeTab) {
      case 'pages':
        return <PagesManager />;
      case 'blog':
        return <BlogManager />;
      case 'media':
        return <MediaManager />;
      case 'contacts':
        return <ContactsManager />;
      case 'forms':
        return <FormsManager />;
      case 'smtp':
        return <SMTPManager />;
      case 'my-account':
        return <MyAccountPage />;
      case 'users':
        return <UsersManager />;
      case 'settings':
        return <SettingsManager />;
      case 'developer':
        return <DeveloperManager />;
      case 'redirects':
        return <RedirectsManager />;
      case 'robots':
        return <RobotsManager />;
      case 'sitemap':
        return <SitemapManager />;
      case 'tenants':
        return <TenantsManager />;
      default:
        return <div className="text-muted-foreground">Select a section from the sidebar</div>;
    }
  };

  const navItems = [
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'blog', label: 'Blog', icon: PenTool },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'developer', label: 'Developer', icon: Code },
    { id: 'tenants', label: 'Tenants', icon: Building2 },
  ].filter(item => user?.is_super_admin || item.id !== 'tenants');

  const usersItems = [
    { id: 'my-account', label: 'My Account', icon: Users },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const crmItems = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'forms', label: 'Forms', icon: FileInput },
    { id: 'smtp', label: 'SMTP', icon: Mail },
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
      {/* Sidebar - Fixed for desktop */}
      <motion.div 
        className="fixed left-0 top-0 w-64 h-screen bg-white/80 backdrop-blur-md shadow-md border-r border-border z-40"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
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
          {/* Tenant Switcher - Hidden when forced tenant is active */}
          {user?.is_super_admin && (
            <div className="relative">
              <button
                onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200 border border-border"
              >
                <div className="flex items-center">
                  <Building2 className="mr-3 h-5 w-5 text-brandTeal" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">{tenant?.name || 'Select Tenant'}</div>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </button>
              
              {/* Dropdown */}
              {tenantDropdownOpen && (
                <div className="absolute bottom-full mb-1 left-0 w-full bg-white rounded-lg border border-border shadow-lg z-50">
                  <div className="p-2 border-b border-border">
                    <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1">Switch Tenant</h3>
                  </div>
                  <ul className="max-h-60 overflow-auto py-1">
                    {tenants.map((tenant) => (
                      <li key={tenant.id}>
                        <button
                          onClick={() => handleTenantChange(tenant.id)}
                          className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="text-foreground">{tenant.name}</span>
                            {tenant.isDevelopment && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Dev</span>
                            )}
                          </div>
                          {currentTenantId === tenant.id && (
                            <Check className="h-4 w-4 text-brandTeal" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="p-2 border-t border-border">
                    <button
                      className="w-full text-left text-xs px-2 py-1 text-brandPurple hover:text-brandPurple/80 transition-colors"
                      onClick={() => {
                        setTenantDropdownOpen(false);
                        setActiveTab('tenants');
                      }}
                    >
                      + Add New Tenant
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
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

      {/* Main Content - Offset for fixed sidebar */}
      <div className="ml-64 flex flex-col min-h-screen">
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
                currentTenantId={currentTenantId || user?.tenant_id || ''}
                onTenantChange={handleTenantChange}
                isSuperAdmin={user?.is_super_admin || false}
              />
              <span className="text-sm text-muted-foreground">
                {user ? `Welcome back, ${user.email || 'Admin'}` : 'Public Dashboard'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div 
          className="flex-1 p-6 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default CMSDashboard;
