
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { alertsAnalyticsService } from '@/services/alertsAnalyticsService';
import { RouteInputTranslations } from '@/types/route';

interface AlertsStatisticsProps {
  translations: RouteInputTranslations;
}

const AlertsStatistics: React.FC<AlertsStatisticsProps> = ({ translations }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);

  // Extract language from translations
  const language = translations.live === 'Live' ? 'en' : 'ua';

  const timeRangeOptions = {
    en: {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 3 months'
    },
    ua: {
      '7d': 'Останні 7 днів',
      '30d': 'Останні 30 днів',
      '90d': 'Останні 3 місяці'
    }
  };

  const chartLabels = {
    en: {
      alertsOverTime: 'Alerts Over Time',
      totalAlerts: 'Total Alerts',
      activeAlerts: 'Active Alerts',
      averageDaily: 'Daily Average',
      timeRange: 'Time Range',
      attackTiming: 'Attack Timing Distribution',
      morning: 'Morning (6AM-12PM)',
      afternoon: 'Afternoon (12PM-6PM)',
      evening: 'Evening (6PM-12AM)',
      night: 'Night (12AM-6AM)'
    },
    ua: {
      alertsOverTime: 'Сповіщення в часі',
      totalAlerts: 'Всього сповіщень',
      activeAlerts: 'Активні сповіщення',
      averageDaily: 'Середньоденне',
      timeRange: 'Часовий діапазон',
      attackTiming: 'Розподіл часу атак',
      morning: 'Ранок (6:00-12:00)',
      afternoon: 'День (12:00-18:00)',
      evening: 'Вечір (18:00-00:00)',
      night: 'Ніч (00:00-6:00)'
    }
  };

  const labels = chartLabels[language];

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await alertsAnalyticsService.getStatistics(timeRange, 'all');
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center text-gray-400 py-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No statistics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Time Range Filter */}
      <div className="flex">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="flex-1 bg-gray-800 border-gray-700 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {Object.entries(timeRangeOptions[language]).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-white hover:bg-gray-700">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs text-gray-400">{labels.totalAlerts}</p>
                <p className="text-lg font-bold text-white">{statistics.totalAlerts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <div>
                <p className="text-xs text-gray-400">{labels.activeAlerts}</p>
                <p className="text-lg font-bold text-white">{statistics.activeAlerts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-400">{labels.averageDaily}</p>
                <p className="text-lg font-bold text-white">{statistics.dailyAverage || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-4">
        {/* Alerts Over Time */}
        {statistics.timeData && statistics.timeData.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">{labels.alertsOverTime}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={statistics.timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                  <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Attack Timing - 6 Hour Breakdown */}
        {statistics.timingData && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {labels.attackTiming}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400">{labels.morning}</p>
                  <p className="text-lg font-bold text-yellow-400">{statistics.timingData.morning || 0}%</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400">{labels.afternoon}</p>
                  <p className="text-lg font-bold text-orange-400">{statistics.timingData.afternoon || 0}%</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400">{labels.evening}</p>
                  <p className="text-lg font-bold text-red-400">{statistics.timingData.evening || 0}%</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400">{labels.night}</p>
                  <p className="text-lg font-bold text-blue-400">{statistics.timingData.night || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlertsStatistics;
