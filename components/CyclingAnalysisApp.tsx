import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import FitFileHandler from '@/lib/FileHandler';
import PhysiologicalAnalyzer from '@/lib/PhysiologicalAnalyzer';
import CyclingDataViz from './CyclingDataViz';
import PowerHRRelationshipViz from './FitnessViz';
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
    decoupling: number;  // Measure of HR-power decoupling
    efficiency: number;  // Cardiac efficiency metric
    aerobicFitness: {
      score: number;
      confidence: number;
    };
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
    responseTime: number;  // Time lag between power changes and HR response
    qualityMetrics: {
      stabilityScore: number;
      couplingScore: number;
      consistencyScore: number;
    };
  }
  interface WindowStats {
    powerMean: number;
    hrMean: number;
    powerStd: number;
    hrStd: number;
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
interface AnalysisState {
  rawData: ProcessedRecord[];
  windows: StableWindow[];
  metadata: any;
  errors: string[];
  isAnalyzing: boolean;
  analysisResults: any;
}

const CyclingAnalysisApp = () => {
  const [analysisState, setAnalysisState] = useState<AnalysisState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const fitHandler = new FitFileHandler();
  

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Process FIT file
      const { processedData, metadata, errors } = await fitHandler.parseFitFile(file);
      
      // Create analyzer instance
      const analyzer = new PhysiologicalAnalyzer();
      
      // Find stable windows (now async)
      const windows = await analyzer.findStableWindows(processedData);
      const analysis = await analyzer.analyzeActivity(processedData)
      //setAnalysisResults(analysis);
      setAnalysisState({
        rawData: processedData,
        windows,
        metadata,
        errors,
        isAnalyzing: false,
        analysisResults: analysis
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing file');
      console.error('Error processing file:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  console.log("analysis state", analysisState);
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Cycling Power-HR Analysis</CardTitle>
          <p className="text-sm text-gray-500">
            Upload a FIT file to analyze power and heart rate relationships
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".fit"
                onChange={handleFileUpload}
                className="hidden"
                id="fit-file-upload"
              />
              <label
                htmlFor="fit-file-upload"
                className="cursor-pointer text-blue-500 hover:text-blue-700"
              >
                {loading ? 'Processing...' : 'Upload FIT File'}
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Analysis Warnings */}
            {/* {analysisState?.errors.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h4 className="font-bold">Analysis Warnings:</h4>
                <ul className="list-disc list-inside">
                  {analysisState.errors.map((err, i) => (
                    <li key={i} className="text-sm">{err}</li>
                  ))}
                </ul>
              </div>
            )} */}

            {/* Results */}
            {analysisState && (
              <div className="space-y-6">
                {/* Metadata Summary */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-bold">Duration</h3>
                    <p>{Math.round(analysisState.metadata.duration / 60)} minutes</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-bold">Distance</h3>
                    <p>{(analysisState.metadata.totalDistance / 1000).toFixed(2)} km</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-bold">Samples</h3>
                    <p>{analysisState.metadata.totalSamples} points</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-bold">Sample Rate</h3>
                    <p>{analysisState.metadata.samplingRate.toFixed(1)} Hz</p>
                  </div>
                  {/* <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-bold">Sample Rate</h3>
                    <p>{analysisResults}</p>
                  </div> */}
                </div>

                {/* Main Visualization */}
            {/* Main Visualization */}
                <PowerHRRelationshipViz
                data={analysisState.rawData}
                stableWindows={analysisState.windows}  // Changed from windows to stableWindows
                />

                {/* Stable Windows Analysis */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Stable Power-HR Windows</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {analysisState.windows.map((window, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <h4 className="font-bold">Window {i + 1}</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p>Time: {Math.round(window.startTime)}s - {Math.round(window.endTime)}s</p>
                            <p>Duration: {Math.round(window.endTime - window.startTime)}s</p>
                            <p>Power: {window.powerRange[0].toFixed(0)}W - {window.powerRange[1].toFixed(0)}W</p>
                            <p>HR: {window.hrRange[0].toFixed(0)} - {window.hrRange[1].toFixed(0)} bpm</p>
                            <p>Slope: {window.slope.toFixed(2)} bpm/W</p>
                            <p>R²: {window.r2.toFixed(3)}</p>
                            <p>Efficiency: {(window.efficiency * 100).toFixed(1)}%</p>
                            <p>Decoupling: {(window.decoupling * 100).toFixed(1)}%</p>
                          </div>
                          {/* Quality Metrics */}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Stability:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{width: `${window.qualityMetrics.stabilityScore * 100}%`}}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Coupling:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{width: `${window.qualityMetrics.couplingScore * 100}%`}}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Consistency:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{width: `${window.qualityMetrics.consistencyScore * 100}%`}}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CyclingAnalysisApp;