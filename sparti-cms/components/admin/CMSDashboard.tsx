import React, { useState } from 'react';
import { 
  FileText, 
  PenTool, 
  Layout, 
  Minus, 
  FileInput, 
  Settings as SettingsIcon, 
  LogOut, 
  Home,
  ArrowLeft,
  Users,
  ChevronDown,
  ChevronRight,
  Code,
  Mail,
  Layers
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { motion } from 'framer-motion';
import gosgLogo from "@/assets/go-sg-logo-official.png";

// Import existing components
import PagesManager from '../cms/PagesManager';
import FormsManager from '../cms/FormsManager';

// Import new components
import SettingsManager from './SettingsManager';
import DeveloperManager from './DeveloperManager';
import ContactsManager from './ContactsManager';
import SMTPManager from './SMTPManager';
import ComponentsManager from './ComponentsManager';

// Placeholder components
const BlogManager = () => (
  <div className="bg-white rounded-lg border border-border shadow-sm p-6">
    <h2 className="text-lg font-semibold text-foreground mb-4">Blog Management</h2>
    <p className="text-muted-foreground">Blog management features will be implemented here.</p>
  </div>
);




const CMSDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pages');
  const [crmExpanded, setCrmExpanded] = useState<boolean>(false);
  const { signOut } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'pages':
        return <PagesManager />;
      case 'blog':
        return <BlogManager />;
      case 'components':
        return <ComponentsManager />;
      case 'forms':
        return <FormsManager />;
      case 'contacts':
        return <ContactsManager />;
      case 'smtp':
        return <SMTPManager />;
      case 'settings':
        return <SettingsManager />;
      case 'developer':
        return <DeveloperManager />;
      default:
        return <div className="text-muted-foreground">Select a section from the sidebar</div>;
    }
  };

  const navItems = [
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'blog', label: 'Blog', icon: PenTool },
    { id: 'components', label: 'Components', icon: Layers },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'developer', label: 'Developer', icon: Code },
  ];

  const crmItems = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'forms', label: 'Forms', icon: FileInput },
    { id: 'smtp', label: 'SMTP', icon: Mail },
  ];

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.id === activeTab) || 
                        crmItems.find(item => item.id === activeTab);
    return currentItem ? currentItem.label : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      {activeTab !== 'components' && (
        <motion.div 
          className="w-64 bg-white/80 backdrop-blur-md shadow-md border-r border-border flex-shrink-0"
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
              
              {/* CRM Submenu - positioned after Blog */}
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
                    <Users className={`mr-3 h-5 w-5 ${crmItems.some(item => item.id === activeTab) ? 'text-brandPurple' : ''}`} />
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
          
          {/* Bottom Actions */}
          <div className="p-4 border-t border-border">
            <div className="space-y-1">
              <a
                href="/"
                target="_blank"
                className="w-full flex items-center px-3 py-2.5 text-left rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200"
              >
                <Home className="mr-3 h-5 w-5" />
                View Site
              </a>

              <button
                onClick={signOut}
                className="w-full flex items-center px-3 py-2.5 text-left rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-border px-6 py-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{getPageTitle()}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage settings and integrations for <span className="font-medium">your site</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-secondary/10 to-background relative">
          {/* Diagonal gradient accents */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brandPurple/5 to-transparent blur-3xl rotate-45 -z-10"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-tl from-brandTeal/5 to-transparent blur-3xl -rotate-45 -z-10"></div>
          
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CMSDashboard;