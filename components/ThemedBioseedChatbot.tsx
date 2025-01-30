"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  Send,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  PlusCircle,
  History,
  User,
  AlertTriangle,
  Paperclip,
  Settings,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext"
import { Login } from "@/components/Login"
import { format } from "date-fns"

function BioseedChatbot() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [lastLogin, setLastLogin] = useState<Date | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesEndRef])

  const handleLogin = (username: string, password: string) => {
    setIsLoggedIn(true)
    setUsername(username)
    setLastLogin(new Date())
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername("")
    setLastLogin(null)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-72 glass-morphism rounded-r-3xl"
          >
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-8">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="url(#gradient)" />
                  <path
                    d="M8 12L11 15L16 9"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#22C55E" />
                      <stop offset="1" stopColor="#15803D" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-2xl font-bold gradient-text">Bioseed AI</span>
              </div>
              <nav>
                <ul className="space-y-4">
                  {[
                    { icon: PlusCircle, label: "New Chat" },
                    { icon: History, label: "Chat History" },
                    { icon: User, label: "About Me" },
                    { icon: AlertTriangle, label: "Report Error" },
                    { icon: Settings, label: "Settings" },
                  ].map(({ icon: Icon, label }) => (
                    <li key={label}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left font-normal hover:bg-primary/10"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="glass-morphism p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-primary/10"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="text-xl font-bold gradient-text">Bioseed Assistant</span>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-primary/10">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/10">
              <LogOut className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{username}</p>
                {lastLogin && (
                  <p className="text-xs text-muted-foreground">Last login: {format(lastLogin, "MMM d, HH:mm")}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 p-6 overflow-hidden">
          <Card className="h-full glass-morphism">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle>Chat with Bioseed AI</CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[calc(100%-8rem)]">
              <ScrollArea className="h-full pr-4">
                {messages.map((m, index) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        m.role === "user"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          : "glass-morphism"
                      }`}
                    >
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 glass-morphism mt-auto">
              <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about Bioseed operations..."
                  className="flex-grow rounded-full bg-white/50 dark:bg-gray-950/50"
                />
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <Button type="button" variant="outline" size="icon" onClick={handleFileUpload} className="rounded-full">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ThemedBioseedChatbot() {
  return (
    <ThemeProvider>
      <BioseedChatbot />
    </ThemeProvider>
  )
}

