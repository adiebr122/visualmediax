
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatTranscriptRequest {
  conversationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { conversationId }: ChatTranscriptRequest = await req.json();

    // Get conversation details
    const { data: conversation, error: convError } = await supabaseClient
      .from('chat_conversations')
      .select(`
        *,
        chat_agents (agent_name, agent_email)
      `)
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found');
    }

    // Get messages
    const { data: messages, error: msgError } = await supabaseClient
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('message_time', { ascending: true });

    if (msgError) {
      throw new Error('Failed to fetch messages');
    }

    // Get email template
    const { data: template, error: templateError } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('template_type', 'chat_transcript')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      throw new Error('Email template not found');
    }

    // Format messages for email
    const formattedMessages = messages?.map(msg => {
      const time = new Date(msg.message_time).toLocaleTimeString('id-ID');
      const sender = msg.sender_type === 'customer' ? conversation.customer_name : (msg.sender_name || 'Agent');
      return `<p><strong>[${time}] ${sender}:</strong> ${msg.message_content}</p>`;
    }).join('') || '';

    // Replace template variables
    const chatDate = new Date(conversation.created_at).toLocaleDateString('id-ID');
    let emailSubject = template.subject_template
      .replace('{{customer_name}}', conversation.customer_name)
      .replace('{{chat_date}}', chatDate);

    let emailBody = template.body_template
      .replace('{{customer_name}}', conversation.customer_name)
      .replace('{{customer_email}}', conversation.customer_email || '')
      .replace('{{customer_phone}}', conversation.customer_phone)
      .replace('{{customer_company}}', conversation.customer_company || '')
      .replace('{{agent_name}}', conversation.chat_agents?.agent_name || 'System')
      .replace('{{chat_date}}', chatDate)
      .replace('{{chat_messages}}', formattedMessages);

    // Send to admin
    await resend.emails.send({
      from: "Live Chat <noreply@aicp.id>",
      to: ["visualmediaxcs@gmail.com"],
      subject: `[ADMIN] ${emailSubject}`,
      html: emailBody,
    });

    // Send to customer if email provided
    if (conversation.customer_email) {
      await resend.emails.send({
        from: "AI Consultant Pro <noreply@aicp.id>",
        to: [conversation.customer_email],
        subject: emailSubject,
        html: emailBody,
      });
    }

    // Mark as email sent
    await supabaseClient
      .from('chat_conversations')
      .update({ email_sent: true })
      .eq('id', conversationId);

    return new Response(
      JSON.stringify({ success: true, message: 'Transcript sent successfully' }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error sending chat transcript:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
