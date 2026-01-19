import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanColumnHandle, KanbanItem, KanbanItemHandle, KanbanOverlay } from '@/components/ui/kanban';
import { Badge } from '@/components/ui/badge-2';
import { Button } from '@/components/ui/button-1';
import { useAuth } from '../../sparti-cms/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  dueDate?: string;
  sourcePath?: string;
  labels?: string[];
};

const COLUMN_TITLES: Record<string, string> = {
  backlog: 'Backlog',
  inProgress: 'In Progress',
  qualityAssurance: 'Quality Assurance',
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
      className="rounded-md border bg-card p-3 shadow-xs cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-colors"
      onClick={() => onOpenDetails?.(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetails?.(task);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${task.title}`}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 font-medium text-sm">{task.title}</span>
        </div>
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.labels.map((l) => (
              <Badge key={l} variant="outline" size="xs" className="px-1.5 py-0.5">
                {l}
              </Badge>
            ))}
          </div>
        )}
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
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Main kanban columns
  const [columns, setColumns] = React.useState<Record<string, Task[]>>({
    backlog: [
      { id: 'feat_integrations', title: 'Integrations', labels: ['Integrations'] },
      { id: 'feat_themes', title: 'Themes', labels: ['Themes'] },
      { id: 'feat_tenants', title: 'Tenants', labels: ['Tenants'] },
      { id: 'feat_page-editor', title: 'Page Editor', labels: ['Pages'] },
      { id: 'feat_blog', title: 'Blog', labels: ['Blog'] },
      { id: 'feat_site-settings', title: 'Site Settings', labels: ['Settings'] },
      { id: 'feat_users', title: 'Users', labels: ['Users'] },
      { id: 'feat_crm', title: 'CRM', labels: ['CRM'] },
      { id: 'feat_seo', title: 'SEO', labels: ['SEO'] },
      { id: 'feat_media', title: 'Media', labels: ['Media'] },
      { id: 'feat_shop', title: 'Shop', labels: ['Shop'] },
    ],
    inProgress: [
      { id: 'task_crm-database', title: 'CMS Database', labels: ['CMS', 'Database'] },
    ],
    qualityAssurance: [],
    done: [],
  });

  // Handle feature click - navigate to feature kanban page
  const handleFeatureClick = (feature: Task) => {
    navigate(`/dev/${feature.id}`);
  };

  if (loading) {
    return <div />;
  }

  if (!user?.is_super_admin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="p-5">
      {/* Main Kanban Board */}
      <Kanban value={columns} onValueChange={setColumns} getItemValue={(item) => item.id}>
        <KanbanBoard className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {Object.entries(columns).map(([columnValue, tasks]) => (
            <TaskColumn
              key={columnValue}
              value={columnValue}
              tasks={tasks}
              onOpenDetails={handleFeatureClick}
            />
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          <div className="rounded-md bg-muted/60 size-full" />
        </KanbanOverlay>
      </Kanban>
    </div>
  );
};

export default KanbanPage;
