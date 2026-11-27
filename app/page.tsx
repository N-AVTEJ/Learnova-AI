import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ClipboardCheck,
  GitBranch,
  Layers,
  Sparkles,
  Target,
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
import { Navbar } from "@/components/shared/navbar";
import { PageTransition } from "@/components/shared/page-transition";
import { KnowledgeGraphPreview } from "@/components/landing/knowledge-graph-preview";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  {
    icon: GitBranch,
    iconColor: "text-purple-400",
    badge: "Knowledge Graph",
    badgeVariant: "outline" as const,
    title: "Prerequisite Mapping",
    description:
      "Every course is modeled as a directed concept graph so you master foundational ideas before tackling advanced topics.",
  },
  {
    icon: BrainCircuit,
    iconColor: "text-blue-400",
    badge: "Adaptive",
    badgeVariant: "accent" as const,
    title: "Recency-Weighted Mastery",
    description:
      "Deterministic mastery scoring tracks accuracy and recency per concept, surfacing exactly what needs reinforcement.",
  },
  {
    icon: Bot,
    iconColor: "text-emerald-400",
    badge: "Gemini Tutor",
    badgeVariant: "success" as const,
    title: "AI Tutor Workspace",
    description:
      "Ask questions with syntax-highlighted code explanations and generate targeted practice questions on demand.",
  },
  {
    icon: ClipboardCheck,
    iconColor: "text-amber-400",
    badge: "Evaluated",
    badgeVariant: "warning" as const,
    title: "Diagnostic Assessments",
    description:
      "Combine multiple-choice and code challenges with instant feedback and AI-assisted evaluation that updates your mastery.",
  },
];

const STEPS = [
  {
    step: "01",
    icon: Layers,
    title: "Pick a structured course",
    description:
      "Start with a curated curriculum decomposed into atomic concepts and clear prerequisite edges.",
  },
  {
    step: "02",
    icon: Bot,
    title: "Learn with the AI Tutor",
    description:
      "Explore concepts interactively, inspect runnable code blocks, and drill with generated practice cards.",
  },
  {
    step: "03",
    icon: Target,
    title: "Prove mastery in assessments",
    description:
      "Complete MCQ and code evaluations with instant feedback and Gemini-powered grading.",
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "Watch your graph light up",
    description:
      "Every submission updates your concept mastery scores and recommends your highest-leverage next lesson.",
  },
];

export default async function LandingPage() {
  let userEmail: string | null = null;
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userEmail = user?.email ?? null;
    } catch {
      userEmail = null;
    }
  }

  return (
    <div className="min-h-screen bg-background bg-radial-spotlight">
      <Navbar userEmail={userEmail} />

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <PageTransition>
          {/* Hero */}
          <section className="mx-auto max-w-3xl text-center space-y-6">
            <Badge variant="accent">Adaptive Mastery Platform</Badge>

            <h1 className="text-h1 sm:text-display text-foreground">
              Master complex subjects through{" "}
              <span className="gradient-text">structured intelligence</span>
            </h1>

            <p className="mx-auto max-w-2xl text-body text-muted-foreground">
              Learnova AI maps every concept into a live dependency graph,
              pairs you with a Gemini-powered tutor, and adapts your learning
              path through verified assessments.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button variant="primary" size="lg" asChild>
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/login">Sign in to workspace</Link>
              </Button>
            </div>
          </section>

          {/* Animated Knowledge Graph Preview */}
          <section className="mt-14 sm:mt-16">
            <KnowledgeGraphPreview />
          </section>

          {/* Feature Showcase */}
          <section className="mt-20 space-y-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge variant="outline">Platform Capabilities</Badge>
                <h2 className="mt-2 text-h1 text-foreground">
                  Built for deep comprehension
                </h2>
              </div>
              <p className="max-w-md text-body text-muted-foreground">
                Every workflow connects back to your concept mastery state—no
                guesswork, no generic checklists.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    variant={index < 2 ? "glass" : "default"}
                    className="flex flex-col justify-between"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border-strong bg-surface-elevated">
                          <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                        </div>
                        <Badge variant={feature.badgeVariant}>
                          {feature.badge}
                        </Badge>
                      </div>
                      <CardTitle className="pt-2">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {index === 0 ? (
                        <ProgressBar value={82} showLabel />
                      ) : index === 1 ? (
                        <div className="flex items-center gap-3">
                          <ProgressRing value={88} size={52} strokeWidth={5} />
                          <span className="text-caption text-muted-foreground">
                            Recency-weighted confidence
                          </span>
                        </div>
                      ) : (
                        <span className="text-caption text-muted-foreground">
                          Synced with Supabase Postgres
                        </span>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* How It Works */}
          <section className="mt-20 space-y-8">
            <div className="text-center space-y-2">
              <Badge variant="accent">How It Works</Badge>
              <h2 className="text-h1 text-foreground">
                From curiosity to verified mastery
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.step} variant="elevated">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span className="text-h2 font-bold gradient-text">
                          {item.step}
                        </span>
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="pt-1">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Footer CTA */}
          <section className="mt-20">
            <Card variant="glass" className="overflow-hidden">
              <CardContent className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 text-caption text-purple-300">
                    <Sparkles className="h-4 w-4" />
                    Ready to map your mastery?
                  </div>
                  <h2 className="text-h1 text-foreground">
                    Start learning with Learnova AI today
                  </h2>
                  <p className="text-body text-muted-foreground">
                    Create your account to access your personalized dashboard,
                    AI tutor workspace, and adaptive assessments.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" size="lg" asChild>
                    <Link href="/signup">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </PageTransition>
      </main>
    </div>
  );
}
