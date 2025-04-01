// analysis-results-card.tsx - Updated version that safely handles ahi type issues

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface AnalysisResult {
  id: string;
  type: 'apnea' | 'hypopnea' | 'normal';
  timestamp: string;
  duration: number;
  oxygenDrop: number;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
}

interface AnalysisResultsCardProps {
  results: {
    summary: {
      totalEvents: number;
      apneaEvents: number;
      hypopneaEvents: number;
      ahi: number | string | null; // Updated to handle multiple types
      avgDuration: number;
      avgOxygenDrop: number;
      classification: string;
    };
    events: AnalysisResult[];
  };
}

const AnalysisResultsCard: React.FC<AnalysisResultsCardProps> = ({ results }) => {
  // Helper function to get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  // Helper function to get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'apnea':
        return <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />;
      case 'hypopnea':
        return <AlertCircle className="w-4 h-4 mr-1 text-orange-500" />;
      case 'normal':
        return <CheckCircle className="w-4 h-4 mr-1 text-green-500" />;
      default:
        return null;
    }
  };

  // Helper function to get AHI classification color
  const getAHIClassColor = (classification: string) => {
    switch (classification) {
      case 'Normal':
        return 'text-green-600';
      case 'Mild':
        return 'text-yellow-600';
      case 'Moderate':
        return 'text-orange-600';
      case 'Severe':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Format AHI value safely accounting for different types
  const formatAHI = (ahi: number | string | null): string => {
    if (typeof ahi === 'number') {
      return ahi.toFixed(1);
    } else if (typeof ahi === 'string') {
      return Number(ahi).toFixed(1);
    } else {
      return '0.0'; // Default value for null
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-medium">AI Analysis Results</CardTitle>
            <CardDescription>Sleep apnea detection analysis</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-3 text-sm font-medium text-gray-500">ANALYSIS SUMMARY</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">AHI Score</p>
                <p className={`text-2xl font-bold ${getAHIClassColor(results.summary.classification)}`}>
                  {formatAHI(results.summary.ahi)}
                </p>
                <Badge variant="outline" className={`mt-1 ${getSeverityColor(results.summary.classification.toLowerCase())}`}>
                  {results.summary.classification}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-800">{results.summary.totalEvents}</p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span className="inline-block w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
                  Apnea: {results.summary.apneaEvents}
                  <span className="inline-block w-2 h-2 ml-2 mr-1 bg-orange-400 rounded-full"></span>
                  Hypopnea: {results.summary.hypopneaEvents}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. O₂ Drop</p>
                <p className="text-2xl font-bold text-gray-800">{results.summary.avgOxygenDrop}%</p>
                <p className="mt-1 text-xs text-gray-500">Avg. Duration: {results.summary.avgDuration}s</p>
              </div>
            </div>
          </div>

          {/* Recent Events Section */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500">RECENT EVENTS</h3>
            <div className="pr-2 space-y-3 overflow-y-auto max-h-64">
              {results.events.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    {getEventTypeIcon(event.type)}
                    <div>
                      <p className="text-sm font-medium">
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)} Event
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()} • {event.duration}s • 
                        SpO₂ drop: {event.oxygenDrop}%
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`ml-auto ${getSeverityColor(event.severity)}`}
                  >
                    {event.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* AI Confidence and Disclaimer */}
          <div className="pt-4 text-xs italic text-gray-500 border-t">
            <p>
              *This analysis is based on rule-based AI detection and should be reviewed by a healthcare professional. 
              The results are intended for informational purposes only and not for medical diagnosis.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResultsCard;