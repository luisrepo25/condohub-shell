// Runtime de @originjs/vite-plugin-federation que el plugin inyecta como módulo virtual en el host.
declare module 'virtual:__federation__' {
  interface ConfiguracionRemota {
    url: () => Promise<string>;
    format: 'esm' | 'systemjs' | 'var';
    from: 'vite' | 'webpack';
  }
  export function __federation_method_setRemote(nombre: string, configuracion: ConfiguracionRemota): void;
  export function __federation_method_getRemote(nombre: string, modulo: string): Promise<unknown>;
}
