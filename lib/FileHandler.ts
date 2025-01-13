import FitParser from 'fit-file-parser';
import { mean } from 'd3-array';
import * as d3 from 'd3-array';
interface RawFitData {
    records: any[];
    sessions?: any[];
    laps?: any[];
    device_info?: any[];
  }
  
  interface ProcessedRecord {
    timestamp: Date;
    seconds: number;
    power: number;
    heartRate: number;
    cadence?: number;
    speed?: number;
    distance?: number;
    temperature?: number;
    altitude?: number;
    position?: {
      latitude: number;
      longitude: number;
    };
  }
  
class FitFileHandler {
    private parser: any;
    private config: {
      minPower: number;
      maxPower: number;
      minHr: number;
      maxHr: number;
      maxGap: number;  // maximum seconds between records
    };
  
    constructor() {
      this.parser = new FitParser({
        force: true,
        speedUnit: 'km/h',
        lengthUnit: 'm',
        temperatureUnit: 'celsius',
        elapsedRecordField: true,
        mode: 'list'
      });
  
      this.config = {
        minPower: 0,
        maxPower: 3000,  // Reasonable maximum power output
        minHr: 30,
        maxHr: 250,
        maxGap: 5        // Maximum 5 seconds between records
      };
    }
  
    async parseFitFile(file: File): Promise<{
      processedData: ProcessedRecord[];
      metadata: any;
      errors: string[];
    }> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const errors: string[] = [];
  
