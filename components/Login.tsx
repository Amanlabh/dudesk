"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/contexts/ThemeContext"

interface LoginProps {
  onLogin: (username: string, password: string) => void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onLogin(username, password)
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-96 glass-morphism">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center gradient-text">Welcome to Bioseed AI</CardTitle>
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            >
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-full bg-white/50 dark:bg-gray-950/50 border-green-300 dark:border-green-700 focus:ring-green-500"
                    required
                  />
                </motion.div>
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-full bg-white/50 dark:bg-gray-950/50 border-green-300 dark:border-green-700 focus:ring-green-500"
                    required
                  />
                </motion.div>
              </div>
              <CardFooter className="flex justify-center mt-6">
                <motion.div
                  className="w-full"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
                  </Button>
                </motion.div>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

