'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function MultimodalInput() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [enableAttachments, setEnableAttachments] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachments(Array.from(event.target.files));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('message', input);
      attachments.forEach((file, index) => {
        formData.append(`attachment${index}`, file);
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setMessages([...messages, { role: 'user', content: input }, data.message]);
      setInput('');
      setAttachments([]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <Switch
          checked={enableAttachments}
          onCheckedChange={setEnableAttachments}
        />
        <span>Enable Attachments</span>
      </div>

      {enableAttachments && (
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-4"
        />
      )}

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

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
} 