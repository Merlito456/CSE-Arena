import { useState, useEffect } from "react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { BookOpenCheck, ArrowRight, AlertCircle, Shield, UserPlus, LogIn, Check, Clock, X } from "lucide-react";
import { storageService } from "@/services/storageService";
import { motion, AnimatePresence } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface LoginViewProps {
  onLogin: (user: any, isAdmin?: boolean) => void;
}

interface RecentAccount {
  id: string;
  name: string;
  lastLogin: number;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [recentAccounts, setRecentAccounts] = useState<RecentAccount[]>([]);
  
  // Registration State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [generatedId, setGeneratedId] = useState("");

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPass, setAdminPass] = useState("");

  useEffect(() => {
    const storedAccounts = localStorage.getItem("cse_recent_accounts");
    if (storedAccounts) {
      try {
        setRecentAccounts(JSON.parse(storedAccounts));
      } catch (e) {
        console.error("Failed to parse recent accounts", e);
      }
    }
  }, []);

  const saveRecentAccount = (user: any) => {
    if (!user || !user.id || user.id === "ADMIN") return;
    
    const newAccount: RecentAccount = {
      id: user.id,
      name: user.name || "User",
      lastLogin: Date.now()
    };

    setRecentAccounts(prev => {
      const filtered = prev.filter(acc => acc.id !== newAccount.id);
      const updated = [newAccount, ...filtered].slice(0, 3); // Keep top 3
      localStorage.setItem("cse_recent_accounts", JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentAccount = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentAccounts(prev => {
      const updated = prev.filter(acc => acc.id !== accountId);
      localStorage.setItem("cse_recent_accounts", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isAdminMode) {
      if (adminPass === "07141994") {
        onLogin("ADMIN", true);
      } else {
        setError("Invalid admin password.");
      }
      return;
    }

    if (!id) {
      setError("Please enter your Reviewer ID.");
      return;
    }

    try {
      // Database login check
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        const user = await res.json();
        saveRecentAccount(user);
        onLogin(user);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Login failed. Check your ID.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection error. Please try again.");
    }
  };

  const handleRecentLogin = async (accountId: string) => {
    setId(accountId);
    setError("");
    
    if (accountId === "GUEST") {
      onLogin({ id: "GUEST", name: "GUEST USER", email: "guest@example.com" });
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: accountId }),
      });

      if (res.ok) {
        const user = await res.json();
        saveRecentAccount(user);
        onLogin(user);
      } else {
        setError("Login failed. Check your ID.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection error. Please try again.");
    }
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!regName.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Generate ID
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newId = `CSE-${randomPart}`;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: newId, name: regName, email: regEmail }),
      });

      if (res.ok) {
        const newUser = await res.json();
        setGeneratedId(newId);
        setId(newId); // Auto-fill login
        saveRecentAccount(newUser);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Connection error. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setId(value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-2">
            <BookOpenCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CSE Arena</h1>
          <p className="text-muted-foreground">
            {isAdminMode ? "Admin Access Portal" : "Your personal review companion"}
          </p>
        </div>

        <Card className="border-2 shadow-lg overflow-hidden">
          {isAdminMode ? (
            <div className="bg-destructive/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-destructive">
                  <Shield className="w-5 h-5" /> Admin Login
                </h2>
                <Button variant="ghost" size="sm" onClick={() => { setIsAdminMode(false); setError(""); }}>
                  Cancel
                </Button>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-pass">Password</Label>
                  <Input
                    id="admin-pass"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPass}
                    onChange={(e) => { setAdminPass(e.target.value); setError(""); }}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
                <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90">
                  Access Portal
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b px-6 pt-2">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="pt-6">
                <TabsContent value="login" className="mt-0 space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reviewer-id">Reviewer ID</Label>
                      <Input
                        id="reviewer-id"
                        placeholder="CSE-XXXXXX"
                        value={id}
                        onChange={handleChange}
                        className="uppercase font-mono tracking-wider"
                        maxLength={10}
                      />
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}
                    <Button type="submit" className="w-full" size="lg">
                      Access Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  {recentAccounts.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Recent Accounts
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {recentAccounts.map((account) => (
                          <div 
                            key={account.id}
                            onClick={() => handleRecentLogin(account.id)}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {account.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium leading-none mb-1">{account.name}</span>
                                <span className="text-xs text-muted-foreground font-mono">{account.id}</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={(e) => removeRecentAccount(account.id, e)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="register" className="mt-0 space-y-4">
                  {!generatedId ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-name">Full Name</Label>
                        <Input
                          id="reg-name"
                          placeholder="ENTER YOUR NAME"
                          value={regName}
                          onChange={(e) => { setRegName(e.target.value.toUpperCase()); setError(""); }}
                          className="uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email Address</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="Enter your email"
                          value={regEmail}
                          onChange={(e) => { setRegEmail(e.target.value); setError(""); }}
                        />
                      </div>
                      {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          <span>{error}</span>
                        </div>
                      )}
                      <Button type="submit" className="w-full" size="lg">
                        Generate ID <UserPlus className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-6 text-center py-2">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg">Registration Successful!</h3>
                        <p className="text-sm text-muted-foreground">Here is your unique Reviewer ID. Keep it safe!</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg border-2 border-dashed border-primary/20">
                        <code className="text-2xl font-mono font-bold tracking-wider text-primary select-all">
                          {generatedId}
                        </code>
                      </div>
                      <Button onClick={() => setActiveTab("login")} className="w-full">
                        Go to Login
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
              
              <CardFooter className="flex justify-center border-t pt-6 bg-muted/5">
                <Button 
                  variant="link" 
                  className="text-xs text-muted-foreground"
                  onClick={() => { setIsAdminMode(true); setError(""); }}
                >
                  <Shield className="w-3 h-3 mr-1" /> Admin Access
                </Button>
              </CardFooter>
            </Tabs>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
