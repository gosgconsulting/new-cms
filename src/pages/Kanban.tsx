import React from 'react';
import { GripVertical } from 'lucide-react';
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanColumnHandle, KanbanItem, KanbanItemHandle, KanbanOverlay } from '@/components/ui/kanban';
import { Badge } from '@/components/ui/badge-2';
import { Button } from '@/components/ui/button-1';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import api from '../../sparti-cms/utils/api';

type Task = {
  id: string;
  title: string;
  dueDate?: string;
  sourcePath?: string; // for docs items
  labels?: string[];   // NEW: multi-labels
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

// NEW: label inference for docs
const inferDocLabels = (title?: string, path?: string): string[] => {
  const t = (title || '').toLowerCase();
  const p = (path || '').toLowerCase();
  const labels = new Set<string>();
  labels.add('Docs');
  if (t.includes('api') || p.includes('api')) labels.add('API');
  if (t.includes('database') || p.includes('postgres') || p.includes('schema')) labels.add('Database');
  if (t.includes('setup') || t.includes('install') || p.includes('setup')) labels.add('Setup');
  return Array.from(labels);
};

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
        {/* NEW: labels as chips */}
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
  matchesLabels?: (task: Task) => boolean;
}

// UPDATE: use matchesLabels passed via props
function TaskColumn({ value, tasks, isOverlay, onOpenDetails, matchesLabels, ...props }: TaskColumnProps) {
  const visibleTasks = React.useMemo(
    () => (matchesLabels ? tasks.filter(matchesLabels) : tasks),
    [tasks, matchesLabels]
  );
  return (
    <KanbanColumn value={value} {...props} className="rounded-md border bg-card p-2.5 shadow-xs">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm">{COLUMN_TITLES[value]}</span>
          <Badge variant="secondary">{visibleTasks.length}</Badge>
        </div>
        <KanbanColumnHandle asChild>
          <Button variant="dim" size="sm" mode="icon" aria-label="Reorder column">
            <GripVertical />
          </Button>
        </KanbanColumnHandle>
      </div>
      <KanbanColumnContent value={value} className="flex flex-col gap-2.5 p-0.5">
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} asHandle={!isOverlay} onOpenDetails={onOpenDetails} />
        ))}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}

