import * as d3 from 'd3-array';
import * as regression from 'regression';

interface PowerHRRelationship {
  slope: number;
  intercept: number;
  r2: number;
  powerRange: [number, number];
  hrRange: [number, number];
  confidenceBands: {
    upper: number[];
    lower: number[];
    prediction: number[];
  };
  decoupling: number;
  efficiency: number;
  aerobicFitness: {
    score: number;
    confidence: number;
  };
}
interface WindowStats {
  powerMean: number;
  hrMean: number;
  powerStd: number;
  hrStd: number;
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

interface StableWindow extends PowerHRRelationship {
  startTime: number;
  endTime: number;
  powerStability: number;
  hrStability: number;
  responseTime: number;
  qualityMetrics: {
    stabilityScore: number;
    couplingScore: number;
    consistencyScore: number;
  };
  points: DataPoint[];
}

class PhysiologicalAnalyzer {
  private windowStats: Map<string, WindowStats> = new Map();
  private powerRange: [number, number] = [0, 0];
  private hrRange: [number, number] = [0, 0];
  private config = {
    minWindowSize: 60,  // 3 minutes minimum
    maxHRDeviation: 0.15,
    minR2Threshold: 0.8,
    maxSlopeChange: 0.2,
    confidenceLevel: 0.95,
    minStableTime: 30,
    maxResponseLag: 15,
    minEfficiencyScore: 0.7,
    minGapBetweenChanges: 10, // seconds
    powerChangeThreshold: 15, // Watts
    smoothingWindowSize: 5,   // seconds
    aerobicThreshold: {
      minPower: 100,
      maxHRDeviation: 0.1
    }
  };

  async findStableWindows(data: DataPoint[]): Promise<StableWindow[]> {
    const windows: StableWindow[] = [];
    let currentWindow: StableWindow | null = null;
    
    // Smooth the data first
    const smoothedData = this.smoothData(data);

    for (let i = 0; i < smoothedData.length - this.config.minWindowSize; i++) {
      const windowData = smoothedData.slice(i, i + this.config.minWindowSize);
      const relationship = await this.analyzePowerHRRelationship(windowData);
     
      if (await this.isStableRelationship(relationship, windowData)) {
        if (!currentWindow) {
          console.log("Initializing window part2", currentWindow);
          currentWindow = await this.initializeStableWindow(windowData, relationship);
        } else {
          console.log("Initializing window part2", currentWindow);
          if (this.isConsistentWithPrevious(currentWindow, relationship)) {
            currentWindow = await this.extendStableWindow(currentWindow, windowData);
          } else {
            console.log("Initializing window part2", currentWindow);
            windows.push(currentWindow);
            currentWindow = await this.initializeStableWindow(windowData, relationship);
          }
        }
      } else if (currentWindow) {
        windows.push(currentWindow);
        currentWindow = null;
      }
    }

    if (currentWindow) {
      windows.push(currentWindow);
    }

    return this.filterAndRefineWindows(windows);
  }

  private smoothData(data: DataPoint[]): DataPoint[] {
    const smoothed: DataPoint[] = [];
    const windowSize = this.config.smoothingWindowSize;

    for (let i = 0; i < data.length; i++) {
      const windowStart = Math.max(0, i - windowSize);
      const windowEnd = Math.min(data.length, i + windowSize + 1);
      const window = data.slice(windowStart, windowEnd);

      smoothed.push({
        ...data[i],
        power: d3.mean(window, d => d.power) || data[i].power,
        heartRate: d3.mean(window, d => d.heartRate) || data[i].heartRate
      });
    }

    return smoothed;
  }

  private async analyzePowerHRRelationship(data: DataPoint[]): Promise<PowerHRRelationship> {
    // Prepare data for regression
    const points = data.map(d => [d.power, d.heartRate]);
    const result = regression.linear(points);
    
    const [slope, intercept] = result.equation;
    const powerRange: [number, number] = [
      d3.min(data, d => d.power) || 0,
      d3.max(data, d => d.power) || 0
    ];
    const hrRange: [number, number] = [
      d3.min(data, d => d.heartRate) || 0,
      d3.max(data, d => d.heartRate) || 0
    ];

    // Calculate confidence bands
    const confidenceBands = this.calculateConfidenceBands(data, slope, intercept);
    
    // Calculate decoupling and efficiency
    const decoupling = this.calculateDecoupling(data, (x: number) => slope * x + intercept);
    const efficiency = this.calculateCardiacEfficiency(data, slope, intercept);
    
    // Assess aerobic fitness
    const aerobicFitness = this.assessAerobicFitness(data, { slope, intercept }, decoupling);

    return {
      slope,
      intercept,
      r2: result.r2,
      powerRange,
      hrRange,
      confidenceBands,
      decoupling,
      efficiency,
      aerobicFitness
    };
  }

