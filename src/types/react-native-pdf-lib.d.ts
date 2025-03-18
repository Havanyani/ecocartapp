declare module 'react-native-pdf-lib' {
  export function rgb(r: number, g: number, b: number): any;

  export class PDFDocument {
    static create(): PDFDocument;
    drawText(text: string, options: {
      x: number;
      y: number;
      color: any;
      fontSize: number;
    }): void;
    drawImage(uri: string, options: {
      x: number;
      y: number;
      width: number;
      height: number;
    }): void;
    write(path: string): Promise<void>;
  }
} 