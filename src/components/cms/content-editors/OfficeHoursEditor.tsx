import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface OfficeHoursItem {
  date: string;
  time: string;
}

interface OfficeHoursEditorProps {
  items?: OfficeHoursItem[];
  onChange?: (items: OfficeHoursItem[]) => void;
  className?: string;
}

export const OfficeHoursEditor: React.FC<OfficeHoursEditorProps> = ({
  items = [],
  onChange,
  className = ''
}) => {
  const [officeHours, setOfficeHours] = useState<OfficeHoursItem[]>(
    items.length > 0 ? items : [{ date: 'Monday - Friday', time: '9 AM - 5 PM' }]
  );

  const handleDateChange = (index: number, date: string) => {
    const updatedHours = [...officeHours];
    updatedHours[index] = { ...updatedHours[index], date };
    setOfficeHours(updatedHours);
    onChange?.(updatedHours);
  };

  const handleTimeChange = (index: number, time: string) => {
    const updatedHours = [...officeHours];
    updatedHours[index] = { ...updatedHours[index], time };
    setOfficeHours(updatedHours);
    onChange?.(updatedHours);
  };

  const addOfficeHoursItem = () => {
    const newHours = [...officeHours, { date: '', time: '' }];
    setOfficeHours(newHours);
    onChange?.(newHours);
  };

  const removeOfficeHoursItem = (index: number) => {
    if (officeHours.length <= 1) {
      return; // Don't remove the last item
    }
    
    const updatedHours = officeHours.filter((_, i) => i !== index);
    setOfficeHours(updatedHours);
    onChange?.(updatedHours);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700">Office Hours</h3>
        <button
          type="button"
          onClick={addOfficeHoursItem}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Hours
        </button>
      </div>

      <div className="space-y-4">
        {officeHours.map((hours, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-md overflow-hidden bg-white p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-600">Hours #{index + 1}</h4>
              <button
                type="button"
                onClick={() => removeOfficeHoursItem(index)}
                className="p-1 text-gray-500 hover:text-red-500 focus:outline-none"
                title="Remove Hours"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                <input
                  type="text"
                  value={hours.date}
                  onChange={(e) => handleDateChange(index, e.target.value)}
                  placeholder="e.g. Monday - Friday"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="text"
                  value={hours.time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  placeholder="e.g. 9 AM - 5 PM"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h4 className="text-sm font-medium text-gray-600 mb-3">Preview</h4>
        <div className="space-y-2">
          {officeHours.map((hours, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="font-medium">{hours.date}</span>
              <span>{hours.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfficeHoursEditor;
