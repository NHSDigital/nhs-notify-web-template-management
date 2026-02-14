/**
 * Type definitions for Carbone internal modules.
 * Not part of Carbone's public API
 */

declare module 'carbone/lib/file' {
  export interface TemplateFile {
    data: string | Buffer;
    isMarked: boolean;
  }

  export interface Template {
    files: TemplateFile[];
  }

  interface FileModule {
    openTemplate(
      path: string,
      cb: (err: Error | null, template: Template) => void
    ): void;
  }

  const file: FileModule;
  export = file;
}

declare module 'carbone/lib/parser' {
  export interface Marker {
    name: string;
  }

  interface ParserModule {
    findMarkers(
      xml: string,
      cb: (err: Error | null, cleanedXml: string, markers: Marker[]) => void
    ): void;
    removeXMLInsideMarkers(xml: string): string;
  }

  const parser: ParserModule;
  export = parser;
}
