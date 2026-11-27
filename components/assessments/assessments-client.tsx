"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ProgressBar,
  ProgressRing,
  Textarea,
} from "@/components/ui";
import { PageTransition } from "@/components/shared/page-transition";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AssessmentQuestion {
  id: string;
  type: "mcq" | "code";
  prompt?: string;
  question?: string;
  options?: string[];
  correct_answer?: string;
  answer?: string;
  explanation?: string;
  starter_code?: string;
  rubric?: string;
}

interface AssessmentItem {
  id: string;
  course_id: string;
  concept_id: string | null;
  title: string;
  assessment_type: string;
  questions: AssessmentQuestion[];
  passing_score: number;
  course_title?: string | null;
  concept_title?: string | null;
  latest_score?: number | null;
  latest_passed?: boolean | null;
  latest_completed_at?: string | null;
}

interface QuestionFeedback {
  question_id: string;
  correct: boolean;
  score: number;
  feedback: string;
}

interface SubmitResult {
  result_id: string;
  assessment_id: string;
  score: number;
  passed: boolean;
  correct_count: number;
  total_count: number;
  summary: string;
  question_results: QuestionFeedback[];
  mastery_update: {
    concept_id: string;
    previous_score: number | null;
    new_score: number;
    confidence: number;
  } | null;
  completed_at: string;
}

