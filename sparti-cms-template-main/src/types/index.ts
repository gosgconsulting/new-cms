export interface SpartiElement {
  id: string;
  element: HTMLElement | null;
  data: {
    content: string;
    styles: Record<string, string>;
    attributes: Record<string, string>;
    type: string;
  };
}
