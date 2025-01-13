declare module 'fit-file-parser' {
    interface FitParserOptions {
      force?: boolean;
      speedUnit?: string;
      lengthUnit?: string;
      temperatureUnit?: string;
      elapsedRecordField?: boolean;
      mode?: string;
    }
  
    interface FitData {
      records: FitRecord[];
    }
  
    interface FitRecord {
      power?: number;
      [key: string]: any;
    }
  
    class FitParser {
      constructor(options?: FitParserOptions);
      parse(file: ArrayBuffer, callback: (error: Error | null, data: FitData) => void): void;
    }
  
    export default FitParser;
  }