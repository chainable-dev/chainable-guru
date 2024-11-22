'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GlobeIcon } from '@radix-ui/react-icons';
import { Paperclip } from 'react-feather';

export default function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [enableSearch, setEnableSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Handle file upload
      console.log('Files uploaded:', files);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const userMessage = { role: 'user', content: input };
      const updatedMessages = [...messages, userMessage];
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          enableSearch
        })
      });
      
      const data = await response.json();
      setMessages([...updatedMessages, data.message]);
      setInput('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="file-upload" className="cursor-pointer">
            <Paperclip className="text-gray-500" />
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            onClick={() => setEnableSearch(!enableSearch)}
            className={`p-2 ${enableSearch ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <GlobeIcon />
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
} 