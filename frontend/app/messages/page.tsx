"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Send, Phone, Video, MoreVertical, Search, CheckCheck, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { socket } from '@/utils/socket';

function MessagesContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Connect socket and register listener
  useEffect(() => {
    if (!user) return;
    
    if (!socket.connected) {
      socket.auth = { token: user.token };
      socket.connect();
    }
    socket.emit('join', user.id);
    
    const handleReceiveMessage = (msg: any) => {
      // If we are currently viewing the chat with the person the message is exchanged with
      if (
        (msg.senderId === activeContactId && msg.receiverId === user.id) ||
        (msg.receiverId === activeContactId && msg.senderId === user.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      } else if (msg.senderId !== user.id) {
        // Find if contact exists and update its unread count and latest message
        setContacts((prevContacts) => {
          const contactIndex = prevContacts.findIndex(c => c.id === msg.senderId);
          if (contactIndex > -1) {
            const updated = [...prevContacts];
            updated[contactIndex].unread = (updated[contactIndex].unread || 0) + 1;
            updated[contactIndex].lastMessage = msg.message;
            updated[contactIndex].lastMessageTime = msg.createdAt;
            return updated;
          } else {
            // Need to fetch user details to add to contacts
            fetchNewContact(msg.senderId);
            return prevContacts;
          }
        });
      }
    };
    
    socket.on('receive_message', handleReceiveMessage);
    
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [user, activeContactId]);
  
  const fetchNewContact = async (userId: number, selectAfter = false) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/user/${userId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setContacts(prev => {
          if (!prev.find(c => c.id === userData.id)) {
            return [{
              id: userData.id,
              name: userData.name,
              avatar: userData.profileImage,
              role: userData.role,
              lastMessage: '',
              lastMessageTime: new Date().toISOString(),
              unread: 0
            }, ...prev];
          }
          return prev;
        });
        if (selectAfter) {
          setActiveContactId(userData.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_BASE_URL}/messages/contacts`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
          
          // Check URL for target user
          const targetUserId = searchParams.get('userId');
          if (targetUserId) {
            const targetIdInt = parseInt(targetUserId);
            if (!data.find((c: any) => c.id === targetIdInt)) {
              // Not in contacts, fetch details
              fetchNewContact(targetIdInt, true);
            } else {
              setActiveContactId(targetIdInt);
            }
          } else if (data.length > 0) {
            setActiveContactId(data[0].id);
          }
        }
      } catch (err) {
        showToast('Error loading contacts', 'error');
      } finally {
        setIsLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [user]);

  // Load messages when active contact changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !activeContactId) return;
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`${API_BASE_URL}/messages/${activeContactId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          
          // Reset unread count for this contact
          setContacts(prev => prev.map(c => 
            c.id === activeContactId ? { ...c, unread: 0 } : c
          ));
        }
      } catch (err) {
        showToast('Error loading messages', 'error');
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeContactId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContactId || !user) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          receiverId: activeContactId,
          message: messageText
        })
      });
      
      if (!res.ok) {
         showToast('Failed to send message', 'error');
         setNewMessage(messageText); // restore text on failure
      } else {
         const updatedContacts = contacts.map(c => {
           if (c.id === activeContactId) {
             return { ...c, lastMessage: messageText, lastMessageTime: new Date().toISOString() };
           }
           return c;
         });
         // Sort to put this contact at the top
         updatedContacts.sort((a, b) => b.id === activeContactId ? 1 : a.id === activeContactId ? -1 : 0);
         setContacts(updatedContacts);
      }
    } catch (err) {
       showToast('Network error', 'error');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoStr: string) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading || (!user && !loading)) return <div className="p-20 text-center animate-pulse">Loading Messages...</div>;

  const activeContact = contacts.find(c => c.id === activeContactId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="glass border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-1 shadow-2xl">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white/50 dark:bg-slate-900/50">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Messages</h1>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-3">
            {isLoadingContacts ? (
               <div className="text-center p-4 text-sm text-slate-500">Loading contacts...</div>
            ) : contacts.length === 0 ? (
               <div className="text-center p-4 text-sm text-slate-500">No conversations yet.</div>
            ) : (
              contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  onClick={() => setActiveContactId(contact.id)}
                  className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors mb-1 ${activeContactId === contact.id ? 'bg-[#FDFCF5] dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg border-2 border-slate-100 dark:border-slate-800">
                      {contact.avatar ? (
                         <img src={contact.avatar} className="w-full h-full object-cover" alt={contact.name} />
                      ) : (
                         contact.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`font-semibold truncate ${activeContactId === contact.id ? 'text-blue-700 dark:text-accent-amber' : 'text-slate-900 dark:text-white'}`}>{contact.name}</h4>
                      <span className="text-xs text-slate-400 shrink-0 ml-2">{formatTime(contact.lastMessageTime)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate ${contact.unread > 0 ? 'font-semibold text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {contact.lastMessage || 'Connected'}
                      </p>
                      {contact.unread > 0 && (
                        <span className="shrink-0 ml-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-col flex-1 bg-slate-50 dark:bg-slate-950">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                     {activeContact.avatar ? (
                        <img src={activeContact.avatar} className="w-full h-full object-cover" alt={activeContact.name} />
                     ) : (
                        activeContact.name.charAt(0).toUpperCase()
                     )}
                   </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{activeContact.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{activeContact.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 text-slate-400 hover:text-primary dark:hover:text-accent-amber transition"><Phone className="w-5 h-5" /></button>
                  <button className="p-2 text-slate-400 hover:text-primary dark:hover:text-accent-amber transition"><Video className="w-5 h-5" /></button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoadingMessages ? (
                  <div className="text-center p-4 text-sm text-slate-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center p-10 text-sm text-slate-500">Send a message to start the conversation!</div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700/50 rounded-bl-sm shadow-sm'}`}>
                          <p className="text-[15px]">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[11px] text-slate-400">{formatTime(msg.createdAt)}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-primary-light" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..." 
                    disabled={sending}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-6 py-3.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                  <button type="submit" disabled={sending || !newMessage.trim()} className="btn-primary p-3.5 rounded-full shrink-0 flex items-center justify-center disabled:opacity-50 disabled:scale-100">
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
               <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
               <p>Select a contact to view your conversation.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center animate-pulse">Loading Messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
