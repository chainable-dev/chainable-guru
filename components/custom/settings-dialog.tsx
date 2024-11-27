"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useModelSettings } from "@/lib/store/model-settings";
import { useSettingsStore } from "@/lib/store/settings-store";
import { BetterTooltip } from "@/components/ui/tooltip";
import { SettingsIcon } from "./icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const modelSettings = useModelSettings();
  const { openAIKey, setOpenAIKey, clearOpenAIKey, isLocalhost } = useSettingsStore();

  // Tool-specific settings
  const [fileSystemEnabled, setFileSystemEnabled] = useState(true);
  const [allowedPaths, setAllowedPaths] = useState("/tmp,/downloads");
  const [databaseEnabled, setDatabaseEnabled] = useState(true);
  const [allowedTables, setAllowedTables] = useState("public.*");
  const [summaryMaxLength, setSummaryMaxLength] = useState(500);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (openAIKey && !openAIKey.startsWith('sk-')) {
      toast.error("OpenAI API key should start with 'sk-'");
      return;
    }

    // Save tool settings
    localStorage.setItem('tool-settings', JSON.stringify({
      fileSystem: {
        enabled: fileSystemEnabled,
        allowedPaths: allowedPaths.split(',').map(p => p.trim())
      },
      database: {
        enabled: databaseEnabled,
        allowedTables: allowedTables.split(',').map(t => t.trim())
      },
      summary: {
        maxLength: summaryMaxLength
      }
    }));

    toast.success("Settings saved successfully");
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
            <SettingsIcon className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </BetterTooltip>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="model">Model</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              {isLocalhost && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="openai-key"
                        type="password"
                        value={openAIKey}
                        onChange={(e) => setOpenAIKey(e.target.value)}
                        placeholder="sk-..."
                        className="font-mono flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleClear}
                        className="shrink-0"
                      >
                        Clear
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Override the default OpenAI API key (localhost only)
                    </p>
                  </div>
                  <Separator />
                </>
              )}
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              {/* File System Tool Settings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="filesystem-enabled">File System Access</Label>
                  <Switch
                    id="filesystem-enabled"
                    checked={fileSystemEnabled}
                    onCheckedChange={setFileSystemEnabled}
                  />
                </div>
                <Input
                  id="allowed-paths"
                  value={allowedPaths}
                  onChange={(e) => setAllowedPaths(e.target.value)}
                  placeholder="Comma-separated allowed paths"
                  disabled={!fileSystemEnabled}
                />
                <p className="text-sm text-muted-foreground">
                  Specify comma-separated paths that the file system tool can access
                </p>
              </div>

              <Separator />

              {/* Database Tool Settings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="database-enabled">Database Access</Label>
                  <Switch
                    id="database-enabled"
                    checked={databaseEnabled}
                    onCheckedChange={setDatabaseEnabled}
                  />
                </div>
                <Input
                  id="allowed-tables"
                  value={allowedTables}
                  onChange={(e) => setAllowedTables(e.target.value)}
                  placeholder="Comma-separated allowed tables"
                  disabled={!databaseEnabled}
                />
                <p className="text-sm text-muted-foreground">
                  Specify comma-separated tables that the database tool can access
                </p>
              </div>

              <Separator />

              {/* Summary Tool Settings */}
              <div className="space-y-2">
                <Label>Maximum Summary Length ({summaryMaxLength})</Label>
                <Slider
                  value={[summaryMaxLength]}
                  onValueChange={([value]) => setSummaryMaxLength(value)}
                  min={100}
                  max={2000}
                  step={100}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum length of generated summaries in characters
                </p>
              </div>
            </TabsContent>

            <TabsContent value="model" className="space-y-4">
              <div className="space-y-2">
                <Label>Temperature ({modelSettings.settings.temperature})</Label>
                <Slider
                  value={[modelSettings.settings.temperature]}
                  onValueChange={([value]) =>
                    modelSettings.updateSettings({ temperature: value })
                  }
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  value={modelSettings.settings.systemPrompt}
                  onChange={(e) =>
                    modelSettings.updateSettings({ systemPrompt: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 