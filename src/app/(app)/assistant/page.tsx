"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Terminal,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useCurrentUser } from "@/components/layout/UserContext";

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
  agentUrl: string;
  agentPath: string;
  model: string;
  availableApps: string[];
  latencyMs: number | null;
  fallbackAvailable: boolean;
  status: string;
}

export default function AssistantPage() {
  const currentUser = useCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("workpulse_agent_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // ignore
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

    refreshStatus();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("workpulse_agent_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const refreshStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      const res = await fetch("/api/v1/agent/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // offline
    } finally {
      setIsRefreshingStatus(false);
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
        text: data.reply || data.error || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: data.source || "sample_agent",
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: "agent",
        text: "Could not reach agent server or bridge. Check terminal or network.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
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
    "What are the shift grace and biometric attendance rules?",
    "How does the two-stage leave and WFH approval process work?",
    "How do SOD morning templates and task carryover work?",
    "What are the probation milestones and review criteria?",
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-cyan-500/20 border border-indigo-500/30 text-cyan-400 shadow-[0_0_25px_rgba(99,102,241,0.25)]">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                AI Pulse Assistant
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                Google ADK 2.8.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Integrated with <code className="font-mono text-cyan-400">sample_agent</code> at{" "}
              <span className="font-mono text-muted-foreground/90">C:\Users\Victus\sample_agent</span>
            </p>
          </div>
        </div>

        {/* Live Status Pill & Refresh */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-sm ${
              status?.connected
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                status?.connected ? "bg-emerald-400 animate-ping" : "bg-cyan-400"
              }`}
            />
            <span>{status?.status || "Checking ADK Server..."}</span>
            {status?.latencyMs !== null && status?.latencyMs !== undefined && (
              <span className="text-[10px] font-mono opacity-70">({status.latencyMs}ms)</span>
            )}
          </div>

          <button
            onClick={refreshStatus}
            disabled={isRefreshingStatus}
            title="Refresh Agent Server Status"
            className="p-2 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshingStatus ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Diagnostics / Right Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Diagnostics & Specs (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Agent Spec Card */}
          <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/60 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border/40 pb-3">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <span>Agent Specification</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Agent Name</span>
                <span className="font-mono font-medium text-foreground">root_agent</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">App Package</span>
                <span className="font-mono font-medium text-cyan-400">sample_agent</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Target Model</span>
                <span className="font-mono font-medium text-foreground">{status?.model || "gemini-3.5-flash"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">ADK Server URI</span>
                <span className="font-mono text-[11px] text-muted-foreground">{status?.agentUrl || "http://127.0.0.1:8000"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Local Path</span>
                <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[170px]" title="C:\Users\Victus\sample_agent">
                  ...\sample_agent
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-[11px] space-y-1 text-muted-foreground">
              <span className="font-semibold text-foreground block">Agent Instruction:</span>
              <p className="italic">"Answer user questions to the best of your knowledge"</p>
            </div>
          </div>

          {/* Quick Terminal Guide Card */}
          <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/60 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>CLI Runner Commands</span>
            </div>
            <p className="text-xs text-muted-foreground">
              To run the local ADK server with auto session creation:
            </p>
            <div className="p-2.5 rounded-xl bg-black/50 border border-border/60 text-[11px] font-mono text-cyan-300 select-all">
              npm run agent:serve
            </div>
            <p className="text-[11px] text-muted-foreground/80">
              Or run the terminal CLI directly:
            </p>
            <div className="p-2.5 rounded-xl bg-black/50 border border-border/60 text-[11px] font-mono text-cyan-300 select-all">
              npm run agent:run
            </div>
          </div>

          {/* Active User Context Card */}
          <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/60 shadow-lg space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Active Employee Context</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All agent requests automatically inject your verified employee credentials:
            </p>
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User:</span>
                <span className="font-medium text-foreground">{currentUser.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium text-cyan-400">{currentUser.primaryRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium text-foreground">{currentUser.department || "General"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Designation:</span>
                <span className="font-medium text-foreground">{currentUser.designation || "Staff"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full-Height Chat Console (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-[720px] rounded-3xl bg-card/70 backdrop-blur-2xl border border-border/80 shadow-2xl overflow-hidden">
          {/* Console Header */}
          <div className="px-6 py-4 border-b border-border/60 bg-muted/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Interactive Agent Conversation
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Session ID: {sessionId}
                </span>
              </div>
            </div>

            <button
              onClick={handleClearHistory}
              title="Clear Session History"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4">
                <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-500/20 border border-indigo-500/30 text-cyan-400 shadow-[0_0_35px_rgba(99,102,241,0.25)]">
                  <Sparkles className="h-8 w-8 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h4 className="font-bold text-base text-foreground">
                    WorkPulse AI Assistant is Ready
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    This assistant interacts directly with your Google ADK agent (<code className="font-mono text-cyan-400">sample_agent</code>). Ask any question or select a prompt below to begin:
                  </p>
                </div>

                {/* Quick Prompts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg pt-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-border/50 hover:border-cyan-500/40 text-xs text-foreground/90 transition-all duration-200 flex items-center justify-between group hover:shadow-lg hover:shadow-cyan-950/20"
                    >
                      <span className="leading-snug">{prompt}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity shrink-0 ml-2" />
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
                    className={`relative max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm group ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-indigo-600 to-cyan-600 text-white rounded-br-none"
                        : "bg-muted/60 border border-border/60 text-foreground rounded-bl-none backdrop-blur-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.sender === "agent" && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="absolute -top-2 -right-2 p-1.5 rounded-md bg-background/90 border border-border/60 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1 px-1">
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className="font-mono px-1 py-0.2 rounded bg-muted/40 border border-border/30 text-[9px]">
                        {msg.source}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-muted/40 border border-border/40 w-fit text-muted-foreground text-xs">
                <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                <span>root_agent is processing your request...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Console Input Bar */}
          <div className="p-4 border-t border-border/60 bg-muted/20 backdrop-blur-md">
            <div className="flex items-end gap-3 bg-background/90 border border-border/60 rounded-2xl p-2 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/40 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask sample_agent a question or give an instruction..."
                rows={2}
                className="flex-1 bg-transparent border-0 resize-none outline-none px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground max-h-32"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center gap-2 shrink-0"
              >
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground/60 px-2 pt-2">
              <span>Press Enter to send · Shift+Enter for newline</span>
              <span className="font-mono">WorkPulse Agent v0.1 · ADK 2.8.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
