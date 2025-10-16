import React, { useState, useMemo } from 'react';
import { Search, Layers, Eye } from 'lucide-react';
import { componentRegistry } from '../../registry';

const ComponentsManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allComponents = componentRegistry.getAll();

  // Get unique categories with counts
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    allComponents.forEach(comp => {
      const category = comp.category || 'other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    return [
      { id: 'all', label: 'All Components', count: allComponents.length },
      ...Array.from(categoryMap.entries()).map(([id, count]) => ({
        id,
        label: id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        count
      }))
    ];
  }, [allComponents]);

  // Filter components
  const filteredComponents = useMemo(() => {
    let filtered = allComponents;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(comp => comp.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(comp => 
        comp.name.toLowerCase().includes(query) ||
        comp.description.toLowerCase().includes(query) ||
        comp.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [allComponents, selectedCategory, searchQuery]);

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Layers className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Components</h2>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-purple-50 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">{category.label}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === category.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedCategory === 'all' 
                ? 'All Components' 
                : categories.find(c => c.id === selectedCategory)?.label || 'Components'}
            </h1>
            <p className="text-sm text-gray-500">
              {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <div
                key={component.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Preview Area */}
                <div className="h-40 bg-gray-50 flex items-center justify-center border-b border-gray-200">
                  <div className="text-center">
                    <div className="text-6xl text-gray-300 mb-2">T</div>
                    <p className="text-sm text-gray-500">Preview</p>
                  </div>
                </div>

                {/* Component Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {component.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {component.category || 'other'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  {component.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {component.description}
                    </p>
                  )}

                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search query' 
                  : 'No components available in this category'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentsManager;
