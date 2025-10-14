export interface ComponentProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  editable?: boolean;
  required?: boolean;
  default?: any;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'button' | 'link' | 'input' | 'container' | 'media' | 'unknown';
  category: 'content' | 'media' | 'navigation' | 'form' | 'layout' | 'interactive';
  description?: string;
  properties: Record<string, ComponentProperty>;
  editor: 'TextEditor' | 'ImageEditor' | 'VideoEditor' | 'ButtonEditor' | 'LinkEditor' | 'InputEditor' | 'ContainerEditor';
  version: string;
  tenant_scope?: 'global' | 'tenant';
  tags?: string[];
  preview_url?: string;
  documentation_url?: string;
  dependencies?: string[];
  last_updated?: string;
}

export interface RegistryConfig {
  version: string;
  last_sync: string;
  components: ComponentDefinition[];
}

export interface SyncResult {
  added: ComponentDefinition[];
  updated: ComponentDefinition[];
  removed: string[];
  errors: string[];
}