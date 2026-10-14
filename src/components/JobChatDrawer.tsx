import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Job } from '../types';
import { Send, X, MessageSquare, ShieldCheck, CheckCheck } from 'lucide-react';

interface JobChatDrawerProps {
  job: Job;
  onClose: () => void;
}

export const JobChatDrawer: React.FC<JobChatDrawerProps> = ({ job, onClose }) => {
  const { currentUser, messages, sendMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const jobMessages = messages.filter((m) => m.jobId === job.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [jobMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(job.id, inputText);
    setInputText('');
  };

  const isCustomer = currentUser?.role === 'customer';
  const partnerName = isCustomer ? (job.hiredProviderName || 'Contractor') : job.customerName;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between gap-4 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              {partnerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900">{partnerName}</h3>
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate max-w-xs">{job.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-neutral-50/50">
          <div className="text-center my-2">
            <span className="text-[11px] font-mono text-neutral-400 bg-white border border-neutral-200 px-2.5 py-1 rounded-full">
              Messages are encrypted & bound to Service Request #{job.id.slice(-6)}
            </span>
          </div>

          {jobMessages.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <span>No messages yet. Send a message to coordinate your on-site service!</span>
            </div>
          ) : (
            jobMessages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-neutral-400 mb-1 px-1">
                    {msg.senderName} ({msg.senderRole === 'customer' ? 'Customer' : 'Specialist'}) · {msg.createdAt}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            'Can you confirm arrival time?',
            'Where is the best place to park?',
            'I am on my way to your location.',
            'Materials and tools are ready.',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setInputText(chip)}
              className="text-[11px] text-neutral-600 hover:text-indigo-600 bg-neutral-100 hover:bg-indigo-50 border border-neutral-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-neutral-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message or coordination update..."
            className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
          <button
            type="submit"
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
