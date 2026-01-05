import React from 'react';
import { GripVertical } from 'lucide-react';
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanColumnHandle, KanbanItem, KanbanItemHandle, KanbanOverlay } from '@/components/ui/kanban';
import { Badge } from '@/components/ui/badge-2';
import { Button } from '@/components/ui/button-1';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  features: 'Features',
  docs: 'Docs',
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
  // Features column with main categories
  const [columns, setColumns] = React.useState<Record<string, Task[]>>({
    features: [
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
    docs: [],
  });
  
  // Selected feature state
  const [selectedFeature, setSelectedFeature] = React.useState<Task | null>(null);

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

  // Parse doc content into sections based on H2 headings
  const parseDocSections = React.useCallback((content: string | null): Array<{ title: string; content: string }> => {
    if (!content) return [];
    
    const sections: Array<{ title: string; content: string }> = [];
    const lines = content.split('\n');
    let currentSection: { title: string; content: string } | null = null;
    
    for (const line of lines) {
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }
        // Start new section
        currentSection = {
          title: h2Match[1].trim(),
          content: '',
        };
      } else if (currentSection) {
        // Add line to current section
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    }
    
    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // If no sections found, use overview as single section
    if (sections.length === 0 && content.trim()) {
      return [{
        title: 'Overview',
        content: content.trim(),
      }];
    }
    
    return sections;
  }, []);

  // Keep docs index to match non-doc features with docs
  const [docsIndex, setDocsIndex] = React.useState<Array<{ id: string; title: string; path: string }>>([]);

  // Load docs index on mount (for matching)
  React.useEffect(() => {
    (async () => {
      const resp = await api.get('/api/docs/list');
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.success && Array.isArray(data.items)) {
        setDocsIndex(data.items.map((it: any) => ({ id: it.id, title: it.title, path: it.path })));
      }
    })();
  }, []);

  // Handle feature click - filter and load related docs
  const handleFeatureClick = async (feature: Task) => {
    setSelectedFeature(feature);
    setBriefSummary(null);
    setBriefContent(null);
    setActionItems(null);
    
    // Map feature IDs to doc paths
    const featureToDocMap: Record<string, string> = {
      'feat_integrations': 'docs/features/integrations.md',
      'feat_themes': 'docs/features/themes.md',
      'feat_tenants': 'docs/features/tenants.md',
      'feat_page-editor': 'docs/features/page-editor.md',
      'feat_blog': 'docs/features/blog.md',
      'feat_site-settings': 'docs/features/site-settings.md',
      'feat_users': 'docs/features/users.md',
      'feat_crm': 'docs/features/crm.md',
      'feat_seo': 'docs/features/seo.md',
      'feat_media': 'docs/features/media.md',
      'feat_shop': 'docs/features/shop.md',
    };
    
    const docPath = featureToDocMap[feature.id];
    if (docPath) {
      // Load the main doc
      const briefResp = await api.get(`/api/docs/brief?path=${encodeURIComponent(docPath)}`);
      if (briefResp.ok) {
        const briefData = await briefResp.json();
        if (briefData.success) {
          setBriefSummary(briefData.summary || null);
          setBriefContent(briefData.content || null);
        }
      }
      
      // Load action items
      const actionsResp = await api.get(`/api/docs/actions?path=${encodeURIComponent(docPath)}`);
      if (actionsResp.ok) {
        const data = await actionsResp.json();
        if (data.success) {
          setActionItems(data.actions);
        }
      }
      
      // Find related docs based on feature title/labels
      const relatedDocs = docsIndex.filter((doc) => {
        const docTitleLower = doc.title.toLowerCase();
        const featureTitleLower = feature.title.toLowerCase();
        return docTitleLower.includes(featureTitleLower) || 
               doc.path.includes(featureTitleLower.replace(/\s+/g, '-'));
      });
      
      // Add main doc and related docs to docs column
      const docsTasks: Task[] = [
        {
          id: `doc:${encodeURIComponent(docPath)}`,
          title: feature.title,
          sourcePath: docPath,
          labels: feature.labels || [],
        },
        ...relatedDocs.map((doc) => ({
          id: doc.id,
          title: doc.title,
          sourcePath: doc.path,
          labels: inferDocLabels(doc.title, doc.path),
        })),
      ];
      
      setColumns((prev) => ({ ...prev, docs: docsTasks }));
    } else {
      // Try to find matching docs by title
      const matchingDocs = docsIndex.filter((doc) => {
        const docTitleLower = doc.title.toLowerCase();
        const featureTitleLower = feature.title.toLowerCase();
        return docTitleLower.includes(featureTitleLower) || 
               featureTitleLower.includes(docTitleLower);
      });
      
      const docsTasks: Task[] = matchingDocs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        sourcePath: doc.path,
        labels: inferDocLabels(doc.title, doc.path),
      }));
      
      setColumns((prev) => ({ ...prev, docs: docsTasks }));
    }
  };

  // Handle doc click in Docs column - open modal with tabs
  const handleOpenDetails = async (task: Task) => {
    setSelectedTask(task);
    setOpen(true);
    setBriefSummary(null);
    setBriefContent(null);
    setActionItems(null);

    // Load brief for docs
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Features Kanban */}
        <div className="lg:col-span-1">
          <Kanban value={{ features: columns.features }} onValueChange={(val) => setColumns(prev => ({ ...prev, features: val.features || [] }))} getItemValue={(item) => item.id}>
            <KanbanBoard className="grid grid-cols-1 gap-5">
              <TaskColumn
                value="features"
                tasks={columns.features}
                onOpenDetails={handleFeatureClick}
                matchesLabels={matchesLabels}
              />
            </KanbanBoard>
            <KanbanOverlay>
              <div className="rounded-md bg-muted/60 size-full" />
            </KanbanOverlay>
          </Kanban>
        </div>

        {/* Docs Kanban and Details Table */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Docs Kanban */}
          <div>
            <Kanban value={{ docs: columns.docs }} onValueChange={(val) => setColumns(prev => ({ ...prev, docs: val.docs || [] }))} getItemValue={(item) => item.id}>
              <KanbanBoard className="grid grid-cols-1 gap-5">
                <TaskColumn
                  value="docs"
                  tasks={columns.docs}
                  onOpenDetails={handleOpenDetails}
                  matchesLabels={matchesLabels}
                />
              </KanbanBoard>
              <KanbanOverlay>
                <div className="rounded-md bg-muted/60 size-full" />
              </KanbanOverlay>
            </Kanban>
          </div>

          {/* Details Table */}
          <div className="rounded-md border bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              {selectedFeature ? `${selectedFeature.title} Details` : 'Select a Feature'}
            </h3>
            {selectedFeature && (
              <div className="space-y-4">
                {/* Brief Summary */}
                {briefSummary && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Brief</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {briefSummary}
                    </div>
                  </div>
                )}
                
                {/* Action Items Table */}
                {actionItems && actionItems.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Action Items</h4>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {actionItems.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium text-sm">{item.task}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{item.description}</TableCell>
                              <TableCell className="capitalize text-sm">{item.status.replace('-', ' ')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No action items available for this feature.
                  </div>
                )}
              </div>
            )}
            {!selectedFeature && (
              <div className="text-sm text-muted-foreground text-center py-8">
                Click on a feature to view details
              </div>
            )}
          </div>
        </div>
      </div>

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

            {/* Tabs-based content for docs */}
            <div className="flex-1 overflow-auto p-4">
              {selectedTask?.id.startsWith('doc:') && briefContent ? (
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