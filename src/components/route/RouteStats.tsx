
import React from 'react';
import { RouteData, RouteInputTranslations } from '@/types/route';

interface RouteStatsProps {
  routeData: RouteData;
  translations: RouteInputTranslations;
}

const RouteStats: React.FC<RouteStatsProps> = ({ routeData, translations }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="text-center p-4 bg-gray-800 rounded-xl">
        <div className="text-sm font-medium text-blue-400 mb-1">{translations.distance}</div>
        <div className="text-2xl font-semibold text-blue-400">
          {routeData.distanceFormatted || `${routeData.distance} km`}
        </div>
      </div>
      <div className="text-center p-4 bg-gray-800 rounded-xl">
        <div className="text-sm font-medium text-blue-400 mb-1">{translations.duration}</div>
        <div className="text-2xl font-semibold text-blue-400">
          {routeData.durationFormatted || `${routeData.duration}h`}
        </div>
      </div>
    </div>
  );
};

export default RouteStats;
