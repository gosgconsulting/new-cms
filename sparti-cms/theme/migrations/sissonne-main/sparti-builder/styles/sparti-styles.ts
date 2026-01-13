// Universal Sparti Builder Styles - Injected directly into DOM
export const SPARTI_STYLES = `
/* Sparti Builder Core Styles - Universal Plugin */
.sparti-builder-wrapper {
  position: relative;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Toolbar Styles - Maximum Priority */
.sparti-toolbar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  background: #ffffff !important;
  border-bottom: 1px solid #e5e7eb !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 2147483647 !important;
  transition: all 0.3s ease;
  font-family: inherit !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-toolbar {
    background: #1f2937 !important;
    border-bottom-color: #374151 !important;
  }
}

.sparti-toolbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  max-width: 100%;
  margin: 0;
}

.sparti-toolbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  font-size: 1rem;
}

@media (prefers-color-scheme: dark) {
  .sparti-toolbar-brand {
    color: #f9fafb;
  }
}

.sparti-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Content Area */
.sparti-content-area {
  position: relative;
}

.sparti-content {
  padding-top: 80px !important;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

body.sparti-editing .sparti-content {
  cursor: crosshair !important;
  position: relative;
}

body.sparti-editing .sparti-content::before {
  content: '';
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.05);
  pointer-events: none;
  z-index: 100;
}

/* Button Styles */
.sparti-btn {
  display: inline-flex !important;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  background: none;
  font-family: inherit;
  line-height: 1.25;
  user-select: none;
}

.sparti-btn-primary {
  background: #3b82f6 !important;
  color: #ffffff !important;
}

.sparti-btn-primary:hover {
  background: #2563eb !important;
}

.sparti-btn-success {
  background: #10b981 !important;
  color: #ffffff !important;
}

.sparti-btn-success:hover {
  background: #059669 !important;
}

.sparti-btn-ghost {
  background: transparent !important;
  color: #6b7280 !important;
  border: 1px solid #d1d5db !important;
}

.sparti-btn-ghost:hover {
  background: #f9fafb !important;
  color: #374151 !important;
}

.sparti-btn-outline {
  background: transparent !important;
  color: #374151 !important;
  border: 1px solid #d1d5db !important;
}

.sparti-btn-outline:hover {
  background: #f3f4f6 !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-btn-ghost {
    color: #9ca3af !important;
    border-color: #4b5563 !important;
  }
  
  .sparti-btn-ghost:hover {
    background: #1f2937 !important;
    color: #f3f4f6 !important;
  }
  
  .sparti-btn-outline {
    color: #f3f4f6 !important;
    border-color: #4b5563 !important;
  }
  
  .sparti-btn-outline:hover {
    background: #374151 !important;
  }
}

/* Overlay Styles */
.sparti-hover-overlay {
  border: 2px dashed #3b82f6 !important;
  background: rgba(59, 130, 246, 0.1) !important;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2) !important;
  pointer-events: none !important;
  z-index: 2147483640 !important;
}

.sparti-selection-overlay {
  border: 2px solid #3b82f6 !important;
  background: rgba(59, 130, 246, 0.1) !important;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  pointer-events: none !important;
  z-index: 2147483641 !important;
}

.sparti-element-label {
  position: absolute;
  top: -24px;
  left: 0;
  background: #3b82f6 !important;
  color: #ffffff !important;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  font-weight: 500;
  white-space: nowrap;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  z-index: 2147483642 !important;
}

/* Edit Panel Styles */
.sparti-edit-panel {
  position: fixed !important;
  right: 0 !important;
  top: 80px !important;
  width: 320px !important;
  height: calc(100vh - 80px) !important;
  background: #ffffff !important;
  border-left: 1px solid #e5e7eb !important;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 2147483646 !important;
  overflow-y: auto !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-edit-panel {
    background: #1f2937 !important;
    border-left-color: #374151 !important;
  }
}

.sparti-edit-panel-header {
  padding: 1rem !important;
  border-bottom: 1px solid #e5e7eb !important;
  background: #f9fafb !important;
  margin: 0 !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-edit-panel-header {
    border-bottom-color: #374151 !important;
    background: #111827 !important;
  }
}

.sparti-edit-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.sparti-edit-header-content h3 {
  margin: 0 !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: #111827 !important;
  font-family: inherit !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-edit-header-content h3 {
    color: #f9fafb !important;
  }
}

.sparti-element-path {
  margin: 0 !important;
  font-size: 0.75rem !important;
  color: #6b7280 !important;
  text-transform: uppercase;
  font-family: inherit !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-element-path {
    color: #9ca3af !important;
  }
}

.sparti-edit-panel-content {
  padding: 1rem !important;
  background: inherit;
}

.sparti-edit-section {
  margin-bottom: 1.5rem !important;
  background: inherit;
}

.sparti-edit-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  color: #374151 !important;
  font-family: inherit !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-edit-label {
    color: #d1d5db !important;
  }
}

.sparti-edit-textarea {
  width: 100% !important;
  padding: 0.75rem !important;
  border: 1px solid #d1d5db !important;
  border-radius: 0.375rem !important;
  background: #ffffff !important;
  color: #111827 !important;
  font-size: 0.875rem !important;
  resize: vertical !important;
  min-height: 80px !important;
  font-family: inherit !important;
  box-sizing: border-box !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-edit-textarea {
    background: #374151 !important;
    color: #f9fafb !important;
    border-color: #4b5563 !important;
  }
}

.sparti-edit-textarea:focus,
.sparti-edit-input:focus,
.sparti-edit-select:focus {
  outline: none !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

.sparti-edit-input,
.sparti-edit-select {
  width: 100% !important;
  padding: 0.5rem !important;
  border: 1px solid #d1d5db !important;
  border-radius: 0.375rem !important;
  background: #ffffff !important;
  color: #111827 !important;
  font-size: 0.875rem !important;
  font-family: inherit !important;
  box-sizing: border-box !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-edit-input,
  .sparti-edit-select {
    background: #374151 !important;
    color: #f9fafb !important;
    border-color: #4b5563 !important;
  }
}

/* Dropdown/Select Styles - High Priority */
.sparti-edit-select,
.sparti-dropdown-menu {
  background: #ffffff !important;
  z-index: 2147483645 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #d1d5db !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-edit-select,
  .sparti-dropdown-menu {
    background: #374151 !important;
    border-color: #4b5563 !important;
  }
}

/* Form Controls */
.sparti-btn-sm {
  padding: 0.375rem 0.75rem !important;
  font-size: 0.8125rem !important;
}

.sparti-url-input {
  display: flex !important;
  gap: 0.5rem;
}

.sparti-url-input input {
  flex: 1 !important;
}

.sparti-color-controls {
  display: flex !important;
  gap: 1rem;
}

.sparti-color-input {
  flex: 1 !important;
  display: flex;
  flex-direction: column;
}

.sparti-color-input label {
  display: block !important;
  margin-bottom: 0.25rem !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  color: #6b7280 !important;
  font-family: inherit !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-color-input label {
    color: #9ca3af !important;
  }
}

.sparti-color-input input[type="color"] {
  width: 100% !important;
  height: 40px !important;
  border: 1px solid #d1d5db !important;
  border-radius: 0.375rem !important;
  background: none !important;
  cursor: pointer !important;
  padding: 0 !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-color-input input[type="color"] {
    border-color: #4b5563 !important;
  }
}

.sparti-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sparti-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.sparti-checkbox input[type="checkbox"] {
  width: auto;
}

.sparti-typography-controls,
.sparti-layout-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sparti-input-group {
  display: flex;
  flex-direction: column;
}

.sparti-alignment-controls {
  display: flex;
  gap: 0.25rem;
}

.sparti-alignment-controls .sparti-btn {
  flex: 1;
}

.sparti-alignment-controls .sparti-btn.active {
  background: #3b82f6 !important;
  color: #ffffff !important;
}

.sparti-link-styling {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sparti-select-input {
  display: flex;
  flex-direction: column;
}

.sparti-image-preview,
.sparti-video-preview,
.sparti-link-preview {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #f9fafb;
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .sparti-image-preview,
  .sparti-video-preview,
  .sparti-link-preview {
    border-color: #4b5563;
    background: #374151;
  }
}

.sparti-spacing-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sparti-appearance-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sparti-border-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  align-items: end;
}

.sparti-border-controls .sparti-color-input {
  grid-column: span 2;
}

.sparti-preset-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.w-full {
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sparti-edit-panel {
    width: 100% !important;
    height: 50vh !important;
    top: auto !important;
    bottom: 0 !important;
    border-left: none !important;
    border-top: 1px solid #e5e7eb !important;
  }
  
  @media (prefers-color-scheme: dark) {
    .sparti-edit-panel {
      border-top-color: #374151 !important;
    }
  }
  
  .sparti-toolbar-content {
    padding: 0.5rem 1rem !important;
  }
  
  .sparti-toolbar-brand span {
    display: none;
  }
  
  .sparti-content {
    padding-top: 60px !important;
  }

  body.sparti-editing .sparti-content::before {
    top: 60px !important;
    bottom: 50vh !important;
  }
}

@media (prefers-contrast: high) {
  .sparti-toolbar {
    border-bottom-width: 2px !important;
  }
  
  .sparti-selection-overlay {
    border-width: 3px !important;
  }
  
  .sparti-hover-overlay {
    border-width: 2px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sparti-builder-wrapper *,
  .sparti-btn,
  .sparti-content {
    transition: none !important;
    animation: none !important;
  }
}

.sparti-ui-force {
  position: fixed !important;
  z-index: 2147483647 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

@media (max-width: 768px) {
  body.sparti-editing {
    overflow: hidden !important;
  }
  
  body.sparti-editing .sparti-content {
    overflow-y: auto !important;
    height: calc(100vh - 60px) !important;
  }
}

.sparti-builder-wrapper {
  line-height: 1.5 !important;
  color: inherit !important;
  background: transparent !important;
}

.sparti-builder-wrapper * {
  transition: border 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease !important;
}

body.sparti-editing * {
  cursor: crosshair !important;
}

body.sparti-editing .sparti-toolbar *,
body.sparti-editing .sparti-edit-panel *,
body.sparti-editing .sparti-overlay *,
body.sparti-editing .sparti-ui * {
  cursor: default !important;
}

body.sparti-editing input,
body.sparti-editing textarea,
body.sparti-editing [contenteditable] {
  cursor: text !important;
}

body.sparti-editing button,
body.sparti-editing .sparti-btn,
body.sparti-editing a {
  cursor: pointer !important;
}

body.sparti-editing .sparti-btn:hover {
  cursor: pointer !important;
}
`;

// CSS injection utility
export class SpartiStyleManager {
  private static styleId = 'sparti-builder-styles';
  private static injected = false;

  static injectStyles(): void {
    if (this.injected || document.getElementById(this.styleId)) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = this.styleId;
    styleElement.textContent = SPARTI_STYLES;
    
    // Insert at the beginning of head for high priority
    document.head.insertBefore(styleElement, document.head.firstChild);
    this.injected = true;
  }

  static removeStyles(): void {
    const existingStyle = document.getElementById(this.styleId);
    if (existingStyle) {
      existingStyle.remove();
      this.injected = false;
    }
  }

  static isInjected(): boolean {
    return this.injected && !!document.getElementById(this.styleId);
  }
}