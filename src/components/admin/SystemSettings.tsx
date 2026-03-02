import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Settings, FileText, Brain, Zap, Crown, 
  Bell, ShieldAlert, Trophy, Construction
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsTab } from "./types";

export const SystemSettings = () => {
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("general");

  const settingsCategories: { id: SettingsTab; label: string; icon: any; description: string }[] = [
    { id: "general", label: "General Settings", icon: Settings, description: "App name, version, and maintenance mode." },
    { id: "quiz", label: "Quiz & Exams", icon: FileText, description: "Difficulty, randomization, and score thresholds." },
    { id: "adaptive", label: "Adaptive Learning", icon: Brain, description: "Weak topic prioritization and review intervals." },
    { id: "ai", label: "AI Controls", icon: Zap, description: "Generation limits, temperature, and quotas." },
    { id: "subscription", label: "Subscriptions", icon: Crown, description: "Pricing plans, trials, and premium limits." },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Reminders, alerts, and broadcast schedules." },
    { id: "security", label: "Security & Roles", icon: ShieldAlert, description: "Permissions, timeouts, and login limits." },
    { id: "gamification", label: "Gamification", icon: Trophy, description: "XP rules, badges, and leaderboard resets." },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {settingsCategories.map((cat) => (
          <Card 
            key={cat.id} 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md border-2",
              activeSettingsTab === cat.id ? "border-primary bg-primary/5" : "border-transparent"
            )}
            onClick={() => setActiveSettingsTab(cat.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  activeSettingsTab === cat.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  <cat.icon className="w-4 h-4" />
                </div>
                <p className="font-semibold text-sm">{cat.label}</p>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{settingsCategories.find(c => c.id === activeSettingsTab)?.label}</CardTitle>
              <CardDescription>Configure the {activeSettingsTab} parameters of your platform.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Reset to Default</Button>
              <Button size="sm">Save Changes</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {activeSettingsTab === "general" && (
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">App Name</label>
                  <Input defaultValue="CSE Arena" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">System Version</label>
                  <Input defaultValue="v1.1.0" disabled />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-red-900">Maintenance Mode</p>
                  <p className="text-xs text-red-700">Disable all user access for system updates.</p>
                </div>
                <div className="h-6 w-11 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Language</label>
                  <select className="w-full bg-background border rounded-md px-3 py-2 text-sm">
                    <option>English</option>
                    <option>Filipino</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <select className="w-full bg-background border rounded-md px-3 py-2 text-sm">
                    <option>Asia/Manila (GMT+8)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === "ai" && (
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Generation Limit</label>
                  <Input type="number" defaultValue="5000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Per-User AI Quota</label>
                  <Input type="number" defaultValue="20" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Model Temperature</span>
                    <span className="font-mono">0.7</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[70%]" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-amber-900">Emergency AI Kill-switch</p>
                  <p className="text-xs text-amber-700">Instantly disable all AI features to save costs.</p>
                </div>
                <Button variant="destructive" size="sm">Disable AI</Button>
              </div>
            </div>
          )}

          {activeSettingsTab === "quiz" && (
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Difficulty</label>
                  <select className="w-full bg-background border rounded-md px-3 py-2 text-sm">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Passing Score (%)</label>
                  <Input type="number" defaultValue="75" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Randomize Questions</p>
                    <p className="text-xs text-muted-foreground">Shuffle question order for every attempt.</p>
                  </div>
                  <div className="h-6 w-11 bg-indigo-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-display Explanations</p>
                    <p className="text-xs text-muted-foreground">Show explanation immediately after answering.</p>
                  </div>
                  <div className="h-6 w-11 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === "subscription" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-indigo-100 bg-indigo-50/30">
                  <CardHeader>
                    <CardTitle className="text-sm">Free Plan Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Daily Quizzes</label>
                      <Input type="number" defaultValue="3" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">AI Explanations</label>
                      <Input type="number" defaultValue="5" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-amber-100 bg-amber-50/30">
                  <CardHeader>
                    <CardTitle className="text-sm">Premium Pricing (Monthly)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Price (PHP)</label>
                      <Input type="number" defaultValue="299" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Trial Duration (Days)</label>
                      <Input type="number" defaultValue="7" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSettingsTab !== "general" && activeSettingsTab !== "ai" && activeSettingsTab !== "quiz" && activeSettingsTab !== "subscription" && (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
              <Construction className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="font-semibold text-slate-900">Settings Section Coming Soon</h3>
              <p className="text-sm text-slate-500 max-w-xs">
                The detailed configuration for {activeSettingsTab} is currently being implemented.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
