"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Send,
  MessageCircle,
  Users,
  Smile,
  Paperclip,
} from "lucide-react";
import { messagesApi, clientsApi } from "../services/api";
import LoadingScreen from "../components/LoadingScreen";

const Messages = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  // Carica le conversazioni
  const fetchConversations = async () => {
    try {
      console.log("Fetching conversations...");
      const response = await messagesApi.getConversations(currentUser.id);
      console.log("Conversations response:", response.data);
      setConversations(response.data || []);

      const clientId = searchParams.get("clientId");
      console.log("ClientId from URL:", clientId);
      if (clientId) {
        await handleClientIdFromParams(
          Number.parseInt(clientId),
          response.data || []
        );
      }
    } catch (error) {
      console.error("Errore nel caricamento delle conversazioni:", error);
      toast({
        title: "❌ Errore",
        description: "Impossibile caricare le conversazioni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientIdFromParams = async (clientId, existingConversations) => {
    try {
      console.log("Handling clientId:", clientId);
      const clientResponse = await clientsApi.getById(clientId);
      console.log("Client response:", clientResponse.data);
      const client = clientResponse.data;

      if (client && client.user) {
        console.log("Client user data:", client.user);
        const existingConversation = existingConversations.find(
          (conv) => conv.user.id === client.user.id
        );
        console.log("Existing conversation:", existingConversation);

        if (existingConversation) {
          console.log("Using existing conversation");
          setSelectedConversation(existingConversation);
        } else {
          console.log("Creating new conversation");
          const newConversation = {
            user: {
              id: client.user.id,
              name: client.user.name,
              email: client.user.email,
              avatar: client.user.avatar,
            },
            lastMessage: null,
            unreadCount: 0,
          };
          console.log("New conversation:", newConversation);
          setSelectedConversation(newConversation);
          setMessages([]);
        }
      } else {
        console.log("No client or user data found");
      }
    } catch (error) {
      console.error("Errore nel caricamento dei dati del cliente:", error);
      toast({
        title: "❌ Errore",
        description: "Impossibile caricare i dati del cliente",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (userId) => {
    try {
      console.log("Fetching messages for user:", userId);
      const response = await messagesApi.getConversation(userId);
      console.log("Messages response:", response.data);
      setMessages(response.data || []);
      scrollToBottom();
    } catch (error) {
      console.error("Errore nel caricamento dei messaggi:", error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) {
      return;
    }

    setSendingMessage(true);
    try {
      const response = await messagesApi.sendMessage({
        receiverId: selectedConversation.user.id,
        content: newMessage.trim(),
      });

      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      await fetchConversations();
      scrollToBottom();

      toast({
        title: "✅ Messaggio inviato",
        description: "Il tuo messaggio è stato inviato con successo",
      });
    } catch (error) {
      console.error("Errore nell'invio del messaggio:", error);
      toast({
        title: "❌ Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("it-IT", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser, searchParams]);

  useEffect(() => {
    const handleRead = async () => {
      try {
        await messagesApi.markAsRead(selectedConversation.user.id);
        // Dopo averli segnati come letti, ricarichi le conversazioni per aggiornare il conteggio
        await fetchConversations();
      } catch (err) {
        console.error("Errore nel marcare i messaggi come letti:", err);
      }
    };

    if (selectedConversation) {
      fetchMessages(selectedConversation.user.id);
      handleRead();
    }
  }, [selectedConversation]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header colorato */}
      <div className="bg-gradient-to-r from-pink-500 to-blue-600 dark:from-pink-600 dark:to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold  flex items-center gap-3">
          💬 Messaggi
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Lista Conversazioni */}
        <Card className="lg:col-span-1 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              💬 Conversazioni
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
              <Input
                placeholder="Cerca conversazioni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {selectedConversation &&
                !filteredConversations.find(
                  (conv) => conv.user.id === selectedConversation.user.id
                ) && (
                  <div
                    className="p-4 cursor-pointer bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-b transition-all duration-200 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/40 dark:hover:to-purple-800/40"
                    onClick={() =>
                      setSelectedConversation(selectedConversation)
                    }
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                        <AvatarImage
                          src={
                            selectedConversation.user.avatar
                              ? selectedConversation.user.avatar.startsWith(
                                  "http"
                                )
                                ? selectedConversation.user.avatar
                                : `http://localhost:3000/${selectedConversation.user.avatar.replace(
                                    /^\/+/,
                                    ""
                                  )}`
                              : "/placeholder.svg"
                          }
                          alt={selectedConversation.user.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                          {selectedConversation.user.name
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-gray-800 dark:text-gray-200">
                          {selectedConversation.user.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {messages.length > 0
                            ? messages[messages.length - 1].content
                            : "Inizia una nuova conversazione"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {filteredConversations.length === 0 && !selectedConversation ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nessuna conversazione</p>
                  <p className="text-sm">
                    Le tue conversazioni appariranno qui
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.user.id}
                    className={`p-4 cursor-pointer border-b transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 ${
                      selectedConversation?.user.id === conversation.user.id
                        ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40"
                        : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                        <AvatarImage
                          src={
                            conversation.user.avatar
                              ? conversation.user.avatar.startsWith("http")
                                ? conversation.user.avatar
                                : `http://localhost:3000/${conversation.user.avatar.replace(
                                    /^\/+/,
                                    ""
                                  )}`
                              : "/placeholder.svg"
                          }
                          alt={conversation.user.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                          {conversation.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate text-gray-800 dark:text-gray-200">
                            {conversation.user.name}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatMessageTime(
                            conversation.lastMessage.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Area Chat */}
        <Card className="lg:col-span-2 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                    <AvatarImage
                      src={
                        selectedConversation.user.avatar
                          ? selectedConversation.user.avatar.startsWith("http")
                            ? selectedConversation.user.avatar
                            : `http://localhost:3000/${selectedConversation.user.avatar.replace(
                                /^\/+/,
                                ""
                              )}`
                          : "/placeholder.svg"
                      }
                      alt={selectedConversation.user.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                      {selectedConversation.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-white">
                      {selectedConversation.user.name}
                    </CardTitle>
                    <p className="text-sm text-blue-100 dark:text-blue-200">
                      {selectedConversation.user.email}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-100 dark:text-blue-200">
                      Online
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex flex-col h-[calc(100vh-300px)]">
                {/* Messaggi */}
                <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                        <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">
                          Nessun messaggio ancora
                        </p>
                        <p className="text-sm">
                          Invia il primo messaggio per iniziare la conversazione
                          🚀
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMine = message.senderId === currentUser.id;
                        const sender = isMine
                          ? currentUser
                          : selectedConversation.user;

                        return (
                          <div
                            key={message.id}
                            className={`flex items-end gap-2 ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isMine && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={
                                    sender.avatar
                                      ? sender.avatar.startsWith("http")
                                        ? sender.avatar
                                        : `http://localhost:3000/${sender.avatar.replace(
                                            /^\/+/,
                                            ""
                                          )}`
                                      : "/placeholder.svg"
                                  }
                                  alt={sender.name}
                                />
                                <AvatarFallback>
                                  {sender.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md ${
                                isMine
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.content}
                              </p>
                              <p
                                className={`text-xs mt-2 ${
                                  isMine
                                    ? "text-blue-100"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <Separator />

                {/* Input Messaggio */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div className="flex gap-3">
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Textarea
                      placeholder="Scrivi un messaggio... 💭"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[60px] resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                      disabled={sendingMessage}
                    />
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      size="icon"
                      className="h-[60px] w-[60px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-20 w-20 mx-auto mb-6 opacity-50" />
                <h3 className="text-xl font-medium mb-2">
                  Seleziona una conversazione
                </h3>
                <p>
                  Scegli una conversazione dalla lista per iniziare a chattare
                  💬
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
