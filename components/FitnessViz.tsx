import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Line, ReferenceLine, ReferenceArea } from 'recharts';

interface PowerHRRelationshipVizProps {
  data: DataPoint[];
  stableWindows: StableWindow[];
}
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
const PowerHRRelationshipViz: React.FC<PowerHRRelationshipVizProps> = ({ data, stableWindows }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Power-HR Relationship Plot */}
      <div className="h-96">
        <ResponsiveContainer>
          <ScatterChart>
            <XAxis 
              dataKey="power" 
              label={{ value: 'Power (watts)', position: 'bottom' }} 
            />
            <YAxis 
              dataKey="heartRate" 
              label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'left' }} 
            />
            
            {/* Plot all points */}
            <Scatter 
              data={data} 
              fill="#8884d8" 
              opacity={0.3}
            />
            
            {/* Plot stable windows with confidence bands */}
            {stableWindows.map((window, i) => (
              <React.Fragment key={i}>
                {/* Reference line for regression */}
                <Line 
                  data={[
                    { power: window.powerRange[0], hr: window.slope * window.powerRange[0] + window.intercept },
                    { power: window.powerRange[1], hr: window.slope * window.powerRange[1] + window.intercept }
                  ]}
                  stroke={`hsl(${120 + i * 30}, 70%, 50%)`}
                  strokeWidth={2}
                />
                
                {/* Confidence bands */}
                <ReferenceArea
                  x1={window.powerRange[0]}
                  x2={window.powerRange[1]}
                  y1={window.confidenceBands.lower}
                  y2={window.confidenceBands.upper}
                  fill={`hsl(${120 + i * 30}, 70%, 50%)`}
                  fillOpacity={0.1}
                />
                
                {/* Points in this window */}
                <Scatter
                  data={window.points}
                  fill={`hsl(${120 + i * 30}, 70%, 50%)`}
                  opacity={0.7}
                />
              </React.Fragment>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {/* Metrics Panel */}
      <div className="p-4 space-y-4">
        {stableWindows.map((window, i) => (
          <div 
            key={i}
            className="p-4 rounded-lg border"
            style={{ borderColor: `hsl(${120 + i * 30}, 70%, 50%)` }}
          >
            <h3 className="font-bold">Stable Window {i + 1}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>Power Range: {window.powerRange[0]}-{window.powerRange[1]}W</p>
              <p>HR Range: {window.hrRange[0]}-{window.hrRange[1]}bpm</p>
              <p>Slope: {window.slope.toFixed(2)} bpm/W</p>
              <p>R²: {window.r2.toFixed(3)}</p>
              <p>Efficiency: {(window.efficiency * 100).toFixed(1)}%</p>
              <p>Response Time: {window.responseTime.toFixed(1)}s</p>
              <p>Decoupling: {(window.decoupling * 100).toFixed(1)}%</p>
              <p>Fitness Score: {(window.aerobicFitness.score * 100).toFixed(1)}</p>
            </div>
            <div className="mt-2 text-xs">
              <p>Quality Metrics:</p>
              <div className="grid grid-cols-3 gap-1">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-full h-2 rounded bg-gray-200"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${120 + i * 30}, 70%, 50%) ${window.qualityMetrics.stabilityScore * 100}%, 
                        #e5e7eb ${window.qualityMetrics.stabilityScore * 100}%)`
                    }}
                  />
                  <span>Stability</span>
                </div>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-full h-2 rounded bg-gray-200"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${120 + i * 30}, 70%, 50%) ${window.qualityMetrics.couplingScore * 100}%, 
                        #e5e7eb ${window.qualityMetrics.couplingScore * 100}%)`
                    }}
                  />
                  <span>Coupling</span>
                </div>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-full h-2 rounded bg-gray-200"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${120 + i * 30}, 70%, 50%) ${window.qualityMetrics.consistencyScore * 100}%, 
                        #e5e7eb ${window.qualityMetrics.consistencyScore * 100}%)`
                    }}
                  />
                  <span>Consistency</span>
                </div>
              </div>
            </div>
            
            {/* Confidence Information */}
            <div className="mt-2 text-xs text-gray-600">
              <p>Analysis Confidence: {(window.aerobicFitness.confidence * 100).toFixed(1)}%</p>
              <div className="mt-1 flex items-center gap-2">
                <div 
                  className="flex-1 h-1 rounded bg-gray-200"
                  style={{
                    background: `linear-gradient(to right, 
                      hsl(${120 + i * 30}, 70%, 50%) ${window.aerobicFitness.confidence * 100}%, 
                      #e5e7eb ${window.aerobicFitness.confidence * 100}%)`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PowerHRRelationshipViz;