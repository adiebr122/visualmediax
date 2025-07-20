import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Star, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  time: string;
  senderName?: string;
}

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    company: ''
  });
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [chatEnded, setChatEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  // Initialize conversation when customer info is provided
  const handleCustomerInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Info Required",
        description: "Nama dan nomor telepon wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create new conversation with status 'unassigned'
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert({
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email || null,
          customer_company: customerInfo.company || null,
          platform: 'website',
          status: 'unassigned',
          last_message_content: 'Percakapan dimulai',
          last_message_time: new Date().toISOString(),
          chat_started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }

      setConversationId(conversation.id);
      setShowCustomerForm(false);
      
      // Add initial system message
      const welcomeMessage: Message = {
        id: '1',
        text: `Halo ${customerInfo.name}! Selamat datang di AI Consultant Pro. Tim CS kami akan segera merespons pesan Anda.`,
        sender: 'agent',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        senderName: 'System'
      };
      
      setMessages([welcomeMessage]);
      
      // Store initial message in database
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'agent',
          sender_name: 'System',
          message_content: welcomeMessage.text,
          message_type: 'text'
        });

      // Create CRM entry
      await supabase
        .from('user_management')
        .insert({
          admin_user_id: '2da7d5d8-a2d8-4bfa-bcb8-8ac350d299cf', // Default admin ID
          client_name: customerInfo.name,
          client_email: customerInfo.email || '',
          client_phone: customerInfo.phone,
          client_company: customerInfo.company || null,
          lead_source: 'Live Chat',
          lead_status: 'new',
          notes: 'Lead dari Live Chat website'
        });

      toast({
        title: "Chat Dimulai",
        description: "Percakapan berhasil dimulai. Tim CS akan segera merespons.",
      });

    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Gagal memulai percakapan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      senderName: customerInfo.name
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      // Store message in database
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'customer',
          sender_name: customerInfo.name,
          message_content: userMessage.text,
          message_type: 'text'
        });

      // Update conversation last message and change status to active
      await supabase
        .from('chat_conversations')
        .update({
          last_message_content: userMessage.text,
          last_message_time: new Date().toISOString(),
          unread_count: 1,
          status: 'active'
        })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan",
        variant: "destructive",
      });
    }
  };

  const handleEndChat = async () => {
    if (!conversationId) return;

    try {
      await supabase
        .from('chat_conversations')
        .update({
          status: 'closed',
          chat_ended_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      setChatEnded(true);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error ending chat:', error);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!conversationId) return;

    try {
      await supabase
        .from('chat_conversations')
        .update({
          chat_rating: rating,
          chat_feedback: feedback
        })
        .eq('id', conversationId);

      // Send chat transcript
      await fetch('/functions/v1/send-chat-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ conversationId })
      });

      setShowFeedback(false);
      toast({
        title: "Terima Kasih",
        description: "Feedback Anda telah dikirim dan transkrip chat telah dikirim ke email",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Listen for real-time updates from admin
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.sender_type === 'agent' && newMsg.sender_name !== 'System') {
            const agentMessage: Message = {
              id: newMsg.id,
              text: newMsg.message_content,
              sender: 'agent',
              time: new Date(newMsg.message_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              senderName: newMsg.sender_name
            };
            setMessages(prev => [...prev, agentMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 relative"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              !
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Live Chat Support</h3>
                  <p className="text-sm opacity-90">Tim kami siap membantu</p>
                </div>
              </div>
              {!chatEnded && conversationId && (
                <button
                  onClick={handleEndChat}
                  className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                >
                  End Chat
                </button>
              )}
            </div>
          </div>

          {/* Customer Info Form */}
          {showCustomerForm ? (
            <form onSubmit={handleCustomerInfoSubmit} className="p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mulai Konsultasi</h4>
                <p className="text-sm text-gray-600 mb-4">Silakan isi informasi Anda untuk memulai chat</p>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Nama lengkap *"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              
              <div>
                <input
                  type="tel"
                  placeholder="Nomor HP *"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Nama Perusahaan"
                  value={customerInfo.company}
                  onChange={(e) => setCustomerInfo({...customerInfo, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="Email (opsional)"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? 'Memulai...' : 'Mulai Chat'}
              </button>
            </form>
          ) : showFeedback ? (
            /* Feedback Form */
            <div className="p-4 space-y-4">
              <h4 className="font-medium text-gray-900">Berikan Rating & Feedback</h4>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Rating:</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Feedback (opsional)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={3}
                />
              </div>

              <button
                onClick={handleFeedbackSubmit}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Kirim Feedback
              </button>
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-xs ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.senderName || (message.sender === 'user' ? 'Anda' : 'Agent')}
                        </p>
                        <p className={`text-xs ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              {!chatEnded && (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ketik pesan Anda..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default LiveChat;
