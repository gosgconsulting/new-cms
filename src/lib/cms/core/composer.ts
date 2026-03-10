// TypeScript conversion of pg.composer.js - Component composition system
export class SpartiComposerManager {
  private instancesMap: Record<string, any[]> = {};
  private unusedMap: Record<string, any[]> = {};
  private types: Record<string, new () => any> = {};

  registerType<T>(name: string, constructor: new () => T): void {
    this.types[name] = constructor;
  }

  unused(instance: any): void {
    if (!this.unusedMap[instance.type]) {
      this.unusedMap[instance.type] = [];
    }
    this.unusedMap[instance.type].push(instance);
  }

  used(instance: any): void {
    if (this.unusedMap[instance.type]) {
      const index = this.unusedMap[instance.type].indexOf(instance);
      if (index >= 0) {
        this.unusedMap[instance.type].splice(index, 1);
      }
    }
  }

  registerInstance(instance: any): void {
    if (!this.instancesMap[instance.type]) {
      this.instancesMap[instance.type] = [];
    }
    this.instancesMap[instance.type].push(instance);
  }

  getInstance<T>(type: string): T {
    if (this.unusedMap[type] && this.unusedMap[type].length) {
      return this.unusedMap[type].pop();
    }
    return new this.types[type]();
  }
}

export const spartiComposerManager = new SpartiComposerManager();

export abstract class SpartiComposerComponent {
  public type: string;
  public id: string | null = null;
  public data: any = null;
  public element: HTMLElement | null = null;
  public map: Record<string, HTMLElement> = {};
  public cache: Record<string, any> = {};
  public childrenMap: Record<string, SpartiComposerComponent[]> = {};
  public manager: SpartiComposerManager;

  constructor(type: string) {
    this.type = type;
    this.manager = spartiComposerManager;
    this.manager.registerInstance(this);
  }

  setData(data: any): void {
    this.data = data;
  }

  detach(): void {
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.manager.unused(this);
    
    for (const key in this.childrenMap) {
      this.childrenMap[key].forEach(child => child.detach());
      this.childrenMap[key] = [];
    }
  }

  create(
    mapKey: string, 
    tagName: string, 
    attributes?: Record<string, string>, 
    children?: HTMLElement[]
  ): HTMLElement {
    const element = document.createElement(tagName);
    
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
      }
    }
    
    if (children) {
      children.forEach(child => element.appendChild(child));
    }
    
    if (mapKey) {
      this.map[mapKey] = element;
    }
    
    return element;
  }

  text(content: string): Text {
    return document.createTextNode(content);
  }

  setHtml(mapKey: string, html: string): void {
    const cacheKey = `${mapKey}__html`;
    if (html !== this.cache[cacheKey]) {
      this.map[mapKey].innerHTML = html;
      this.cache[cacheKey] = html;
    }
  }

  addClass(mapKey: string, className: string): void {
    const element = this.map[mapKey];
    if (!element.classList.contains(className)) {
      element.classList.add(className);
    }
  }

  removeClass(mapKey: string, className: string): void {
    const element = this.map[mapKey];
    if (element.classList.contains(className)) {
      element.classList.remove(className);
    }
  }

  setAttribute(mapKey: string, attribute: string, value: string): void {
    const element = this.map[mapKey];
    if (element.getAttribute(attribute) !== value) {
      element.setAttribute(attribute, value);
    }
  }

  removeAttribute(mapKey: string, attribute: string): void {
    const element = this.map[mapKey];
    if (element.hasAttribute(attribute)) {
      element.removeAttribute(attribute);
    }
  }

  append(mapKey: string, child: HTMLElement): void {
    const parent = this.map[mapKey];
    if (child.parentNode !== parent) {
      parent.appendChild(child);
    }
  }

  setChildren(mapKey: string, children: SpartiComposerComponent[]): void {
    if (this.childrenMap[mapKey]) {
      this.childrenMap[mapKey].forEach(child => child.detach());
    }
    
    const parent = this.map[mapKey];
    children.forEach(child => {
      if (child.element) {
        parent.appendChild(child.element);
      }
    });
    
    this.childrenMap[mapKey] = children;
  }

  getElement(mapKey: string): HTMLElement {
    return this.map[mapKey];
  }

  objToString(obj: any): string {
    if (Array.isArray(obj)) {
      return `[${obj.map(item => this.objToString(item)).join(', ')}]`;
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const pairs = Object.entries(obj).map(([key, value]) => 
        `${key}: ${this.objToString(value)}`
      );
      return `{${pairs.join(', ')}}`;
    }
    
    return String(obj);
  }

  didChange(key: string, value: any): boolean {
    const cacheKey = `${key}__value`;
    const cachedValue = this.cache[cacheKey] || null;
    const stringValue = this.objToString(value);
    
    if (cachedValue === null) {
      if (value !== null) {
        this.cache[cacheKey] = stringValue;
        return true;
      }
      return false;
    }
    
    if (cachedValue !== stringValue) {
      this.cache[cacheKey] = stringValue;
      return true;
    }
    
    return false;
  }
}