import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database, Table as TableIcon } from "lucide-react";
import DatabaseTablesViewer from './DatabaseTablesViewer';

interface DatabaseTablesButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const DatabaseTablesButton: React.FC<DatabaseTablesButtonProps> = ({ 
  variant = "outline", 
  size = "default",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`${className} bg-brandPurple/10 hover:bg-brandPurple/20 border-brandPurple/20 text-brandPurple hover:text-brandPurple`}
        >
          <TableIcon className="h-4 w-4 mr-2" />
          Tables
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-brandPurple" />
            <span>PostgreSQL Database Tables</span>
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-[calc(95vh-80px)]">
          <DatabaseTablesViewer onClose={() => setIsOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseTablesButton;
