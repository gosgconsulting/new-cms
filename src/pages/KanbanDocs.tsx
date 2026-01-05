import React from 'react';
import { GripVertical } from 'lucide-react';
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanColumnHandle, KanbanItem, KanbanItemHandle, KanbanOverlay } from '@/components/ui/kanban';
import { Badge } from '@/components/ui/badge-2';
import { Button } from '@/components/ui/button-1';

type DocTask = {
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
  task: DocTask;
  asHandle?: boolean;
}

function TaskCard({ task, asHandle, ...props }: TaskCardProps) {
  const cardContent = (
    <div className="rounded-md border bg-card p-3 shadow-xs">
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
  tasks: DocTask[];
  isOverlay?: boolean;
}

function TaskColumn({ value, tasks, isOverlay, ...props }: TaskColumnProps) {
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
          <TaskCard key={task.id} task={task} asHandle={!isOverlay} />
        ))}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}

const KanbanDocsPage: React.FC = () => {
  const [columns, setColumns] = React.useState<Record<string, DocTask[]>>({
    docs: [
      { id: 'd1', title: 'Add onboarding docs', dueDate: 'Jan 12, 2025' },
      { id: 'd2', title: 'Write API usage overview', dueDate: 'Jan 17, 2025' },
      { id: 'd3', title: 'Docs structure audit', dueDate: 'Jan 21, 2025' },
    ],
    backlog: [
      { id: 'd6', title: 'Deployment guide QA', dueDate: 'Jan 30, 2025' },
    ],
    inProgress: [
      { id: 'd4', title: 'CLI setup guide', dueDate: 'Jan 24, 2025' },
      { id: 'd5', title: 'Environment variables reference', dueDate: 'Jan 26, 2025' },
    ],
    done: [
      { id: 'd7', title: 'Authentication quickstart', dueDate: 'Dec 28, 2024' },
      { id: 'd8', title: 'Tailwind & shadcn setup', dueDate: 'Dec 20, 2024' },
    ],
  });

  return (
    <div className="p-5">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Docs Board</h1>
        <p className="text-muted-foreground text-sm">Track documentation tasks. Drag to reorder or move between columns.</p>
      </div>
      <Kanban value={columns} onValueChange={setColumns} getItemValue={(item) => item.id}>
        <KanbanBoard className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {Object.entries(columns).map(([columnValue, tasks]) => (
            <TaskColumn key={columnValue} value={columnValue} tasks={tasks} />
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          <div className="rounded-md bg-muted/60 size-full" />
        </KanbanOverlay>
      </Kanban>
    </div>
  );
};

export default KanbanDocsPage;