import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Plus, ClipboardList, Users, Eye, Edit, QrCode, BarChart3,
  GripVertical, Trash2, ChevronUp, ChevronDown, Copy, ExternalLink
} from "lucide-react";

type QuestionType = "likert" | "multiple_choice" | "free_text" | "ranking" | "matrix" | "yes_no";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: string[];
  pillar?: string;
}

const questionTypes: { value: QuestionType; label: string; desc: string }[] = [
  { value: "likert", label: "Likert scale", desc: "Strongly agree → Strongly disagree" },
  { value: "multiple_choice", label: "Multiple choice", desc: "Select one or more options" },
  { value: "free_text", label: "Free text", desc: "Open-ended response" },
  { value: "ranking", label: "Ranking", desc: "Order items by preference" },
  { value: "matrix", label: "Matrix", desc: "Rate multiple items on a scale" },
  { value: "yes_no", label: "Yes / No", desc: "Simple binary choice" },
];

const defaultQuestions: Question[] = [
  { id: "q1", type: "likert", text: "Overall, how satisfied are you with the way your parish/town council is run?", required: true, pillar: "resident_voice" },
  { id: "q2", type: "likert", text: "How well does the council communicate with residents?", required: true, pillar: "community_engagement" },
  { id: "q3", type: "likert", text: "How transparent do you feel the council is about its decisions and finances?", required: true, pillar: "governance" },
  { id: "q4", type: "likert", text: "How well does the council listen and respond to residents' concerns?", required: true, pillar: "resident_voice" },
  { id: "q5", type: "multiple_choice", text: "What are the most important issues for your local area? (Select up to 3)", required: false, options: ["Roads and transport", "Green spaces and parks", "Community facilities", "Safety and lighting", "Planning and development", "Events and activities", "Other"], pillar: "community_engagement" },
  { id: "q6", type: "free_text", text: "Is there anything specific you would like the council to focus on in the next 12 months?", required: false, pillar: "delivery" },
];

