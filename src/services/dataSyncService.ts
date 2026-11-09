
import { invoke } from '@/integrations/api';

export class DataSyncService {
  static async triggerManualSync(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🔄 Triggering manual alerts data sync...');
      
      const { data, error } = await invoke('sync-alerts-data', {
        body: { manual: true }
      });

      if (error) {
        console.error('❌ Manual sync failed:', error);
        return {
          success: false,
          message: `Sync failed: ${error.message}`
        };
      }

      console.log('✅ Manual sync completed:', data);
      return {
        success: true,
        message: `Sync completed: ${data.inserted} inserted, ${data.updated} updated, ${data.deleted} deleted`,
        data
      };
    } catch (error) {
      console.error('❌ Manual sync error:', error);
      return {
        success: false,
        message: `Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
