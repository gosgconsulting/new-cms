import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Kanban: React.FC = () => {
  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-gray-600 mt-2">This board is empty and hardcoded for superadmin access.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <Card key={col} className="bg-white border">
              <CardHeader>
                <CardTitle className="text-lg">{col}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                  No items
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Kanban;