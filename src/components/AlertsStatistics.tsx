
import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, AlertTriangle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { alertsAnalyticsService } from '@/services/alertsAnalyticsService';
import { RouteInputTranslations } from '@/types/route';

interface AlertsStatisticsProps {
  translations: RouteInputTranslations;
  language: 'en' | 'ua';
}

const AlertsStatistics: React.FC<AlertsStatisticsProps> = ({ translations, language }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);

  // Trend: second half of the period vs the first half (more alerts = bad = red)
  const getTrend = () => {
    const data: Array<{ count: number }> = statistics?.timeData || [];
    if (data.length < 4) return null;
    const half = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, half).reduce((sum, d) => sum + (d.count || 0), 0);
    const secondHalf = data.slice(data.length - half).reduce((sum, d) => sum + (d.count || 0), 0);
    if (firstHalf === 0) return null;
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
  };

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
        <p>{translations.noStatisticsData}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Time Range Filter */}
      <div className="flex">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="flex-1 bg-white/10 border-white/15 text-white rounded-xl backdrop-blur-md transition-colors hover:bg-white/15">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900/90 backdrop-blur-2xl border-white/15 text-white rounded-xl">
            {Object.entries(timeRangeOptions[language]).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-white rounded-lg focus:bg-white/15 focus:text-white">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card border-white/15 bg-transparent transition-all duration-200 hover:bg-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs text-white/60">{translations.totalAlerts}</p>
                <p className="text-lg font-bold text-white tabular-nums">{statistics.totalAlerts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 bg-transparent transition-all duration-200 hover:bg-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <div>
                <p className="text-xs text-white/60">{translations.activeAlerts}</p>
                <p className="text-lg font-bold text-white tabular-nums">{statistics.activeAlerts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/15 bg-transparent transition-all duration-200 hover:bg-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-white" />
              <div>
                <p className="text-xs text-white/60">{translations.averageDaily}</p>
                <p className="text-lg font-bold text-white tabular-nums">{statistics.dailyAverage || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-4">
        {/* Alerts Over Time */}
        {statistics.timeData && statistics.timeData.length > 0 && (
          <Card className="glass-card border-white/15 bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white tracking-tight flex items-center justify-between">
                {translations.alertsOverTime}
                {(() => {
                  const trend = getTrend();
                  if (trend === null) return null;
                  const rising = trend > 0;
                  return (
                    <span
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        rising
                          ? 'border-red-400/30 bg-red-500/10 text-red-300'
                          : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                      }`}
                    >
                      {rising ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span className="hud-value">{rising ? '+' : ''}{trend}%</span>
                    </span>
                  );
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={statistics.timeData}>
                  <defs>
                    <linearGradient id="alertsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.35)" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(9, 13, 20, 0.88)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#ffffff"
                    strokeWidth={2}
                    fill="url(#alertsAreaGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#ffffff', stroke: 'rgba(255,255,255,0.3)', strokeWidth: 6 }}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.45))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Attack Timing - 6 Hour Breakdown */}
        {statistics.timingData && (
          <Card className="glass-card border-white/15 bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white tracking-tight flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {translations.attackTiming}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: translations.morning, value: statistics.timingData.morning || 0 },
                  { label: translations.afternoon, value: statistics.timingData.afternoon || 0 },
                  { label: translations.evening, value: statistics.timingData.evening || 0 },
                  { label: translations.night, value: statistics.timingData.night || 0 }
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 transition-colors hover:bg-white/10">
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-xs text-white/50">{label}</p>
                      <p className="text-base font-semibold text-white hud-value">{value}%</p>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-white/60 to-white transition-all duration-700"
                        style={{ width: `${Math.min(100, value)}%`, boxShadow: '0 0 6px rgba(255,255,255,0.5)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlertsStatistics;
