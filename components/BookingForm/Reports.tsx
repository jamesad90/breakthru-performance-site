import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Calendar, Activity, TrendingUp } from 'lucide-react';

interface Report {
  id: string;
  date: string;
  type: string;
  results: {
    title: string;
    value: string;
    unit: string;
    change?: string;
  }[];
  recommendations: string[];
  trainingZones: {
    zone: string;
    range: string;
    description: string;
  }[];
}

const exampleReports: Report[] = [
  {
    id: '1',
    date: '2024-03-15',
    type: 'Metabolic Testing',
    results: [
      { title: 'VO2 Max', value: '58.2', unit: 'ml/kg/min', change: '+2.1' },
      { title: 'Anaerobic Threshold', value: '165', unit: 'bpm', change: '+3' },
      { title: 'Max Heart Rate', value: '188', unit: 'bpm' },
      { title: 'RER at AT', value: '1.02', unit: '' }
    ],
    recommendations: [
      'Increase Zone 2 training volume by 20%',
      'Add two VO2 max sessions per week',
      'Focus on nutrition timing around harder sessions',
      'Implement regular recovery weeks every 4th week'
    ],
    trainingZones: [
      { zone: 'Zone 1', range: '120-135 bpm', description: 'Recovery/Easy' },
      { zone: 'Zone 2', range: '136-150 bpm', description: 'Endurance' },
      { zone: 'Zone 3', range: '151-165 bpm', description: 'Tempo' },
      { zone: 'Zone 4', range: '166-176 bpm', description: 'Threshold' },
      { zone: 'Zone 5', range: '177-188 bpm', description: 'VO2 Max' }
    ]
  },
  {
    id: '2',
    date: '2024-01-10',
    type: 'Lactate Testing',
    results: [
      { title: 'Lactate Threshold', value: '245', unit: 'watts', change: '+15' },
      { title: 'Lactate Turn Point', value: '285', unit: 'watts' },
      { title: 'Peak Power', value: '325', unit: 'watts' }
    ],
    recommendations: [
      'Build threshold power through 2x20min intervals',
      'Maintain current sweet spot training volume',
      'Consider supplementing with strength training',
      'Monitor recovery through HRV'
    ],
    trainingZones: [
      { zone: 'Zone 1', range: '0-200W', description: 'Recovery' },
      { zone: 'Zone 2', range: '201-235W', description: 'Endurance' },
      { zone: 'Zone 3', range: '236-260W', description: 'Tempo' },
      { zone: 'Zone 4', range: '261-285W', description: 'Threshold' },
      { zone: 'Zone 5', range: '286+W', description: 'VO2 Max' }
    ]
  }
];

export default function Reports() {
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const toggleReport = (reportId: string) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-center mb-8">
          <FileText className="w-8 h-8 text-blue-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">My Reports</h2>
        </div>

        <div className="space-y-4">
          {exampleReports.map((report) => (
            <div key={report.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleReport(report.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Activity className="w-5 h-5 text-blue-500 mr-3" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{report.type}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {expandedReport === report.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedReport === report.id && (
                <div className="px-6 py-4 border-t">
                  {/* Results */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Key Results</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {report.results.map((result, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">{result.title}</div>
                          <div className="font-semibold text-gray-800">
                            {result.value} {result.unit}
                            {result.change && (
                              <span className="ml-1 text-green-500 text-sm">
                                <TrendingUp className="w-3 h-3 inline mb-1" /> {result.change}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Training Zones */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Training Zones</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Zone</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Range</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.trainingZones.map((zone, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2 text-sm text-gray-800">{zone.zone}</td>
                              <td className="px-4 py-2 text-sm text-gray-800 font-mono">{zone.range}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{zone.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {report.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <ChevronDown className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}