  private calculateConfidenceBands(
    data: DataPoint[],
    slope: number,
    intercept: number
  ): { upper: number[]; lower: number[]; prediction: number[] } {
    const n = data.length;
    const xMean = d3.mean(data, d => d.power) || 0;
    
    // Calculate sum of squared errors
    const predictions = data.map(d => slope * d.power + intercept);
    const residuals = data.map((d, i) => d.heartRate - predictions[i]);
    const SSE = d3.sum(residuals.map(r => r * r));
    const MSE = SSE / (n - 2);
    
    // Calculate standard error
    const xVar = d3.variance(data, d => d.power) || 1;
    const SE = Math.sqrt(MSE / (n * xVar));
    
    // Generate confidence bands
    const t = 1.96; // 95% confidence interval
    const powerValues = Array.from(
      { length: 100 },
      (_, i) => this.powerRange[0] + (i / 99) * (this.powerRange[1] - this.powerRange[0])
    );

    const bands = powerValues.map(x => {
      const predicted = slope * x + intercept;
      const SE_at_x = SE * Math.sqrt(1 + 1/n + Math.pow(x - xMean, 2)/(n * xVar));
      return {
        prediction: predicted,
        upper: predicted + t * SE_at_x,
        lower: predicted - t * SE_at_x
      };
    });

    return {
      prediction: bands.map(b => b.prediction),
      upper: bands.map(b => b.upper),
      lower: bands.map(b => b.lower)
    };
  }

  private calculateCardiacEfficiency(
    data: DataPoint[],
    slope: number,
    intercept: number
  ): number {
    // Calculate the average power-to-HR ratio in stable regions
    const powerHRRatios = data.map(d => d.power / d.heartRate);
    const meanRatio = d3.mean(powerHRRatios) || 0;
    
    // Normalize to 0-1 scale (typical range 0.5-2.5 W/bpm)
    return Math.min(1, Math.max(0, (meanRatio - 0.5) / 2));
  }

  private calculateDecoupling(
    data: DataPoint[],
    regressionLine: (x: number) => number
  ): number {
    const midPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midPoint);
    const secondHalf = data.slice(midPoint);

    // Calculate mean deviation from expected HR for each half
    const getHalfDeviation = (half: DataPoint[]) => {
      const deviations = half.map(d => {
        const expectedHR = regressionLine(d.power);
        return Math.abs(d.heartRate - expectedHR) / expectedHR;
      });
      return d3.mean(deviations) || 0;
    };

    const firstDeviation = getHalfDeviation(firstHalf);
    const secondDeviation = getHalfDeviation(secondHalf);

    return Math.max(0, (secondDeviation - firstDeviation) / firstDeviation);
  }

