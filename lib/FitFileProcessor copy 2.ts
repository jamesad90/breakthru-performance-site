import FitParser from 'fit-file-parser';
import * as d3 from 'd3-array';
interface PowerHRRelationship {
  slope: number;
  intercept: number;
  r2: number;
  powerRange: [number, number];
  hrRange: [number, number];
  confidenceBands: {
    upper: number;
    lower: number;
  };
}

// class PhysiologicalAnalyzer {
//   config = {
//     minWindowSize: 180,  // 3 minutes
//     maxHRDeviation: 0.15,  // Maximum 15% deviation from expected HR
//     minR2Threshold: 0.8,   // Strong correlation requirement
//     maxSlopeChange: 0.2,   // Maximum 20% change in HR/power slope
//     confidenceInterval: 0.95
//   };
interface PhysiologicalWindow {
  startTime: number;
  endTime: number;
  state: string;
  confidence: number;
  powerMean: number;
  hrMean: number;
  points: DataPoint[];
  transition?: StateTransition;
}

interface StateTransition {
  time: number;
  fromState: string;
  toState: string;
  confidence: number;
}

interface DataPoint {
  timestamp: Date;
  seconds: number;
  power: number;
  heartRate: number;
  cadence?: number;
  speed?: number;
  distance?: number;
  temperature?: number;
  }
  
  interface WindowStats {
  powerMean: number;
  hrMean: number;
  powerStd: number;
  hrStd: number;
  }