const KanbanPage: React.FC = () => {
  // UPDATE: include labels on seeded features
  const [columns, setColumns] = React.useState<Record<string, Task[]>>({
    docs: [
      { id: 'doc:database%3Aoverview', title: 'Database Overview', sourcePath: 'database:overview', labels: ['Docs', 'Database'] },
    ],
    backlog: [
      { id: 'feat_products', title: 'Products', labels: ['E-shop', 'Catalog'] },
      { id: 'feat_orders', title: 'Orders', labels: ['E-shop', 'Checkout'] },
      { id: 'feat_product_variants', title: 'Product Variants', labels: ['E-shop', 'Catalog'] },
      { id: 'feat_product_categories', title: 'Product Categories', labels: ['E-shop', 'Catalog'] },
      { id: 'feat_redirects', title: 'Redirects', labels: ['SEO', 'Redirects'] },
      { id: 'feat_seo_meta', title: 'SEO Meta', labels: ['SEO'] },
      { id: 'feat_analytics', title: 'Analytics', labels: ['Analytics'] },
      { id: 'feat_tenant_integrations', title: 'Tenant Integrations', labels: ['Integrations'] },
      { id: 'feat_integration_settings', title: 'Integration Settings', labels: ['Integrations'] },
      { id: 'feat_smtp_config', title: 'SMTP Config', labels: ['Integrations', 'Email'] },
      { id: 'feat_ai_assistant', title: 'AI Assistant', labels: ['Integrations', 'AI'] },
      { id: 'feat_resend', title: 'Resend', labels: ['Integrations', 'Email'] },
    ],
    inProgress: [
      { id: 'feat_blog', title: 'Blog', labels: ['CMS', 'Blog', 'SEO'] },
      { id: 'feat_forms', title: 'Forms', labels: ['CMS', 'Forms'] },
      { id: 'feat_contacts', title: 'Contacts (CRM)', labels: ['CMS', 'CRM'] },
      { id: 'feat_sitemap', title: 'Sitemap', labels: ['SEO'] },
      { id: 'feat_security_logging', title: 'Security Logging', labels: ['Security'] },
    ],
    done: [
      { id: 'feat_pages', title: 'Pages', labels: ['CMS', 'Pages', 'SEO'] },
      { id: 'feat_media', title: 'Media Library', labels: ['CMS', 'Media'] },
      { id: 'feat_themes', title: 'Themes', labels: ['CMS', 'Themes'] },
      { id: 'feat_site_settings', title: 'Site Settings', labels: ['CMS', 'Settings'] },
      { id: 'feat_users', title: 'Users', labels: ['Security', 'Auth'] },
    ],
  });

  // NEW: label filter state (OR logic)
  const [selectedLabels, setSelectedLabels] = React.useState<string[]>([]);

  // NEW: unique labels across all tasks for filter bar
  const allLabels = React.useMemo(() => {
    const s = new Set<string>();
    Object.values(columns).forEach(tasks => tasks.forEach(t => (t.labels || []).forEach(l => s.add(l))));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [columns]);

  const [open, setOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [actionItems, setActionItems] = React.useState<Array<{
    task: string;
    description: string;
    status: string;
    filesTouched: string[];
  }> | null>(null);

  // NEW: brief state and nested modal control
  const [briefSummary, setBriefSummary] = React.useState<string | null>(null);
  const [briefContent, setBriefContent] = React.useState<string | null>(null);
  const [briefOpen, setBriefOpen] = React.useState(false);

  // Keep docs index to match non-doc features with docs
  const [docsIndex, setDocsIndex] = React.useState<Array<{ id: string; title: string; path: string }>>([]);

  // Load docs dynamically on mount
  React.useEffect(() => {
    (async () => {
      const resp = await api.get('/api/docs/list');
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.success && Array.isArray(data.items)) {
        const docsTasks: Task[] = data.items.map((it: any) => ({
          id: it.id,
          title: it.title,
          sourcePath: it.path,
          labels: inferDocLabels(it.title, it.path),
        }));
        setColumns((prev) => ({ ...prev, docs: docsTasks }));
        setDocsIndex(data.items.map((it: any) => ({ id: it.id, title: it.title, path: it.path })));
      }
    })();
  }, []);

  const handleOpenDetails = async (task: Task) => {
    setSelectedTask(task);
    setOpen(true);
    setBriefSummary(null);
    setBriefContent(null);
    setActionItems(null);

    // Load brief for docs or attempt to match a doc for feature cards
    if (task.id.startsWith('doc:')) {
      const pathPart = task.sourcePath ? task.sourcePath : task.id.slice(4);
      const briefResp = await api.get(`/api/docs/brief?path=${encodeURIComponent(pathPart)}`);
      if (briefResp.ok) {
        const briefData = await briefResp.json();
        if (briefData.success) {
          setBriefSummary(briefData.summary || null);
          setBriefContent(briefData.content || null);
        }
      }
      const actionsResp = await api.get(`/api/docs/actions?path=${encodeURIComponent(pathPart)}`);
      if (actionsResp.ok) {
        const data = await actionsResp.json();
        if (data.success) {
          setActionItems(data.actions);
        }
      }
      return;
    }

    // Non-doc feature: try to find a matching doc by title
    const match =
      docsIndex.find((d) => d.title.toLowerCase().includes((task.title || '').toLowerCase())) ||
      null;

    if (match) {
      const briefResp = await api.get(`/api/docs/brief?path=${encodeURIComponent(match.path)}`);
      if (briefResp.ok) {
        const briefData = await briefResp.json();
        if (briefData.success) {
          setBriefSummary(briefData.summary || null);
          setBriefContent(briefData.content || null);
        }
      }
      const actionsResp = await api.get(`/api/docs/actions?path=${encodeURIComponent(match.path)}`);
      if (actionsResp.ok) {
        const data = await actionsResp.json();
        if (data.success) {
          setActionItems(data.actions);
        }
      }
    } else {
      // Graceful fallback if no doc found
      setBriefSummary('No brief is available yet for this feature. Add documentation under the docs/ folder to populate this section.');
      setBriefContent(null);
    }
  };

  // NEW: label filter helper (OR logic) inside component scope
  const matchesLabels = React.useCallback((task: Task) => {
    if (!selectedLabels.length) return true;
    const tl = task.labels || [];
    return selectedLabels.some((l) => tl.includes(l));
  }, [selectedLabels]);

  return (
    <div className="p-5">
      {/* NEW: Label filter bar */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {allLabels.map((label) => {
          const selected = selectedLabels.includes(label);
          return (
            <Badge
              key={label}
              variant={selected ? 'primary' : 'outline'}
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setSelectedLabels((prev) =>
                  selected ? prev.filter((l) => l !== label) : [...prev, label]
                );
              }}
            >
              {label}
            </Badge>
          );
        })}
        {selectedLabels.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setSelectedLabels([])}
          >
            Clear
          </Button>
        )}
      </div>

      <Kanban value={columns} onValueChange={setColumns} getItemValue={(item) => item.id}>
        <KanbanBoard className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {Object.entries(columns).map(([columnValue, tasks]) => (
            <TaskColumn
              key={columnValue}
              value={columnValue}
              tasks={tasks}
              onOpenDetails={handleOpenDetails}
              matchesLabels={matchesLabels}
            />
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          <div className="rounded-md bg-muted/60 size-full" />
        </KanbanOverlay>
      </Kanban>

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

              {/* NEW: View brief button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBriefOpen(true)}
                disabled={!briefContent && !briefSummary}
              >
                View brief
              </Button>
            </div>

            {/* NEW: Brief preview block above the table */}
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Brief</h2>
              </div>
              <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {briefSummary
                  ? briefSummary
                  : 'No brief available yet. Add documentation in docs/ or link a doc to this feature.'}
              </div>
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
                  {actionItems && actionItems.length > 0 ? (
                    actionItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.task}</TableCell>
                        <TableCell className="text-muted-foreground">{item.description}</TableCell>
                        <TableCell className="capitalize">{item.status.replace('-', ' ')}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {item.filesTouched && item.filesTouched.length > 0 ? (
                              item.filesTouched.map((f, i) => (
                                <span key={i} className="inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-xs font-mono">
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
                  ) : selectedTask ? (
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

      {/* NEW: Nested modal to view full brief */}
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

export default KanbanPage;