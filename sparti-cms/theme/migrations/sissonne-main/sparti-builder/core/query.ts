// TypeScript conversion of pg-query.js - DOM manipulation and node management
export interface ElementData {
  id: string;
  tagName: string;
  content: string;
  attributes: Record<string, string>;
  styles: Record<string, string>;
}

export interface SpartiNodeElementPair {
  element: HTMLElement;
  data: ElementData;
}

export class SpartiQuery {
  private list: SpartiNodeElementPair[] = [];
  public length: number = 0;

  constructor(input?: HTMLElement[] | HTMLElement | SpartiNodeElementPair[] | SpartiNodeElementPair) {
    if (Array.isArray(input)) {
      if (input.length > 0 && 'element' in input[0]) {
        // Array of SpartiNodeElementPair
        this.list = input as SpartiNodeElementPair[];
      } else {
        // Array of HTMLElements
        this.list = (input as HTMLElement[]).map(el => this.createPair(el));
      }
    } else if (input) {
      if ('element' in input) {
        // Single SpartiNodeElementPair
        this.list = [input as SpartiNodeElementPair];
      } else {
        // Single HTMLElement
        this.list = [this.createPair(input as HTMLElement)];
      }
    }
    
    this.length = this.list.length;
  }

  private createPair(element: HTMLElement): SpartiNodeElementPair {
    const computedStyles = window.getComputedStyle(element);
    const styles: Record<string, string> = {};
    
    // Extract key styles
    ['color', 'backgroundColor', 'fontSize', 'fontFamily', 'fontWeight', 'textAlign', 'padding', 'margin', 'display'].forEach(prop => {
      styles[prop] = computedStyles.getPropertyValue(prop);
    });

    const attributes: Record<string, string> = {};
    Array.from(element.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });

