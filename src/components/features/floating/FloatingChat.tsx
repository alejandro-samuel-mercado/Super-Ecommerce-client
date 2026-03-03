"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/hooks/useSocket";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  text: string;
  sender: "USER" | "ADMIN" | "BOT";
  createdAt?: string;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "BOT",
      text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const socket = useSocket();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (!socket) return;
    const savedId = localStorage.getItem("chat_conversation_id");
    if (savedId) {
      socket.emit("resume_chat", { conversationId: parseInt(savedId) });
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    // Escuchar mensajes entrantes
    socket.on(
      "message_received",
      (msg: Message & { conversationId?: number }) => {
        setIsTyping(false);
        setMessages((prev) => [...prev, msg]);

        // Guardar ID si se proporciona (desde la primera respuesta del bot, etc.)
        if (msg.conversationId) {
          localStorage.setItem(
            "chat_conversation_id",
            msg.conversationId.toString(),
          );
        }
      },
    );

    socket.on(
      "chat_history",
      (data: { conversationId: number | null; messages: Message[] }) => {
        if (data.conversationId) {
          setMessages(data.messages);
          localStorage.setItem(
            "chat_conversation_id",
            data.conversationId.toString(),
          );
        } else {
          localStorage.removeItem("chat_conversation_id");
        }
      },
    );

    socket.on("display_typing", (data: { sender: string }) => {
      if (data.sender === "ADMIN") setIsTyping(true);
    });
    socket.on("hide_typing", () => setIsTyping(false));

    return () => {
      socket.off("message_received");
      socket.off("chat_history");
      socket.off("display_typing");
      socket.off("hide_typing");
    };
  }, [socket]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;

    // Actualización optimista
    setMessages((prev) => [...prev, { sender: "USER", text: input }]);

    socket.emit("client_message", { text: input });

    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[360px] h-[520px] bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Fondo decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10"></div>

            {/* Header*/}
            <div className="p-5 bg-gradient-to-r from-primary/90 to-purple-600/90 backdrop-blur-md text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-full shadow-inner border border-white/10">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    Asistente Virtual
                  </h3>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                    <p className="text-xs font-medium">En línea</p>
                  </div>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full h-8 w-8 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mensajes */}
            <div
              className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50"
              ref={scrollRef}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 px-4 text-sm leading-relaxed shadow-sm ${
                      msg.sender === "USER"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                        : msg.sender === "ADMIN"
                          ? "bg-purple-300/90 text-foreground border border-purple-200 shadow-purple-100 rounded-2xl rounded-tl-sm ring-1 ring-secondary/10"
                          : "bg-gray-300/90 text-foreground border border-slate-200 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {msg.sender === "ADMIN" && (
                      <span className="block text-[10px] font-bold text-purple-600 mb-1 uppercase tracking-wider">
                        Agente
                      </span>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Indicador de typing */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200/80 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 bg-gray-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0.2,
                      }}
                      className="w-2 h-2 bg-gray-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0.4,
                      }}
                      className="w-2 h-2 bg-gray-500 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100">
              <form
                className="flex gap-2 relative bg-slate-100 rounded-full p-1 pl-4  transition-all"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <Input
                  className=" bg-gray-200 border-2 border-secondary  focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground/70 pl-2"
                  placeholder="Escribe tu consulta..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button
                  size="icon"
                  type="submit"
                  className="rounded-full h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0"
                  disabled={!input.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        className="rounded-full h-14 w-14 shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-gradient-to-tr from-primary to-purple-600 hover:scale-110 hover:shadow-primary/40 transition-all duration-300 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare className="w-7 h-7 text-white" />
     
      </Button>
    </div>
  );
}
