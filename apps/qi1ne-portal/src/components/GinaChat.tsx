import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Avatar, Input, Button, ScrollShadow, Chip } from "@heroui/react";
import { Send, Bot, User, MessageCircle, X, Minimize2 } from "lucide-react";
import { useGina } from '../hooks/useGina';
import { motion, AnimatePresence } from "framer-motion";

export const GinaChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, isThinking } = useGina();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <Card className="w-[380px] h-[500px] shadow-2xl border-small border-white/20 bg-background/60 backdrop-blur-md">
              <CardHeader className="flex justify-between items-center border-b border-divider px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar icon={<Bot size={20}/>} className="bg-primary text-white w-8 h-8" />
                  <div>
                    <p className="text-sm font-bold tracking-tight">GINA Agent</p>
                    <p className="text-[10px] text-success">Online & System-Ready</p>
                  </div>
                </div>
                <Button isIconOnly variant="light" size="sm" onClick={() => setIsOpen(false)}>
                  <Minimize2 size={18} />
                </Button>
              </CardHeader>

              <CardBody>
                <ScrollShadow className="flex flex-col gap-4 h-full pr-2">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar
                        size="sm"
                        icon={m.role === 'user' ? <User size={14}/> : <Bot size={14}/>}
                        className={m.role === 'user' ? "bg-secondary" : "bg-primary"}
                      />
                      <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${
                        m.role === 'user'
                          ? 'bg-secondary text-secondary-foreground rounded-tr-none'
                          : 'bg-content2 text-foreground rounded-tl-none border-small border-white/10'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex gap-2">
                      <Avatar size="sm" icon={<Bot size={14}/>} className="bg-primary animate-pulse" />
                      <Chip variant="dot" color="primary" className="border-none bg-content2">GINA is thinking...</Chip>
                    </div>
                  )}
                </ScrollShadow>
              </CardBody>

              <CardFooter className="p-3 pt-0">
                <form
                  className="flex w-full gap-2"
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input); setInput(""); }}
                >
                  <Input
                    placeholder="Ask GINA anything..."
                    size="sm"
                    variant="flat"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow"
                  />
                  <Button isIconOnly color="primary" size="sm" type="submit">
                    <Send size={16} />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        isIconOnly
        className="w-14 h-14 rounded-full shadow-lg bg-primary text-white hover:scale-110 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>
    </div>
  );
};