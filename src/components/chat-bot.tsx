"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import {
  Bot,
  ExternalLink,
  Lightbulb,
  Loader2,
  MessageCircle,
  Send,
  User,
  X,
} from "lucide-react";

import { searchProjectSolutions } from "@/actions/project-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  projects?: { id: string; title: string; slug: string; description: string }[];
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hi! I'm your Project Scout. Tell me about a problem you're trying to solve, and I'll find building logs or projects that can help!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const result = await searchProjectSolutions(input);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text:
          result.success && result.data && result.data.length > 0
            ? `I found ${result.data.length} projects that might solve your problem!`
            : "I couldn't find a specific project matching that exact problem, but you might want to explore our categories for inspiration.",
        projects: result.success ? result.data : [],
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: "I'm having a bit of trouble searching right now. Try again in a moment!",
        },
      ]);
    }
  };

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <Card className="border-primary/20 bg-background/95 mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden py-0 shadow-2xl backdrop-blur-md sm:w-[400px]">
          {/* Header */}
          <div className="bg-primary text-primary-foreground flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/20 p-1.5">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Project Scout AI</h3>
                <p className="text-[10px] opacity-70">Always online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground h-8 w-8 hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto scroll-smooth p-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border"
                  )}
                >
                  {msg.sender === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className="flex max-w-[80%] flex-col gap-2">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm shadow-sm",
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted/50 text-foreground rounded-tl-none border"
                    )}
                  >
                    {msg.text}
                  </div>

                  {/* Project Cards in Chat */}
                  {msg.projects && msg.projects.length > 0 && (
                    <div className="mt-2 grid gap-2">
                      {msg.projects.map((proj) => (
                        <Link
                          key={proj.id}
                          href={`/projects/${proj.slug}`}
                          className="group bg-background hover:border-primary/50 block rounded-xl border p-3 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="group-hover:text-primary text-xs font-bold transition-colors">
                              {proj.title}
                            </h4>
                            <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <p className="text-muted-foreground mt-1 line-clamp-2 text-[10px]">
                            {proj.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted/30 flex gap-1 rounded-2xl rounded-tl-none border px-4 py-3">
                  <div className="bg-muted-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full" />
                  <div className="bg-muted-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0.2s]" />
                  <div className="bg-muted-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="bg-muted/20 border-t p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Describe your problem..."
                className="bg-background border-primary/10 focus:ring-primary/20 w-full rounded-full border py-2.5 pr-12 pl-4 text-sm transition-all focus:ring-2 focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                className="absolute top-1 right-1 h-8 w-8 rounded-full shadow-lg"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1 text-center text-[9px]">
              <Lightbulb className="h-2.5 w-2.5 text-amber-500" />
              Try: &quot;I need a way to track inventory&quot; or
              &quot;Dashboard for react&quot;
            </p>
          </form>
        </Card>
      )}

      {/* Launcher Bubble */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110",
          isOpen
            ? "bg-destructive hover:bg-destructive/90 rotate-90"
            : "bg-primary hover:shadow-primary/40"
        )}
      >
        {isOpen ? (
          <X className="h-7 w-7" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
            </span>
          </div>
        )}
      </Button>
    </div>
  );
}
