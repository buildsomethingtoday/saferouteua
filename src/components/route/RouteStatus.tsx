
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { RouteData, RouteInputTranslations } from '@/types/route';

interface RouteStatusProps {
  isSearching: boolean;
  routeData?: RouteData | null;
  translations: RouteInputTranslations;
}

const RouteStatus: React.FC<RouteStatusProps> = ({
  isSearching,
  routeData,
  translations
}) => {
  const isMobile = useIsMobile();

  // Only show loading indicator on mobile
  if (isSearching && isMobile) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-600 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-white">{translations.searching}</span>
        </div>
      </div>
    );
  }

  if (routeData?.error && !isSearching) {
    return (
      <div className="p-4 bg-red-900 border border-red-700 rounded-xl">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
          <span className="text-sm font-medium text-red-300">Route Error</span>
        </div>
        <p className="text-sm text-red-200 mb-2">{routeData.error}</p>
        <div className="text-xs text-red-300 space-y-1">
          <p>• Check your internet connection</p>
          <p>• Try more specific city names (e.g., "Kyiv, Ukraine")</p>
          <p>• Ensure city names are spelled correctly</p>
          <p>• Try different nearby cities if the exact location isn't found</p>
        </div>
      </div>
    );
  }

  return null;
};

export default RouteStatus;
