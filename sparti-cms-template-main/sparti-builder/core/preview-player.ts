// TypeScript conversion of pg.page-view-player.js - Real-time preview system
export interface PreviewEvent {
  type: string;
  target?: HTMLElement;
  data?: any;
  timestamp: number;
}

export class SpartiEventHandler {
  private events: PreviewEvent[] = [];
  private isRecording: boolean = false;
  private callbacks: Array<(event: PreviewEvent) => void> = [];

  start(): void {
    this.isRecording = true;
    this.events = [];
  }

  stop(): void {
    this.isRecording = false;
  }

  record(event: PreviewEvent): void {
    if (this.isRecording) {
      this.events.push({
        ...event,
        timestamp: Date.now()
      });
      
      // Notify callbacks
      this.callbacks.forEach(callback => callback(event));
    }
  }

  onEvent(callback: (event: PreviewEvent) => void): void {
    this.callbacks.push(callback);
  }

  getEvents(): PreviewEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }

  destroy(): void {
    this.callbacks = [];
    this.events = [];
    this.isRecording = false;
  }
}

export class SpartiNodeEventDOMPlayer {
  private container: HTMLElement;
  private eventHandler: SpartiEventHandler;

  constructor(container: HTMLElement, eventHandler: SpartiEventHandler) {
    this.container = container;
    this.eventHandler = eventHandler;
  }

  play(event: PreviewEvent, target: HTMLElement): void {
    try {
      switch (event.type) {
        case 'content-change':
          this.handleContentChange(event, target);
          break;
        case 'style-change':
          this.handleStyleChange(event, target);
          break;
        case 'attribute-change':
          this.handleAttributeChange(event, target);
          break;
        case 'element-add':
          this.handleElementAdd(event, target);
          break;
        case 'element-remove':
          this.handleElementRemove(event, target);
          break;
        default:
          console.warn('Unknown event type:', event.type);
      }
    } catch (error) {
      console.error('Error playing event:', error);
    }
  }

  private handleContentChange(event: PreviewEvent, target: HTMLElement): void {
    if (event.data && typeof event.data.content === 'string') {
      if (event.data.isText) {
        target.textContent = event.data.content;
      } else {
        target.innerHTML = event.data.content;
      }
    }
  }

  private handleStyleChange(event: PreviewEvent, target: HTMLElement): void {
    if (event.data && event.data.styles) {
      Object.entries(event.data.styles).forEach(([property, value]) => {
        target.style.setProperty(property, value as string);
      });
    }
  }

  private handleAttributeChange(event: PreviewEvent, target: HTMLElement): void {
    if (event.data && event.data.attributes) {
      Object.entries(event.data.attributes).forEach(([name, value]) => {
        if (value === null || value === undefined) {
          target.removeAttribute(name);
        } else {
          target.setAttribute(name, value as string);
        }
      });
    }
  }

  private handleElementAdd(event: PreviewEvent, target: HTMLElement): void {
    if (event.data && event.data.html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = event.data.html;
      
      while (tempDiv.firstChild) {
        target.appendChild(tempDiv.firstChild);
      }
    }
  }

  private handleElementRemove(event: PreviewEvent, target: HTMLElement): void {
    if (target.parentNode) {
      target.parentNode.removeChild(target);
    }
  }

  destroy(): void {
    // Cleanup if needed
  }
}

export class SpartiPageViewPlayer {
  private iframe: HTMLIFrameElement;
  private eventHandler: SpartiEventHandler;
  private domPlayer: SpartiNodeEventDOMPlayer;

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
    this.eventHandler = new SpartiEventHandler();
    
    // Initialize DOM player when iframe loads
    this.iframe.addEventListener('load', () => {
      const doc = this.iframe.contentDocument;
      if (doc && doc.documentElement) {
        this.domPlayer = new SpartiNodeEventDOMPlayer(
          doc.documentElement, 
          this.eventHandler
        );
      }
    });

    // Set up event listener
    this.eventHandler.onEvent((event) => {
      this.playEvent(event);
    });
  }

  private playEvent(event: PreviewEvent): void {
    const doc = this.iframe.contentDocument;
    if (!doc || !this.domPlayer) return;

    let target: HTMLElement | null = null;

    // Find target element
    if (event.data && event.data.selector) {
      target = doc.querySelector(event.data.selector) as HTMLElement;
    } else if (event.data && event.data.id) {
      target = doc.getElementById(event.data.id) as HTMLElement;
    }

    if (target) {
      this.domPlayer.play(event, target);
    }
  }

  open(): void {
    this.eventHandler.start();
  }

  recordEvent(event: PreviewEvent): void {
    this.eventHandler.record(event);
  }

  destroy(): void {
    this.eventHandler.destroy();
    if (this.domPlayer) {
      this.domPlayer.destroy();
    }
  }
}

// Utility functions for creating common events
export function createContentChangeEvent(target: HTMLElement, content: string, isText: boolean = false): PreviewEvent {
  return {
    type: 'content-change',
    target,
    data: {
      content,
      isText,
      selector: target.tagName.toLowerCase() + (target.id ? `#${target.id}` : ''),
      id: target.id
    },
    timestamp: Date.now()
  };
}

export function createStyleChangeEvent(target: HTMLElement, styles: Record<string, string>): PreviewEvent {
  return {
    type: 'style-change',
    target,
    data: {
      styles,
      selector: target.tagName.toLowerCase() + (target.id ? `#${target.id}` : ''),
      id: target.id
    },
    timestamp: Date.now()
  };
}

export function createAttributeChangeEvent(target: HTMLElement, attributes: Record<string, string | null>): PreviewEvent {
  return {
    type: 'attribute-change',
    target,
    data: {
      attributes,
      selector: target.tagName.toLowerCase() + (target.id ? `#${target.id}` : ''),
      id: target.id
    },
    timestamp: Date.now()
  };
}