declare module 'react-test-renderer' {
  export interface ReactTestRendererJSON {
    type: string;
    props: { [propName: string]: any };
    children: null | ReactTestRendererNode[];
    $$typeof?: symbol;
  }

  export type ReactTestRendererNode = ReactTestRendererJSON | string;

  export interface ReactTestInstance {
    instance: any;
    type: any;
    props: { [propName: string]: any };
    parent: null | ReactTestInstance;
    children: (ReactTestInstance | string)[];
    find(predicate: (node: ReactTestInstance) => boolean): ReactTestInstance;
    findByType(type: any): ReactTestInstance;
    findByProps(props: { [propName: string]: any }): ReactTestInstance;
    findAll(
      predicate: (node: ReactTestInstance) => boolean,
      options?: { deep?: boolean }
    ): ReactTestInstance[];
    findAllByType(type: any, options?: { deep?: boolean }): ReactTestInstance[];
    findAllByProps(
      props: { [propName: string]: any },
      options?: { deep?: boolean }
    ): ReactTestInstance[];
  }

  export interface ReactTestRenderer {
    toJSON(): null | ReactTestRendererJSON | ReactTestRendererJSON[];
    toTree(): null | any;
    unmount(nextElement?: any): void;
    update(nextElement: any): void;
    getInstance(): null | ReactTestInstance;
    root: ReactTestInstance;
  }

  export function create(nextElement: any, options?: any): ReactTestRenderer;

  export function act(callback: () => void | Promise<void>): any;
}
