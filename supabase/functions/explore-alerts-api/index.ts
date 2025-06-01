
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const alertsApiKey = '5f3057f3a4497052ef3a0e0d2f12be79270c923fab2203';

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
      return new Response(JSON.stringify({ 
        error: 'API key not configured',
        message: 'ALERTS_IN_UA_API_KEY environment variable is missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json().catch(() => ({}));
    const { endpoint = 'regions' } = requestBody;
    
    // Base URL for Alerts.in.ua API based on documentation
    const baseUrl = 'https://api.alerts.in.ua/v2';
    
    // Available endpoints based on official documentation
    const endpoints = {
      regions: `${baseUrl}/regions.json`,
      status: `${baseUrl}/status.json`, 
      alerts: `${baseUrl}/alerts/active.json`,
      history: `${baseUrl}/alerts/history.json`,
    };

    const targetUrl = endpoints[endpoint] || endpoints.regions;
    console.log('📡 Fetching from:', targetUrl);

    // Use X-API-Key header as shown in documentation
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': alertsApiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'SafeRoute-UA/1.0',
      },
    });

    console.log('📊 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API request failed:', errorText);
      
      return new Response(JSON.stringify({ 
        error: 'API request failed',
        status: response.status,
        statusText: response.statusText,
        details: errorText,
        url: targetUrl
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('✅ Success with X-API-Key method');
    console.log('📋 Data received:', JSON.stringify(data, null, 2));

    return new Response(JSON.stringify({
      success: true,
      endpoint: endpoint,
      authMethod: 'x-api-key',
      data: data,
      dataStructure: analyzeDataStructure(data)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in explore-alerts-api function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      type: 'function_error'
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