class FitFileHandler {
parser:any;
config:any;
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
      minWindowSize: 60,  // 3 minutes
      maxHrVariability: 5.0,
      maxPowerVariability: 20.0,
      minR2Threshold: 0.7,
      lactatePowerThreshold: 260,
      cvDriftThreshold: 0.1,
      confidenceLevel: 0.95,
      maxHRDeviation: 0.15, 
      maxSlopeChange: 0.2,
    };
  }

  async parseFitFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          
          this.parser.parse(buffer, (error, data) => {
            if (error) {
              reject(error);
            } else {
              // Extract records and process them
              const processedData = this.processRecords(data);
              resolve(processedData);
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

  processRecords(fitData) {
    // Extract records from FIT data
    const records = fitData.records || [];
    
    // Convert records to our format
    const dataPoints = records
      .filter(record => 
        record.power !== undefined && 
        record.heart_rate !== undefined
      )
      .map((record, index) => ({
        timestamp: record.timestamp,
        seconds: index, // We'll update this below
        power: record.power,
        heartRate: record.heart_rate,
        cadence: record.cadence,
        speed: record.speed,
        distance: record.distance,
        temperature: record.temperature
      }));

    // Calculate proper seconds from start
    if (dataPoints.length > 0) {
      const startTime = new Date(dataPoints[0].timestamp).getTime();
      dataPoints.forEach(point => {
        point.seconds = (new Date(point.timestamp).getTime() - startTime) / 1000;
      });
    }

    // Apply smoothing to power and heart rate
    const smoothedData = this.smoothData(dataPoints);
    
    // Find physiological windows
    const windows = this.findPhysiologicalWindows(smoothedData);
    
    // Perform additional analysis
    const analysis = this.performAnalysis(smoothedData, windows);

    return {
      dataPoints: smoothedData,
      windows,
      analysis,
      metadata: {
        startTime: dataPoints[0]?.timestamp,
        totalDistance: dataPoints[dataPoints.length - 1]?.distance,
        duration: dataPoints[dataPoints.length - 1]?.seconds,
        device: fitData.device_info?.[0]
      }
    };
  }
  performAnalysis(dataPoints, windows) {
    // Calculate rolling statistics
    const rollingStats = this.calculateRollingStatistics(dataPoints);
    
    // Detect state transitions
    const transitions = this.detectTransitions(dataPoints, windows);
    
    // Calculate advanced metrics
    return {
      normalizedPower: this.calculateNormalizedPower(dataPoints.map(d => d.power)),
      variabilityIndex: this.calculateVariabilityIndex(dataPoints),
      stateTransitions: transitions,
      rollingStatistics: rollingStats
    };
  }
  calculateRollingStatistics(dataPoints, windowSize = 10) {
    const result = [];
    for (let i = windowSize; i < dataPoints.length; i++) {
      const window = dataPoints.slice(i - windowSize, i);
      const powerMean = d3.mean(window, d => d.power);
      const hrMean = d3.mean(window, d => d.heartRate);
      const powerStd = d3.deviation(window, d => d.power);
      const hrStd = d3.deviation(window, d => d.heartRate);
      
      result.push({
        time: dataPoints[i].seconds,
        powerMean,
        hrMean,
        powerStd,
        hrStd,
        correlation: this.calculateCorrelation(
          window.map(d => d.power),
          window.map(d => d.heartRate)
        )
      });
    }
    return result;
  }
  detectTransitions(dataPoints: DataPoint[], windows: PhysiologicalWindow[]): StateTransition[] {
    const transitions: StateTransition[] = [];
    const windowSize = 30; // 30 seconds window
    
    for (let i = 1; i < windows.length; i++) {
      const prevWindow = windows[i - 1];
      const currWindow = windows[i];
      
      if (prevWindow.state !== currWindow.state) {
        const transitionPoint = this.findExactTransitionPoint(
          dataPoints,
          prevWindow.endTime,
          currWindow.startTime
        );
        
        // Get data points before and after transition
        const beforeTransition = dataPoints.filter(
          d => d.seconds >= transitionPoint - windowSize && 
               d.seconds < transitionPoint
        );
        const afterTransition = dataPoints.filter(
          d => d.seconds >= transitionPoint && 
               d.seconds < transitionPoint + windowSize
        );
        
        const confidence = this.calculateTransitionConfidence(
          beforeTransition,
          afterTransition
        );
        
        transitions.push({
          time: transitionPoint,
          fromState: prevWindow.state,
          toState: currWindow.state,
          confidence
        });
      }
    }
    
    return transitions;
}
  findExactTransitionPoint(dataPoints, start, end) {
    const relevantPoints = dataPoints.filter(
      d => d.seconds >= start && d.seconds <= end
    );
    
    // Use change point detection
    let minCost = Infinity;
    let bestPoint = start;
    
    for (let i = 1; i < relevantPoints.length; i++) {
      const left = relevantPoints.slice(0, i);
      const right = relevantPoints.slice(i);
      
      const leftVar = d3.variance(left, d => d.power);
      const rightVar = d3.variance(right, d => d.power);
      const cost = (leftVar * left.length + rightVar * right.length) / relevantPoints.length;
      
      if (cost < minCost) {
        minCost = cost;
        bestPoint = relevantPoints[i].seconds;
      }
    }
    
    return bestPoint;
  }


  smoothData(dataPoints, windowSize = 30) {
    return dataPoints.map((point, index) => {
      const window = dataPoints.slice(
        Math.max(0, index - windowSize),
        Math.min(dataPoints.length, index + windowSize + 1)
      );
      
      return {
        ...point,
        power: d3.mean(window, d => d.power),
        heartRate: d3.mean(window, d => d.heartRate)
      };
    });
  }

  findPhysiologicalWindows(dataPoints) {
    const windows = [];
    let currentWindow = null;
    
    for (let i = 0; i < dataPoints.length - this.config.minWindowSize; i++) {
      const windowData = dataPoints.slice(i, i + this.config.minWindowSize);
      const state = this.determinePhysiologicalState(windowData);
      
      if (!currentWindow || currentWindow.state !== state.type) {
        if (currentWindow) {
          // Calculate transition metrics
          const transition = this.calculateTransition(
            dataPoints,
            currentWindow,
            state,
            i
          );
          currentWindow.transition = transition;
          windows.push(currentWindow);
        }
        
        currentWindow = {
          startTime: windowData[0].seconds,
          endTime: windowData[windowData.length - 1].seconds,
          state: state.type,
          confidence: state.confidence,
          powerMean: d3.mean(windowData, d => d.power),
          hrMean: d3.mean(windowData, d => d.heartRate),
          points: windowData
        };
      } else {
        currentWindow.endTime = windowData[windowData.length - 1].seconds;
        currentWindow.points = windowData;
      }
    }

    if (currentWindow) {
      windows.push(currentWindow);
    }

    return this.mergeAdjacentWindows(windows);
  }




  determinePhysiologicalState(windowData: DataPoint[]) {
    const relationship = this.analyzePowerHRRelationship(windowData);
    
    if (this.isStableRelationship(relationship, windowData)) {
      return {
        type: 'stable',
        confidence: relationship.r2,
        parameters: relationship
      };
    }

    // Check if HR response is higher than expected
    if (this.isAboveLactateThreshold(relationship, windowData)) {
      return {
        type: 'lactate_threshold',
        confidence: this.calculateLactateThresholdConfidence(relationship, windowData),
        parameters: relationship
      };
    }

    // Check for cardiovascular drift
    if (this.isCardiovascularDrift(relationship, windowData)) {
      return {
        type: 'cv_drift',
        confidence: this.calculateDriftConfidence(relationship, windowData),
        parameters: relationship
      };
    }

    return {
      type: 'unknown',
      confidence: 0,
      parameters: relationship
    };
  }

  analyzePowerHRRelationship(data: DataPoint[]): PowerHRRelationship {
    const power = data.map(d => d.power);
    const hr = data.map(d => d.heartRate);

    // Calculate linear regression
    const n = power.length;
    const sumX = d3.sum(power);
    const sumY = d3.sum(hr);
    const sumXY = d3.sum(power.map((p, i) => p * hr[i]));
    const sumX2 = d3.sum(power.map(p => p * p));

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = d3.mean(hr);
    const predictedY = power.map(p => slope * p + intercept);
    const ssRes = d3.sum(hr.map((h, i) => Math.pow(h - predictedY[i], 2)));
    const ssTot = d3.sum(hr.map(h => Math.pow(h - yMean, 2)));
    const r2 = 1 - (ssRes / ssTot);

    // Calculate confidence bands
    const standardError = Math.sqrt(ssRes / (n - 2));
    const confidenceBands = {
      upper: standardError * 1.96, // 95% confidence interval
      lower: -standardError * 1.96
    };

    return {
      slope,
      intercept,
      r2,
      powerRange: [d3.min(power), d3.max(power)],
      hrRange: [d3.min(hr), d3.max(hr)],
      confidenceBands
    };
  }

  isStableRelationship(relationship: PowerHRRelationship, data: DataPoint[]): boolean {
    // Check if relationship is strong and consistent
    if (relationship.r2 < this.config.minR2Threshold) {
      return false;
    }

    // Check if HR responses stay within expected bounds
    const expectedHR = data.map(d => 
      relationship.slope * d.power + relationship.intercept
    );

    const deviations = data.map((d, i) => 
      Math.abs(d.heartRate - expectedHR[i]) / expectedHR[i]
    );

    // Check if deviations are within acceptable range
    return d3.max(deviations) < this.config.maxHRDeviation;
  }

  isAboveLactateThreshold(relationship: PowerHRRelationship, data: DataPoint[]): boolean {
    // Calculate rolling HR response to power changes
    const windowSize = 30; // 30-second windows
    let isAboveThreshold = false;

    for (let i = windowSize; i < data.length; i++) {
      const window = data.slice(i - windowSize, i);
      const windowRelationship = this.analyzePowerHRRelationship(window);

      // Check if HR response is accelerating compared to baseline
      if (windowRelationship.slope > relationship.slope * (1 + this.config.maxSlopeChange)) {
        isAboveThreshold = true;
        break;
      }
    }

    return isAboveThreshold;
  }

  isCardiovascularDrift(relationship: PowerHRRelationship, data: DataPoint[]): boolean {
    const timeSegments = 4; // Divide data into quarters
    const segmentSize = Math.floor(data.length / timeSegments);
    
    // Compare HR response in first and last quarters
    const firstSegment = data.slice(0, segmentSize);
    const lastSegment = data.slice(-segmentSize);

    const firstRelationship = this.analyzePowerHRRelationship(firstSegment);
    const lastRelationship = this.analyzePowerHRRelationship(lastSegment);

    // Check if HR response has drifted upward while power remains similar
    const powerDiff = Math.abs(
      d3.mean(lastSegment.map(d => d.power)) - 
      d3.mean(firstSegment.map(d => d.power))
    );

    const hrDiff = 
      d3.mean(lastSegment.map(d => d.heartRate)) - 
      d3.mean(firstSegment.map(d => d.heartRate));

    return powerDiff < 10 && hrDiff > 5; // Less than 10W power change but >5bpm HR increase
  }

  calculateLactateThresholdConfidence(relationship: PowerHRRelationship, data: DataPoint[]): number {
    // Calculate confidence based on how much HR response deviates from stable relationship
    const expectedHR = data.map(d => 
      relationship.slope * d.power + relationship.intercept
    );

    const deviations = data.map((d, i) => 
      (d.heartRate - expectedHR[i]) / expectedHR[i]
    );

    // Higher confidence with more consistent deviation above expected
    return Math.min(1, d3.mean(deviations) / this.config.maxHRDeviation);
  }

  calculateDriftConfidence(relationship: PowerHRRelationship, data: DataPoint[]): number {
    // Calculate confidence based on consistency of drift
    const timeSegments = 4;
    const segmentSize = Math.floor(data.length / timeSegments);
    
    const segments = Array.from({ length: timeSegments }, (_, i) => 
      data.slice(i * segmentSize, (i + 1) * segmentSize)
    );

    const segmentMeans = segments.map(segment => ({
      power: d3.mean(segment.map(d => d.power)),
      hr: d3.mean(segment.map(d => d.heartRate))
    }));

    // Check if HR trend is consistently increasing while power remains stable
    const powerStability = 1 - Math.abs(
      d3.deviation(segmentMeans.map(s => s.power)) / 
      d3.mean(segmentMeans.map(s => s.power))
    );

    const hrTrend = (segmentMeans[segmentMeans.length - 1].hr - segmentMeans[0].hr) /
                    segmentMeans[0].hr;

    return Math.min(1, powerStability * hrTrend * 5); // Scale factor of 5 for reasonable confidence values
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
    
    return (hrTrend > this.config.cvDriftThreshold && powerTrend <= 0);
  }


  calculateCorrelation(x, y) {
    const n = x.length;
    const meanX = d3.mean(x);
    const meanY = d3.mean(y);
    const sumXY = d3.sum(x.map((xi, i) => (xi - meanX) * (y[i] - meanY)));
    const sumX2 = d3.sum(x.map(xi => (xi - meanX) ** 2));
    const sumY2 = d3.sum(y.map(yi => (yi - meanY) ** 2));
    
    return sumXY / Math.sqrt(sumX2 * sumY2);
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

  // Add missing calculateWindowStats method
  calculateWindowStats(points: DataPoint[]): WindowStats {
    return {
      powerMean: d3.mean(points, d => d.power) || 0,
      hrMean: d3.mean(points, d => d.heartRate) || 0,
      powerStd: d3.deviation(points, d => d.power) || 0,
      hrStd: d3.deviation(points, d => d.heartRate) || 0
    };
  }

  // Fix calculateTransitionConfidence signature and implementation
  calculateTransitionConfidence(before: DataPoint[], after: DataPoint[]): number {
    const beforeStats = this.calculateWindowStats(before);
    const afterStats = this.calculateWindowStats(after);
    
    const powerDiff = Math.abs(afterStats.powerMean - beforeStats.powerMean);
    const hrDiff = Math.abs(afterStats.hrMean - beforeStats.hrMean);
    
    return Math.min(1, (powerDiff / beforeStats.powerMean + hrDiff / beforeStats.hrMean) / 2);
  }

  // Add missing calculateVariabilityIndex method
  calculateVariabilityIndex(dataPoints: DataPoint[]) {
    return {
      power: d3.deviation(dataPoints, d => d.power) / d3.mean(dataPoints, d => d.power),
      hr: d3.deviation(dataPoints, d => d.heartRate) / d3.mean(dataPoints, d => d.heartRate)
    };
  }

  // Add missing calculateNormalizedPower method
  calculateNormalizedPower(power: number[]): number {
    const thirtySecondPower = this.movingAverage(power, 30);
    const fourthPower = thirtySecondPower.map(p => Math.pow(p, 4));
    return Math.pow(d3.mean(fourthPower) || 0, 0.25);
  }

  // Add missing movingAverage method
  movingAverage(arr: number[], window: number): number[] {
    const result = [];
    for (let i = window; i < arr.length; i++) {
      const windowSlice = arr.slice(i - window, i);
      result.push(d3.mean(windowSlice) || 0);
    }
    return result;
  }

  // Fix calculateTransition to use correct parameters
  calculateTransition(
    dataPoints: DataPoint[],
    prevWindow: PhysiologicalWindow,
    nextState: { type: string },
    transitionIndex: number
  ): StateTransition {
    const windowSize = 30;
    const before = dataPoints.slice(
      Math.max(0, transitionIndex - windowSize),
      transitionIndex
    );
    const after = dataPoints.slice(
      transitionIndex,
      Math.min(dataPoints.length, transitionIndex + windowSize)
    );
    
    const confidence = this.calculateTransitionConfidence(before, after);
    
    return {
      time: dataPoints[transitionIndex].seconds,
      fromState: prevWindow.state,
      toState: nextState.type,
      confidence
    };
  }

  mergeAdjacentWindows(windows) {
    return windows.reduce((merged, current) => {
      const last = merged[merged.length - 1];
      
      if (last && last.state === current.state && 
          current.startTime - last.endTime < 30) { // 30 seconds threshold
        last.endTime = current.endTime;
        last.points = [...last.points, ...current.points];
        last.confidence = (last.confidence + current.confidence) / 2;
      } else {
        merged.push(current);
      }
      
      return merged;
    }, []);
  }
}

export default FitFileHandler;


