import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

interface QuickAction {
  label: string;
  response: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm TotHub's assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { label: "How does check-in work?", response: "Our digital check-in system allows parents to sign children in/out using a tablet or smartphone. Photos are captured for security, and staff are instantly notified. The system automatically tracks attendance for compliance reporting." },
    { label: "What about billing?", response: "TotHub integrates with QuickBooks for automated invoicing. You can set up recurring billing, track payments, send reminders, and generate financial reports. Parents can view and pay invoices through their portal." },
    { label: "Is it compliant?", response: "Yes! TotHub supports all 50 US states with automatic staff-to-child ratio monitoring. We track federal compliance (COPPA, HIPAA, FERPA) and provide audit-ready reports. State-specific requirements update automatically." },
    { label: "Schedule a demo", response: "I'd be happy to help you schedule a demo! Please contact our team at demo@tothub.com or call 1-800-TOTHUB. You can also start a free 30-day trial right from the dashboard." }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Pricing questions
    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("pricing")) {
      return "TotHub starts at $99/month for centers with up to 30 children. We offer volume discounts for larger centers and multi-location businesses. All plans include unlimited staff accounts, parent access, and 24/7 support. Would you like me to help you calculate pricing for your center?";
    }
    
    // Features questions
    if (lowerMessage.includes("feature") || lowerMessage.includes("what can")) {
      return "TotHub includes: Digital check-in/out with photos, Real-time parent communication, Staff scheduling & ratio monitoring, Billing & invoicing integration, Child profiles with medical info, Activity & meal tracking, Compliance reporting for all 50 states, and much more! What specific feature interests you?";
    }
    
    // Security questions
    if (lowerMessage.includes("secure") || lowerMessage.includes("security") || lowerMessage.includes("safe")) {
      return "Security is our top priority! We use bank-level encryption, secure photo storage, role-based access control, and comply with COPPA, HIPAA, and FERPA. Our physical security integration supports keypad, RFID, and biometric access control. All data is backed up hourly.";
    }
    
    // Support questions
    if (lowerMessage.includes("support") || lowerMessage.includes("help")) {
      return "We offer 24/7 support through chat, email, and phone. Most issues are resolved within 2 hours. We also provide free onboarding, training videos, and a comprehensive knowledge base. Premium plans include dedicated account managers.";
    }
    
    // Trial questions
    if (lowerMessage.includes("trial") || lowerMessage.includes("free")) {
      return "Yes! We offer a 30-day free trial with full access to all features. No credit card required to start. Our team will help you get set up and import your existing data. You can cancel anytime during the trial period.";
    }
    
    // Default response
    return "I'm here to help you learn more about TotHub! I can answer questions about features, pricing, compliance, security, and more. Try asking me something like 'How does billing work?' or 'Is it secure?' You can also click the quick action buttons above.";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(input),
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action: QuickAction) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: action.label,
      sender: "user",
      timestamp: new Date()
    };
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: action.response,
      sender: "bot",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage, botMessage]);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <CardTitle className="text-lg font-medium">KidSign Pro Support</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-100">We typically reply instantly</span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === "user" ? "bg-blue-100" : "bg-purple-100"
                      }`}>
                        {message.sender === "user" ? (
                          <User className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.sender === "user" 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === "user" ? "text-blue-100" : "text-gray-500"
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                      onClick={() => handleQuickAction(action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex space-x-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}