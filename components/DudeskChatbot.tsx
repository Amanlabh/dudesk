'use client';

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";

function DuDeskChatbot() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentFirstMessage, setHasUserSentFirstMessage] = useState(false);

  // Add a welcome message when the chat starts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-message",
          role: "assistant",
          content: "Welcome to DU Desk AI Chat Assistant! How can I assist you today?",
        },
      ]);
    }
  }, [messages.length, setMessages]);

  // Simulate typing effect when a new assistant message is being generated
  useEffect(() => {
    setIsTyping(isLoading);
  }, [isLoading]);

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track if the user has sent their first message
  useEffect(() => {
    if (messages.some(m => m.role === "user")) {
      setHasUserSentFirstMessage(true);
    }
  }, [messages]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && input.trim() !== '') {
      handleSubmit(event);
    }
  };

  const sanitizeResponse = (message: string) => {
    return message
      .replace(/cuet_data.csv|links.csv|list.csv/g, '') // Removes any file mentions
      .replace(/\*\*([^\*]+)\*\*/g, '$1') // Removes **text** formatting
      .replace(/analyzed the provided files|based on the `?`? file you provided,/g, 'analyzed the relevant information')
      .replace(/\*/g, '') // Removes remaining '*' asterisks
      .replace(/\n/g, '<br />')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, '[$1]($2)')
      .replace(/^\s*\*\s/gm, (match, index) => {
        return `<ol class="list-decimal pl-5"><li>` + (index + 1) + '.';
      }) // Convert * to numbered list
      .replace(/\n/gm, '</li>') // Closing li tag
      .replace(/-+/gm, '</ol>') // Close the ordered list at the end
      .replace(/Please note that this list is based on the provided CSV data./g, '') // Completely remove this sentence
      .replace(
        /(https?:\/\/[^\s]+)(?<!\])/g,
        '<a href="$1" target="_blank" class="text-blue-600 underline hover:text-blue-800">$1</a>'
      ) // Convert links to clickable blue text
      .replace(/Good day/g, 'Hello') // Replace "Good day" with "Hello"
  };

  const handleSubmitWithContext = async (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim() === "") return;

    // Add context to the prompt
    const promptWithContext = `You are an AI assistant specialized in CUET (UG). Provide accurate and concise answers based on verified data. If you are unsure, say "I'm not sure." User: ${input}`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: promptWithContext }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      setMessages([...messages, { id: Date.now().toString(), role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([...messages, { id: Date.now().toString(), role: "assistant", content: "Sorry, something went wrong. Please try again later." }]);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="flex-1 flex flex-col backdrop-blur-md bg-opacity-20 bg-white rounded-lg shadow-lg m-4 overflow-hidden">
        <div className="flex items-center justify-start bg-gradient-to-r from-blue-500 to-blue-600 p-4">
          <img src="/dudeskdarklogo.svg" alt="Du Desk Logo" className="w-12 h-12 mr-3" />
          <div className="text-white text-lg font-semibold">DU Desk AI Assistant</div>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto p-4">
          {messages.map((m, index) => {
            let content = m.content;
            if (m.role === "assistant" && isFirstMessage && index === 0) {
              content = "Hello. " + content;
              setIsFirstMessage(false); // Add the "Hello" only once
            }
            return (
              <div key={m.id} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex items-start">
                  {m.role === "user" ? (
                    <>
                      <div className="max-w-[80%] p-4 rounded-xl shadow-md bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <span dangerouslySetInnerHTML={{ __html: sanitizeResponse(content) }} />
                      </div>
                      <img src="/profiledu.webp" alt="User Profile" className="w-10 h-10 rounded-full ml-3" />
                    </>
                  ) : (
                    <>
                      <img src="/dudeskdarklogo.svg" alt="Assistant Profile" className="w-10 h-10 mr-3" />
                      <div className="max-w-[80%] p-4 rounded-xl shadow-md bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100">
                        <span dangerouslySetInnerHTML={{ __html: sanitizeResponse(content) }} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="mb-4 flex justify-start">
              <div className="flex items-start">
                <img src="/dudeskdarklogo.svg" alt="Assistant Profile" className="w-10 h-10 mr-3" />
                <div className="max-w-[80%] p-4 rounded-xl bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {hasUserSentFirstMessage && !isLoading && (
            <div className="mb-4 text-center text-gray-400">
              Thank you! Let me know if you have any other queries regarding CUET (UG) or if I made a mistake.{" "}
              <a href="https://chat.whatsapp.com/H92LuwrK5ujH8ujiskzUvp" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                Join our WhatsApp Community for customer support.
              </a>
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center p-4 bg-white bg-opacity-90 backdrop-blur-md shadow-md">
          <Input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-grow rounded-lg border border-blue-200 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 bg-white"
          />
          <Button
            type="submit"
            onClick={handleSubmitWithContext}
            className="ml-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
          {/* Footer */}
        <div className="text-xs text-center text-gray-400 p-3 bg-white bg-opacity-90 backdrop-blur-md">
          DU Desk AI is new and may make mistakes. For accurate and verified information, visit our{" "}
          <a href="https://dudesk.in/home" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
            website
          </a>.
        </div>
      </div>
    </div>
  );
}

export default DuDeskChatbot;