    return {
      element,
      data: {
        id: element.id || `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tagName: element.tagName.toLowerCase(),
        content: element.textContent || element.innerHTML || '',
        attributes,
        styles,
      }
    };
  }

  create(html: string): SpartiQuery {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const elements = Array.from(wrapper.children) as HTMLElement[];
    
    elements.forEach(el => {
      this.add(this.createPair(el));
    });
    
    return this;
  }

  add(pair: SpartiNodeElementPair): SpartiQuery {
    this.list.push(pair);
    this.length = this.list.length;
    return this;
  }

  get(index: number): SpartiNodeElementPair | null {
    return index >= this.list.length ? null : this.list[index];
  }

  $get(index: number): HTMLElement | null {
    return index >= this.list.length ? null : this.list[index].element;
  }

  each(callback: (index: number, pair: SpartiNodeElementPair) => boolean | void): SpartiQuery {
    for (let i = 0; i < this.list.length; i++) {
      if (callback(i, this.list[i]) === false) {
        break;
      }
    }
    return this;
  }

  indexOfElement(element: HTMLElement): number {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].element === element) {
        return i;
      }
    }
    return -1;
  }

  find(selector: string): SpartiQuery {
    const result = new SpartiQuery();
    
    this.each((_, pair) => {
      const found = pair.element.querySelectorAll(selector);
      Array.from(found).forEach((el: HTMLElement) => {
        if (result.indexOfElement(el) < 0) {
          result.add(this.createPair(el));
        }
      });
    });
    
    return result;
  }

  is(selector: string): boolean {
    return this.length > 0 && this.list[0].element.matches(selector);
  }

  closest(selector: string): SpartiQuery {
    const result = new SpartiQuery();
    
    this.each((_, pair) => {
      const closest = pair.element.closest(selector) as HTMLElement;
      if (closest && result.indexOfElement(closest) < 0) {
        result.add(this.createPair(closest));
      }
    });
    
    return result;
  }

  parent(): SpartiQuery {
    const result = new SpartiQuery();
    
    this.each((_, pair) => {
      const parent = pair.element.parentElement;
      if (parent && result.indexOfElement(parent) < 0) {
        result.add(this.createPair(parent));
      }
    });
    
    return result;
  }

  attr(name: string, value?: string): string | SpartiQuery | null {
    if (value === undefined) {
      // Get attribute
      return this.length > 0 ? this.list[0].element.getAttribute(name) : null;
    }
    
    // Set attribute
    this.each((_, pair) => {
      pair.element.setAttribute(name, value);
      pair.data.attributes[name] = value;
    });
    
    return this;
  }

  removeAttr(name: string): SpartiQuery {
    this.each((_, pair) => {
      pair.element.removeAttribute(name);
      delete pair.data.attributes[name];
    });
    
    return this;
  }

  hasAttr(name: string): boolean {
    return this.length > 0 && this.list[0].element.hasAttribute(name);
  }

  css(property: string, value?: string): string | SpartiQuery | null {
    if (value === undefined) {
      // Get CSS property
      if (this.length === 0) return null;
      return window.getComputedStyle(this.list[0].element).getPropertyValue(property);
    }
    
    // Set CSS property
    this.each((_, pair) => {
      pair.element.style.setProperty(property, value);
      pair.data.styles[property] = value;
    });
    
    return this;
  }

  html(content?: string): string | SpartiQuery {
    if (content === undefined) {
      // Get HTML
      return this.length > 0 ? this.list[0].element.innerHTML : '';
    }
    
    // Set HTML
    this.each((_, pair) => {
      pair.element.innerHTML = content;
      pair.data.content = content;
    });
    
    return this;
  }

  text(content?: string): string | SpartiQuery {
    if (content === undefined) {
      // Get text
      return this.length > 0 ? this.list[0].element.textContent || '' : '';
    }
    
    // Set text
    this.each((_, pair) => {
      pair.element.textContent = content;
      pair.data.content = content;
    });
    
    return this;
  }

  val(value?: string): string | SpartiQuery {
    if (value === undefined) {
      // Get value
      if (this.length === 0) return '';
      const element = this.list[0].element as HTMLInputElement;
      return element.value || '';
    }
    
    // Set value
    this.each((_, pair) => {
      const element = pair.element as HTMLInputElement;
      if (element.value !== undefined) {
        element.value = value;
      }
    });
    
    return this;
  }

  addClass(className: string): SpartiQuery {
    this.each((_, pair) => {
      pair.element.classList.add(className);
    });
    
    return this;
  }

  removeClass(className: string): SpartiQuery {
    this.each((_, pair) => {
      pair.element.classList.remove(className);
    });
    
    return this;
  }

  hasClass(className: string): boolean {
    return this.length > 0 && this.list[0].element.classList.contains(className);
  }

  append(child: SpartiQuery | HTMLElement): SpartiQuery {
    this.each((_, pair) => {
      if (child instanceof SpartiQuery) {
        child.each((_, childPair) => {
          pair.element.appendChild(childPair.element);
        });
      } else {
        pair.element.appendChild(child);
      }
    });
    
    return this;
  }

  prepend(child: SpartiQuery | HTMLElement): SpartiQuery {
    this.each((_, pair) => {
      if (child instanceof SpartiQuery) {
        child.each((_, childPair) => {
          pair.element.insertBefore(childPair.element, pair.element.firstChild);
        });
      } else {
        pair.element.insertBefore(child, pair.element.firstChild);
      }
    });
    
    return this;
  }

  insertBefore(target: SpartiQuery | HTMLElement): SpartiQuery {
    this.each((_, pair) => {
      if (target instanceof SpartiQuery) {
        const targetEl = target.$get(0);
        if (targetEl && targetEl.parentNode) {
          targetEl.parentNode.insertBefore(pair.element, targetEl);
        }
      } else {
        if (target.parentNode) {
          target.parentNode.insertBefore(pair.element, target);
        }
      }
    });
    
    return this;
  }

  insertAfter(target: SpartiQuery | HTMLElement): SpartiQuery {
    this.each((_, pair) => {
      if (target instanceof SpartiQuery) {
        const targetEl = target.$get(0);
        if (targetEl && targetEl.parentNode) {
          targetEl.parentNode.insertBefore(pair.element, targetEl.nextSibling);
        }
      } else {
        if (target.parentNode) {
          target.parentNode.insertBefore(pair.element, target.nextSibling);
        }
      }
    });
    
    return this;
  }

  remove(): SpartiQuery {
    this.each((_, pair) => {
      if (pair.element.parentNode) {
        pair.element.parentNode.removeChild(pair.element);
      }
    });
    
    return this;
  }

  detach(): SpartiQuery {
    this.each((_, pair) => {
      if (pair.element.parentNode) {
        pair.element.parentNode.removeChild(pair.element);
      }
    });
    
    return this;
  }

  show(): SpartiQuery {
    return this.css('display', '');
  }

  hide(): SpartiQuery {
    return this.css('display', 'none');
  }

  contents(): SpartiQuery {
    const result = new SpartiQuery();
    
    this.each((_, pair) => {
      Array.from(pair.element.children).forEach((child: HTMLElement) => {
        if (result.indexOfElement(child) < 0) {
          result.add(this.createPair(child));
        }
      });
    });
    
    return result;
  }
}

// Utility functions
export function spartiQuery(selector?: string | HTMLElement | HTMLElement[]): SpartiQuery {
  if (!selector) {
    return new SpartiQuery();
  }
  
  if (typeof selector === 'string') {
    const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    return new SpartiQuery(elements);
  }
  
  return new SpartiQuery(selector);
}

// Export as $ for convenience
export const $ = spartiQuery;