import React from 'react';
import { GripVertical } from 'lucide-react';
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanColumnHandle, KanbanItem, KanbanItemHandle, KanbanOverlay } from '@/components/ui/kanban';
import { Badge } from '@/components/ui/badge-2';
import { Button } from '@/components/ui/button-1';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

type Task = {
  id: string;
  title: string;
  dueDate?: string;
};

const COLUMN_TITLES: Record<string, string> = {
  docs: 'Docs',
  backlog: 'Backlog',
  inProgress: 'In Progress',
  done: 'Done',
};

interface TaskCardProps extends Omit<React.ComponentProps<typeof KanbanItem>, 'value' | 'children'> {
  task: Task;
  asHandle?: boolean;
  onOpenDetails?: (task: Task) => void;
}

function TaskCard({ task, asHandle, onOpenDetails, ...props }: TaskCardProps) {
  const cardContent = (
    <div
      className="rounded-md border bg-card p-3 shadow-xs"
      onClick={() => onOpenDetails?.(task)}
      role="button"
      tabIndex={0}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 font-medium text-sm">{task.title}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          {task.dueDate && <time className="text-[10px] tabular-nums whitespace-nowrap">{task.dueDate}</time>}
        </div>
      </div>
    </div>
  );

  return (
    <KanbanItem value={task.id} {...props}>
      {asHandle ? <KanbanItemHandle>{cardContent}</KanbanItemHandle> : cardContent}
    </KanbanItem>
  );
}

interface TaskColumnProps extends Omit<React.ComponentProps<typeof KanbanColumn>, 'children'> {
  tasks: Task[];
  isOverlay?: boolean;
  onOpenDetails?: (task: Task) => void;
}

function TaskColumn({ value, tasks, isOverlay, onOpenDetails, ...props }: TaskColumnProps) {
  return (
    <KanbanColumn value={value} {...props} className="rounded-md border bg-card p-2.5 shadow-xs">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm">{COLUMN_TITLES[value]}</span>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
        <KanbanColumnHandle asChild>
          <Button variant="dim" size="sm" mode="icon" aria-label="Reorder column">
            <GripVertical />
          </Button>
        </KanbanColumnHandle>
      </div>
      <KanbanColumnContent value={value} className="flex flex-col gap-2.5 p-0.5">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} asHandle={!isOverlay} onOpenDetails={onOpenDetails} />
        ))}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}

const KanbanPage: React.FC = () => {
  const [columns, setColumns] = React.useState<Record<string, Task[]>>({
    docs: [
      { id: 'feat_docs', title: 'Documentation' },
      { id: 'feat_api_reference', title: 'API Reference' },
    ],
    backlog: [
      { id: 'feat_products', title: 'Products' },
      { id: 'feat_orders', title: 'Orders' },
      { id: 'feat_product_variants', title: 'Product Variants' },
      { id: 'feat_product_categories', title: 'Product Categories' },
      { id: 'feat_redirects', title: 'Redirects' },
      { id: 'feat_seo_meta', title: 'SEO Meta' },
      { id: 'feat_analytics', title: 'Analytics' },
      { id: 'feat_tenant_integrations', title: 'Tenant Integrations' },
      { id: 'feat_integration_settings', title: 'Integration Settings' },
      { id: 'feat_smtp_config', title: 'SMTP Config' },
      { id: 'feat_ai_assistant', title: 'AI Assistant' },
      { id: 'feat_resend', title: 'Resend' },
    ],
    inProgress: [
      { id: 'feat_blog', title: 'Blog' },
      { id: 'feat_forms', title: 'Forms' },
      { id: 'feat_contacts', title: 'Contacts (CRM)' },
      { id: 'feat_sitemap', title: 'Sitemap' },
      { id: 'feat_security_logging', title: 'Security Logging' },
    ],
    done: [
      { id: 'feat_pages', title: 'Pages' },
      { id: 'feat_media', title: 'Media Library' },
      { id: 'feat_themes', title: 'Themes' },
      { id: 'feat_site_settings', title: 'Site Settings' },
      { id: 'feat_users', title: 'Users' },
    ],
  });

  // NEW: modal state
  const [open, setOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const handleOpenDetails = (task: Task) => {
    setSelectedTask(task);
    setOpen(true);
  };

  return (
    <div className="p-5">
      <Kanban value={columns} onValueChange={setColumns} getItemValue={(item) => item.id}>
        <KanbanBoard className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {Object.entries(columns).map(([columnValue, tasks]) => (
            <TaskColumn key={columnValue} value={columnValue} tasks={tasks} onOpenDetails={handleOpenDetails} />
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          <div className="rounded-md bg-muted/60 size-full" />
        </KanbanOverlay>
      </Kanban>

      {/* NEW: Full-screen modal with action items table */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-none w-screen h-screen max-w-none p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <DialogHeader className="space-y-0">
                <DialogTitle className="text-lg">
                  {selectedTask ? selectedTask.title : 'Task Details'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Files Touched</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTask ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No action items yet for this feature.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Select a feature to view details.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanPage;