
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { deviceId, action } = await req.json()

    if (action === 'generate') {
      // Generate QR code for WhatsApp Web connection
      const qrData = `whatsapp://qr/${deviceId}/${Date.now()}`
      
      // Update device with QR code data
      const { error } = await supabaseClient
        .from('whatsapp_devices')
        .update({
          qr_code_data: qrData,
          connection_status: 'connecting',
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating device:', error)
        return new Response(JSON.stringify({ error: 'Failed to generate QR code' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        qrData,
        message: 'QR code generated successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'connect') {
      // Simulate WhatsApp connection process
      const { error } = await supabaseClient
        .from('whatsapp_devices')
        .update({
          connection_status: 'connected',
          last_connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error connecting device:', error)
        return new Response(JSON.stringify({ error: 'Failed to connect device' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Device connected successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'disconnect') {
      const { error } = await supabaseClient
        .from('whatsapp_devices')
        .update({
          connection_status: 'disconnected',
          qr_code_data: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error disconnecting device:', error)
        return new Response(JSON.stringify({ error: 'Failed to disconnect device' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Device disconnected successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in whatsapp-qr function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