  private assessAerobicFitness(
    data: DataPoint[],
    regression: { slope: number; intercept: number },
    decoupling: number
  ): { score: number; confidence: number } {
    // Calculate components
    const slopeScore = Math.max(0, 1 - regression.slope / 2);
    const decouplingScore = 1 - decoupling;
    const responseTime = this.calculateResponseTime(data);
    const responseScore = Math.max(0, 1 - responseTime / this.config.maxResponseLag);
    const stabilityScore = this.calculateStabilityScore(data);

    // Weighted combination
    const score = (
      slopeScore * 0.3 +
      decouplingScore * 0.3 +
      responseScore * 0.2 +
      stabilityScore * 0.2
    );

    // Calculate confidence based on data quality
    const confidence = this.calculateAssessmentConfidence(data);

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence
    };
  }

  private calculateStabilityScore(data: DataPoint[]): number {
    const powerStability = 1 - (d3.deviation(data.map(d => d.power)) || 0) / 
      (d3.mean(data.map(d => d.power)) || 1);
    
    const hrStability = 1 - (d3.deviation(data.map(d => d.heartRate)) || 0) / 
      (d3.mean(data.map(d => d.heartRate)) || 1);

    return Math.max(0, Math.min(1, (powerStability + hrStability) / 2));
  }

  private calculateResponseTime(data: DataPoint[]): number {
    const powerChanges = this.detectPowerChanges(data);
    const responses = this.analyzeHRResponses(data, powerChanges);
    return d3.mean(responses.map(r => r.responseTime)) || this.config.maxResponseLag;
  }

   private calculateAssessmentConfidence(data: DataPoint[]): number {
  if (data.length < 2) return 0;

  const dataDuration = data[data.length - 1].seconds - data[0].seconds;
  const powerValues = data.map(d => d.power);
  const minPower = d3.min(powerValues);
  const maxPower = d3.max(powerValues);

  if (minPower === undefined || maxPower === undefined) {
    return 0;
  }

  const rangeCoverage = (maxPower - minPower) / 300; // Normalized to typical range

  return Math.min(1, (
    (Math.min(1, dataDuration / 1800) * 0.4) + // Duration component (30 min max)
    (Math.min(1, rangeCoverage) * 0.3) +       // Power range component
    (this.calculateStabilityScore(data) * 0.3)  // Stability component
  ));
}
private detectPowerChanges(data: DataPoint[]): Array<{ time: number; magnitude: number }> {
  if (data.length < 2) return [];

  const changes: Array<{ time: number; magnitude: number }> = [];
  const smoothedData = this.smoothData(data);
  const smoothedPower = smoothedData.map(d => d.power);

  // Calculate the standard deviation of the smoothed power values
  const powerStdDev = d3.deviation(smoothedPower) || 0;

  // Define the dynamic threshold
  const dynamicThreshold = Math.max(this.config.powerChangeThreshold, 0.5 * powerStdDev *3);

  let lastChangeIndex = -1;

  for (let i = 1; i < smoothedPower.length; i++) {
    const powerChange = smoothedPower[i] - smoothedPower[i - 1];

    // Detect changes using the dynamic threshold
    if (Math.abs(powerChange) > dynamicThreshold) {
      // Group nearby changes into a single event
      if (lastChangeIndex === -1 || i - lastChangeIndex > this.config.minGapBetweenChanges) {
        changes.push({
          time: data[i].seconds,
          magnitude: powerChange,
        });
        lastChangeIndex = i;
      }
    }
  }

  return changes;
}


  // private detectPowerChanges(data: DataPoint[]): Array<{ time: number; magnitude: number }> {
  //   if (data.length < 2) return [];

  //   const changes: Array<{ time: number; magnitude: number }> = [];
  //   const smoothedData = this.smoothData(data);
  //   const smoothedPower = smoothedData.map(d => d.power);
    
  //   for (let i = 1; i < smoothedPower.length; i++) {
  //     const powerChange = smoothedPower[i] - smoothedPower[i - 1];
  //     if (Math.abs(powerChange) > this.config.powerChangeThreshold) {
  //       changes.push({
  //         time: data[i].seconds,
  //         magnitude: powerChange
  //       });
  //     }
  //   }
    
  //   return changes;
  // }

  private analyzeHRResponses(
    data: DataPoint[],
    powerChanges: Array<{ time: number; magnitude: number }>
  ): Array<{ responseTime: number; magnitude: number }> {
    return powerChanges.map(change => {
      // Find the starting index for the power change
      const startIdx = data.findIndex(d => d.seconds >= change.time);
      if (startIdx === -1) {
        return { responseTime: -1, magnitude: 0 }; // No valid data for this change
      }
  
      const endIdx = Math.min(startIdx + 30, data.length); // Look at the next 30 seconds
      const responseWindow = data.slice(startIdx, endIdx);
  
      // Calculate the baseline heart rate (use a short average for stability)
      const baselineHR = d3.mean(
        data.slice(Math.max(0, startIdx - 5), startIdx),
        d => d.heartRate
      ) || data[startIdx].heartRate;
  
      // Determine the peak heart rate in the response window
      const peakHR = d3.max(responseWindow, d => d.heartRate) || baselineHR;
  
      // Relaxed threshold: Allow for less strict peak determination
      const targetHR = baselineHR + 0.5 * (peakHR - baselineHR); // 50% instead of 63%
  
      // Find the first time the heart rate exceeds the relaxed threshold
      const responseTime = responseWindow.findIndex(d => d.heartRate >= targetHR);
  
      return {
        responseTime: responseTime === -1 ? responseWindow.length : responseTime, // Use length if no response found
        magnitude: peakHR - baselineHR
      };
    });
  }
  // private analyzeHRResponses(
  //   data: DataPoint[],
  //   powerChanges: Array<{ time: number; magnitude: number }>
  // ): Array<{ responseTime: number; magnitude: number }> {
  //   return powerChanges.map(change => {
  //     const startIdx = data.findIndex(d => d.seconds >= change.time);
  //     const endIdx = Math.min(startIdx + 30, data.length); // Look at next 30 seconds
  //     const responseWindow = data.slice(startIdx, endIdx);
      
  //     const baselineHR = data[startIdx].heartRate;
  //     const peakHR = d3.max(responseWindow, d => d.heartRate) || baselineHR;
  //     const responseTime = responseWindow.findIndex(d => 
  //       d.heartRate >= baselineHR + 0.63 * (peakHR - baselineHR)
  //     );
      
  //     return {
  //       responseTime: responseTime === -1 ? 30 : responseTime,
  //       magnitude: peakHR - baselineHR
  //     };
  //   });
  // }

  private async initializeStableWindow(
    data: DataPoint[],
    relationship: PowerHRRelationship
  ): Promise<StableWindow> {
    const powerStats = this.calculateWindowStats(data.map(d => d.power));
    const hrStats = this.calculateWindowStats(data.map(d => d.heartRate));
    
    return {
      startTime: data[0].seconds,
      endTime: data[data.length - 1].seconds,
      powerRange: [d3.min(data, d => d.power) || 0, d3.max(data, d => d.power) || 0],
      hrRange: [d3.min(data, d => d.heartRate) || 0, d3.max(data, d => d.heartRate) || 0],
      slope: relationship.slope,
      intercept: relationship.intercept,
      r2: relationship.r2,
      confidenceBands: relationship.confidenceBands,
      decoupling: relationship.decoupling,
      efficiency: relationship.efficiency,
      aerobicFitness: relationship.aerobicFitness,
      powerStability: this.calculatePowerStability(data),
      hrStability: this.calculateHRStability(data),
      responseTime: this.calculateResponseTime(data),
      qualityMetrics: {
        stabilityScore: this.calculateStabilityScore(data),
        couplingScore: this.calculateCouplingScore(data, relationship),
        consistencyScore: await this.calculateConsistencyScore(data, relationship)
      },
      points: data
    };
  }

  private isConsistentWithPrevious(
    currentWindow: StableWindow,
    newRelationship: PowerHRRelationship
  ): boolean {
    const slopeChange = Math.abs((newRelationship.slope - currentWindow.slope) / currentWindow.slope);
    const efficiencyChange = Math.abs(
      (newRelationship.efficiency - currentWindow.efficiency) / currentWindow.efficiency
    );
    
    return (
      slopeChange < this.config.maxSlopeChange &&
      efficiencyChange < 0.15 &&
      newRelationship.r2 >= this.config.minR2Threshold &&
      Math.abs(newRelationship.decoupling - currentWindow.decoupling) < 0.1
    );
  }

  private async extendStableWindow(
    currentWindow: StableWindow,
    newData: DataPoint[]
  ): Promise<StableWindow> {
    const allPoints = [...currentWindow.points, ...newData];
    const combinedRelationship = await this.analyzePowerHRRelationship(allPoints);
    
    return {
      ...currentWindow,
      endTime: newData[newData.length - 1].seconds,
      powerRange: [d3.min(allPoints, d => d.power) || 0, d3.max(allPoints, d => d.power) || 0],
      hrRange: [d3.min(allPoints, d => d.heartRate) || 0, d3.max(allPoints, d => d.heartRate) || 0],
      slope: combinedRelationship.slope,
      intercept: combinedRelationship.intercept,
      r2: combinedRelationship.r2,
      confidenceBands: combinedRelationship.confidenceBands,
      decoupling: combinedRelationship.decoupling,
      efficiency: combinedRelationship.efficiency,
      aerobicFitness: combinedRelationship.aerobicFitness,
      powerStability: this.calculatePowerStability(allPoints),
      hrStability: this.calculateHRStability(allPoints),
      responseTime: this.calculateResponseTime(allPoints),
      qualityMetrics: {
        stabilityScore: this.calculateStabilityScore(allPoints),
        couplingScore: this.calculateCouplingScore(allPoints, combinedRelationship),
        consistencyScore: await this.calculateConsistencyScore(allPoints, combinedRelationship)
      },
      points: allPoints
    };
  }

  private async filterAndRefineWindows(windows: StableWindow[]): Promise<StableWindow[]> {
    // Remove windows that are too short
    let filtered = windows.filter(window => 
      window.endTime - window.startTime >= this.config.minWindowSize
    );
    
    // Merge overlapping windows with similar characteristics
    filtered = await this.mergeOverlappingWindows(filtered);
    
    // Sort by quality score
    filtered.sort((a, b) => this.calculateOverallQuality(b) - this.calculateOverallQuality(a));
    
    return filtered;
  }

  private async mergeOverlappingWindows(windows: StableWindow[]): Promise<StableWindow[]> {
    if (windows.length <= 1) return windows;
    
    const merged: StableWindow[] = [];
    let current = windows[0];
    
    for (let i = 1; i < windows.length; i++) {
      const next = windows[i];
      if (this.shouldMergeWindows(current, next)) {
        current = await this.mergeWindows(current, next);
      } else {
        merged.push(current);
        current = next;
      }
    }
    
    merged.push(current);
    return merged;
  }

  private shouldMergeWindows(w1: StableWindow, w2: StableWindow): boolean {
    const overlap = w1.endTime >= w2.startTime - 5; // 5s gap allowance
    const slopeSimilarity = Math.abs((w1.slope - w2.slope) / w1.slope) < 0.15;
    const efficiencySimilarity = Math.abs((w1.efficiency - w2.efficiency) / w1.efficiency) < 0.15;
    
    return overlap && slopeSimilarity && efficiencySimilarity;
  }

  private async mergeWindows(w1: StableWindow, w2: StableWindow): Promise<StableWindow> {
    const allPoints = [...w1.points, ...w2.points].sort((a, b) => a.seconds - b.seconds);
    const relationship = await this.analyzePowerHRRelationship(allPoints);
    
    return await this.initializeStableWindow(allPoints, relationship);
  }

  private calculateOverallQuality(window: StableWindow): number {
    return (
      window.r2 * 0.25 +
      window.efficiency * 0.2 +
      (1 - window.decoupling) * 0.2 +
      window.qualityMetrics.stabilityScore * 0.15 +
      window.qualityMetrics.couplingScore * 0.1 +
      window.qualityMetrics.consistencyScore * 0.1
    );
  }

  private calculateWindowStats(values: number[]): { mean: number; std: number } {
    return {
      mean: d3.mean(values) || 0,
      std: d3.deviation(values) || 0
    };
  }

  private calculatePowerStability(data: DataPoint[]): number {
    const powerValues = data.map(d => d.power);
    const stats = this.calculateWindowStats(powerValues);
    return Math.max(0, 1 - (stats.std / stats.mean));
  }

  private calculateHRStability(data: DataPoint[]): number {
    const hrValues = data.map(d => d.heartRate);
    const stats = this.calculateWindowStats(hrValues);
    return Math.max(0, 1 - (stats.std / stats.mean));
  }

  private calculateCouplingScore(data: DataPoint[], relationship: PowerHRRelationship): number {
    const predictedHR = data.map(d => relationship.slope * d.power + relationship.intercept);
    const deviations = data.map((d, i) => Math.abs(d.heartRate - predictedHR[i]) / predictedHR[i]);
    return Math.max(0, 1 - (d3.mean(deviations) || 0));
  }

  private async calculateConsistencyScore(data: DataPoint[], relationship: PowerHRRelationship): Promise<number> {
    // Split data into segments and analyze each
    const segments = this.splitIntoSegments(data, 4);
    const segmentRelationships = await Promise.all(segments.map(seg => this.analyzePowerHRRelationship(seg)));
    
    // Calculate variation in key metrics across segments
    const slopeVariation = d3.deviation(segmentRelationships.map(r => r.slope)) || 0;
    const r2Variation = d3.deviation(segmentRelationships.map(r => r.r2)) || 0;
    
    return Math.max(0, 1 - (
      (slopeVariation / relationship.slope) * 0.6 +
      r2Variation * 0.4
    ));
  }

  private splitIntoSegments(data: DataPoint[], numSegments: number): DataPoint[][] {
    const segmentSize = Math.floor(data.length / numSegments);
    return Array.from(
      { length: numSegments },
      (_, i) => data.slice(i * segmentSize, (i + 1) * segmentSize)
    );
  }

  private async isStableRelationship(
    relationship: PowerHRRelationship,
    data: DataPoint[]
  ): Promise<boolean> {
    if (relationship.r2 < this.config.minR2Threshold) return false;
    
    const powerChanges = this.detectPowerChanges(data);
    const hrResponses = this.analyzeHRResponses(data, powerChanges);
    
    // Check response consistency
    const responseConsistency = this.calculateResponseConsistency(hrResponses);
    if (responseConsistency < this.config.minEfficiencyScore) return false;
    
    // Check HR deviations
    const predictedHR = data.map(d => relationship.slope * d.power + relationship.intercept);
    const hrDeviations = data.map((d, i) => 
      Math.abs(d.heartRate - predictedHR[i]) / predictedHR[i]
    );
    if ((d3.max(hrDeviations) || 0) > this.config.maxHRDeviation) return false;
    
    // Check linearity
    const linearityScore = this.assessLinearity(data, relationship);
    if (linearityScore < this.config.minEfficiencyScore) return false;
    
    return true;
  }

  private calculateResponseConsistency(
    responses: Array<{ responseTime: number; magnitude: number }>
  ): number {
    if (responses.length < 2) return 0;
    
    // Calculate consistency of response times and magnitudes
    const timeDeviation = d3.deviation(responses.map(r => r.responseTime)) || 0;
    const magnitudeDeviation = d3.deviation(responses.map(r => r.magnitude)) || 0;
    
    const meanTime = d3.mean(responses.map(r => r.responseTime)) || 1;
    const meanMagnitude = d3.mean(responses.map(r => r.magnitude)) || 1;
    
    const timeConsistency = 1 - (timeDeviation / meanTime);
    const magnitudeConsistency = 1 - (magnitudeDeviation / meanMagnitude);
    
    return Math.max(0, (timeConsistency + magnitudeConsistency) / 2);
  }

  private assessLinearity(data: DataPoint[], relationship: PowerHRRelationship): number {
    const residuals = data.map(d => 
      d.heartRate - (relationship.slope * d.power + relationship.intercept)
    );
    
    // Test for patterns in residuals
    const residualPatterns = this.testResidualPatterns(residuals);
    const nonLinearityScore = this.testNonLinearity(data);
    
    return Math.max(0, 1 - (residualPatterns * 0.6 + nonLinearityScore * 0.4));
  }

  private testResidualPatterns(residuals: number[]): number {
    let runs = 1;
    let positive = residuals[0] >= 0;
    
    for (let i = 1; i < residuals.length; i++) {
      if ((residuals[i] >= 0) !== positive) {
        runs++;
        positive = !positive;
      }
    }
    
    const n = residuals.length;
    const expectedRuns = (2 * n - 1) / 3;
    const stdDev = Math.sqrt((16 * n - 29) / 90);
    
    const zScore = Math.abs((runs - expectedRuns) / stdDev);
    return Math.min(1, zScore / 2);
  }
  private calculateQuadraticR2(X: number[][], y: number[]): number {
    const yMean = d3.mean(y) || 0;
    const ssTotal = d3.sum(y.map(yi => Math.pow(yi - yMean, 2)));
    
    // Simplified quadratic prediction
    const yPred = X.map(xi => xi[0] + xi[1] + 0.5 * xi[2]);
    const ssResidual = d3.sum(y.map((yi, i) => Math.pow(yi - yPred[i], 2)));
    
    return 1 - (ssResidual / ssTotal);
  }

  private testNonLinearity(data: DataPoint[]): number {
    // Create quadratic terms for comparison
    const X = data.map(d => [1, d.power, d.power * d.power]);
    const y = data.map(d => d.heartRate);
    
    const linearR2 = this.calculateLinearR2(data);
    const quadraticR2 = this.calculateQuadraticR2(X, y);
    
    return Math.min(1, Math.max(0, (quadraticR2 - linearR2) / linearR2));
  }

  private calculateLinearR2(data: DataPoint[]): number {
    const x = data.map(d => d.power);
    const y = data.map(d => d.heartRate);
    const xMean = d3.mean(x) || 0;
    const yMean = d3.mean(y) || 0;
    
    const ssTotal = d3.sum(y.map(yi => Math.pow(yi - yMean, 2)));
    const ssResidual = d3.sum(data.map((d, i) => 
      Math.pow(d.heartRate - (this.powerRange[1] * d.power + this.hrRange[0]), 2)
    ));
    
    return 1 - (ssResidual / ssTotal);
  }

  // Activity Summary Methods
  async analyzeActivity(data: DataPoint[]): Promise<ActivitySummary> {
    const windows = await this.findStableWindows(data);
    const normalizedPower = this.calculateNormalizedPower(data);
    const variabilityIndex = this.calculateVariabilityIndex(data);
    const intensityScore = this.calculateIntensityScore(data, normalizedPower);
    
    return {
      duration: data[data.length - 1].seconds - data[0].seconds,
      totalDistance: this.calculateTotalDistance(data),
      averagePower: d3.mean(data.map(d => d.power)) || 0,
      normalizedPower,
      variabilityIndex,
      intensityScore,
      powerZones: this.calculatePowerZones(data),
      hrZones: this.calculateHRZones(data),
      peaks: this.calculatePowerPeaks(data),
      stableWindows: windows,
      energyExpenditure: this.calculateEnergyExpenditure(data),
      workloadMetrics: this.calculateWorkloadMetrics(data, normalizedPower)
    };
  }

  private calculateNormalizedPower(data: DataPoint[]): number {
    // Implementation based on Coggan's algorithm
    // 1. 30-second moving average
    // 2. Fourth power
    // 3. Average
    // 4. Fourth root
    
    const windowSize = 30; // 30-second window
    const movingAvg: number[] = [];
    
    // Calculate 30-second moving average
    for (let i = windowSize; i < data.length; i++) {
      const window = data.slice(i - windowSize, i);
      movingAvg.push(d3.mean(window.map(d => d.power)) || 0);
    }
    
    // Calculate fourth power and average
    const fourthPowerMean = d3.mean(movingAvg.map(p => Math.pow(p, 4))) || 0;
    
    // Take fourth root
    return Math.pow(fourthPowerMean, 0.25);
  }

  private calculateVariabilityIndex(data: DataPoint[]): {
    power: number;
    hr: number;
  } {
    const powerMean = d3.mean(data.map(d => d.power)) || 1;
    const hrMean = d3.mean(data.map(d => d.heartRate)) || 1;
    
    return {
      power: (d3.deviation(data.map(d => d.power)) || 0) / powerMean,
      hr: (d3.deviation(data.map(d => d.heartRate)) || 0) / hrMean
    };
  }

  private calculateIntensityScore(data: DataPoint[], normalizedPower: number): number {
    const ftp = this.estimateFTP(data); // Could be provided as input or estimated
    const intensityFactor = normalizedPower / ftp;
    return intensityFactor * normalizedPower;
  }

  private estimateFTP(data: DataPoint[]): number {
    // Simple estimation based on 95% of best 20-min power
    const twentyMinPower = this.calculateBestPowerForDuration(data, 1200); // 1200 seconds = 20 min
    return twentyMinPower * 0.95;
  }

  private calculateBestPowerForDuration(data: DataPoint[], duration: number): number {
    let bestPower = 0;
    
    for (let i = 0; i < data.length - duration; i++) {
      const window = data.slice(i, i + duration);
      const avgPower = d3.mean(window.map(d => d.power)) || 0;
      bestPower = Math.max(bestPower, avgPower);
    }
    
    return bestPower;
  }

  private calculatePowerZones(data: DataPoint[]): PowerZones {
    const ftp = this.estimateFTP(data);
    const zones = {
      z1: 0, // Recovery: < 55% FTP
      z2: 0, // Endurance: 55-75% FTP
      z3: 0, // Tempo: 76-90% FTP
      z4: 0, // Threshold: 91-105% FTP
      z5: 0, // VO2Max: 106-120% FTP
      z6: 0  // Anaerobic: > 120% FTP
    };
    
    data.forEach(point => {
      const powerPercent = (point.power / ftp) * 100;
      if (powerPercent <= 55) zones.z1++;
      else if (powerPercent <= 75) zones.z2++;
      else if (powerPercent <= 90) zones.z3++;
      else if (powerPercent <= 105) zones.z4++;
      else if (powerPercent <= 120) zones.z5++;
      else zones.z6++;
    });
    
    // Convert to percentages
    const total = data.length;
    return {
      z1: zones.z1 / total,
      z2: zones.z2 / total,
      z3: zones.z3 / total,
      z4: zones.z4 / total,
      z5: zones.z5 / total,
      z6: zones.z6 / total
    };
  }

  private calculateHRZones(data: DataPoint[]): HRZones {
    const maxHR = d3.max(data.map(d => d.heartRate)) || 0;
    const zones = {
      z1: 0, // Recovery: < 60% Max HR
      z2: 0, // Endurance: 60-70% Max HR
      z3: 0, // Tempo: 71-80% Max HR
      z4: 0, // Threshold: 81-90% Max HR
      z5: 0  // Maximum: > 90% Max HR
    };
    
    data.forEach(point => {
      const hrPercent = (point.heartRate / maxHR) * 100;
      if (hrPercent <= 60) zones.z1++;
      else if (hrPercent <= 70) zones.z2++;
      else if (hrPercent <= 80) zones.z3++;
      else if (hrPercent <= 90) zones.z4++;
      else zones.z5++;
    });
    
    const total = data.length;
    return {
      z1: zones.z1 / total,
      z2: zones.z2 / total,
      z3: zones.z3 / total,
      z4: zones.z4 / total,
      z5: zones.z5 / total
    };
  }

  private calculatePowerPeaks(data: DataPoint[]): PowerPeaks {
    const durations = [5, 30, 60, 300, 600, 1200, 3600]; // 5s, 30s, 1min, 5min, 10min, 20min, 1hr
    const peaks: PowerPeaks = {};
    
    durations.forEach(duration => {
      peaks[`peak${duration}`] = this.calculateBestPowerForDuration(data, duration);
    });
    
    return peaks;
  }

  private calculateTotalDistance(data: DataPoint[]): number {
    return data[data.length - 1].distance || 0;
  }

  private calculateEnergyExpenditure(data: DataPoint[]): EnergyMetrics {
    const kJoules = d3.sum(data.map(d => d.power)) / (1000 / this.getSamplingRate(data));
    const kcal = kJoules * 0.239; // Convert kJ to kcal
    
    return {
      kJoules,
      kcal,
      kJPerHour: kJoules / (data[data.length - 1].seconds / 3600)
    };
  }

  private calculateWorkloadMetrics(data: DataPoint[], normalizedPower: number): WorkloadMetrics {
    const ftp = this.estimateFTP(data);
    const intensityFactor = normalizedPower / ftp;
    const tss = this.calculateTrainingStressScore(data, intensityFactor);
    
    return {
      intensityFactor,
      trainingStressScore: tss,
      workPerHour: normalizedPower * 3.6 // kJ per hour
    };
  }

  private calculateTrainingStressScore(data: DataPoint[], intensityFactor: number): number {
    const duration = data[data.length - 1].seconds / 3600; // hours
    return (duration * 100 * intensityFactor * intensityFactor);
  }

  private getSamplingRate(data: DataPoint[]): number {
    const timeDiffs = [];
    for (let i = 1; i < data.length; i++) {
      timeDiffs.push(data[i].seconds - data[i-1].seconds);
    }
    return 1 / (d3.mean(timeDiffs) || 1); // Hz
  }
}

interface PowerZones {
  z1: number; // Recovery
  z2: number; // Endurance
  z3: number; // Tempo
  z4: number; // Threshold
  z5: number; // VO2Max
  z6: number; // Anaerobic
}

interface HRZones {
  z1: number; // Recovery
  z2: number; // Endurance
  z3: number; // Tempo
  z4: number; // Threshold
  z5: number; // Maximum
}

interface PowerPeaks {
  [key: string]: number; // peak5, peak30, peak60, etc.
}

interface EnergyMetrics {
  kJoules: number;
  kcal: number;
  kJPerHour: number;
}

interface WorkloadMetrics {
  intensityFactor: number;
  trainingStressScore: number;
  workPerHour: number;
}

interface ActivitySummary {
  duration: number;
  totalDistance: number;
  averagePower: number;
  normalizedPower: number;
  variabilityIndex: {
    power: number;
    hr: number;
  };
  intensityScore: number;
  powerZones: PowerZones;
  hrZones: HRZones;
  peaks: PowerPeaks;
  stableWindows: StableWindow[];
  energyExpenditure: EnergyMetrics;
  workloadMetrics: WorkloadMetrics;
}

export default PhysiologicalAnalyzer;