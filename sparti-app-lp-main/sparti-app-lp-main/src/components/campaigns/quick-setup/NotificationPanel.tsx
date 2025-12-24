import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Info, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationStatus = 'loading' | 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  status: NotificationStatus;
  timestamp: Date;
}

interface NotificationPanelProps {
  notifications: Notification[];
  className?: string;
}

const getIcon = (status: NotificationStatus) => {
  switch (status) {
    case 'loading':
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const getStatusColor = (status: NotificationStatus) => {
  switch (status) {
    case 'loading':
      return 'border-l-primary bg-primary/5';
    case 'success':
      return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
    case 'error':
      return 'border-l-destructive bg-destructive/5';
    case 'warning':
      return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
    case 'info':
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
  }
};

export const NotificationPanel = ({ notifications, className }: NotificationPanelProps) => {
  if (notifications.length === 0) return null;

  return (
    <Card className={cn('p-4 space-y-2', className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-sm font-semibold text-foreground">Activity Log</h3>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-md border-l-4 transition-all duration-200',
              getStatusColor(notification.status)
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
