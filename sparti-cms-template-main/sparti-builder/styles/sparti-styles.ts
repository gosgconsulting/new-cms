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
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  background: #ffffff !important;
  border-top: 1px solid #e5e7eb !important;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 2147483647 !important;
  transition: all 0.3s ease;
  font-family: inherit !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-toolbar {
    background: #1f2937 !important;
    border-top-color: #374151 !important;
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
  padding-bottom: 80px !important;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 80px;
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

/* Edit Panel Styles - Modal Version */
.sparti-edit-panel {
  position: fixed !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 480px !important;
  max-width: 90vw !important;
  max-height: 80vh !important;
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
  z-index: 2147483646 !important;
  overflow-y: auto !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

/* Modal Backdrop */
.sparti-modal-backdrop {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  z-index: 2147483645 !important;
  backdrop-filter: blur(2px) !important;
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
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.sparti-close-btn {
  padding: 0.5rem !important;
  border-radius: 50% !important;
  width: 36px !important;
  height: 36px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: background-color 0.2s ease !important;
}

.sparti-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-close-btn:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
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
    width: 95% !important;
    max-height: 70vh !important;
    border-radius: 12px !important;
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
    padding-bottom: 60px !important;
  }

  body.sparti-editing .sparti-content::before {
    top: 0 !important;
    bottom: 110vh !important;
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
    padding-bottom: 60px !important;
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

/* Tiptap Rich Text Editor Styles */
.sparti-tiptap-toolbar {
  display: flex !important;
  align-items: center !important;
  gap: 0.25rem !important;
  padding: 0.75rem !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 0.5rem 0.5rem 0 0 !important;
  border-bottom: none !important;
  flex-wrap: wrap !important;
}

/* Typography dropdown styles */
.sparti-typography-dropdown,
.sparti-color-dropdown {
  position: relative !important;
  display: inline-block !important;
}

.sparti-toolbar-dropdown-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 0.5rem !important;
  height: 32px !important;
  padding: 0 0.5rem !important;
  border: 1px solid transparent !important;
  border-radius: 0.375rem !important;
  background: transparent !important;
  color: #64748b !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  font-size: 0.75rem !important;
  min-width: 110px !important;
}

.sparti-toolbar-dropdown-btn:hover {
  background: #e2e8f0 !important;
  color: #334155 !important;
}

.sparti-toolbar-dropdown-btn.active {
  background: #3b82f6 !important;
  color: #ffffff !important;
  border-color: #2563eb !important;
}

.sparti-dropdown-label {
  font-size: 0.75rem !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 80px !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-tiptap-toolbar {
    background: #1e293b !important;
    border-color: #475569 !important;
  }
}

.sparti-toolbar-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  border: 1px solid transparent !important;
  border-radius: 0.375rem !important;
  background: transparent !important;
  color: #64748b !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  font-size: 0 !important;
}

.sparti-toolbar-btn:hover {
  background: #e2e8f0 !important;
  color: #334155 !important;
}

.sparti-toolbar-btn.active {
  background: #3b82f6 !important;
  color: #ffffff !important;
  border-color: #2563eb !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-toolbar-btn,
  .sparti-toolbar-dropdown-btn {
    color: #94a3b8 !important;
  }
  
  .sparti-toolbar-btn:hover,
  .sparti-toolbar-dropdown-btn:hover {
    background: #334155 !important;
    color: #f1f5f9 !important;
  }
}

.sparti-toolbar-divider {
  width: 1px !important;
  height: 20px !important;
  background: #e2e8f0 !important;
  margin: 0 0.25rem !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-toolbar-divider {
    background: #475569 !important;
  }
}

.sparti-tiptap-editor {
  border: 1px solid #e2e8f0 !important;
  border-radius: 0 0 0.5rem 0.5rem !important;
  background: #ffffff !important;
  min-height: 200px !important;
  overflow: hidden !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-tiptap-editor {
    background: #0f172a !important;
    border-color: #475569 !important;
  }
}

.sparti-tiptap-editor .ProseMirror {
  padding: 1rem !important;
  outline: none !important;
  min-height: 180px !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 0.875rem !important;
  line-height: 1.5 !important;
  color: #1e293b !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-tiptap-editor .ProseMirror {
    color: #f1f5f9 !important;
  }
}

.sparti-tiptap-editor .ProseMirror p {
  margin: 0 0 0.75rem 0 !important;
}

/* Heading styles in editor */
.sparti-tiptap-editor .ProseMirror h1 {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  margin: 1rem 0 0.75rem 0 !important;
  line-height: 1.2 !important;
}

.sparti-tiptap-editor .ProseMirror h2 {
  font-size: 1.375rem !important;
  font-weight: 700 !important;
  margin: 1rem 0 0.75rem 0 !important;
  line-height: 1.2 !important;
}

.sparti-tiptap-editor .ProseMirror h3 {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  margin: 1rem 0 0.75rem 0 !important;
  line-height: 1.3 !important;
}

.sparti-tiptap-editor .ProseMirror h4 {
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  margin: 0.75rem 0 0.5rem 0 !important;
  line-height: 1.4 !important;
}

.sparti-tiptap-editor .ProseMirror h5 {
  font-size: 1rem !important;
  font-weight: 500 !important;
  margin: 0.75rem 0 0.5rem 0 !important;
  line-height: 1.4 !important;
}

