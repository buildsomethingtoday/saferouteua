
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApiAlert {
  id: number;
  location_title: string;
  location_type: string;
  started_at: string;
  finished_at?: string;
  alert_type: string;
  location_oblast: string;
  location_raion?: string;
  location_uid: string;
  location_oblast_uid: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting alerts data sync...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get API token
    const apiToken = Deno.env.get('ALERTS_IN_UA_API_KEY');
    if (!apiToken) {
      throw new Error('ALERTS_IN_UA_API_KEY not configured');
    }

    // Fetch alerts from external API
    console.log('📡 Fetching alerts from external API...');
    const apiResponse = await fetch(`https://api.alerts.in.ua/v1/alerts/active.json?token=${apiToken}`);
    
    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    const alerts: ApiAlert[] = apiData.alerts || [];
    console.log(`📊 Fetched ${alerts.length} alerts from API`);

    // Transform and insert alerts into database
    let insertCount = 0;
    let updateCount = 0;

    for (const alert of alerts) {
      try {
        // Check if alert already exists
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id, end_time')
          .eq('alert_id', alert.id.toString())
          .single();

        const alertData = {
          alert_id: alert.id.toString(),
          start_time: alert.started_at,
          end_time: alert.finished_at || null,
          location_name: alert.location_title,
          location_oblast: alert.location_oblast,
          location_raion: alert.location_raion || null,
          alert_type: alert.alert_type,
          region_id: alert.location_oblast_uid.toString(),
          severity: mapSeverity(alert.alert_type),
          coordinates: null, // API doesn't provide coordinates
          notes: null
        };

        if (existingAlert) {
          // Update existing alert (mainly to update end_time if it changed)
          if (existingAlert.end_time !== alertData.end_time) {
            const { error: updateError } = await supabase
              .from('alerts')
              .update({ 
                end_time: alertData.end_time,
                updated_at: new Date().toISOString()
              })
              .eq('alert_id', alert.id.toString());

            if (updateError) {
              console.error(`❌ Error updating alert ${alert.id}:`, updateError);
            } else {
              updateCount++;
              console.log(`✅ Updated alert ${alert.id}`);
            }
          }
        } else {
          // Insert new alert
          const { error: insertError } = await supabase
            .from('alerts')
            .insert(alertData);

          if (insertError) {
            console.error(`❌ Error inserting alert ${alert.id}:`, insertError);
          } else {
            insertCount++;
            console.log(`✅ Inserted new alert ${alert.id}`);
          }
        }
      } catch (alertError) {
        console.error(`❌ Error processing alert ${alert.id}:`, alertError);
      }
    }

    // Clean up old alerts (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { error: cleanupError, count: deletedCount } = await supabase
      .from('alerts')
      .delete()
      .lt('start_time', ninetyDaysAgo.toISOString());

    if (cleanupError) {
      console.error('❌ Error during cleanup:', cleanupError);
    } else if (deletedCount && deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old alerts`);
    }

    const result = {
      success: true,
      processed: alerts.length,
      inserted: insertCount,
      updated: updateCount,
      deleted: deletedCount || 0,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Sync completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Sync failed:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function mapSeverity(alertType: string): string {
  const type = alertType.toLowerCase();
  if (type.includes('urban_fights') || type.includes('artillery_shelling')) return 'high';
  if (type.includes('air_raid')) return 'moderate';
  return 'low';
}
