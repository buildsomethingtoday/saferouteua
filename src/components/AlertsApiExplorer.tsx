
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AlertsApiExplorerProps {
  language: 'en' | 'ua';
}

const AlertsApiExplorer: React.FC<AlertsApiExplorerProps> = ({ language }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      title: 'Alerts.in.ua API Explorer',
      subtitle: 'Discover available safety data',
      testEndpoint: 'Test Endpoint',
      regions: 'Regions',
      alerts: 'Active Alerts',
      status: 'System Status',
      history: 'Alert History',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      dataStructure: 'Data Structure',
      authMethod: 'Auth Method',
      endpoint: 'Endpoint',
    },
    ua: {
      title: 'Дослідження API Alerts.in.ua',
      subtitle: 'Відкрийте доступні дані безпеки',
      testEndpoint: 'Тестувати ендпоінт',
      regions: 'Регіони',
      alerts: 'Активні сповіщення',
      status: 'Статус системи',
      history: 'Історія сповіщень',
      loading: 'Завантаження...',
      error: 'Помилка',
      success: 'Успіх',
      dataStructure: 'Структура даних',
      authMethod: 'Метод авторизації',
      endpoint: 'Ендпоінт',
    }
  };

  const t = translations[language];

  const testEndpoint = async (endpoint: string) => {
    setIsLoading(true);
    setError(null);
    setApiData(null);

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

  const endpoints = [
    { key: 'regions', label: t.regions, icon: MapPin },
    { key: 'status', label: t.status, icon: Shield },
    { key: 'alerts', label: t.alerts, icon: AlertTriangle },
    { key: 'history', label: t.history, icon: Clock },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-900 border-gray-700 text-white">
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
        {apiData && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-medium text-green-400">{t.success}</span>
            </div>

            {/* API Metadata */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-400">{t.endpoint}</div>
                <div className="font-medium">{apiData.endpoint}</div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-400">{t.authMethod}</div>
                <Badge variant="outline" className="mt-1">
                  {apiData.authMethod}
                </Badge>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-400">Data Type</div>
                <div className="font-medium">{apiData.dataStructure?.type}</div>
              </div>
            </div>

            {/* Data Structure Analysis */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-3">{t.dataStructure}</h4>
              <pre className="text-sm text-gray-300 overflow-auto max-h-64">
                {JSON.stringify(apiData.dataStructure, null, 2)}
              </pre>
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
      </CardContent>
    </Card>
  );
};

export default AlertsApiExplorer;
