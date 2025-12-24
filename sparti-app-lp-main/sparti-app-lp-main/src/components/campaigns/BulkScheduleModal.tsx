import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BulkScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articles: Array<{ id: string; title: string }>;
  onScheduleComplete: () => void;
}

export function BulkScheduleModal({ open, onOpenChange, articles, onScheduleComplete }: BulkScheduleModalProps) {
  const [articlesPerWeek, setArticlesPerWeek] = useState<string>('2');
  const [isScheduling, setIsScheduling] = useState(false);

  const generateRandomDaysInWeek = (count: number, weekOffset: number): number[] => {
    // Get all available days in the week (0-6, Sunday to Saturday)
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    
    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...allDays].sort(() => Math.random() - 0.5);
    
    // Take the first 'count' days from shuffled array
    return shuffled.slice(0, Math.min(count, 7));
  };

  const generateScheduleDates = (articleCount: number, perWeek: number) => {
    const dates: Date[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start from tomorrow
    startDate.setHours(0, 0, 0, 0);

    let currentWeekOffset = 0;
    let articleIndex = 0;

    while (articleIndex < articleCount) {
      const articlesThisWeek = Math.min(perWeek, articleCount - articleIndex);
      const daysInWeek = generateRandomDaysInWeek(articlesThisWeek, currentWeekOffset);
      
      daysInWeek.forEach((dayOfWeek) => {
        if (articleIndex >= articleCount) return;

        // Calculate the date for this day of the week
        const scheduleDate = new Date(startDate);
        const daysToAdd = currentWeekOffset * 7 + dayOfWeek - startDate.getDay();
        const adjustedDays = daysToAdd < 0 ? daysToAdd + 7 : daysToAdd;
        scheduleDate.setDate(startDate.getDate() + adjustedDays);
        
        // Set random time between 9 AM and 6 PM
        const randomHour = Math.floor(Math.random() * 10) + 9; // 9-18 (9 AM to 6 PM)
        const randomMinute = Math.floor(Math.random() * 60);
        scheduleDate.setHours(randomHour, randomMinute, 0, 0);

        dates.push(new Date(scheduleDate));
        articleIndex++;
      });

      currentWeekOffset++;
    }

    return dates;
  };

  const handleSchedule = async () => {
    if (articles.length === 0) {
      toast.error('No articles to schedule');
      return;
    }

    setIsScheduling(true);

    try {
      const perWeek = parseInt(articlesPerWeek);
      const scheduleDates = generateScheduleDates(articles.length, perWeek);

      // Update each article with its scheduled date (without changing status)
      const updatePromises = articles.map((article, index) => 
        supabase
          .from('blog_posts')
          .update({ scheduled_date: scheduleDates[index].toISOString() })
          .eq('id', article.id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        console.error('Errors updating articles:', errors);
        throw new Error(`Failed to update ${errors.length} articles`);
      }

      toast.success(`Successfully updated dates for ${articles.length} articles`);
      onScheduleComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error scheduling articles:', error);
      toast.error('Failed to schedule articles');
    } finally {
      setIsScheduling(false);
    }
  };

  const getSchedulePreview = () => {
    if (articles.length === 0) return 'No articles to schedule';
    
    const perWeek = parseInt(articlesPerWeek);
    const weeks = Math.ceil(articles.length / perWeek);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    
    return `${articles.length} articles will be scheduled over ${weeks} week${weeks > 1 ? 's' : ''}, starting ${startDate.toLocaleDateString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bulk Schedule Articles
          </DialogTitle>
          <DialogDescription>
            Automatically schedule all draft articles with random dates and times
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="articles-per-week">Articles Per Week</Label>
            <Select value={articlesPerWeek} onValueChange={setArticlesPerWeek}>
              <SelectTrigger id="articles-per-week">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 article per week</SelectItem>
                <SelectItem value="2">2 articles per week</SelectItem>
                <SelectItem value="3">3 articles per week</SelectItem>
                <SelectItem value="4">4 articles per week</SelectItem>
                <SelectItem value="5">5 articles per week</SelectItem>
                <SelectItem value="6">6 articles per week</SelectItem>
                <SelectItem value="7">7 articles per week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm space-y-1">
                <p className="font-medium">Schedule Details:</p>
                <ul className="text-muted-foreground space-y-1 ml-1">
                  <li>• Random days of the week</li>
                  <li>• Random times between 9 AM - 6 PM</li>
                  <li>• Starting from tomorrow</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">{getSchedulePreview()}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isScheduling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={isScheduling || articles.length === 0}
          >
            {isScheduling ? 'Applying...' : `Apply for ${articles.length} article${articles.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
