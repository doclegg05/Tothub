import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

export function ChatbotNew() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm TotHub's assistant. How can I help you today?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("price") || message.includes("cost")) {
      return "TotHub starts at $99/month for centers with up to 30 children. We offer volume discounts for larger centers. All plans include unlimited staff accounts and parent access.";
    }
    
    if (message.includes("demo") || message.includes("trial")) {
      return "We offer a 30-day free trial! No credit card required. Contact us at demo@tothub.com or call 1-800-TOTHUB to get started.";
    }
    
    if (message.includes("feature")) {
      return "TotHub includes: Digital check-in/out, Real-time parent communication, Staff scheduling, Billing integration, Compliance reporting, and much more!";
    }
    
    if (message.includes("support") || message.includes("help")) {
      return "We offer 24/7 support via chat, email, and phone. Most issues are resolved within 2 hours. We also provide free onboarding and training.";
    }
    
    if (message.includes("secure") || message.includes("security")) {
      return "Security is our top priority! We use bank-level encryption, role-based access control, and comply with COPPA, HIPAA, and FERPA.";
    }
    
    if (message.includes("billing") || message.includes("payment")) {
      return "TotHub integrates with QuickBooks for automated invoicing. You can set up recurring billing, track payments, and send reminders easily.";
    }
    
    if (message.includes("mobile") || message.includes("app")) {
      return "TotHub works perfectly on all devices! Parents and staff can access it from smartphones, tablets, or computers.";
    }
    
    return "I can help you with questions about pricing, features, security, billing, and more. What would you like to know about TotHub?";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      isBot: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: getBotResponse(userMessage.text),
        isBot: true
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 sm:w-96 h-[500px] shadow-xl z-50 flex flex-col">
          <CardHeader className="bg-blue-600 text-white p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">TotHub Support</CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col">
            {/* Messages Container */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isBot
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}