function QuestionCard({ question, index, total, onMove, onDelete, onChange }: {
  question: Question; index: number; total: number;
  onMove: (dir: "up" | "down") => void;
  onDelete: () => void;
  onChange: (q: Question) => void;
}) {
  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center gap-1 pt-3">
        <button className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={() => onMove("up")} disabled={index === 0} className="text-muted-foreground/40 hover:text-muted-foreground disabled:opacity-20">
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onMove("down")} disabled={index === total - 1} className="text-muted-foreground/40 hover:text-muted-foreground disabled:opacity-20">
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <Card className="flex-1 border-border/60 hover:border-accent/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-muted-foreground/60">Q{index + 1}</span>
              <Badge variant="secondary" className="text-xs capitalize">{question.type.replace("_", " ")}</Badge>
              {question.pillar && (
                <Badge className="text-xs bg-teal-50 text-teal-700 border-teal-200 capitalize">{question.pillar.replace("_", " ")}</Badge>
              )}
              {question.required && <Badge className="text-xs bg-red-50 text-red-600 border-red-200">Required</Badge>}
            </div>
            <button onClick={onDelete} className="text-muted-foreground/40 hover:text-destructive transition-colors flex-shrink-0">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <Input
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            className="text-sm font-medium border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
            placeholder="Question text..."
          />
          {question.type === "multiple_choice" && question.options && (
            <div className="mt-3 space-y-1.5">
              {question.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-border flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{opt}</span>
                </div>
              ))}
            </div>
          )}
          {question.type === "likert" && (
            <div className="mt-3 flex gap-2">
              {["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"].map((opt) => (
                <div key={opt} className="flex flex-col items-center gap-1">
                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                  <span className="text-xs text-muted-foreground text-center" style={{ fontSize: 9 }}>{opt}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Surveys() {
  const [activeTab, setActiveTab] = useState("list");
  const [showBuilder, setShowBuilder] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [surveyTitle, setSurveyTitle] = useState("Annual Resident Survey 2025");
  const [surveyDesc, setSurveyDesc] = useState("We'd like to hear your views on how the council is performing and what matters most to you.");

  const { data: council } = trpc.councils.myCouncil.useQuery();
  const councilId = council?.id;

  const { data: surveys, refetch } = trpc.surveys.list.useQuery(
    { councilId: councilId! },
    { enabled: !!councilId }
  );

  const createSurvey = trpc.surveys.create.useMutation({
    onSuccess: () => {
      toast.success("Survey created successfully");
      setShowBuilder(false);
      refetch();
    },
    onError: () => toast.error("Failed to create survey"),
  });

  const updateSurvey = trpc.surveys.update.useMutation({
    onSuccess: () => { toast.success("Survey updated"); refetch(); },
    onError: () => toast.error("Failed to update survey"),
  });

  const moveQuestion = (index: number, dir: "up" | "down") => {
    const newQs = [...questions];
    const target = dir === "up" ? index - 1 : index + 1;
    [newQs[index], newQs[target]] = [newQs[target], newQs[index]];
    setQuestions(newQs);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: `q${Date.now()}`,
      type,
      text: "",
      required: false,
      options: type === "multiple_choice" ? ["Option 1", "Option 2", "Option 3"] : undefined,
    };
    setQuestions([...questions, newQ]);
  };

  const handleSave = (status: "draft" | "active") => {
    if (!councilId) { toast.error("No council linked to your account"); return; }
    createSurvey.mutate({
      councilId,
      title: surveyTitle,
      description: surveyDesc,
      questions: questions as any,
    });
  };

  const sampleSurveys = [
    { id: 1, title: "Annual Resident Survey 2025", status: "active", responseCount: 87, slug: "annual-resident-survey-2025", createdAt: new Date("2025-01-15") },
    { id: 2, title: "Community Priorities Survey 2024", status: "closed", responseCount: 142, slug: "community-priorities-2024", createdAt: new Date("2024-09-01") },
  ];
  const displaySurveys = (surveys && surveys.length > 0) ? surveys : sampleSurveys;

  return (
    <PortalLayout title="Surveys">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Resident Surveys</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Create and manage surveys to gather resident feedback</p>
          </div>
          <Button onClick={() => setShowBuilder(!showBuilder)}>
            <Plus className="h-4 w-4 mr-1.5" />
            {showBuilder ? "Cancel" : "New survey"}
          </Button>
        </div>

        {/* Survey builder */}
        {showBuilder && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle className="text-base">Survey builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="questions">
                <TabsList>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="questions" className="space-y-4 mt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Survey title</Label>
                      <Input value={surveyTitle} onChange={(e) => setSurveyTitle(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Input value={surveyDesc} onChange={(e) => setSurveyDesc(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {questions.map((q, i) => (
                      <QuestionCard
                        key={q.id} question={q} index={i} total={questions.length}
                        onMove={(dir) => moveQuestion(i, dir)}
                        onDelete={() => deleteQuestion(i)}
                        onChange={(updated) => setQuestions(questions.map((x, j) => j === i ? updated : x))}
                      />
                    ))}
                  </div>

                  {/* Add question */}
                  <div className="border-2 border-dashed border-border rounded-xl p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3">Add a question</p>
                    <div className="flex flex-wrap gap-2">
                      {questionTypes.map((qt) => (
                        <button
                          key={qt.value}
                          onClick={() => addQuestion(qt.value)}
                          className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-lg font-medium text-foreground transition-colors"
                        >
                          + {qt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => handleSave("draft")} disabled={createSurvey.isPending}>
                      Save as draft
                    </Button>
                    <Button onClick={() => handleSave("active")} disabled={createSurvey.isPending}>
                      {createSurvey.isPending ? "Saving..." : "Launch survey"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Open date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Close date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Introduction text</Label>
                    <Textarea rows={3} placeholder="Text shown at the start of the survey..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Thank you message</Label>
                    <Textarea rows={2} placeholder="Text shown after submission..." />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <div className="bg-secondary rounded-xl p-6 max-w-lg">
                    <h3 className="font-semibold text-foreground mb-2">{surveyTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{surveyDesc}</p>
                    {questions.slice(0, 3).map((q, i) => (
                      <div key={q.id} className="mb-5">
                        <p className="text-sm font-medium text-foreground mb-2">{i + 1}. {q.text || "Question text..."}</p>
                        {q.type === "likert" && (
                          <div className="flex gap-3">
                            {["SA", "A", "N", "D", "SD"].map((opt) => (
                              <div key={opt} className="flex flex-col items-center gap-1">
                                <div className="w-6 h-6 rounded-full border-2 border-border bg-white" />
                                <span className="text-xs text-muted-foreground">{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {q.type === "free_text" && <Textarea rows={2} placeholder="Your response..." className="mt-1" />}
                      </div>
                    ))}
                    {questions.length > 3 && <p className="text-xs text-muted-foreground">...and {questions.length - 3} more questions</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Survey list */}
        <div className="space-y-3">
          {displaySurveys.map((survey) => (
            <Card key={survey.id} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{survey.title}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <Badge
                          className={`text-xs ${survey.status === "active" ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-secondary text-muted-foreground"}`}
                        >
                          {survey.status}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />{survey.responseCount} responses
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {survey.status === "active" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/survey/${survey.slug}`); toast.success("Link copied"); }}>
                          <Copy className="h-3.5 w-3.5 mr-1" />Link
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.info("QR code feature — coming soon")}>
                          <QrCode className="h-3.5 w-3.5 mr-1" />QR
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/portal/surveys/${survey.id}`}>
                        <BarChart3 className="h-3.5 w-3.5 mr-1" />Results
                      </Link>
                    </Button>
                    {survey.status === "active" && (
                      <Button variant="outline" size="sm" onClick={() => updateSurvey.mutate({ id: survey.id, status: "closed" })}>
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
