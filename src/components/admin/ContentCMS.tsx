import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, Plus, MoreVertical, Edit, 
  Copy, Archive, Trash2, Eye, Zap, BookOpen,
  Layers, GraduationCap, Award, Construction,
  FileText, ShieldAlert, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CMSTab } from "./types";

export const ContentCMS = () => {
  const [activeCMSTab, setActiveCMSTab] = useState<CMSTab>("questions");
  const [cmsSearchQuery, setCmsSearchQuery] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeCMSTab === "questions") {
      fetchQuestions();
    }
  }, [activeCMSTab]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  };

  const cmsTabs: { id: CMSTab; label: string; icon: any }[] = [
    { id: "questions", label: "Questions", icon: FileText },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "exams", label: "Mock Exams", icon: GraduationCap },
    { id: "quizzes", label: "Mini Quizzes", icon: Zap },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "subjects", label: "Subjects & Topics", icon: BookOpen },
  ];

  const filteredQuestions = questions.filter(q => 
    q.question_text.toLowerCase().includes(cmsSearchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(cmsSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* CMS Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {cmsTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeCMSTab === tab.id ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setActiveCMSTab(tab.id)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {activeCMSTab === "questions" && (
        <div className="space-y-6">
          {/* Questions Analytics Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-xl text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Questions</p>
                  <p className="text-sm font-bold text-slate-900">{questions.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Categories</p>
                  <p className="text-sm font-bold text-slate-900">{new Set(questions.map(q => q.category)).size}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Latest ID</p>
                  <p className="text-sm font-bold text-slate-900">{questions[0]?.id?.substring(0, 8) || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions Toolbar */}
          <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search questions..." 
                  className="pl-10"
                  value={cmsSearchQuery}
                  onChange={(e) => setCmsSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                  <tr>
                    <th className="p-4">Question Preview</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredQuestions.length > 0 ? filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 max-w-xs">
                        <p className="font-medium text-slate-900 truncate">{q.question_text}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{q.id}</p>
                      </td>
                      <td className="p-4">
                        <div className="text-xs">
                          <p className="font-medium text-slate-700">{q.category}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={cn(
                          "text-[10px]",
                          q.difficulty === "Easy" ? "text-green-600 border-green-100 bg-green-50" :
                          q.difficulty === "Moderate" ? "text-amber-600 border-amber-100 bg-amber-50" :
                          "text-red-600 border-red-100 bg-red-50"
                        )}>
                          {q.difficulty}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(q.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">No questions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeCMSTab !== "questions" && (activeCMSTab === "flashcards" ? (
         <FlashcardCMS />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white rounded-xl border border-dashed">
          <Construction className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="font-semibold text-slate-900">CMS Module Coming Soon</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            The {activeCMSTab} management interface is currently under development.
          </p>
        </div>
      ))}
    </div>
  );
};

const FlashcardCMS = () => {
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/flashcards/decks");
      if (res.ok) {
        const data = await res.json();
        setDecks(data);
      }
    } catch (error) {
      console.error("Failed to fetch decks", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading ? (
        <div className="col-span-full p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : decks.length > 0 ? decks.map(deck => (
        <Card key={deck.id}>
          <CardHeader>
            <CardTitle className="text-lg">{deck.title}</CardTitle>
            <CardDescription>{deck.category}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">{deck.description}</p>
            <Button variant="outline" size="sm" className="w-full">Manage Cards</Button>
          </CardContent>
        </Card>
      )) : (
        <div className="col-span-full p-12 text-center text-slate-400 border border-dashed rounded-xl">
          No flashcard decks found in database
        </div>
      )}
    </div>
  );
};
