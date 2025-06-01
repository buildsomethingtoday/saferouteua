
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const alertsApiKey = Deno.env.get('ALERTS_IN_UA_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Exploring Alerts.in.ua API...');
    
    if (!alertsApiKey) {
      console.error('❌ ALERTS_IN_UA_API_KEY not found');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { endpoint = 'regions' } = await req.json().catch(() => ({}));
    
    // Base URL for Alerts.in.ua API
    const baseUrl = 'https://api.alerts.in.ua/v1';
    
    // Test different endpoints to explore available data
    const endpoints = {
      regions: `${baseUrl}/regions.json`,
      status: `${baseUrl}/status.json`,
      alerts: `${baseUrl}/alerts/active.json`,
      history: `${baseUrl}/alerts/history.json`,
    };

    const targetUrl = endpoints[endpoint] || endpoints.regions;
    console.log('📡 Fetching from:', targetUrl);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${alertsApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SafeRoute-UA/1.0',
      },
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      
      // Try without Bearer prefix
      console.log('🔄 Retrying without Bearer prefix...');
      const retryResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Authorization': alertsApiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'SafeRoute-UA/1.0',
        },
      });

      if (!retryResponse.ok) {
        // Try as query parameter
        console.log('🔄 Retrying with API key as query parameter...');
        const urlWithKey = `${targetUrl}?token=${alertsApiKey}`;
        const queryResponse = await fetch(urlWithKey, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SafeRoute-UA/1.0',
          },
        });

        if (!queryResponse.ok) {
          const queryErrorText = await queryResponse.text();
          console.error('❌ All auth methods failed:', queryErrorText);
          return new Response(JSON.stringify({ 
            error: 'API request failed with all authentication methods',
            status: queryResponse.status,
            details: queryErrorText,
            triedMethods: ['Bearer token', 'Direct header', 'Query parameter']
          }), {
            status: queryResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const queryData = await queryResponse.json();
        console.log('✅ Success with query parameter method');
        return new Response(JSON.stringify({
          success: true,
          endpoint: endpoint,
          authMethod: 'query_parameter',
          data: queryData,
          dataStructure: analyzeDataStructure(queryData)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const retryData = await retryResponse.json();
      console.log('✅ Success with direct header method');
      return new Response(JSON.stringify({
        success: true,
        endpoint: endpoint,
        authMethod: 'direct_header',
        data: retryData,
        dataStructure: analyzeDataStructure(retryData)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('✅ Success with Bearer token method');
    console.log('📋 Data received:', JSON.stringify(data, null, 2));

    return new Response(JSON.stringify({
      success: true,
      endpoint: endpoint,
      authMethod: 'bearer_token',
      data: data,
      dataStructure: analyzeDataStructure(data)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in explore-alerts-api function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeDataStructure(data: any): any {
  if (Array.isArray(data)) {
    return {
      type: 'array',
      length: data.length,
      sampleItem: data[0] ? analyzeDataStructure(data[0]) : null
    };
  } else if (typeof data === 'object' && data !== null) {
    const structure: any = {
      type: 'object',
      keys: Object.keys(data)
    };
    
    // Analyze a few key properties
    for (const key of Object.keys(data).slice(0, 5)) {
      structure[key] = {
        type: typeof data[key],
        isArray: Array.isArray(data[key]),
        sampleValue: Array.isArray(data[key]) ? 
          `Array(${data[key].length})` : 
          (typeof data[key] === 'string' && data[key].length > 50) ? 
            data[key].substring(0, 50) + '...' : 
            data[key]
      };
    }
    
    return structure;
  } else {
    return {
      type: typeof data,
      value: data
    };
  }
}