export function AssessmentsClient() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeAssessment, setActiveAssessment] =
    useState<AssessmentItem | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [instantFeedback, setInstantFeedback] = useState<
    Record<string, { checked: boolean; correct: boolean | null; message: string }>
  >({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  async function loadAssessments() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiFetch<AssessmentItem[]>("/api/assessments");
      setAssessments(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load assessments"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssessments();
  }, []);

  function startAssessment(assessment: AssessmentItem) {
    const initialAnswers: Record<string, string> = {};
    assessment.questions.forEach((q, idx) => {
      const qid = String(q.id || `q${idx + 1}`);
      if (q.type === "code" && q.starter_code) {
        initialAnswers[qid] = q.starter_code;
      }
    });
    setActiveAssessment(assessment);
    setAnswers(initialAnswers);
    setInstantFeedback({});
    setSubmitError(null);
    setSubmitResult(null);
  }

  function handleCheckQuestion(q: AssessmentQuestion, qid: string) {
    const studentAnswer = (answers[qid] || "").trim();
    if (!studentAnswer) {
      setInstantFeedback((prev) => ({
        ...prev,
        [qid]: {
          checked: true,
          correct: false,
          message: "Please enter or select an answer first.",
        },
      }));
      return;
    }

    if (q.type === "mcq") {
      const expected = (q.correct_answer || q.answer || "").trim();
      const isCorrect =
        expected.length > 0 &&
        studentAnswer.toLowerCase() === expected.toLowerCase();
      setInstantFeedback((prev) => ({
        ...prev,
        [qid]: {
          checked: true,
          correct: expected ? isCorrect : null,
          message: expected
            ? isCorrect
              ? q.explanation || "Correct! Nice work."
              : `Not quite. ${q.explanation || "Review the concept and try again."}`
            : "Answer recorded. Submit for full Gemini evaluation.",
        },
      }));
      return;
    }

    setInstantFeedback((prev) => ({
      ...prev,
      [qid]: {
        checked: true,
        correct: null,
        message:
          q.rubric ||
          "Code draft looks ready—submit the assessment for full Gemini evaluation.",
      },
    }));
  }

  async function handleSubmitAssessment() {
    if (!activeAssessment || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await apiFetch<SubmitResult>(
        `/api/assessments/${activeAssessment.id}/submit`,
        {
          method: "POST",
          body: JSON.stringify({ answers }),
        }
      );
      setSubmitResult(result);
      await loadAssessments();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit assessment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Performance Summary View
  if (activeAssessment && submitResult) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <PageTransition>
          <Card variant="glass">
            <CardHeader className="border-b border-border">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge variant={submitResult.passed ? "success" : "warning"}>
                    {submitResult.passed ? "Passed" : "Needs Review"}
                  </Badge>
                  <CardTitle className="mt-2 text-h1">
                    {activeAssessment.title} — Summary
                  </CardTitle>
                  <CardDescription>
                    Evaluated by Gemini &amp; saved to Supabase
                  </CardDescription>
                </div>
                <ProgressRing
                  value={submitResult.score}
                  size={84}
                  strokeWidth={6}
                  label="Score"
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="rounded-lg border border-border bg-surface-elevated p-4 space-y-2">
                <div className="flex items-center gap-2 text-caption font-medium text-purple-300">
                  <Sparkles className="h-4 w-4" />
                  AI Evaluation Summary ({submitResult.correct_count}/
                  {submitResult.total_count} correct)
                </div>
                <p className="text-body text-foreground">
                  {submitResult.summary}
                </p>
              </div>

              {submitResult.mastery_update ? (
                <div className="rounded-lg border border-accent-violet/30 bg-accent-violet/10 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-caption text-purple-200">
                      Concept Mastery Updated
                    </p>
                    <p className="text-h3 text-foreground">
                      {submitResult.mastery_update.previous_score !== null
                        ? `${Math.round(
                            submitResult.mastery_update.previous_score
                          )}% → `
                        : "New: "}
                      {Math.round(submitResult.mastery_update.new_score)}%
                    </p>
                  </div>
                  <Badge variant="accent">
                    Confidence:{" "}
                    {Math.round(submitResult.mastery_update.confidence * 100)}%
                  </Badge>
                </div>
              ) : null}

              <div className="space-y-3">
                <h3 className="text-h3 text-foreground">Question Breakdown</h3>
                {submitResult.question_results.map((qr, idx) => (
                  <div
                    key={qr.question_id || idx}
                    className="rounded-md border border-border bg-surface-elevated p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-body font-medium text-foreground">
                        Question {idx + 1}
                      </span>
                      <Badge variant={qr.correct ? "success" : "warning"}>
                        {qr.correct ? "Correct" : "Needs Work"}
                      </Badge>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {qr.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap justify-between gap-3 border-t border-border pt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setActiveAssessment(null);
                  setSubmitResult(null);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Assessments
              </Button>
              <Button variant="primary" asChild>
                <Link href="/dashboard">
                  View Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </PageTransition>
      </main>
    );
  }

  // Quiz-Taking Flow
  if (activeAssessment) {
    const total = activeAssessment.questions.length;
    const answeredCount = activeAssessment.questions.filter((q, idx) => {
      const qid = String(q.id || `q${idx + 1}`);
      const val = (answers[qid] || "").trim();
      if (!val) return false;
      if (q.type === "code" && q.starter_code && val === q.starter_code.trim()) {
        return false;
      }
      return true;
    }).length;
    const progressPct = total > 0 ? (answeredCount / total) * 100 : 0;

    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <PageTransition>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveAssessment(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              All Assessments
            </Button>
            <div className="flex items-center gap-2">
              {activeAssessment.concept_title ? (
                <Badge variant="accent">{activeAssessment.concept_title}</Badge>
              ) : null}
              <Badge variant="outline">
                Pass: {Math.round(activeAssessment.passing_score)}%
              </Badge>
            </div>
          </div>

          <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="text-h1">{activeAssessment.title}</CardTitle>
              <CardDescription>
                {answeredCount} of {total} questions answered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressBar value={progressPct} showLabel />
            </CardContent>
          </Card>

          <div className="space-y-6">
            {activeAssessment.questions.map((q, idx) => {
              const qid = String(q.id || `q${idx + 1}`);
              const promptText = q.prompt || q.question || "";
              const fb = instantFeedback[qid];

              return (
                <Card key={qid}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-caption font-medium text-purple-300">
                        Question {idx + 1} of {total}
                      </span>
                      <Badge variant="outline" className="uppercase">
                        {q.type === "code" ? (
                          <span className="inline-flex items-center gap-1">
                            <Code2 className="h-3 w-3" />
                            Code
                          </span>
                        ) : (
                          "MCQ"
                        )}
                      </Badge>
                    </div>
                    <CardTitle className="pt-1">{promptText}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {q.type === "mcq" && Array.isArray(q.options) ? (
                      <div className="grid gap-2.5">
                        {q.options.map((option) => {
                          const selected = answers[qid] === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [qid]: option,
                                }))
                              }
                              className={cn(
                                "w-full rounded-md border px-4 py-3 text-left text-body transition-colors",
                                selected
                                  ? "border-accent-violet bg-accent-violet/20 text-foreground"
                                  : "border-border-strong bg-surface-elevated text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <Textarea
                        value={answers[qid] || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [qid]: e.target.value,
                          }))
                        }
                        rows={6}
                        placeholder="Write your code solution here..."
                        className="font-mono text-xs"
                      />
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCheckQuestion(q, qid)}
                      >
                        Check Answer
                      </Button>
                    </div>

                    {fb?.checked ? (
                      <div
                        className={cn(
                          "flex items-start gap-2 rounded-md border p-3 text-caption",
                          fb.correct === true
                            ? "border-status-success/40 bg-status-success/10 text-emerald-200"
                            : fb.correct === false
                            ? "border-status-warning/40 bg-status-warning/10 text-amber-200"
                            : "border-border-strong bg-surface-elevated text-muted-foreground"
                        )}
                      >
                        {fb.correct === true ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        ) : fb.correct === false ? (
                          <XCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                        ) : (
                          <Sparkles className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
                        )}
                        <span>{fb.message}</span>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {submitError ? (
            <div className="mt-6 rounded-md border border-status-danger/40 bg-status-danger/10 px-4 py-3 text-caption text-status-danger">
              {submitError}
            </div>
          ) : null}

          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmitAssessment}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Evaluating with Gemini...
                </>
              ) : (
                <>
                  Submit Assessment
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </PageTransition>
      </main>
    );
  }

  // Assessments List View
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageTransition>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="accent">Assessment Center</Badge>
            <h1 className="mt-2 text-h1 text-foreground">
              Available Assessments
            </h1>
            <p className="text-body text-muted-foreground">
              Test your understanding with MCQ and code challenges. Submissions
              update your concept mastery scores.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-12 flex items-center justify-center gap-2 text-body text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
            Loading assessments...
          </div>
        ) : loadError ? (
          <Card className="mt-8">
            <CardContent className="p-6 space-y-3">
              <p className="text-body text-status-danger">{loadError}</p>
              <Button variant="secondary" size="sm" onClick={loadAssessments}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : assessments.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="p-8 text-center space-y-2">
              <ClipboardCheck className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-h3 text-foreground">
                No assessments available yet
              </p>
              <p className="text-body text-muted-foreground">
                Publish a course and add assessments in Supabase to begin.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <Card
                key={assessment.id}
                variant="glass"
                className="flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className="capitalize">
                      {assessment.assessment_type.replace("_", " ")}
                    </Badge>
                    {assessment.latest_score !== null &&
                    assessment.latest_score !== undefined ? (
                      <Badge
                        variant={
                          assessment.latest_passed ? "success" : "warning"
                        }
                      >
                        Last: {Math.round(assessment.latest_score)}%
                      </Badge>
                    ) : null}
                  </div>
                  <CardTitle className="pt-2">{assessment.title}</CardTitle>
                  <CardDescription>
                    {assessment.course_title || "Course"}
                    {assessment.concept_title
                      ? ` · ${assessment.concept_title}`
                      : ""}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 text-caption text-muted-foreground">
                  <p>{assessment.questions.length} questions (MCQ &amp; Code)</p>
                  <p>Passing score: {Math.round(assessment.passing_score)}%</p>
                </CardContent>

                <CardFooter>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => startAssessment(assessment)}
                  >
                    {assessment.latest_score !== null &&
                    assessment.latest_score !== undefined
                      ? "Retake Assessment"
                      : "Start Assessment"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </PageTransition>
    </main>
  );
}
