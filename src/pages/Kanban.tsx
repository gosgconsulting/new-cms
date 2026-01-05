import React from 'react';
import { GripVertical, X } from 'lucide-react';
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

// NEW: Action item type and sample data for tasks
type ActionItem = {
  task: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  filesTouched: string[];
};

const ACTION_ITEMS: Record<string, ActionItem[]> = {
  d1: [
    {
      task: 'Outline sections',
      description: 'Draft main chapters and sections for the handbook',
      status: 'in-progress',
      filesTouched: ['docs/development/development-workflow.md'],
    },
    {
      task: 'Review structure',
      description: 'Get feedback from team on outline',
      status: 'todo',
      filesTouched: [],
    },
  ],
  d2: [
    {
      task: 'Index endpoints',
      description: 'List public REST routes by category',
      status: 'todo',
      filesTouched: ['docs/api/public-api-routes.md'],
    },
  ],
  '1': [
    {
      task: 'Login flow audit',
      description: 'Verify /auth and ProtectedRoute behavior',
      status: 'done',
      filesTouched: ['src/pages/Auth.tsx', 'sparti-cms/components/auth/ProtectedRoute.tsx'],
    },
    {
      task: 'Session token',
      description: 'Persist token and validate on /api/auth/me',
      status: 'in-progress',
      filesTouched: ['sparti-cms/components/auth/AuthProvider.tsx', 'server/routes/auth.js'],
    },
  ],
  '2': [
    {
      task: 'Users CRUD',
      description: 'Implement basic users routes and validations',
      status: 'in-progress',
      filesTouched: ['server/routes/users.js'],
    },
  ],
  '3': [
    {
      task: 'Docs initial scaffold',
      description: 'Create Getting Started and Conventions',
      status: 'todo',
      filesTouched: ['docs/README.md'],
    },
  ],
  '4': [
    {
      task: 'Tokens & colors',
      description: 'Consolidate Tailwind theme across components',
      status: 'in-progress',
      filesTouched: ['tailwind.config.ts'],
    },
  ],
  '5': [
    {
      task: 'Theme toggle audit',
      description: 'Verify dark mode surfaces and tokens',
      status: 'todo',
      filesTouched: ['src/components/ThemeToggle.tsx'],
    },
  ],
  '7': [
    {
      task: 'Project boot',
      description: 'Initial Vite + React + TS setup',
      status: 'done',
      filesTouched: ['vite.config.ts', 'tsconfig.json'],
    },
  ],
  '8': [
    {
      task: 'Repo init',
      description: 'First commit and CI setup',
      status: 'done',
      filesTouched: ['.gitignore', 'README.md'],
    },
  ],
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
      { id: 'd1', title: 'Developer handbook outline', dueDate: 'Jan 08, 2025' },
      { id: 'd2', title: 'API reference index', dueDate: 'Jan 12, 2025' },
    ],
    backlog: [
      { id: '1', title: 'Authentication flow', dueDate: 'Jan 10, 2025' },
      { id: '2', title: 'Create API endpoints', dueDate: 'Jan 15, 2025' },
      { id: '3', title: 'Write documentation', dueDate: 'Jan 20, 2025' },
    ],
    inProgress: [
      { id: '4', title: 'Design system updates', dueDate: 'Aug 25, 2025' },
      { id: '5', title: 'Implement dark mode', dueDate: 'Aug 25, 2025' },
    ],
    done: [
      { id: '7', title: 'Setup project', dueDate: 'Sep 25, 2025' },
      { id: '8', title: 'Initial commit', dueDate: 'Sep 20, 2025' },
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
                  {(selectedTask && ACTION_ITEMS[selectedTask.id]) ? (
                    ACTION_ITEMS[selectedTask.id].map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.task}</TableCell>
                        <TableCell className="text-muted-foreground">{item.description}</TableCell>
                        <TableCell className="capitalize">
                          {item.status.replace('-', ' ')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {item.filesTouched.length > 0 ? (
                              item.filesTouched.map((f, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-xs font-mono"
                                >
                                  {f}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No action items yet for this task.
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