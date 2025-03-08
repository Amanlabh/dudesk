'use client';

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, X, RefreshCw } from "lucide-react";

function DuDeskChatbot() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentFirstMessage, setHasUserSentFirstMessage] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [currentStep, setCurrentStep] = useState<"initial" | "eligibility_board" | "state_board_inquiry" | "eligibility_subjects" | "eligibility_courses" | "explore_colleges">("initial");

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-message",
          role: "assistant",
          content: "Welcome to DU Desk AI Chat Assistant! How can I assist you today? Here are some options:",
        },
      ]);
      setStartTime(Date.now());
    }
  }, [messages.length, setMessages]);

  useEffect(() => {
    setIsTyping(isLoading);
  }, [isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.some(m => m.role === "user")) {
      setHasUserSentFirstMessage(true);
    }
  }, [messages]);

  useEffect(() => {
    if (startTime && !isChatEnded) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setElapsedTime(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime, isChatEnded]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && input.trim() !== '' && !isChatEnded) {
      handleSubmit(event);
    }
  };

  const sanitizeResponse = (message: string) => {
    return message
      .replace(/cuet_data.csv|links.csv|list.csv/g, "")
      .replace(/\*\*([^\*]+)\*\*/g, "$1")
      .replace(/analyzed the provided files|based on the `?`? file you provided,/g, "analyzed the relevant information")
      .replace(/\*/g, "")
      .replace(/\n/g, "<br />")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, "[$1](https://dudesk.in)") // Replace all external links with dudesk.in
      .replace(/^\s*\*\s/gm, (match, index) => {
        return `<ol class="list-decimal pl-5"><li>` + (index + 1) + ".";
      })
      .replace(/\n/gm, "</li>")
      .replace(/-+/gm, "</ol>")
      .replace(/Please note that this list is based on the provided CSV data./g, "")
      .replace(/(https?:\/\/[^\s]+)(?<!\])/g, '<a href="https://dudesk.in" target="_blank" class="text-blue-600 underline hover:text-blue-800">https://dudesk.in</a>') // Replace all standalone external links with dudesk.in
      .replace(/Good day/g, "Hello");
  };

  const handleSubmitWithContext = async (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim() === "" || isChatEnded) return;

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
      setShowOptions(false);
    } catch (error) {
      console.error("Error:", error);
      setMessages([...messages, { id: Date.now().toString(), role: "assistant", content: "Sorry, something went wrong. Please try again later." }]);
    }
  };

  const handleOptionClick = (option: string) => {
    if (isChatEnded) return;

    if (option === "Check Eligibility") {
      setCurrentStep("eligibility_board");
      setMessages([
        ...messages,
        { id: Date.now().toString(), role: "user", content: option },
        { id: Date.now().toString() + "-response", role: "assistant", content: "From which board have you attempted your 12th exam?" },
      ]);
    } else if (option === "Explore Colleges") {
      setCurrentStep("explore_colleges");
      setMessages([
        ...messages,
        { id: Date.now().toString(), role: "user", content: option },
        { id: Date.now().toString() + "-response", role: "assistant", content: "Enter the courses to find the colleges that offer them." },
      ]);
    }
    setShowOptions(false);
  };

  const handleBoardSelection = (board: string) => {
    if (board === "State Board") {
      // If the user selects "State Board," ask for the specific state board
      setCurrentStep("state_board_inquiry");
      setMessages([
        ...messages,
        { id: Date.now().toString(), role: "user", content: board },
        { id: Date.now().toString() + "-response", role: "assistant", content: "Which state board do you belong to? Please specify your state board (e.g., Maharashtra State Board, Tamil Nadu State Board, etc.)." },
      ]);
    } else {
      // For CBSE or ICSE, proceed to the next step
      setCurrentStep("eligibility_subjects");
      setMessages([
        ...messages,
        { id: Date.now().toString(), role: "user", content: board },
        { id: Date.now().toString() + "-response", role: "assistant", content: "How many subjects did you study in Class 12? (5 or 6)" },
      ]);
    }
  };

  const handleEndChat = () => {
    setIsChatEnded(true);
    setMessages([
      ...messages,
      { id: "end-chat-message", role: "assistant", content: `Thank you for using DU Desk AI Chat Assistant! Your chat duration was ${elapsedTime}. Go Back to the Home Page https://dudesk.in` },
    ]);
  };

  const handleResetChat = () => {
    setMessages([]);
    setIsChatEnded(false);
    setStartTime(Date.now());
    setElapsedTime("00:00");
    setHasUserSentFirstMessage(false);
    setShowOptions(true);
    setCurrentStep("initial");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="flex-1 flex flex-col backdrop-blur-md bg-opacity-20 bg-white rounded-lg shadow-lg m-2 sm:m-4 overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 p-2 sm:p-4">
          <div className="flex items-center">
            <img src="/dudeskdarklogo.svg" alt="Du Desk Logo" className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
            <div className="text-white text-sm sm:text-lg font-semibold">DU Desk AI Assistant</div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              onClick={handleResetChat}
              className="bg-blue-500 hover:bg-green-600 text-white rounded-full px-2 py-1 sm:px-3 sm:py-2 flex items-center space-x-1 sm:space-x-2"
              disabled={isChatEnded}
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Reset Chat</span>
            </Button>
            <Button
              onClick={handleEndChat}
              className="bg-blue-500 hover:bg-red-600 text-white rounded-full px-2 py-1 sm:px-3 sm:py-2 flex items-center space-x-1 sm:space-x-2"
              disabled={isChatEnded}
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">End Chat ({elapsedTime})</span>
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto p-2 sm:p-4">
          {messages.map((m, index) => {
            let content = m.content;
            if (m.role === "assistant" && isFirstMessage && index === 0) {
              content = "Hello. " + content;
              setIsFirstMessage(false);
            }
            return (
              <div key={m.id} className={`mb-2 sm:mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex items-start">
                  {m.role === "user" ? (
                    <>
                      <div className="max-w-[80%] p-2 sm:p-3 rounded-xl shadow-md bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <span dangerouslySetInnerHTML={{ __html: sanitizeResponse(content) }} />
                      </div>
                      <img src="/profiledu.webp" alt="User Profile" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full ml-2 sm:ml-3" />
                    </>
                  ) : (
                    <>
                      <img src="/dudeskdarklogo.svg" alt="Assistant Profile" className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
                      <div className="max-w-[80%] p-2 sm:p-3 rounded-xl shadow-md bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100">
                        <span dangerouslySetInnerHTML={{ __html: sanitizeResponse(content) }} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="mb-2 sm:mb-4 flex justify-start">
              <div className="flex items-start">
                <img src="/dudeskdarklogo.svg" alt="Assistant Profile" className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
                <div className="max-w-[80%] p-2 sm:p-3 rounded-xl bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(showOptions && !hasUserSentFirstMessage) && (
            <div className="mb-2 sm:mb-4 text-left w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%]">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Choose an option:</h3>
              <div className="space-y-1 sm:space-y-2">
                <Button
                  onClick={() => handleOptionClick("Check Eligibility")}
                  className="w-full text-left bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100 hover:bg-blue-50 transition-all duration-300 text-xs sm:text-sm whitespace-normal"
                >
                  Check Eligibility: Find out if you qualify for your dream course.
                </Button>
                <Button
                  onClick={() => handleOptionClick("Explore Colleges")}
                  className="w-full text-left bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100 hover:bg-blue-50 transition-all duration-300 text-xs sm:text-sm whitespace-normal"
                >
                  Explore Colleges: Discover which colleges offer your dream course.
                </Button>
              </div>
            </div>
          )}

          {currentStep === "eligibility_board" && (
            <div className="mb-2 sm:mb-4 text-left w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%]">
              <div className="space-y-1 sm:space-y-2">
                <Button
                  onClick={() => handleBoardSelection("CBSE")}
                  className="w-full text-left bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100 hover:bg-blue-50 transition-all duration-300 text-xs sm:text-sm whitespace-normal"
                >
                  CBSE
                </Button>
                <Button
                  onClick={() => handleBoardSelection("ICSE")}
                  className="w-full text-left bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100 hover:bg-blue-50 transition-all duration-300 text-xs sm:text-sm whitespace-normal"
                >
                  ICSE
                </Button>
                <Button
                  onClick={() => handleBoardSelection("State Board")}
                  className="w-full text-left bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100 hover:bg-blue-50 transition-all duration-300 text-xs sm:text-sm whitespace-normal"
                >
                  State Board
                </Button>
              </div>
            </div>
          )}

          

          {currentStep === "eligibility_subjects" && (
            <div className="mb-2 sm:mb-4 text-left w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%]">
              <div className="space-y-1 sm:space-y-2">
                <Button
                  onClick={() => {
                    setCurrentStep("eligibility_courses");
                    setMessages([
                      ...messages,
                      { id: Date.now().toString(), role: "user", content: "5" },
                      { id: Date.now().toString() + "-response", role: "assistant", content: "Please enter the subjects you studied in Class 12." },
                    ]);
                  }}
                  className="w-full text-left bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100 hover:bg-blue-50 transition-all duration-300 text-xs sm:text-sm whitespace-normal"
                >
                  5
                </Button>
                <Button
                  onClick={() => {
                    setCurrentStep("eligibility_courses");
                    setMessages([
                      ...messages,
                      { id: Date.now().toString(), role: "user", content: "6" },
                      { id: Date.now().toString() + "-response", role: "assistant", content: "Please enter the subjects you studied in Class 12." },
                    ]);
                  }}
                  className="w-full text-left bg-white bg-opacity-90 backdrop-blur-md text-gray-800 border border-blue-100 hover:bg-blue-50 transition-all duration-300 text-xs sm:text-sm whitespace-normal"
                >
                  6
                </Button>
              </div>
            </div>
          )}

          {currentStep === "eligibility_courses" && (
            <div className="mb-2 sm:mb-4 text-left w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%]">
              {/* Add input for subjects here if needed */}
            </div>
          )}

          <div ref={messagesEndRef} />

          {hasUserSentFirstMessage && !isLoading && (
            <div className="mb-2 sm:mb-4 text-center text-gray-400 text-xs sm:text-sm">
              Thank you! Let me know if you have any other queries regarding CUET (UG) or if I made a mistake.{" "}
              <a href="https://chat.whatsapp.com/H92LuwrK5ujH8ujiskzUvp" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                Join our WhatsApp Community for customer support.
              </a>
              <br />
              <span className="text-gray-600">
                Feel free to ask any other questions or interact with our AI Assistant!
              </span>
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center p-2 sm:p-4 bg-white bg-opacity-90 backdrop-blur-md shadow-md">
          <Input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isChatEnded ? "Chat has ended" : "Type a message..."}
            className="flex-grow rounded-lg border border-blue-200 px-2 py-1 sm:px-3 sm:py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 bg-white text-xs sm:text-sm"
            disabled={isChatEnded}
          />
          <Button
            type="submit"
            onClick={handleSubmitWithContext}
            className="ml-2 sm:ml-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-1 sm:p-2 shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={isLoading || isChatEnded}
          >
            {isLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Send className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
        </div>

        <div className="text-xs sm:text-sm text-center text-gray-400 p-2 sm:p-3 bg-white bg-opacity-90 backdrop-blur-md">
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
