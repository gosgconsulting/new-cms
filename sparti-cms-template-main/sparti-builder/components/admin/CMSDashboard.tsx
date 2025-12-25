import React, { useState } from 'react';
import { FileText, Type, Palette, Image, FileImage, Users, LogOut, Home } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import ColorSettings from '../cms/ColorSettings';
import TypographySettings from '../cms/TypographySettings';
import BrandingSettings from '../cms/BrandingSettings';
import MediaManager from '../cms/MediaManager';
import PagesManager from '../cms/PagesManager';

const CMSDashboard: React.FC = () => {
  console.log('CMSDashboard rendering successfully');
  const [activeTab, setActiveTab] = useState<string>('pages');
  const { signOut } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'pages':
        return <PagesManager />;
      case 'typography':
        return <TypographySettings />;
      case 'colors':
        return <ColorSettings />;
      case 'branding':
        return <BrandingSettings />;
      case 'media':
        return <MediaManager />;
      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  const navItems = [
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'branding', label: 'Branding', icon: Image },
    { id: 'media', label: 'Media', icon: FileImage },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Sparti CMS</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
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
          
          {/* Quick Actions */}
          <div className="p-6 border-t border-gray-200">
            <div className="space-y-2">
              <a
                href="/"
                target="_blank"
                className="w-full flex items-center px-3 py-2 text-left rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Home className="mr-3 h-5 w-5" />
                View Site
              </a>
              <a
                href="/admin/components"
                className="w-full flex items-center px-3 py-2 text-left rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Users className="mr-3 h-5 w-5" />
                Components
              </a>
              <button
                onClick={signOut}
                className="w-full flex items-center px-3 py-2 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CMSDashboard;