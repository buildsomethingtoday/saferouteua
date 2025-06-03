
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, AlertTriangle, BarChart3 } from 'lucide-react';
import CityInputForm from './route/CityInputForm';
import RouteDetails from './route/RouteDetails';
import MobileAlertsDisplay from './mobile/MobileAlertsDisplay';
import AlertsStatistics from './AlertsStatistics';
import ManualSyncButton from './ManualSyncButton';
import { RouteInputTranslations, RouteData } from '@/types/route';
import { useAlertsData } from '@/hooks/useAlertsData';

interface RouteInputProps {
  translations: RouteInputTranslations;
  language?: 'en' | 'ua';
  onRouteRequest?: (routeData: any) => void;
  isSearching?: boolean;
  setIsSearching?: (searching: boolean) => void;
  routeData?: RouteData | null;
  selectedRegion?: string | null;
  onAlertClick?: (alert: any) => void;
}

const RouteInput: React.FC<RouteInputProps> = ({ 
  translations,
  language = 'en',
  onRouteRequest,
  isSearching = false,
  setIsSearching,
  routeData,
  selectedRegion,
  onAlertClick
}) => {
  const [activeTab, setActiveTab] = useState('route');
  const [startCity, setStartCity] = useState('');
  const [endCity, setEndCity] = useState('');
  const { alerts, isLoading, onRefresh } = useAlertsData();

  const tabTranslations = {
    route: translations?.planRoute || 'Plan Route',
    alerts: translations?.alerts || 'Alerts',
    statistics: translations?.statistics || 'Statistics'
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-900 rounded-xl shadow-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-800">
          <TabsTrigger 
            value="route" 
            className="flex items-center space-x-2 text-xs md:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">{tabTranslations.route}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="alerts" 
            className="flex items-center space-x-2 text-xs md:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">{tabTranslations.alerts}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="statistics" 
            className="flex items-center space-x-2 text-xs md:text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">{tabTranslations.statistics}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="route" className="mt-0">
          <div className="space-y-4">
            <CityInputForm 
              startCity={startCity}
              endCity={endCity}
              language={language}
              translations={translations}
              onStartCityChange={setStartCity}
              onEndCityChange={setEndCity}
            />
            {routeData && (
              <RouteDetails routeData={routeData} translations={translations} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-0">
          <MobileAlertsDisplay 
            alerts={alerts}
            language={language}
            isLoading={isLoading}
            onRefresh={onRefresh}
            onAlertClick={onAlertClick || (() => {})}
          />
        </TabsContent>

        <TabsContent value="statistics" className="mt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Statistics</h3>
              <ManualSyncButton />
            </div>
            <AlertsStatistics translations={translations} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RouteInput;
