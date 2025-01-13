import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import FitFileHandler from '@/lib/PhysiologicalAnalyzer';
import CyclingDataViz from './CyclingDataViz';

const CyclingAnalysisApp = () => {
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setLoading(true);
    setError(null);

    try {
      const fitHandler = new FitFileHandler();
      const results = await fitHandler.parseFitFile(file);
      setAnalysisResults(results as any);
    } catch (err) {
      setError('Error processing file: ' + (err as Error).message);
      console.error('Error processing file:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  console.log(analysisResults, 'analysisResults');
  return ( 
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Cycling Activity Analysis</CardTitle>
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
                Upload FIT File
              </label>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-4">
                Processing file...
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-red-500 py-4">
                {error}
              </div>
            )}

            {/* Results */}
            {analysisResults && (
              <div className="space-y-4">
                <CyclingDataViz 
                  data={analysisResults.dataPoints}
                  windows={analysisResults.windows}
                  analysis={analysisResults.analysis}
                />
                
                {/* Metadata */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-bold">Duration</h3>
                    <p>{Math.round(analysisResults.metadata.duration / 60)} minutes</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-bold">Distance</h3>
                    <p>{(analysisResults.metadata.totalDistance / 1000).toFixed(2)} km</p>
                  </div>
                  {/* <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-bold">Normalized Power</h3>
                    <p>{analysisResults.analysis.normalizedPower || 'Unknown'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-bold">Variability Index</h3>
                    <p>{analysisResults.analysis.variabilityIndex || 'Unknown'}</p>
                  </div> */}
                  <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-bold">Start Time</h3>
                    <p>{new Date(analysisResults.metadata.startTime).toLocaleString()}</p>
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