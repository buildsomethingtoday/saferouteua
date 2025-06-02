
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, MapPin, Clock, Zap, Plane, Swords, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AlertsApiExplorerProps {
  language: 'en' | 'ua';
  selectedRegion?: string | null;
  compact?: boolean;
  onAlertClick?: (alert: AlertItem) => void;
}

interface AlertItem {
  id: number;
  location_title: string;
  location_type: string;
  started_at: string;
  finished_at?: string;
  alert_type: string;
  location_oblast: string;
  location_raion?: string;
  notes?: string;
}

const AlertsApiExplorer: React.FC<AlertsApiExplorerProps> = ({ 
  language, 
  selectedRegion, 
  compact = false,
  onAlertClick
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const translations = {
    en: {
      title: compact ? 'Safety Alerts' : 'Live Ukraine Safety Alerts',
      subtitle: 'Real-time alert data from Alerts.in.ua',
      loadData: 'Refresh Data',
      loading: 'Loading...',
      error: 'Error',
      success: 'Live Data',
      activeAlerts: 'Active Alerts',
      noAlerts: 'No active alerts',
      regionFilter: 'Showing alerts for',
      allRegions: 'All regions',
      autoRefresh: 'Auto-refresh',
      clearFilter: 'Clear filter',
      alertTypes: {
        air_raid: 'Air Raid',
        artillery_shelling: 'Artillery Attack',
        urban_fights: 'Urban Combat',
        chemical: 'Chemical Threat',
        nuclear: 'Nuclear Threat'
      },
      timeAgo: {
        minutes: 'min',
        hours: 'h',
        days: 'd'
      },
      lastUpdated: 'Last updated',
      alertDuration: 'Duration',
      clickMapHint: 'Click on alerts to view region on map',
      clickToFocus: 'Click to focus on map',
      last72Hours: 'Active alerts from last 72 hours',
      timeFormat: {
        active: 'Active for',
        since: 'Since'
      }
    },
    ua: {
      title: compact ? 'Сповіщення безпеки' : 'Сповіщення безпеки України',
      subtitle: 'Дані в реальному часі з Alerts.in.ua',
      loadData: 'Оновити дані',
      loading: 'Завантаження...',
      error: 'Помилка',
      success: 'Дані онлайн',
      activeAlerts: 'Активні сповіщення',
      noAlerts: 'Немає активних сповіщень',
      regionFilter: 'Показано сповіщення для',
      allRegions: 'Всі регіони',
      autoRefresh: 'Авто-оновлення',
      clearFilter: 'Очистити фільтр',
      alertTypes: {
        air_raid: 'Повітряна тривога',
        artillery_shelling: 'Артилерійський обстріл',
        urban_fights: 'Вуличні бої',
        chemical: 'Хімічна загроза',
        nuclear: 'Ядерна загроза'
      },
      timeAgo: {
        minutes: 'хв',
        hours: 'г',
        days: 'д'
      },
      lastUpdated: 'Останнє оновлення',
      alertDuration: 'Тривалість',
      clickMapHint: 'Натисніть на сповіщення, щоб переглянути регіон на карті',
      clickToFocus: 'Натисніть, щоб сфокусуватися на карті',
      last72Hours: 'Активні сповіщення за останні 72 години',
      timeFormat: {
        active: 'Активне протягом',
        since: 'З'
      }
    }
  };

  const t = translations[language];

  const loadAlertsData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading fresh alerts data...');
      
      const { data, error: functionError } = await supabase.functions.invoke('explore-alerts-api', {
        body: { endpoint: 'alerts' }
      });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        setError(functionError.message);
        return;
      }

      console.log('✅ Fresh alerts data received:', data);
      setApiData(data);

    } catch (err) {
      console.error('❌ Request error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlertsData();
    
    if (autoRefresh) {
      const interval = setInterval(loadAlertsData, 30000); // Refresh every 30 seconds for faster updates
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getFilteredAlerts = (alerts: AlertItem[]) => {
    if (!alerts) return alerts;
    
    // Filter to only active alerts from the last 72 hours
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));
    
    let activeAlerts = alerts.filter(alert => {
      const alertDate = new Date(alert.started_at);
      return !alert.finished_at && alertDate >= seventyTwoHoursAgo;
    });
    
    console.log(`Showing all alerts: ${activeAlerts.length} active alerts`);
    return activeAlerts;
  };

  const handleAlertClick = (alert: AlertItem) => {
    console.log('Alert clicked, focusing map on:', alert.location_oblast);
    onAlertClick?.(alert);
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'air_raid': return <Plane className="w-4 h-4" />;
      case 'artillery_shelling': return <Zap className="w-4 h-4" />;
      case 'urban_fights': return <Swords className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'air_raid': return 'bg-red-600';
      case 'artillery_shelling': return 'bg-orange-600';
      case 'urban_fights': return 'bg-purple-600';
      default: return 'bg-yellow-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}${t.timeAgo.days} ${diffHours % 24}${t.timeAgo.hours}`;
    } else if (diffHours > 0) {
      return `${diffHours}${t.timeAgo.hours}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${Math.max(1, diffMinutes)}${t.timeAgo.minutes}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ua' ? 'uk-UA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAlerts = (alerts: AlertItem[]) => {
    const filteredAlerts = getFilteredAlerts(alerts);
    
    if (!filteredAlerts || filteredAlerts.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <Shield className="w-12 h-12 mx-auto mb-4 text-green-400" />
          <p className="mb-2 font-medium text-lg">{t.noAlerts}</p>
          <p className="text-sm text-gray-500">{t.last72Hours}</p>
        </div>
      );
    }

    const sortedAlerts = filteredAlerts.sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    const alertsToShow = compact ? 20 : 40;
    const maxHeight = compact ? 'max-h-[500px]' : 'max-h-[600px]';

    return (
      <div className="space-y-0">
        <div className="text-xs text-gray-400 mb-4 px-3 font-medium">{t.last72Hours}</div>
        <div className={`${maxHeight} overflow-y-auto`}>
          {sortedAlerts.slice(0, alertsToShow).map((alert, index) => (
            <div
              key={alert.id}
              className="group p-4 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer border-b border-gray-800/50 last:border-b-0"
              onClick={() => handleAlertClick(alert)}
            >
              <div className="flex items-start space-x-4">
                {/* Alert Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAlertColor(alert.alert_type)} flex-shrink-0 shadow-lg`}>
                  {getAlertIcon(alert.alert_type)}
                </div>
                
                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white text-base leading-tight">
                      {alert.location_title}
                    </h4>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTimeAgo(alert.started_at)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                    {alert.location_raion && `${alert.location_raion}, `}{alert.location_oblast}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline" 
                        className="text-sm border-gray-600 text-gray-300 bg-gray-700/30 px-3 py-1 font-medium"
                      >
                        {t.alertTypes[alert.alert_type] || alert.alert_type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(alert.started_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-orange-400 font-medium">
                      {t.timeFormat.active}
                    </div>
                  </div>
                  
                  <div className="text-sm text-blue-400 mt-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.clickToFocus}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredAlerts.length > alertsToShow && (
          <div className="text-center py-4 border-t border-gray-800/50">
            <p className="text-sm text-gray-500 font-medium">
              Showing {alertsToShow} of {filteredAlerts.length} alerts
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full bg-gray-900 border border-gray-700 shadow-xl text-white">
      <CardHeader className={compact ? "pb-4" : "pb-4"}>
        <CardTitle className={`flex items-center justify-between ${compact ? 'text-lg' : 'text-xl'} text-white`}>
          <div className="flex items-center space-x-3">
            <AlertTriangle className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-orange-400`} />
            <span>{t.title}</span>
          </div>
          {apiData && !error && (
            <Badge className="bg-green-600 text-white text-sm border-none px-3 py-1">
              {t.success}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={loadAlertsData}
              disabled={isLoading}
              variant="outline"
              size={compact ? "sm" : "default"}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              {isLoading ? t.loading : t.loadData}
            </Button>
            
            {!compact && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-300">
                  {t.autoRefresh}
                </label>
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8 px-6">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-300">{t.loading}</span>
          </div>
        )}

        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="font-medium text-red-400">{t.error}</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {apiData && !error && apiData.data?.alerts && (
          <div className="space-y-0">
            {!compact && apiData.data?.meta?.last_updated_at && (
              <div className="px-6 pb-4">
                <div className="text-sm text-gray-400 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{t.lastUpdated}: {new Date(apiData.data.meta.last_updated_at).toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="bg-gray-800/30 border-t border-gray-700/50">
              {renderAlerts(apiData.data.alerts)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsApiExplorer;
