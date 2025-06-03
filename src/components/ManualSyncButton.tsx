
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { DataSyncService } from '@/services/dataSyncService';
import { toast } from 'sonner';

interface ManualSyncButtonProps {
  onSyncComplete?: () => void;
}

const ManualSyncButton: React.FC<ManualSyncButtonProps> = ({ onSyncComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleManualSync = async () => {
    setIsLoading(true);
    
    try {
      const result = await DataSyncService.triggerManualSync();
      
      if (result.success) {
        toast.success('Data sync completed!', {
          description: result.message,
          duration: 5000,
        });
        onSyncComplete?.();
      } else {
        toast.error('Sync failed', {
          description: result.message,
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error('Sync error', {
        description: 'An unexpected error occurred',
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
      <span>{isLoading ? 'Syncing...' : 'Sync Data'}</span>
    </Button>
  );
};

export default ManualSyncButton;
