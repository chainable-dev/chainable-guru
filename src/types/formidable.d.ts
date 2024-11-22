declare module 'formidable' {
  import { IncomingMessage } from 'http';

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface Files {
    [key: string]: File | File[];
  }

  export interface File {
    size: number;
    path: string;
    name: string;
    type: string;
    lastModifiedDate?: Date;
    hash?: string;
  }

  export class IncomingForm {
    parse(
      req: IncomingMessage,
      callback: (err: any, fields: Fields, files: Files) => void
    ): void;
  }
} 