/**
 * Handles button link clicks - supports popups and regular URLs
 * 
 * @param link - The link value from the button schema (e.g., "popup:contact", "https://example.com", "/about")
 * @param onPopupOpen - Callback function to open a popup by name
 */
export const handleButtonLink = (
  link: string | undefined,
  onPopupOpen?: (popupName: string) => void
) => {
  if (!link) return;

  // Check if it's a popup reference
  if (link.startsWith('popup:')) {
    const popupName = link.replace('popup:', '');
    if (onPopupOpen) {
      onPopupOpen(popupName);
    } else {
      console.warn('[testing] Popup handler not provided for:', popupName);
    }
    return;
  }

  // Check if it's a regular URL
  if (link.startsWith('http://') || link.startsWith('https://')) {
    window.open(link, '_blank');
    return;
  }

  // Check if it's an internal route
  if (link.startsWith('/')) {
    window.location.href = link;
    return;
  }

  // Fallback: treat as popup name (backward compatibility)
  if (onPopupOpen) {
    onPopupOpen(link);
  }
};

