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
  BarChart3,
  Users
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

// Import existing components
import PagesManager from '../cms/PagesManager';
import FormsManager from '../cms/FormsManager';

// Import new components
import SettingsManager from './SettingsManager';
import DeveloperManager from './DeveloperManager';
import HeaderManager from './HeaderManager';
import FooterManager from './FooterManager';
import AnalyticsManager from './AnalyticsManager';
import ContactsManager from './ContactsManager';

// Placeholder components
const BlogManager = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Blog Management</h2>
    <p className="text-gray-600">Blog management features will be implemented here.</p>
  </div>
);




const CMSDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const { signOut } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsManager />;
      case 'pages':
        return <PagesManager />;
      case 'blog':
        return <BlogManager />;
      case 'header':
        return <HeaderManager />;
      case 'footer':
        return <FooterManager />;
      case 'forms':
        return <FormsManager />;
      case 'contacts':
        return <ContactsManager />;
      case 'settings':
        return <SettingsManager />;
      case 'developer':
        return <DeveloperManager />;
      default:
        return <div className="text-gray-500">Select a section from the sidebar</div>;
    }
  };

  const navItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'blog', label: 'Blog', icon: PenTool },
    { id: 'header', label: 'Header', icon: Layout },
    { id: 'footer', label: 'Footer', icon: Minus },
    { id: 'forms', label: 'Forms', icon: FileInput },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'developer', label: 'Developer', icon: SettingsIcon },
  ];

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.id === activeTab);
    return currentItem ? currentItem.label : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Sparti</h1>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-1">
              <a
                href="/"
                target="_blank"
                className="w-full flex items-center px-3 py-2.5 text-left rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                <Home className="mr-3 h-5 w-5" />
                View Site
              </a>

              <button
                onClick={signOut}
                className="w-full flex items-center px-3 py-2.5 text-left rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage settings and integrations for <span className="font-medium">your site</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSDashboard;