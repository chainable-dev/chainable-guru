"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useModelSettings } from "@/lib/store/model-settings";
import { useSettingsStore } from "@/lib/store/settings-store";
import { BetterTooltip } from "@/components/ui/tooltip";

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const modelSettings = useModelSettings();
  const { openAIKey, setOpenAIKey, clearOpenAIKey } = useSettingsStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OpenAI key format
    if (openAIKey && !openAIKey.startsWith('sk-')) {
      toast.error("OpenAI API key should start with 'sk-'");
      return;
    }

    // Save and provide feedback
    toast.success(
      openAIKey 
        ? "Custom OpenAI API key has been saved"
        : "Using default API key"
    );
    
    setIsOpen(false);
  };

  const handleClear = () => {
    clearOpenAIKey();
    toast.success("API key cleared - using default key");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <BetterTooltip content="Settings">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings2 className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </BetterTooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <Input
              id="openai-key"
              type="password"
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="sk-..."
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Enter your OpenAI API key to use your own account. Leave empty to use the default key.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Model Settings</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Temperature ({modelSettings.settings.temperature})</Label>
                <Slider 
                  min={0} 
                  max={2} 
                  step={0.1}
                  value={[modelSettings.settings.temperature]}
                  onValueChange={([value]) => modelSettings.updateSettings({ temperature: value })}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values make the output more random, lower values make it more focused and deterministic.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Top K ({modelSettings.settings.topK})</Label>
                <Slider 
                  min={1} 
                  max={100}
                  value={[modelSettings.settings.topK]}
                  onValueChange={([value]) => modelSettings.updateSettings({ topK: value })}
                />
                <p className="text-xs text-muted-foreground">
                  The number of highest probability vocabulary tokens to keep for top-k filtering.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Top P ({modelSettings.settings.topP})</Label>
                <Slider 
                  min={0} 
                  max={1} 
                  step={0.1}
                  value={[modelSettings.settings.topP]}
                  onValueChange={([value]) => modelSettings.updateSettings({ topP: value })}
                />
                <p className="text-xs text-muted-foreground">
                  The cumulative probability for top-p filtering. Lower values = more focused, higher values = more creative.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Repeat Penalty ({modelSettings.settings.repeatPenalty})</Label>
                <Slider 
                  min={1} 
                  max={2} 
                  step={0.1}
                  value={[modelSettings.settings.repeatPenalty]}
                  onValueChange={([value]) => modelSettings.updateSettings({ repeatPenalty: value })}
                />
                <p className="text-xs text-muted-foreground">
                  How strongly to penalize repetitions. A higher value (e.g., 1.5) will penalize repetitions more strongly.
                </p>
              </div>

              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea 
                  value={modelSettings.settings.systemPrompt}
                  onChange={(e) => modelSettings.updateSettings({ systemPrompt: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The system prompt that sets the behavior and capabilities of the AI assistant.
                </p>
              </div>

              <Button 
                type="button"
                variant="outline" 
                onClick={modelSettings.resetSettings}
                className="w-full"
              >
                Reset to Defaults
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            {openAIKey && (
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear API Key
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 