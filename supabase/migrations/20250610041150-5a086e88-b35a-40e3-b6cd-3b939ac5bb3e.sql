
-- Create table for chat agents
CREATE TABLE public.chat_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  agent_name TEXT NOT NULL,
  agent_email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_online BOOLEAN NOT NULL DEFAULT false,
  max_concurrent_chats INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for email templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'chat_transcript',
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update chat_conversations table to include more customer details and agent assignment
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS customer_company TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.chat_agents(id),
ADD COLUMN IF NOT EXISTS chat_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS chat_ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS chat_rating INTEGER CHECK (chat_rating >= 1 AND chat_rating <= 5),
ADD COLUMN IF NOT EXISTS chat_feedback TEXT,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;

-- Drop existing check constraint if it exists and add the correct one
ALTER TABLE public.chat_conversations DROP CONSTRAINT IF EXISTS chat_conversations_status_check;
ALTER TABLE public.chat_conversations ADD CONSTRAINT chat_conversations_status_check 
CHECK (status IN ('unassigned', 'active', 'pending', 'closed'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_agent_id ON public.chat_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON public.chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_agents_user_id ON public.chat_agents(user_id);

-- Enable RLS on new tables
ALTER TABLE public.chat_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_agents
CREATE POLICY "Users can view all agents" ON public.chat_agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own agent profile" ON public.chat_agents FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create RLS policies for email_templates
CREATE POLICY "Users can view all templates" ON public.email_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage all templates" ON public.email_templates FOR ALL TO authenticated USING (true);

-- Insert default email template
INSERT INTO public.email_templates (template_name, template_type, subject_template, body_template) VALUES
('Chat Transcript Default', 'chat_transcript', 
'Transkrip Percakapan - {{customer_name}}', 
'<h2>Transkrip Percakapan Live Chat</h2>
<p><strong>Tanggal:</strong> {{chat_date}}</p>
<p><strong>Nama Customer:</strong> {{customer_name}}</p>
<p><strong>Email:</strong> {{customer_email}}</p>
<p><strong>No. HP:</strong> {{customer_phone}}</p>
<p><strong>Perusahaan:</strong> {{customer_company}}</p>
<p><strong>Agent:</strong> {{agent_name}}</p>

<h3>Percakapan:</h3>
<div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
{{chat_messages}}
</div>

<p>Terima kasih telah menghubungi kami. Jika ada pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami kembali.</p>

<p>Salam,<br>
Tim Customer Service<br>
AI Consultant Pro</p>');
