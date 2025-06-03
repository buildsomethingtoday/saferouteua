
import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, AlertTriangle, BarChart3 } from 'lucide-react';
import CityInputForm from './route/CityInputForm';
import RouteDetails from './route/RouteDetails';
import RouteStatus from './route/RouteStatus';
import MobileAlertsDisplay from './mobile/MobileAlertsDisplay';
import AlertsStatistics from './AlertsStatistics';
import ManualSyncButton from './ManualSyncButton';
import { RouteInputTranslations, RouteData } from '@/types/route';
import { useAlertsData } from '@/hooks/useAlertsData';
import { useRouteSearch } from '@/hooks/useRouteSearch';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [internalRouteData, setInternalRouteData] = useState<RouteData | null>(null);
  const [internalIsSearching, setInternalIsSearching] = useState(false);
  const { alerts, isLoading, onRefresh } = useAlertsData();
  const isMobile = useIsMobile();
  
  // Use ref to track if we've already searched for this city combination
  const lastSearchedRoute = useRef<string>('');

  // Use internal state if external handlers not provided
  const currentRouteData = routeData || internalRouteData;
  const currentIsSearching = isSearching || internalIsSearching;
  const currentSetIsSearching = setIsSearching || setInternalIsSearching;
  const currentOnRouteRequest = onRouteRequest || setInternalRouteData;

  // Initialize route search hook
  const { handleRouteSearch } = useRouteSearch({
    translations,
    setIsSearching: currentSetIsSearching,
    onRouteRequest: currentOnRouteRequest
  });

  // Auto-search when both cities are selected (with proper dependency management)
  useEffect(() => {
    if (startCity && endCity && startCity !== endCity && !currentIsSearching) {
      const routeKey = `${startCity}-${endCity}`;
      
      // Only search if this is a new route combination
      if (lastSearchedRoute.current !== routeKey) {
        console.log('🔍 Auto-triggering route search for:', startCity, 'to', endCity);
        lastSearchedRoute.current = routeKey;
        handleRouteSearch(startCity, endCity, 'driving');
      }
    }
  }, [startCity, endCity, currentIsSearching]); // Remove handleRouteSearch from dependencies to prevent loops

  // Reset the last searched route when cities change
  useEffect(() => {
    if (!startCity || !endCity) {
      lastSearchedRoute.current = '';
    }
  }, [startCity, endCity]);

  const tabTranslations = {
    route: translations?.planRoute?.replace('Plan ', '') || 'Route',
    alerts: translations?.alerts || 'Alerts',
    statistics: translations?.statistics || 'Statistics'
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-900 rounded-xl shadow-lg">
      {/* Mobile route searching loading indicator */}
      {currentIsSearching && isMobile && (
        <div className="flex items-center justify-center p-4 bg-blue-600 rounded-xl mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-white">{translations.searching}</span>
          </div>
        </div>
      )}

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

            {/* Route status (only show errors, not loading) */}
            {currentRouteData?.error && !currentIsSearching && (
              <RouteStatus 
                isSearching={false}
                routeData={currentRouteData}
                translations={translations}
              />
            )}

            {/* Route details */}
            {currentRouteData && !currentRouteData.error && (
              <RouteDetails routeData={currentRouteData} translations={translations} />
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
              <h3 className="text-lg font-semibold text-white">{translations.statisticsTitle}</h3>
              <ManualSyncButton translations={translations} />
            </div>
            <AlertsStatistics translations={translations} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RouteInput;
