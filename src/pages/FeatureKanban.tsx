import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GripVertical } from 'lucide-react';
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanColumnHandle, KanbanItem, KanbanItemHandle, KanbanOverlay } from '@/components/ui/kanban';
import { Badge } from '@/components/ui/badge-2';
import { Button } from '@/components/ui/button-1';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import api from '../../sparti-cms/utils/api';

type Task = {
  id: string;
  title: string;
  dueDate?: string;
  sourcePath?: string;
  labels?: string[];
};

const COLUMN_TITLES: Record<string, string> = {
  docs: 'Docs',
  backlog: 'Backlog',
  inProgress: 'In Progress',
  done: 'Done',
};

// Map feature IDs to titles
const FEATURE_MAP: Record<string, { title: string; labels: string[] }> = {
  'feat_integrations': { title: 'Integrations', labels: ['Integrations'] },
  'feat_themes': { title: 'Themes', labels: ['Themes'] },
  'feat_tenants': { title: 'Tenants', labels: ['Tenants'] },
  'feat_page-editor': { title: 'Page Editor', labels: ['Pages'] },
  'feat_blog': { title: 'Blog', labels: ['Blog'] },
  'feat_site-settings': { title: 'Site Settings', labels: ['Settings'] },
  'feat_users': { title: 'Users', labels: ['Users'] },
  'feat_crm': { title: 'CRM', labels: ['CRM'] },
  'feat_seo': { title: 'SEO', labels: ['SEO'] },
  'feat_media': { title: 'Media', labels: ['Media'] },
  'feat_shop': { title: 'Shop', labels: ['Shop'] },
};

interface TaskCardProps extends Omit<React.ComponentProps<typeof KanbanItem>, 'value' | 'children'> {
  task: Task;
  asHandle?: boolean;
  onOpenDetails?: (task: Task) => void;
}

