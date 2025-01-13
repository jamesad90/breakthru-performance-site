import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Scatter, ScatterChart, ReferenceArea } from 'recharts';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DataRow {
  seconds: number;
  power: number;
  heartRate: number;
}

interface Window {
  startTime: number;
  endTime: number;
  state: string;
  powerMean: number;
  hrMean: number;
  confidence: number;
  transition?: {
    probability: number;
  };
}

interface Analysis {
  stateTransitions?: {
    time: number;
    fromState: string;
    toState: string;
    confidence: number;
  }[];
}

const CyclingDataViz = ({ data, windows, analysis }: { data: DataRow[], windows: Window[], analysis: Analysis }) => {
  const [viewMode, setViewMode] = useState('2d');

  const processDataForVisualization = () => {
    return data.map((row: DataRow) => ({
      time: row.seconds,
      power: row.power,
      hr: row.heartRate,
      state: getStateAtTime(row.seconds, windows),
    }));
  };
  
  const formatVariabilityIndex = (vi) => {
    if (!vi) return 'N/A';
    return {
      power: (vi.power * 100).toFixed(1) + '%',
      hr: (vi.hr * 100).toFixed(1) + '%'
    };
  };

  const process3DData = () => {
    return {
      x: data.map((d: any) => d.seconds),
      y: data.map((d: any) => d.power),
      z: data.map((d: any) => d.heartRate),
      mode: 'lines+markers',
      type: 'scatter3d',
      marker: {
        size: 3,
        color: data.map((_: any, i: number) => getStateAtTime(data[i].seconds, windows)),
        colorscale: [
          [0, '#41ae76'],    // stable
          [0.33, '#cf597e'], // lactate threshold
          [0.66, '#eb9b4b'], // cv drift
          [1, '#999999']     // unknown
        ]
      },
      line: {
        color: '#cccccc',
        width: 1
      },
      hovertemplate:
        'Time: %{x}s<br>' +
        'Power: %{y}W<br>' +
        'Heart Rate: %{z}bpm<br>'
    };
  };

  const processTransitions = () => {
    if (!analysis?.stateTransitions) return [];

    return analysis.stateTransitions.map((transition: any) => ({
      type: 'cone',
      x: [transition.time],
      y: [data.find((d: any) => d.seconds === transition.time)?.power],
      z: [data.find((d: any) => d.seconds === transition.time)?.heartRate],
      u: [0],
      v: [0],
      w: [10],
      colorscale: [[0, '#ff0000'], [1, '#ff0000']],
      showscale: false,
      hovertemplate:
        `Transition: ${transition.fromState} → ${transition.toState}<br>` +
        `Confidence: ${(transition.confidence * 100).toFixed(1)}%`
    }));
  };
  const processDataForChart = () => {
    return data.map(point => ({
      time: point.seconds,
      power: point.power,
      heartRate: point.heartRate,
      state: getStateAtTime(point.seconds, windows)
    }));
  };
  const getStateAtTime = (time: number, windows: any[]) => {
    const window = windows.find((w: any) => 
      time >= w.startTime && time <= w.endTime
    );
    return window ? window.state : 'unknown';
  };
  const getStateColor = (state) => {
    const colors = {
      'stable': '#41ae76',
      'lactate_threshold': '#cf597e',
      'cv_drift': '#eb9b4b',
      'unknown': '#999999'
    };
    return colors[state] || colors.unknown;
  };
   // Create separate traces for each state in 3D
   const create3DTraces = () => {
    const traces = [];
    
    windows.forEach((window, index) => {
      const windowData = data.filter(d => 
        d.seconds >= window.startTime && d.seconds <= window.endTime
      );
      
      if (windowData.length > 0) {
        traces.push({
          type: 'scatter3d',
          mode: 'lines+markers',
          x: windowData.map(d => d.seconds),
          y: windowData.map(d => d.power),
          z: windowData.map(d => d.heartRate),
          name: window.state,
          marker: {
            size: 3,
            color: getStateColor(window.state)
          },
          line: {
            color: getStateColor(window.state),
            width: 2
          },
          hovertemplate:
            'Time: %{x}s<br>' +
            'Power: %{y}W<br>' +
            'Heart Rate: %{z}bpm<br>' +
            'State: ' + window.state + '<br>'
        });
      }
    });

    return traces;
  };

  const createStateRegions = () => {
    return windows.map((window, index) => (
      <ReferenceArea
        key={index}
        x1={window.startTime}
        x2={window.endTime}
        fill={getStateColor(window.state)}
        fillOpacity={0.1}
        stroke={getStateColor(window.state)}
        strokeOpacity={0.3}
        strokeWidth={1}
      />
    ));
  };
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ride Analysis</CardTitle>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded ${viewMode === '2d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('2d')}
          >
            2D View
          </button>
          <button
            className={`px-4 py-2 rounded ${viewMode === '3d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('3d')}
          >
            3D View
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          {viewMode === '2d' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processDataForChart()} margin={{ top: 20, right: 50, left: 20, bottom: 20 }}>
                {/* Add state regions first so they're behind the lines */}
                {createStateRegions()}
                
                <XAxis 
                  dataKey="time" 
                  label={{ value: 'Time (seconds)', position: 'bottom' }}
                />
                <YAxis 
                  yAxisId="power" 
                  label={{ value: 'Power (watts)', angle: -90, position: 'left' }}
                />
                <YAxis 
                  yAxisId="hr" 
                  orientation="right" 
                  label={{ value: 'Heart Rate (bpm)', angle: 90, position: 'right' }}
                />
                <Tooltip 
                  content={({ payload, label }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p>Time: {label}s</p>
                          <p>Power: {payload[0]?.value}W</p>
                          <p>Heart Rate: {payload[1]?.value}bpm</p>
                          <p>State: {payload[0]?.payload.state}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="power"
                  type="monotone" 
                  dataKey="power" 
                  stroke="#8884d8" 
                  dot={false}
                  name="Power"
                />
                <Line 
                  yAxisId="hr"
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="#82ca9d" 
                  dot={false}
                  name="Heart Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Plot
              data={create3DTraces()}
              layout={{
                scene: {
                  xaxis: { title: 'Time (seconds)' },
                  yaxis: { title: 'Power (watts)' },
                  zaxis: { title: 'Heart Rate (bpm)' }
                },
                showlegend: true,
                legend: {
                  x: 0.7,
                  y: 0.9
                },
                margin: { l: 0, r: 0, b: 0, t: 0 }
              }}
              config={{ responsive: true }}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>

        {/* State Legend */}
        <div className="mt-4 flex gap-4 justify-center">
          {['stable', 'lactate_threshold', 'cv_drift'].map(state => (
            <div key={state} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: getStateColor(state) }}
              />
              <span className="capitalize">{state.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
        {/* Analysis Summary */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          {windows.map((window, i) => (
            <div 
              key={i}
              className="p-4 rounded"
              style={{ borderLeft: `4px solid ${getStateColor(window.state)}` }}
            >
              <h3 className="font-bold">{window.state}</h3>
              <p>Duration: {(window.endTime - window.startTime).toFixed(0)}s</p>
              <p>Avg Power: {window.powerMean.toFixed(0)}W</p>
              <p>Avg HR: {window.hrMean.toFixed(0)}bpm</p>
              <p>Confidence: {(window.confidence * 100).toFixed(1)}%</p>
            </div>
          ))}
          
          {analysis?.variabilityIndex && (
            <div className="p-4 rounded bg-gray-50">
              <h3 className="font-bold">Variability</h3>
              <p>Power: {formatVariabilityIndex(analysis.variabilityIndex).power}</p>
              <p>Heart Rate: {formatVariabilityIndex(analysis.variabilityIndex).hr}</p>
            </div>
          )}

          {analysis?.normalizedPower && (
            <div className="p-4 rounded bg-gray-50">
              <h3 className="font-bold">Normalized Power</h3>
              <p>{analysis.normalizedPower.toFixed(0)}W</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CyclingDataViz;