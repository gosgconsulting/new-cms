import React from 'react';
import { SpartiCMSWrapper } from '../../sparti-cms';
import FlowbiteExamples from '../components/FlowbiteExamples';

const ComponentsViewer: React.FC = () => {
  const sections = [
    { id: 'buttons', title: 'Buttons' },
    { id: 'alerts', title: 'Alerts' },
    { id: 'badges', title: 'Badges' },
    { id: 'cards', title: 'Cards' },
    { id: 'dropdowns', title: 'Dropdowns' },
    { id: 'modal', title: 'Modal' },
    { id: 'navbar', title: 'Navbar' },
    { id: 'pagination', title: 'Pagination' },
    { id: 'progress', title: 'Progress' },
    { id: 'tabs', title: 'Tabs' },
    { id: 'tooltips', title: 'Tooltips' },
    { id: 'accordion', title: 'Accordion' },
    { id: 'drawer', title: 'Drawer' },
    { id: 'forms', title: 'Forms' },
    { id: 'table', title: 'Table' },
  ];

  return (
    <SpartiCMSWrapper>
      <div className="flex min-h-screen bg-background">
        {/* Left Sidebar (anchors) */}
        <aside className="w-64 bg-white border-r border-gray-200 sticky top-0 h-screen hidden md:flex md:flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Flowbite Library</h2>
            <p className="text-xs text-gray-500 mt-1">Tailwind components</p>
          </div>
          <nav className="flex-1 overflow-auto p-3">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Sections</h3>
            <ul className="space-y-1">
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-3 border-t border-gray-200 text-xs text-gray-400">
            Flowbite examples
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Components Viewer (Flowbite)</h1>
            <FlowbiteExamples />
          </div>
        </main>
      </div>
    </SpartiCMSWrapper>
  );
};

export default ComponentsViewer;