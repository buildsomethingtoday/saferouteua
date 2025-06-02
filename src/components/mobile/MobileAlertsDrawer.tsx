
import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Shield, Clock, Plane, Zap, Swords, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface MobileAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  language: 'en' | 'ua';
  isLoading: boolean;
  onRefresh: () => void;
  onAlertClick: (alert: AlertItem) => void;
}

const MobileAlertsDrawer: React.FC<MobileAlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  language,
  isLoading,
  onRefresh,
  onAlertClick
}) => {
  const translations = {
    en: {
      title: 'Safety Alerts',
      noAlerts: 'No active alerts',
      last72Hours: 'Active alerts from last 72 hours',
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
      clickToFocus: 'Click to focus on map'
    },
    ua: {
      title: 'Сповіщення безпеки',
      noAlerts: 'Немає активних сповіщень',
      last72Hours: 'Активні сповіщення за останні 72 години',
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
      clickToFocus: 'Натисніть, щоб сфокусуватися на карті'
    }
  };

  const t = translations[language];

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'air_raid':
        return <Plane className="w-4 h-4" />;
      case 'artillery_shelling':
        return <Zap className="w-4 h-4" />;
      case 'urban_fights':
        return <Swords className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'air_raid':
        return 'bg-red-600';
      case 'artillery_shelling':
        return 'bg-orange-600';
      case 'urban_fights':
        return 'bg-purple-600';
      default:
        return 'bg-yellow-600';
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

  const handleAlertClick = (alert: AlertItem) => {
    onAlertClick(alert);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-gray-900 border-gray-700 text-white h-[85vh]">
        <DrawerHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center space-x-3 text-xl">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              <span>{t.title}</span>
            </DrawerTitle>
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-800"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-300">Loading...</span>
            </div>
          ) : !alerts || alerts.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Shield className="w-16 h-16 mx-auto mb-6 text-green-400" />
              <p className="text-xl font-medium text-white mb-2">{t.noAlerts}</p>
              <p className="text-gray-400">{t.last72Hours}</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="text-sm text-gray-400 mb-4 font-medium">
                  {t.last72Hours}
                </div>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="group p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 
                               hover:bg-gray-800/50 transition-all duration-200 cursor-pointer
                               active:scale-[0.98] transform"
                      onClick={() => handleAlertClick(alert)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                                       ${getAlertColor(alert.alert_type)} flex-shrink-0 shadow-lg`}>
                          {getAlertIcon(alert.alert_type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-white text-lg leading-tight">
                              {alert.location_title}
                            </h4>
                            <div className="text-right flex-shrink-0 ml-3">
                              <div className="flex items-center text-sm text-gray-400">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatTimeAgo(alert.started_at)}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-400 text-base mb-4 leading-relaxed">
                            {alert.location_raion && `${alert.location_raion}, `}{alert.location_oblast}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Badge variant="outline" className="border-gray-600 text-gray-300 bg-gray-700/30 px-3 py-1">
                                {t.alertTypes[alert.alert_type] || alert.alert_type}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatDate(alert.started_at)}
                              </span>
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
              </div>
            </ScrollArea>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileAlertsDrawer;
