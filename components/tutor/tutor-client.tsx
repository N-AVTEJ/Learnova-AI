"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  CheckCircle2,
  Eye,
  Loader2,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from "@/components/ui";
import { PageTransition } from "@/components/shared/page-transition";
import { MarkdownRenderer } from "@/components/tutor/markdown-renderer";
import { API_BASE_URL, apiFetch, getAuthHeaders } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface PracticeQuestion {
  id: string;
  type: "mcq" | "code";
  concept: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface TutorClientProps {
  initialTopic: string;
  availableTopics: string[];
}

export function TutorClient({
  initialTopic,
  availableTopics,
}: TutorClientProps) {
  const [topic, setTopic] = useState(
    initialTopic || availableTopics[0] || "Binary Trees"
  );
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [practiceQuestions, setPracticeQuestions] = useState<
    PracticeQuestion[]
  >([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    setChatError(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const assistantId = `assistant-${Date.now()}`;
    const nextMessages = [...messages, userMsg];

    setMessages([
      ...nextMessages,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setIsStreaming(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          topic: topic || undefined,
          stream: true,
        }),
      });

      if (!response.ok) {
        let detail = `Chat request failed (${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson?.detail) detail = errJson.detail;
        } catch {
          // ignore
        }
        throw new Error(detail);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming response body unavailable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload || payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.text }
                    : m
                )
              );
            }
          } catch (err) {
            if (err instanceof SyntaxError) continue;
            throw err;
          }
        }
      }

      const trailing = buffer.trim();
      if (trailing.startsWith("data: ")) {
        const payload = trailing.slice(6).trim();
        if (payload && payload !== "[DONE]") {
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.text }
                    : m
                )
              );
            }
          } catch (err) {
            if (!(err instanceof SyntaxError)) throw err;
          }
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to reach AI Tutor";
      setChatError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.length > 0));
    } finally {
      setIsStreaming(false);
    }
  }

  async function handleGeneratePracticeQuestions() {
    if (isGeneratingQuestions) return;
    setQuestionsError(null);
    setIsGeneratingQuestions(true);
    setSelectedOptions({});
    setRevealedIds({});

    try {
      const data = await apiFetch<{
        topic: string;
        questions: PracticeQuestion[];
      }>("/api/chat/practice-questions", {
        method: "POST",
        body: JSON.stringify({
          topic: topic.trim() || "Computer Science Fundamentals",
          difficulty,
          count: 3,
        }),
      });
      setPracticeQuestions(data.questions || []);
    } catch (err) {
      setQuestionsError(
        err instanceof Error
          ? err.message
          : "Failed to generate practice questions"
      );
    } finally {
      setIsGeneratingQuestions(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PageTransition>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="accent">Gemini AI Proxy</Badge>
            <h1 className="mt-2 text-h1 text-foreground">AI Tutor Workspace</h1>
            <p className="text-body text-muted-foreground">
              Streamed explanations, syntax-highlighted code, and instant
              practice drills.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleGeneratePracticeQuestions}
              disabled={isGeneratingQuestions}
            >
              {isGeneratingQuestions ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate practice questions
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Chat Panel */}
          <Card variant="glass" className="lg:col-span-2 flex flex-col">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-400" />
                  <CardTitle>Tutor Session</CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Focus topic..."
                    aria-label="Focus topic"
                    className="h-8 w-44 text-caption"
                  />
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value as
                          | "beginner"
                          | "intermediate"
                          | "advanced"
                      )
                    }
                    aria-label="Difficulty"
                    className="h-8 rounded-md border border-border-strong bg-surface px-2.5 text-caption text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/60"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              {availableTopics.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {availableTopics.slice(0, 6).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-caption transition-colors",
                        topic === t
                          ? "border-accent-violet/50 bg-accent-violet/20 text-purple-200"
                          : "border-border bg-surface-elevated text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : null}
            </CardHeader>

            <CardContent className="flex flex-1 flex-col p-4 sm:p-6">
              <div
                ref={scrollRef}
                className="flex-1 min-h-[340px] max-h-[500px] space-y-4 overflow-y-auto pr-1"
              >
                {messages.length === 0 ? (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated">
                      <Bot className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="max-w-md space-y-1">
                      <p className="text-h3 text-foreground">
                        Ask anything about {topic}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        Responses stream through the FastAPI Gemini proxy with
                        syntax-highlighted code blocks.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                      ) : null}

                      <div
                        className={cn(
                          "max-w-[88%] rounded-lg px-4 py-3",
                          msg.role === "user"
                            ? "bg-accent-violet/25 border border-accent-violet/40 text-foreground"
                            : "bg-surface-elevated border border-border text-foreground"
                        )}
                      >
                        {msg.role === "assistant" ? (
                          msg.content ? (
                            <MarkdownRenderer content={msg.content} />
                          ) : (
                            <span className="inline-flex items-center gap-2 text-caption text-muted-foreground">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Thinking...
                            </span>
                          )
                        ) : (
                          <p className="text-body whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        )}
                      </div>

                      {msg.role === "user" ? (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border-strong bg-surface-elevated text-foreground">
                          <User className="h-4 w-4" />
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              {chatError ? (
                <div className="mt-3 rounded-md border border-status-danger/40 bg-status-danger/10 px-3 py-2 text-caption text-status-danger">
                  {chatError}
                </div>
              ) : null}

              <form
                onSubmit={handleSendMessage}
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${topic}, request a code example, or paste code to debug...`}
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isStreaming || !input.trim()}
                  className="shrink-0"
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Practice Questions Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Practice Questions</CardTitle>
                <CardDescription>
                  Structured drills generated for{" "}
                  <span className="text-foreground font-medium">{topic}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {questionsError ? (
                  <div className="rounded-md border border-status-danger/40 bg-status-danger/10 px-3 py-2 text-caption text-status-danger">
                    {questionsError}
                  </div>
                ) : null}

                {practiceQuestions.length === 0 ? (
                  <div className="rounded-md border border-border bg-surface-elevated p-4 text-center space-y-2">
                    <p className="text-caption text-muted-foreground">
                      Click &ldquo;Generate practice questions&rdquo; to create
                      concept-tagged drills via Gemini.
                    </p>
                  </div>
                ) : (
                  practiceQuestions.map((pq, idx) => {
                    const selected = selectedOptions[pq.id];
                    const revealed = Boolean(revealedIds[pq.id]);

                    return (
                      <Card key={pq.id || idx} variant="elevated">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="accent">{pq.concept}</Badge>
                            <Badge variant="outline" className="uppercase">
                              {pq.type}
                            </Badge>
                          </div>
                          <p className="pt-2 text-body font-medium text-foreground">
                            {idx + 1}. {pq.question}
                          </p>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-2">
                          {pq.type === "mcq" && pq.options.length > 0 ? (
                            <div className="space-y-1.5">
                              {pq.options.map((opt) => {
                                const isSelected = selected === opt;
                                const isCorrect =
                                  revealed && opt === pq.answer;
                                const isWrong =
                                  revealed && isSelected && opt !== pq.answer;

                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() =>
                                      setSelectedOptions((prev) => ({
                                        ...prev,
                                        [pq.id]: opt,
                                      }))
                                    }
                                    className={cn(
                                      "w-full rounded-md border px-3 py-2 text-left text-caption transition-colors",
                                      isCorrect
                                        ? "border-status-success/60 bg-status-success/15 text-emerald-200"
                                        : isWrong
                                        ? "border-status-danger/60 bg-status-danger/15 text-red-200"
                                        : isSelected
                                        ? "border-accent-violet/60 bg-accent-violet/20 text-foreground"
                                        : "border-border bg-surface text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setRevealedIds((prev) => ({
                                ...prev,
                                [pq.id]: !prev[pq.id],
                              }))
                            }
                            className="px-0 text-purple-300"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {revealed ? "Hide answer" : "Check answer"}
                          </Button>

                          {revealed ? (
                            <div className="rounded-md border border-border bg-surface p-3 space-y-1">
                              <div className="flex items-center gap-1.5 text-caption font-medium text-emerald-300">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Answer: {pq.answer}
                              </div>
                              <p className="text-caption text-muted-foreground">
                                {pq.explanation}
                              </p>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </main>
  );
}
