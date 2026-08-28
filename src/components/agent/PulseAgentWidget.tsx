"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Trash2,
  Maximize2,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "../layout/UserContext";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  source?: string;
}

interface AgentStatus {
  connected: boolean;
  appName: string;
  model: string;
  status: string;
  fallbackAvailable: boolean;
}

export function PulseAgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  const currentUser = useCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize or restore session & status
  useEffect(() => {
    const saved = sessionStorage.getItem("workpulse_agent_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    }
    const savedSession = sessionStorage.getItem("workpulse_agent_session");
    if (savedSession) {
      setSessionId(savedSession);
    } else {
      const newSession = `wp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setSessionId(newSession);
      sessionStorage.setItem("workpulse_agent_session", newSession);
    }

    checkStatus();
  }, []);

  // Save messages to session storage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("workpulse_agent_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/v1/agent/status");
      if (res.ok) {
        const data = await res.json();
        setAgentStatus(data);
      }
    } catch {
      setAgentStatus({
        connected: false,
        appName: "sample_agent",
        model: "gemini-3.6-flash",
        status: "Checking status...",
        fallbackAvailable: true,
      });
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          sessionId,
        }),
      });

      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: `msg_agent_${Date.now()}`,
        sender: "agent",
        text: data.reply || data.error || "No response received from agent.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: data.source || "sample_agent",
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: "agent",
        text: "Could not reach agent bridge. Please make sure the ADK server is started or your connection is active.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    sessionStorage.removeItem("workpulse_agent_messages");
    const newSession = `wp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newSession);
    sessionStorage.setItem("workpulse_agent_session", newSession);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    "What are the shift grace & biometric rules?",
    "How does 2-stage leave approval work?",
    "How do SOD templates & carryover work?",
    "Explain 30/60/90-day probation milestones",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 150);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white shadow-[0_0_25px_rgba(99,102,241,0.45)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] hover:scale-105 transition-all duration-300 border border-white/20"
          >
            <div className="relative">
              <Bot className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-violet-900 animate-ping" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-violet-900" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Pulse Agent</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-300 opacity-80 group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[420px] h-[600px] max-h-[85vh] rounded-3xl bg-card/95 backdrop-blur-2xl border border-border/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-border/60 bg-muted/40 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Bot className="h-5 w-5" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ${
                    agentStatus?.connected ? "bg-emerald-400" : "bg-amber-400"
                  } ring-1 ring-background`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    WorkPulse AI Agent
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                    sample_agent
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      agentStatus?.connected ? "bg-emerald-400" : "bg-cyan-400"
                    }`}
                  />
                  <span>
                    {agentStatus?.connected ? "ADK Live Server" : "Direct Gemini Bridge"}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1">
              <Link
                href="/assistant"
                onClick={() => setIsOpen(false)}
                title="Open Full Screen Assistant"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <Maximize2 className="h-4 w-4" />
              </Link>
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* User Persona Context Banner */}
          <div className="px-4 py-1.5 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent border-b border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="truncate">
              Context: <strong className="text-cyan-400 font-medium">{currentUser.userName}</strong> ({currentUser.primaryRole})
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0">
              {currentUser.department || "General"}
            </span>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-cyan-500/10 to-transparent border border-indigo-500/30 text-cyan-400 shadow-[0_0_25px_rgba(99,102,241,0.2)]">
                  <Sparkles className="h-7 w-7 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-foreground">
                    How can I help you today?
                  </h4>
                  <p className="text-muted-foreground text-[11px] max-w-[280px]">
                    I am connected to your Google ADK agent (<code className="font-mono text-cyan-400">sample_agent</code>). Ask me about workdays, tasks, policies, or general questions!
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="w-full space-y-1.5 pt-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 text-left">
                    Suggested Prompts:
                  </p>
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/50 hover:border-cyan-500/40 text-[11px] text-foreground/90 transition-all duration-150 flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <Send className="h-3 w-3 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed shadow-sm group ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-indigo-600 to-cyan-600 text-white rounded-br-none"
                        : "bg-muted/60 border border-border/60 text-foreground rounded-bl-none backdrop-blur-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.sender === "agent" && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="absolute -top-2 -right-2 p-1 rounded-md bg-background/90 border border-border/60 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border/40 w-fit text-muted-foreground text-[11px]">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span>root_agent is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-border/60 bg-muted/20 backdrop-blur-md">
            <div className="flex items-end gap-2 bg-background/80 border border-border/60 rounded-2xl p-1.5 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/40 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask sample_agent a question..."
                rows={1}
                className="flex-1 bg-transparent border-0 resize-none outline-none px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground max-h-24"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 px-1 pt-1.5">
              <span>Enter to send · Shift+Enter for new line</span>
              <span className="font-mono">google-adk 2.8.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
