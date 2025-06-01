import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, MapPin, Clock, Zap, Plane, Swords } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AlertsApiExplorerProps {
  language: 'en' | 'ua';
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

const AlertsApiExplorer: React.FC<AlertsApiExplorerProps> = ({ language }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');

  const translations = {
    en: {
      title: 'Live Ukraine Safety Alerts',
      subtitle: 'Real-time alert data from Alerts.in.ua',
      testEndpoint: 'Load Data',
      regions: 'Regions',
      alerts: 'Active Alerts',
      status: 'System Status',
      history: 'Alert History',
      loading: 'Loading...',
      error: 'Error',
      success: 'Live Data',
      activeAlerts: 'Active Alerts',
      longTermAlerts: 'Long-term Alerts',
      noAlerts: 'No active alerts',
      alertTypes: {
        air_raid: 'Air Raid',
        artillery_shelling: 'Artillery Shells',
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
      alertDuration: 'Duration'
    },
    ua: {
      title: 'Сповіщення безпеки України',
      subtitle: 'Дані в реальному часі з Alerts.in.ua',
      testEndpoint: 'Завантажити дані',
      regions: 'Регіони',
      alerts: 'Активні сповіщення',
      status: 'Статус системи',
      history: 'Історія сповіщень',
      loading: 'Завантаження...',
      error: 'Помилка',
      success: 'Дані онлайн',
      activeAlerts: 'Активні сповіщення',
      longTermAlerts: 'Довгострокові сповіщення',
      noAlerts: 'Немає активних сповіщень',
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
      alertDuration: 'Тривалість'
    }
  };

  const t = translations[language];

  const testEndpoint = async (endpoint: string) => {
    setIsLoading(true);
    setError(null);
    setApiData(null);
    setSelectedEndpoint(endpoint);

    try {
      console.log('🔍 Testing endpoint:', endpoint);
      
      const { data, error: functionError } = await supabase.functions.invoke('explore-alerts-api', {
        body: { endpoint }
      });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        setError(functionError.message);
        return;
      }

      console.log('✅ API data received:', data);
      setApiData(data);

    } catch (err) {
      console.error('❌ Request error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
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
      return `${diffHours}${t.timeAgo.hours} ${Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))}${t.timeAgo.minutes}`;
    } else {
      return `${Math.floor(diffMs / (1000 * 60))}${t.timeAgo.minutes}`;
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
    if (!alerts || alerts.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <Shield className="w-12 h-12 mx-auto mb-4 text-green-400" />
          <p>{t.noAlerts}</p>
        </div>
      );
    }

    // Group alerts by date
    const groupedAlerts = alerts.reduce((groups: { [key: string]: AlertItem[] }, alert) => {
      const date = new Date(alert.started_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(alert);
      return groups;
    }, {});

    // Separate long-term alerts (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAlerts = alerts.filter(alert => new Date(alert.started_at) > sevenDaysAgo);
    const longTermAlerts = alerts.filter(alert => new Date(alert.started_at) <= sevenDaysAgo);

    return (
      <div className="space-y-6">
        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              {t.activeAlerts}
            </h3>
            <div className="space-y-4">
              {Object.entries(groupedAlerts).map(([date, dayAlerts]) => {
                const filteredDayAlerts = dayAlerts.filter(alert => new Date(alert.started_at) > sevenDaysAgo);
                if (filteredDayAlerts.length === 0) return null;
                
                return (
                  <div key={date}>
                    <div className="text-sm font-medium text-gray-400 mb-2">
                      {new Date(date).toLocaleDateString(language === 'ua' ? 'uk-UA' : 'en-US', {
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="space-y-2">
                      {filteredDayAlerts.map((alert) => (
                        <Card key={alert.id} className="bg-gray-800 border-gray-600">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getAlertColor(alert.alert_type)}`}>
                                {getAlertIcon(alert.alert_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate">
                                  {alert.location_title}
                                </h4>
                                <p className="text-sm text-gray-400">
                                  {alert.location_raion && `${alert.location_raion}, `}{alert.location_oblast}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-xs text-gray-500">
                                    {formatDate(alert.started_at)}
                                  </span>
                                  <Badge variant="outline" className="text-xs border-gray-500">
                                    {t.alertTypes[alert.alert_type] || alert.alert_type}
                                  </Badge>
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Long-term Alerts */}
        {longTermAlerts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-400" />
              {t.longTermAlerts}
            </h3>
            <div className="space-y-2">
              {longTermAlerts.slice(0, 5).map((alert) => (
                <Card key={alert.id} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getAlertColor(alert.alert_type)} opacity-70`}>
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-300 truncate">
                          {alert.location_title}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {alert.location_oblast}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {formatTimeAgo(alert.started_at)}
                        </div>
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-500">
                          {t.alertTypes[alert.alert_type] || alert.alert_type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {longTermAlerts.length > 5 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  +{longTermAlerts.length - 5} more long-term alerts
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const endpoints = [
    { key: 'alerts', label: t.alerts, icon: AlertTriangle },
    { key: 'regions', label: t.regions, icon: MapPin },
    { key: 'status', label: t.status, icon: Shield },
    { key: 'history', label: t.history, icon: Clock },
  ];

  return (
    <Card className="w-full max-w-6xl mx-auto bg-gray-900 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          <div>
            <div className="text-xl">{t.title}</div>
            <div className="text-sm text-gray-400 font-normal">{t.subtitle}</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Endpoint Testing Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {endpoints.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => testEndpoint(key)}
              disabled={isLoading}
              variant="outline"
              className="h-16 bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon className="w-5 h-5" />
                <span className="text-sm">{label}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-300">{t.loading}</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="font-medium text-red-400">{t.error}</span>
            </div>
            <p className="text-red-300 text-sm mt-2">{error}</p>
          </div>
        )}

        {/* Success Results */}
        {apiData && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-400">{t.success}</span>
              </div>
              {apiData.data?.meta?.last_updated_at && (
                <div className="text-sm text-gray-400">
                  {t.lastUpdated}: {new Date(apiData.data.meta.last_updated_at).toLocaleString()}
                </div>
              )}
            </div>

            {/* Display Alerts Data */}
            {selectedEndpoint === 'alerts' && apiData.data?.alerts && (
              <div className="bg-gray-800 rounded-lg p-4">
                {renderAlerts(apiData.data.alerts)}
              </div>
            )}

            {/* Display Other Data Types */}
            {selectedEndpoint !== 'alerts' && (
              <div className="space-y-4">
                {/* API Metadata */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Endpoint</div>
                    <div className="font-medium">{apiData.endpoint}</div>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Auth Method</div>
                    <Badge variant="outline" className="mt-1">
                      {apiData.authMethod}
                    </Badge>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Data Type</div>
                    <div className="font-medium">{apiData.dataStructure?.type}</div>
                  </div>
                </div>

                {/* Raw Data Sample */}
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-3">Sample Data</h4>
                  <pre className="text-sm text-gray-300 overflow-auto max-h-64">
                    {JSON.stringify(apiData.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsApiExplorer;