.sparti-tiptap-editor .ProseMirror h6 {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  margin: 0.75rem 0 0.5rem 0 !important;
  line-height: 1.5 !important;
}

.sparti-tiptap-editor .ProseMirror p:last-child {
  margin-bottom: 0 !important;
}

.sparti-tiptap-editor .ProseMirror ul,
.sparti-tiptap-editor .ProseMirror ol {
  padding-left: 1.5rem !important;
  margin: 0 0 0.75rem 0 !important;
}

.sparti-tiptap-editor .ProseMirror li {
  margin-bottom: 0.25rem !important;
}

.sparti-tiptap-editor .ProseMirror strong {
  font-weight: 600 !important;
}

.sparti-tiptap-editor .ProseMirror em {
  font-style: italic !important;
}

.sparti-tiptap-editor .ProseMirror u {
  text-decoration: underline !important;
}

/* Dropdown menu styles */
.sparti-dropdown-menu {
  position: absolute !important;
  top: 100% !important;
  left: 0 !important;
  z-index: 2147483646 !important;
  min-width: 180px !important;
  max-height: 300px !important;
  overflow-y: auto !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 0.375rem !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  padding: 0.5rem 0 !important;
  margin-top: 0.25rem !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-dropdown-menu {
    background: #1e293b !important;
    border-color: #475569 !important;
  }
}

.sparti-dropdown-item {
  display: block !important;
  width: 100% !important;
  padding: 0.5rem 0.75rem !important;
  text-align: left !important;
  background: transparent !important;
  border: none !important;
  cursor: pointer !important;
  transition: background-color 0.15s ease !important;
  color: #334155 !important;
}

.sparti-dropdown-item:hover {
  background-color: #f1f5f9 !important;
}

.sparti-dropdown-item.active {
  background-color: #e0f2fe !important;
  color: #0284c7 !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-dropdown-item {
    color: #e2e8f0 !important;
  }
  
  .sparti-dropdown-item:hover {
    background-color: #334155 !important;
  }
  
  .sparti-dropdown-item.active {
    background-color: #0f172a !important;
    color: #38bdf8 !important;
  }
}

.sparti-dropdown-item-label {
  font-size: 0.875rem !important;
  font-weight: 400 !important;
  display: block !important;
}

/* Heading styles in dropdown */
.sparti-dropdown-item-label.h1 {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
}

.sparti-dropdown-item-label.h2 {
  font-size: 1.125rem !important;
  font-weight: 700 !important;
}

.sparti-dropdown-item-label.h3 {
  font-size: 1rem !important;
  font-weight: 600 !important;
}

.sparti-dropdown-item-label.h4 {
  font-size: 0.9375rem !important;
  font-weight: 600 !important;
}

.sparti-dropdown-item-label.h5 {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
}

.sparti-dropdown-item-label.h6 {
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
}

/* Color picker styles */
.sparti-color-btn {
  position: relative !important;
}

.sparti-color-picker-menu {
  width: 220px !important;
}

.sparti-color-picker-title {
  padding: 0.5rem 0.75rem !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  color: #64748b !important;
  border-bottom: 1px solid #e2e8f0 !important;
  margin-bottom: 0.5rem !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-color-picker-title {
    color: #94a3b8 !important;
    border-bottom-color: #475569 !important;
  }
}

.sparti-color-grid {
  display: grid !important;
  grid-template-columns: repeat(5, 1fr) !important;
  gap: 0.25rem !important;
  padding: 0.5rem 0.75rem !important;
}

.sparti-color-swatch {
  width: 24px !important;
  height: 24px !important;
  border-radius: 4px !important;
  border: 1px solid #e2e8f0 !important;
  cursor: pointer !important;
  transition: transform 0.15s ease !important;
}

.sparti-color-swatch:hover {
  transform: scale(1.1) !important;
}

.sparti-color-swatch.active {
  box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
  transform: scale(1.1) !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-color-swatch {
    border-color: #475569 !important;
  }
  
  .sparti-color-swatch.active {
    box-shadow: 0 0 0 2px #38bdf8, 0 0 0 4px rgba(56, 189, 248, 0.3) !important;
  }
}

/* Custom color input styles */
.sparti-color-custom {
  padding: 0.5rem 0.75rem !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  border-top: 1px solid #e2e8f0 !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

.sparti-color-custom-label {
  font-size: 0.75rem !important;
  color: #64748b !important;
  flex-shrink: 0 !important;
}

.sparti-color-input {
  width: 100% !important;
  height: 24px !important;
  padding: 0 !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  background: none !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-color-custom {
    border-color: #475569 !important;
  }
  
  .sparti-color-custom-label {
    color: #94a3b8 !important;
  }
  
  .sparti-color-input {
    border-color: #475569 !important;
  }
}

.sparti-tiptap-editor .ProseMirror[data-placeholder]:before {
  content: attr(data-placeholder) !important;
  color: #94a3b8 !important;
  pointer-events: none !important;
  height: 0 !important;
  float: left !important;
}

@media (prefers-color-scheme: dark) {
  .sparti-tiptap-editor .ProseMirror[data-placeholder]:before {
    color: #64748b !important;
  }
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