function TaskCard({ task, asHandle, onOpenDetails, ...props }: TaskCardProps) {
  const cardContent = (
    <div
      className="rounded-md border bg-card p-3 shadow-sm cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-colors"
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
    <KanbanColumn value={value} {...props} className="rounded-md border bg-card p-2.5 shadow-sm">
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

// Derive feature info from featureId if not in FEATURE_MAP
const getFeatureInfo = (id: string | undefined): { title: string; labels: string[] } => {
  if (!id) {
    return { title: 'Unknown Feature', labels: [] };
  }
  
  if (FEATURE_MAP[id]) {
    return FEATURE_MAP[id];
  }
  
  // Remove prefixes and convert to title case
  const cleanId = id.replace(/^(task_|feat_)/, '');
  const title = cleanId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Extract labels from id
  const labels: string[] = [];
  if (id.includes('crm') || id.includes('cms')) labels.push('CMS');
  if (id.includes('database')) labels.push('Database');
  if (id.includes('task_')) labels.push('Task');
  
  return { title, labels };
};

const FeatureKanban: React.FC = () => {
  const { featureId } = useParams<{ featureId: string }>();
  const navigate = useNavigate();
  
  const feature = getFeatureInfo(featureId);
  
  const [featureColumns, setFeatureColumns] = React.useState<Record<string, Task[]>>({
    docs: [],
    backlog: [],
    inProgress: [],
    done: [],
  });

  const [open, setOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [briefSummary, setBriefSummary] = React.useState<string | null>(null);
  const [briefContent, setBriefContent] = React.useState<string | null>(null);
  const [briefOpen, setBriefOpen] = React.useState(false);

  // Hardcoded action plan tasks for CMS Database
  const CMS_DATABASE_ACTIONS: Task[] = [
    {
      id: 'action-tenant-theme-pages',
      title: 'Tenant Creation with Theme - Copy Theme Pages',
      sourcePath: 'docs/features/crm-database.md',
      labels: ['Action'],
    },
    {
      id: 'action-tenant-custom-theme',
      title: 'Tenant Creation with Custom Theme - Ensure Empty Tables Exist',
      sourcePath: 'docs/features/crm-database.md',
      labels: ['Action'],
    },
    {
      id: 'action-fix-site-settings',
      title: 'Fix Site Settings Saving - Ensure tenant_id is Passed',
      sourcePath: 'docs/features/crm-database.md',
      labels: ['Action'],
    },
    {
      id: 'action-initialize-modules',
      title: 'Initialize All Module Tables for Tenant',
      sourcePath: 'docs/features/crm-database.md',
      labels: ['Action'],
    },
    {
      id: 'action-db-connection',
      title: 'Database Connection Verification',
      sourcePath: 'docs/features/crm-database.md',
      labels: ['Action'],
    },
    {
      id: 'action-theme-pages-structure',
      title: 'Theme Pages Table Structure',
      sourcePath: 'docs/features/crm-database.md',
      labels: ['Action'],
    },
    {
      id: 'action-settings-isolation',
      title: 'Settings Module - Tenant Isolation',
      sourcePath: 'docs/features/crm-database.md',
      labels: ['Action'],
    },
    {
      id: 'action-testing',
      title: 'Testing Tenant Database Operations',
      sourcePath: 'docs/features/crm-database.md',
      labels: ['Action'],
    },
  ];

  // Initialize tasks for CMS Database feature
  React.useEffect(() => {
    if (featureId === 'task_crm-database') {
      const mainDocTask: Task = {
        id: 'doc-cms-database',
        title: 'CMS Database Action Plan',
        sourcePath: 'docs/features/crm-database.md',
        labels: ['Docs'],
      };

      setFeatureColumns({
        docs: [mainDocTask, ...CMS_DATABASE_ACTIONS],
        backlog: [],
        inProgress: [],
        done: [],
      });
    }
  }, [featureId]);

  // Parse doc content into sections based on H2 headings
  const parseDocSections = React.useCallback((content: string | null): Array<{ title: string; content: string }> => {
    if (!content) return [];
    
    const sections: Array<{ title: string; content: string }> = [];
    const lines = content.split('\n');
    let currentSection: { title: string; content: string } | null = null;
    
    for (const line of lines) {
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: h2Match[1].trim(),
          content: '',
        };
      } else if (currentSection) {
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    if (sections.length === 0 && content.trim()) {
      return [{
        title: 'Overview',
        content: content.trim(),
      }];
    }
    
    return sections;
  }, []);

  // Handle doc click - open modal with tabs
  const handleOpenDetails = async (task: Task) => {
    setSelectedTask(task);
    setOpen(true);
    setBriefSummary(null);
    setBriefContent(null);

    // Load document content for tasks with sourcePath or doc: prefix
    if (task.sourcePath) {
      const briefResp = await api.get(`/api/docs/brief?path=${encodeURIComponent(task.sourcePath)}`);
      if (briefResp.ok) {
        const briefData = await briefResp.json();
        if (briefData.success) {
          setBriefSummary(briefData.summary || null);
          setBriefContent(briefData.content || null);
        }
      }
    } else if (task.id.startsWith('doc:')) {
      const pathPart = task.id.slice(4);
      const briefResp = await api.get(`/api/docs/brief?path=${encodeURIComponent(pathPart)}`);
      if (briefResp.ok) {
        const briefData = await briefResp.json();
        if (briefData.success) {
          setBriefSummary(briefData.summary || null);
          setBriefContent(briefData.content || null);
        }
      }
    }
  };

  return (
    <div className="p-5">
      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dev')} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{feature.title}</h1>
          {feature.labels && feature.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {feature.labels.map((l) => (
                <Badge key={l} variant="outline" size="xs" className="px-1.5 py-0.5">
                  {l}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature Kanban */}
      <Kanban value={featureColumns} onValueChange={setFeatureColumns} getItemValue={(item) => item.id}>
        <KanbanBoard className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {Object.entries(featureColumns).map(([columnValue, tasks]) => (
            <TaskColumn
              key={columnValue}
              value={columnValue}
              tasks={tasks}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          <div className="rounded-md bg-muted/60 w-full h-full" />
        </KanbanOverlay>
      </Kanban>

      {/* Modal for doc details */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-none w-screen h-screen max-w-none p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-lg">
                  {selectedTask ? selectedTask.title : 'Task Details'}
                </DialogTitle>
                {selectedTask?.labels && selectedTask.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.labels.map((l) => (
                      <Badge key={l} variant="outline" size="xs" className="px-1.5 py-0.5">
                        {l}
                      </Badge>
                    ))}
                  </div>
                )}
              </DialogHeader>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setBriefOpen(true)}
                disabled={!briefContent && !briefSummary}
              >
                View brief
              </Button>
            </div>

            {/* Tabs-based content for docs */}
            <div className="flex-1 overflow-auto p-4">
              {(selectedTask?.sourcePath || selectedTask?.id.startsWith('doc:')) && briefContent ? (
                (() => {
                  const sections = parseDocSections(briefContent);
                  if (sections.length === 0) {
                    return (
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {briefSummary || 'No content available.'}
                      </div>
                    );
                  }
                  
                  return (
                    <Tabs defaultValue={sections[0]?.title || 'Overview'} className="w-full">
                      <TabsList className="flex flex-wrap gap-1 h-auto p-1">
                        {sections.map((section) => (
                          <TabsTrigger key={section.title} value={section.title} className="text-xs px-3 py-1.5">
                            {section.title}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {sections.map((section) => (
                        <TabsContent key={section.title} value={section.title} className="mt-4">
                          <div className="text-sm text-foreground whitespace-pre-wrap prose prose-sm max-w-none">
                            {section.content.trim() || 'No content for this section.'}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  );
                })()
              ) : briefSummary ? (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {briefSummary}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No brief available yet. Add documentation in docs/ or link a doc to this feature.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested modal to view full brief */}
      <Dialog open={briefOpen} onOpenChange={setBriefOpen}>
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>{selectedTask ? `${selectedTask.title} — Brief` : 'Brief'}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 max-h-[60vh] overflow-auto text-sm whitespace-pre-wrap">
            {briefContent || briefSummary || 'No brief available.'}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureKanban;
