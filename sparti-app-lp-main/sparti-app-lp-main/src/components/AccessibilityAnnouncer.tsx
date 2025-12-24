import { FC, useEffect, useState } from 'react';

interface AccessibilityAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
}

/**
 * Screen reader announcer component for dynamic content updates
 */
const AccessibilityAnnouncer: FC<AccessibilityAnnouncerProps> = ({
  message,
  priority = 'polite',
  delay = 100
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      // Small delay to ensure screen reader picks up the change
      const timer = setTimeout(() => {
        setAnnouncement(message);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [message, delay]);

  useEffect(() => {
    if (announcement) {
      // Clear the announcement after a short period to allow for re-announcements
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [announcement]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

export default AccessibilityAnnouncer;