import { ComponentType, ReactNode } from 'react';

declare module 'kbar' {
  export const KBarProvider: ComponentType<{ actions?: Action[], children?: ReactNode }>;
  export const KBarPortal: ComponentType<{ children?: ReactNode }>;
  export const KBarPositioner: ComponentType<{ className?: string, children?: ReactNode }>;
  export const KBarAnimator: ComponentType<{ className?: string, children?: ReactNode }>;
  export const KBarSearch: ComponentType<{ className?: string, placeholder?: string }>;
  export const useMatches: () => { results: (Action | string)[] };
   export const KBarResults: ComponentType<{
    items: (Action | string)[];
    onRender: (params: { item: Action | string; active: boolean }) => ReactNode;
  }>;
  export interface Action {
    id: string;
    name: string;
    shortcut?: string[];
    keywords?: string;
    perform?: () => void;
    icon?: ReactNode;
    parent?: string;
    section?: string;
  }
}
