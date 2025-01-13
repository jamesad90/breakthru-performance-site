import FitParser from 'fit-file-parser';


class FitProcessor {
  parser: any;
  constructor() {
    this.parser = new FitParser({
      force: true,
      speedUnit: 'km/h',
      lengthUnit: 'm',
      temperatureUnit: 'celsius',
      elapsedRecordField: true,
      mode: 'list'
    });
  }

  async processFile(fileBuffer: any) {
    try {
      const parsed = await new Promise((resolve, reject) => {
        this.parser.parse(fileBuffer, (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });

      // Extract records from the parsed data
      const records = parsed.records;
      
      // Extract relevant data points
      const dataPoints = records
        .filter(record => record.power !== undefined && record.heart_rate !== undefined)
        .map(record => ({
          timestamp: record.timestamp,
          power: record.power,
          heartRate: record.heart_rate,
          cadence: record.cadence,
          distance: record.distance,
          seconds: (new Date(record.timestamp).getTime() - new Date(records[0].timestamp).getTime()) / 1000
        }));

      // Process windows using our physiological analyzer
      const windows = this.analyzePhysiologicalStates(dataPoints);

      return {
        dataPoints,
        windows,
        summary: this.generateSummary(dataPoints, windows)
      };
    } catch (error) {
      console.error('Error processing FIT file:', error);
      throw error;
    }
  }
  analyzePhysiologicalStates(dataPoints: any) {
    const windows = [];
    const minWindowSize = 180; // 3 minutes in seconds
    let currentWindow = null;

    for (let i = 0; i < dataPoints.length; i++) {
      const point = dataPoints[i];
      const windowData = dataPoints.slice(
        Math.max(0, i - minWindowSize),
        i + 1
      );

      const state = this.determinePhysiologicalState(windowData);
      
      if (!currentWindow || currentWindow.state !== state.type) {
        if (currentWindow) {
          windows.push(currentWindow);
        }
        currentWindow = {
          startTime: point.seconds,
          state: state.type,
          confidence: state.confidence,
          powerMean: 0,
          hrMean: 0,
          points: []
        };
      }

      currentWindow.points.push(point);
      currentWindow.endTime = point.seconds;
    }

    if (currentWindow) {
      windows.push(currentWindow);
    }

    return this.calculateWindowStatistics(windows);
  }

  determinePhysiologicalState(windowData) {
    if (windowData.length < 30) return { type: 'unknown', confidence: 0 };

    const power = windowData.map(d => d.power);
    const hr = windowData.map(d => d.heartRate);

    // Calculate statistics
    const powerMean = this.mean(power);
    const hrMean = this.mean(hr);
    const powerStd = this.standardDeviation(power);
    const hrStd = this.standardDeviation(hr);
    const correlation = this.correlation(power, hr);

    // State detection logic
    if (powerStd < 20 && hrStd < 5 && correlation > 0.7) {
      return { type: 'stable', confidence: correlation };
    }
    
    if (powerMean > 260 && correlation > 0.6) {
      return { type: 'lactate_threshold', confidence: correlation };
    }

    if (this.detectCVDrift(windowData)) {
      return { type: 'cv_drift', confidence: 0.8 };
    }

    return { type: 'unknown', confidence: 0 };
  }

  // Statistical helper methods
  mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  standardDeviation(arr) {
    const mean = this.mean(arr);
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  correlation(x, y) {
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    const numerator = x.reduce((acc, xi, i) => 
      acc + (xi - meanX) * (y[i] - meanY), 0);
    const denominatorX = Math.sqrt(x.reduce((acc, xi) => 
      acc + Math.pow(xi - meanX, 2), 0));
    const denominatorY = Math.sqrt(y.reduce((acc, yi) => 
      acc + Math.pow(yi - meanY, 2), 0));
    return numerator / (denominatorX * denominatorY);
  }

  detectCVDrift(windowData) {
    const hrTrend = this.calculateTrend(
      windowData.map(d => d.seconds),
      windowData.map(d => d.heartRate)
    );
    const powerTrend = this.calculateTrend(
      windowData.map(d => d.seconds),
      windowData.map(d => d.power)
    );
    return hrTrend > 0.1 && powerTrend <= 0;
  }

  calculateTrend(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  calculateWindowStatistics(windows) {
    return windows.map(window => ({
      ...window,
      powerMean: this.mean(window.points.map(p => p.power)),
      hrMean: this.mean(window.points.map(p => p.heartRate)),
      duration: window.endTime - window.startTime
    }));
  }

  generateSummary(dataPoints, windows) {
    return {
      totalDuration: dataPoints[dataPoints.length - 1].seconds,
      normalizedPower: this.calculateNormalizedPower(dataPoints.map(d => d.power)),
      stateDistribution: windows.reduce((acc, window) => ({
        ...acc,
        [window.state]: (acc[window.state] || 0) + window.duration
      }), {})
    };
  }

  calculateNormalizedPower(power) {
    const thirtySecondPower = this.movingAverage(power, 30);
    const fourthPower = thirtySecondPower.map(p => Math.pow(p, 4));
    return Math.pow(this.mean(fourthPower), 0.25);
  }

  movingAverage(arr, window) {
    const result = [];
    for (let i = window; i < arr.length; i++) {
      const windowSlice = arr.slice(i - window, i);
      result.push(this.mean(windowSlice));
    }
    return result;
  }
}

export default FitProcessor;