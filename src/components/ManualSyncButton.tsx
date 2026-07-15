
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { DataSyncService } from '@/services/dataSyncService';
import { toast } from 'sonner';
import { RouteInputTranslations } from '@/types/route';

interface ManualSyncButtonProps {
  onSyncComplete?: () => void;
  translations: RouteInputTranslations;
}

const ManualSyncButton: React.FC<ManualSyncButtonProps> = ({ onSyncComplete, translations }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleManualSync = async () => {
    setIsLoading(true);
    
    try {
      const result = await DataSyncService.triggerManualSync();
      
      if (result.success) {
        toast.success(translations.syncCompleted, {
          description: result.message,
          duration: 5000,
        });
        onSyncComplete?.();
      } else {
        toast.error(translations.syncFailed, {
          description: result.message,
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error(translations.syncError, {
        description: translations.unexpectedError,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManualSync}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="flex items-center space-x-2"
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      <span>{isLoading ? translations.syncing : translations.syncData}</span>
    </Button>
  );
};

export default ManualSyncButton;
