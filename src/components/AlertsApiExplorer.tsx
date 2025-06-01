
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
        artillery_shelling: 'Artillery',
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
      last72Hours: 'Showing alerts from last 72 hours'
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
        artillery_shelling: 'Артилерія',
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
      last72Hours: 'Показано сповіщення за останні 72 години'
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
      const interval = setInterval(loadAlertsData, 60000);
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
          <p className="mb-2">{t.noAlerts}</p>
          <p className="text-xs text-gray-500 mb-2">{t.last72Hours}</p>
        </div>
      );
    }

    const sortedAlerts = filteredAlerts.sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    // Show more alerts in compact mode and increase max height
    const alertsToShow = compact ? 15 : 30;
    const maxHeight = compact ? 'max-h-96' : 'max-h-[500px]';

    return (
      <div className={`space-y-3 ${maxHeight} overflow-y-auto pr-2`}>
        <div className="text-xs text-gray-500 mb-2 px-1">{t.last72Hours}</div>
        {sortedAlerts.slice(0, alertsToShow).map((alert) => (
          <Card 
            key={alert.id} 
            className="bg-gray-800 border-gray-600 hover:bg-gray-750 transition-colors cursor-pointer"
            onClick={() => handleAlertClick(alert)}
          >
            <CardContent className={compact ? "p-3" : "p-4"}>
              <div className="flex items-start space-x-3">
                <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg flex items-center justify-center ${getAlertColor(alert.alert_type)}`}>
                  {getAlertIcon(alert.alert_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-white truncate ${compact ? 'text-sm' : ''}`}>
                    {alert.location_title}
                  </h4>
                  <p className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                    {alert.location_raion && `${alert.location_raion}, `}{alert.location_oblast}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatDate(alert.started_at)}
                    </span>
                    <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                      {t.alertTypes[alert.alert_type] || alert.alert_type}
                    </Badge>
                  </div>
                  <div className="text-xs text-blue-400 mt-1">
                    {t.clickToFocus}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(alert.started_at)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredAlerts.length > alertsToShow && (
          <p className="text-xs text-gray-500 text-center py-2">
            Showing {alertsToShow} of {filteredAlerts.length} alerts
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full bg-gray-900 border border-gray-700 shadow-xl text-white">
      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <CardTitle className={`flex items-center justify-between ${compact ? 'text-base' : 'text-lg'} text-white`}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-orange-400`} />
            <span>{t.title}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
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

        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-300">{t.loading}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="font-medium text-red-400">{t.error}</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {apiData && !error && apiData.data?.alerts && (
          <div className="space-y-4">
            {!compact && apiData.data?.meta?.last_updated_at && (
              <div className="text-sm text-gray-400 flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>{t.lastUpdated}: {new Date(apiData.data.meta.last_updated_at).toLocaleString()}</span>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-3">
              {renderAlerts(apiData.data.alerts)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsApiExplorer;
