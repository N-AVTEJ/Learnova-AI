"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ProgressBar,
  ProgressRing,
} from "@/components/ui";
import { PageTransition } from "@/components/shared/page-transition";

export interface DashboardCourseItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  difficulty: string;
  conceptCount: number;
  masteryPercent: number;
}

export interface WeeklyActivityPoint {
  day: string;
  assessments: number;
  avgScore: number;
}

export interface RecentPerformanceItem {
  id: string;
  assessmentTitle: string;
  assessmentType: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface RecommendedLessonItem {
  conceptId: string;
  conceptTitle: string;
  courseTitle: string;
  summary: string | null;
  masteryScore: number;
}

export interface DashboardClientProps {
  userEmail: string;
  overallMastery: number;
  streakDays: number;
  completedCount: number;
  masteredConceptsCount: number;
  totalConceptsCount: number;
  courses: DashboardCourseItem[];
  weeklyActivity: WeeklyActivityPoint[];
  recentPerformance: RecentPerformanceItem[];
  recommendedLessons: RecommendedLessonItem[];
}

export function DashboardClient({
  userEmail,
  overallMastery,
  streakDays,
  completedCount,
  masteredConceptsCount,
  totalConceptsCount,
  courses,
  weeklyActivity,
  recentPerformance,
  recommendedLessons,
}: DashboardClientProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageTransition>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="accent">Student Dashboard</Badge>
            <h1 className="mt-2 text-h1 text-foreground">Learning Overview</h1>
            <p className="text-body text-muted-foreground">
              Signed in as {userEmail}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/tutor">
                <Bot className="h-4 w-4" />
                Open AI Tutor
              </Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/assessments">
                <ClipboardCheck className="h-4 w-4" />
                Take Assessment
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Metrics */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="glass">
            <CardContent className="flex items-center gap-4 p-6">
              <ProgressRing value={overallMastery} size={68} strokeWidth={6} />
              <div>
                <p className="text-caption text-muted-foreground">
                  Overall Mastery
                </p>
                <p className="text-h2 text-foreground">
                  {Math.round(overallMastery)}%
                </p>
                <p className="text-caption text-muted-foreground">
                  {masteredConceptsCount}/{totalConceptsCount} concepts mastered
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-caption text-muted-foreground">
                  Active Streak
                </p>
                <p className="mt-1 text-h1 text-foreground">
                  {streakDays} {streakDays === 1 ? "day" : "days"}
                </p>
                <p className="text-caption text-muted-foreground">
                  Consecutive study days
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border-strong bg-surface-elevated">
                <Flame className="h-6 w-6 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-caption text-muted-foreground">
                  Assessments Completed
                </p>
                <p className="mt-1 text-h1 text-foreground">{completedCount}</p>
                <p className="text-caption text-muted-foreground">
                  Recorded evaluations
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border-strong bg-surface-elevated">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-caption text-muted-foreground">
                  Enrolled Courses
                </p>
                <p className="mt-1 text-h1 text-foreground">{courses.length}</p>
                <p className="text-caption text-muted-foreground">
                  Published tracks
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border-strong bg-surface-elevated">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Weekly Activity + Recent Performance */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card variant="glass" className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>
                    Average assessment score over the last 7 days
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  <TrendingUp className="h-3.5 w-3.5" />7 Days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={weeklyActivity}
                    margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111629",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "0.75rem",
                        color: "#F1F5F9",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgScore"
                      name="Avg Score (%)"
                      stroke="#7C3AED"
                      strokeWidth={2.5}
                      fill="url(#scoreFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Performance</CardTitle>
              <CardDescription>
                Latest assessment results from Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPerformance.length === 0 ? (
                <div className="rounded-md border border-border bg-surface-elevated p-4 text-center space-y-2">
                  <p className="text-body text-muted-foreground">
                    No assessments completed yet.
                  </p>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href="/assessments">Start first quiz</Link>
                  </Button>
                </div>
              ) : (
                recentPerformance.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-elevated p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-body font-medium text-foreground">
                        {item.assessmentTitle}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {new Date(item.completedAt).toLocaleDateString()} ·{" "}
                        {item.assessmentType}
                      </p>
                    </div>
                    <Badge variant={item.passed ? "success" : "warning"}>
                      {Math.round(item.score)}%
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        {/* Current Courses + Recommended Lessons */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Courses</CardTitle>
              <CardDescription>
                Your progress across published knowledge tracks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.length === 0 ? (
                <div className="rounded-md border border-border bg-surface-elevated p-4 text-body text-muted-foreground">
                  No published courses found in Supabase yet.
                </div>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-md border border-border bg-surface-elevated p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-h3 text-foreground">
                          {course.title}
                        </h4>
                        {course.description ? (
                          <p className="mt-1 text-caption text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>
                        ) : null}
                      </div>
                      <Badge variant="outline" className="capitalize shrink-0">
                        {course.difficulty}
                      </Badge>
                    </div>
                    <ProgressBar value={course.masteryPercent} showLabel />
                    <div className="flex items-center justify-between text-caption text-muted-foreground">
                      <span>{course.conceptCount} concepts</span>
                      <Link
                        href="/assessments"
                        className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200"
                      >
                        Practice
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recommended Lessons</CardTitle>
                  <CardDescription>
                    Lowest-mastery concepts to focus on next
                  </CardDescription>
                </div>
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedLessons.length === 0 ? (
                <div className="rounded-md border border-border bg-surface-elevated p-4 text-body text-muted-foreground">
                  No concepts available yet. Ask the AI Tutor about any topic!
                </div>
              ) : (
                recommendedLessons.map((lesson) => (
                  <div
                    key={lesson.conceptId}
                    className="flex flex-col gap-3 rounded-md border border-border bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-body font-medium text-foreground">
                          {lesson.conceptTitle}
                        </p>
                        <Badge
                          variant={
                            lesson.masteryScore >= 80
                              ? "success"
                              : lesson.masteryScore > 0
                              ? "accent"
                              : "outline"
                          }
                        >
                          {Math.round(lesson.masteryScore)}%
                        </Badge>
                      </div>
                      <p className="text-caption text-muted-foreground">
                        {lesson.courseTitle}
                        {lesson.summary ? ` · ${lesson.summary}` : ""}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" asChild className="shrink-0">
                      <Link
                        href={`/tutor?topic=${encodeURIComponent(
                          lesson.conceptTitle
                        )}`}
                      >
                        Study with AI
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </PageTransition>
    </main>
  );
}