        reader.onload = async (e) => {
          try {
            const buffer = e.target?.result;
            if (!buffer) {
              reject(new Error('Failed to read file'));
              return;
            }
  
            this.parser.parse(buffer, (error: Error, fitData: RawFitData) => {
              if (error) {
                reject(error);
                return;
              }
  
              try {
                const { processedData, metadata, processingErrors } = this.processRawFitData(fitData);
                errors.push(...processingErrors);
  
                // Validate the processed data
                const validationErrors = this.validateProcessedData(processedData);
                errors.push(...validationErrors);
  
                // Apply corrections and filtering
                const cleanedData = this.cleanAndFilterData(processedData);
                
                resolve({
                  processedData: cleanedData,
                  metadata,
                  errors
                });
              } catch (processingError) {
                reject(processingError);
              }
            });
          } catch (error) {
            reject(error);
          }
        };
  
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });
    }
  
    private processRawFitData(fitData: RawFitData): {
      processedData: ProcessedRecord[];
      metadata: any;
      processingErrors: string[];
    } {
      const errors: string[] = [];
      const records = fitData.records || [];
  
      if (records.length === 0) {
        errors.push('No records found in FIT file');
      }
  
      // Process records
      const processedData = records
        .filter(record => 
          record.power !== undefined && 
          record.heart_rate !== undefined &&
          record.timestamp !== undefined
        )
        .map((record, index) => {
          const processed: ProcessedRecord = {
            timestamp: new Date(record.timestamp),
            seconds: 0,  // Will be calculated below
            power: record.power,
            heartRate: record.heart_rate,
            cadence: record.cadence,
            speed: record.speed,
            distance: record.distance,
            temperature: record.temperature,
            altitude: record.altitude,
            position: record.position_lat && record.position_long ? {
              latitude: record.position_lat,
              longitude: record.position_long
            } : undefined
          };
  
          return processed;
        });
  
      // Calculate proper seconds from start
      if (processedData.length > 0) {
        const startTime = processedData[0].timestamp.getTime();
        processedData.forEach(point => {
          point.seconds = (point.timestamp.getTime() - startTime) / 1000;
        });
      }
  
      // Extract metadata
      const metadata = {
        startTime: processedData[0]?.timestamp,
        totalDistance: processedData[processedData.length - 1]?.distance,
        duration: processedData[processedData.length - 1]?.seconds,
        device: fitData.device_info?.[0],
        totalSamples: processedData.length,
        samplingRate: this.calculateSamplingRate(processedData)
      };
  
      return {
        processedData,
        metadata,
        processingErrors: errors
      };
    }
  
    private validateProcessedData(data: ProcessedRecord[]): string[] {
      const errors: string[] = [];
  
      // Check for invalid values
      data.forEach((record, index) => {
        if (record.power < this.config.minPower || record.power > this.config.maxPower) {
          errors.push(`Invalid power value at index ${index}: ${record.power}W`);
        }
        if (record.heartRate < this.config.minHr || record.heartRate > this.config.maxHr) {
          errors.push(`Invalid heart rate value at index ${index}: ${record.heartRate}bpm`);
        }
      });
  
      // Check for gaps in data
      for (let i = 1; i < data.length; i++) {
        const timeDiff = data[i].seconds - data[i-1].seconds;
        if (timeDiff > this.config.maxGap) {
          errors.push(`Large time gap detected at index ${i}: ${timeDiff}s`);
        }
      }
  
      // Check for abnormal patterns
      const powerJumps = this.detectAbnormalJumps(data.map(d => d.power), 100);  // 100W jump threshold
      const hrJumps = this.detectAbnormalJumps(data.map(d => d.heartRate), 20);  // 20bpm jump threshold
  
      powerJumps.forEach(index => {
        errors.push(`Suspicious power jump at index ${index}`);
      });
  
      hrJumps.forEach(index => {
        errors.push(`Suspicious heart rate jump at index ${index}`);
      });
  
      return errors;
    }
  
    private cleanAndFilterData(data: ProcessedRecord[]): ProcessedRecord[] {
      // Remove obvious outliers
      let cleanedData = data.filter(record => 
        record.power >= this.config.minPower &&
        record.power <= this.config.maxPower &&
        record.heartRate >= this.config.minHr &&
        record.heartRate <= this.config.maxHr
      );
  
      // Interpolate small gaps
      cleanedData = this.interpolateGaps(cleanedData);
  
      // Apply smoothing
      cleanedData = this.smoothData(cleanedData);
  
      return cleanedData;
    }
  
    private interpolateGaps(data: ProcessedRecord[]): ProcessedRecord[] {
      const interpolated: ProcessedRecord[] = [];
      
      for (let i = 0; i < data.length - 1; i++) {
        interpolated.push(data[i]);
        
        const timeDiff = data[i + 1].seconds - data[i].seconds;
        if (timeDiff > 1 && timeDiff <= this.config.maxGap) {
          // Create interpolated points
          const steps = Math.floor(timeDiff);
          for (let j = 1; j < steps; j++) {
            const fraction = j / steps;
            interpolated.push({
              timestamp: new Date(data[i].timestamp.getTime() + j * 1000),
              seconds: data[i].seconds + j,
              power: this.lerp(data[i].power, data[i + 1].power, fraction),
              heartRate: this.lerp(data[i].heartRate, data[i + 1].heartRate, fraction),
              cadence: data[i].cadence ? this.lerp(data[i].cadence, data[i + 1].cadence || 0, fraction) : undefined,
              speed: data[i].speed ? this.lerp(data[i].speed, data[i + 1].speed || 0, fraction) : undefined
            });
          }
        }
      }
      interpolated.push(data[data.length - 1]);
      
      return interpolated;
    }
  
    private lerp(start: number, end: number, fraction: number): number {
      return start + (end - start) * fraction;
    }
  
    private smoothData(data: ProcessedRecord[]): ProcessedRecord[] {
      const windowSize = 5;  // 5-second moving average
      
      return data.map((record, index) => {
        const window = data.slice(
          Math.max(0, index - windowSize),
          Math.min(data.length, index + windowSize + 1)
        );
        
        return {
          ...record,
          power: d3.mean(window, d => d.power) || record.power,
          heartRate: d3.mean(window, d => d.heartRate) || record.heartRate
        };
      });
    }
  
    private detectAbnormalJumps(values: number[], threshold: number): number[] {
      const suspicious: number[] = [];
      
      for (let i = 1; i < values.length - 1; i++) {
        const prevDiff = Math.abs(values[i] - values[i-1]);
        const nextDiff = Math.abs(values[i+1] - values[i]);
        
        if (prevDiff > threshold && nextDiff > threshold) {
          suspicious.push(i);
        }
      }
      
      return suspicious;
    }
  
    private calculateSamplingRate(data: ProcessedRecord[]): number {
      if (data.length < 2) return 0;
      
      const timeDiffs: number[] = [];
      for (let i = 1; i < data.length; i++) {
        timeDiffs.push(data[i].seconds - data[i-1].seconds);
      }
      
      const mean = d3.mean(timeDiffs);
      return 1 / (mean || 1);  // Hz
    }
  }
  export default FitFileHandler