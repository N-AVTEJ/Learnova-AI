"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, GitBranch, ShieldCheck } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ProgressBar,
  ProgressRing,
} from "@/components/ui";
import { Navbar } from "@/components/shared/navbar";
import { PageTransition } from "@/components/shared/page-transition";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background bg-radial-spotlight">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-24">
        <PageTransition>
          <section className="mx-auto max-w-3xl text-center space-y-6">
            <Badge variant="accent">Phase 1 Foundation</Badge>

            <h1 className="text-h1 sm:text-display text-foreground">
              Master complex subjects through{" "}
              <span className="gradient-text">structured intelligence</span>
            </h1>

            <p className="mx-auto max-w-2xl text-body text-muted-foreground">
              Learnova AI maps every concept into a live dependency graph,
              pinpoints gaps with diagnostic assessments, and adapts your path
              to verified mastery.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button variant="primary" size="lg" asChild>
                <Link href="/signup">
                  Start learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="lg">
                    Inspect system
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Learnova AI Architecture</DialogTitle>
                    <DialogDescription>
                      Dark-first design system, Supabase Auth &amp; Postgres
                      knowledge graph schema, and FastAPI backend.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <ProgressBar value={100} showLabel />
                    <div className="flex items-center justify-between rounded-md border border-border bg-surface p-4">
                      <span className="text-caption text-muted-foreground">
                        Auth &amp; Protected Routes
                      </span>
                      <Badge variant="success">Ready</Badge>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </section>

          <section className="mt-20 grid gap-6 md:grid-cols-3">
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-elevated border border-border-strong">
                    <GitBranch className="h-5 w-5 text-purple-400" />
                  </div>
                  <Badge variant="outline">Graph</Badge>
                </div>
                <CardTitle className="pt-2">Knowledge Graph</CardTitle>
                <CardDescription>
                  Directed concept dependencies track prerequisites and unlock
                  advanced topics only when foundations hold.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressBar value={78} showLabel />
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-elevated border border-border-strong">
                    <BrainCircuit className="h-5 w-5 text-blue-400" />
                  </div>
                  <Badge variant="accent">Adaptive</Badge>
                </div>
                <CardTitle className="pt-2">Mastery Telemetry</CardTitle>
                <CardDescription>
                  Continuous confidence-weighted scoring across every concept
                  node, calibrated by targeted assessments.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <ProgressRing value={86} size={64} strokeWidth={5} />
                <div className="space-y-1">
                  <p className="text-body font-medium text-foreground">
                    Linear Algebra
                  </p>
                  <p className="text-caption text-muted-foreground">
                    High confidence mastery
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-elevated border border-border-strong">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <Badge variant="success">Verified</Badge>
                </div>
                <CardTitle className="pt-2">Session Security</CardTitle>
                <CardDescription>
                  Row-level security in Supabase Postgres paired with edge
                  middleware protecting every authenticated route.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" asChild className="px-0">
                  <Link href="/dashboard">
                    Open protected dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </PageTransition>
      </main>
    </div>
  );
}
