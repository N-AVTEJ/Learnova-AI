"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Network,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";
import { ConceptNode, type ConceptFlowNode } from "./concept-node";
import { computeDagrePositions, getPrerequisiteChain } from "./layout";
import type {
  KnowledgeGraphNodeData,
  KnowledgeGraphResponse,
  MasteryStatus,
  RecommendationResponse,
} from "./types";

const SNAPSHOT_KEY = "learnova_kg_mastery_snapshot";
const NODE_TYPES = { concept: ConceptNode };

const STATUS_BADGE_VARIANT: Record<
  MasteryStatus,
  "success" | "accent" | "warning" | "outline"
> = {
  mastered: "success",
  improving: "accent",
  weak: "warning",
  not_assessed: "outline",
};

const STATUS_LABEL: Record<MasteryStatus, string> = {
  mastered: "Mastered",
  improving: "Improving",
  weak: "Weak",
  not_assessed: "Not assessed",
};

export function KnowledgeGraphClient() {
  const [graph, setGraph] = useState<KnowledgeGraphResponse | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recError, setRecError] = useState<string | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [transitions, setTransitions] = useState<Record<string, MasteryStatus>>({});
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<ConceptFlowNode, Edge> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadGraph = useCallback(async (showSpinner = false): Promise<boolean> => {
    if (showSpinner) setLoading(true);
    setError(null);
    let statusChanged = false;
    try {
      const data = await apiFetch<KnowledgeGraphResponse>("/api/knowledge-graph");

      // Compare against previous session snapshot to animate mastery transitions
      try {
        const rawPrev = sessionStorage.getItem(SNAPSHOT_KEY);
        if (rawPrev) {
          const prevMap = JSON.parse(rawPrev) as Record<string, MasteryStatus>;
          const nextTransitions: Record<string, MasteryStatus> = {};
          for (const node of data.nodes) {
            const prevStatus = prevMap[node.id];
            if (prevStatus && prevStatus !== node.status) {
              nextTransitions[node.id] = prevStatus;
            }
          }
          if (Object.keys(nextTransitions).length > 0) {
            statusChanged = true;
            setTransitions(nextTransitions);
            if (transitionTimerRef.current) {
              clearTimeout(transitionTimerRef.current);
            }
            transitionTimerRef.current = setTimeout(() => {
              setTransitions({});
              transitionTimerRef.current = null;
            }, 4000);
          }
        }
        const snapshot: Record<string, MasteryStatus> = {};
        for (const node of data.nodes) {
          snapshot[node.id] = node.status;
        }
        sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
      } catch {
        // Ignore storage errors in restricted environments
      }

      setGraph(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load knowledge graph");
    } finally {
      setLoading(false);
    }
    return statusChanged;
  }, []);

  const loadRecommendation = useCallback(async (courseId: string) => {
    setRecLoading(true);
    setRecError(null);
    try {
      const qs = courseId !== "all" ? `?course_id=${encodeURIComponent(courseId)}` : "";
      const rec = await apiFetch<RecommendationResponse>(`/api/recommendation${qs}`);
      setRecommendation(rec);
    } catch (err) {
      setRecError(
        err instanceof Error ? err.message : "Failed to generate AI recommendation"
      );
    } finally {
      setRecLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph(true);
  }, [loadGraph]);

  useEffect(() => {
    loadRecommendation(selectedCourseId);
  }, [loadRecommendation, selectedCourseId]);

  // Live sync when returning from Assessment Center or another tab
  useEffect(() => {
    const onFocus = async () => {
      const changed = await loadGraph(false);
      if (changed) {
        loadRecommendation(selectedCourseId);
      }
    };
    window.addEventListener("focus", onFocus);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("learnova-mastery");
      channel.onmessage = () => {
        loadGraph(false);
        loadRecommendation(selectedCourseId);
      };
    }

    return () => {
      window.removeEventListener("focus", onFocus);
      channel?.close();
    };
  }, [loadGraph, loadRecommendation, selectedCourseId]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const courses = useMemo(() => {
    if (!graph) return [];
    const seen = new Map<string, string>();
    for (const node of graph.nodes) {
      if (!seen.has(node.course_id)) {
        seen.set(node.course_id, node.course_title);
      }
    }
    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
  }, [graph]);

  const visibleNodes = useMemo(() => {
    if (!graph) return [];
    if (selectedCourseId === "all") return graph.nodes;
    return graph.nodes.filter((n) => n.course_id === selectedCourseId);
  }, [graph, selectedCourseId]);

  const visibleEdges = useMemo(() => {
    if (!graph) return [];
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    return graph.edges.filter(
      (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
    );
  }, [graph, visibleNodes]);

  const selectedNode: KnowledgeGraphNodeData | null = useMemo(
    () => visibleNodes.find((n) => n.id === selectedNodeId) ?? null,
    [visibleNodes, selectedNodeId]
  );

  // Prerequisite chain highlighting when a weak node is clicked
  const prereqChain = useMemo(() => {
    if (!selectedNode || selectedNode.status !== "weak") {
      return null;
    }
    return getPrerequisiteChain(selectedNode.id, visibleNodes, visibleEdges);
  }, [selectedNode, visibleNodes, visibleEdges]);

  const positions = useMemo(
    () => computeDagrePositions(visibleNodes, visibleEdges, "LR"),
    [visibleNodes, visibleEdges]
  );

  const flowNodes: ConceptFlowNode[] = useMemo(() => {
    return visibleNodes.map((node) => {
      const isSelected = node.id === selectedNodeId;
      const inChain = prereqChain ? prereqChain.highlightedNodeIds.has(node.id) : false;
      const isDimmed = Boolean(prereqChain && !inChain);
      return {
        id: node.id,
        type: "concept",
        position: positions[node.id] ?? { x: 0, y: 0 },
        data: {
          concept: node,
          isSelected,
          isHighlighted: Boolean(prereqChain && inChain && !isSelected),
          isDimmed,
          transitionFrom: transitions[node.id] ?? null,
        },
      };
    });
  }, [visibleNodes, positions, selectedNodeId, prereqChain, transitions]);

  const flowEdges: Edge[] = useMemo(() => {
    return visibleEdges.map((edge) => {
      const isHighlighted = Boolean(
        prereqChain && prereqChain.highlightedEdgeIds.has(edge.id)
      );
      const isDimmed = Boolean(prereqChain && !isHighlighted);

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: isHighlighted,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? "#A78BFA" : "#64748B",
          width: 18,
          height: 18,
        },
        style: {
          stroke: isHighlighted ? "#8B5CF6" : "rgba(148, 163, 184, 0.45)",
          strokeWidth: isHighlighted ? 2.6 : 1.6,
          opacity: isDimmed ? 0.14 : 1,
          transition: "opacity 250ms ease, stroke 250ms ease",
        },
      };
    });
  }, [visibleEdges, prereqChain]);

  const handleNodeClick: NodeMouseHandler<ConceptFlowNode> = useCallback((_, node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const hasSelectedNode = Boolean(selectedNode);
  useEffect(() => {
    if (!rfInstance || visibleNodes.length === 0) return;
    const timer = setTimeout(() => {
      rfInstance.fitView({ padding: 0.24, duration: 300 });
    }, 80);
    return () => clearTimeout(timer);
  }, [rfInstance, selectedCourseId, visibleNodes.length, hasSelectedNode]);

  const displayedOverallMastery = useMemo(() => {
    if (!graph) return 0;
    if (selectedCourseId === "all") return graph.overall_mastery;
    const assessed = visibleNodes.filter(
      (n) => n.status !== "not_assessed" && n.mastery_score !== null
    );
    if (assessed.length === 0) return 0;
    const sum = assessed.reduce((acc, n) => acc + (n.mastery_score ?? 0), 0);
    return Math.round((sum / assessed.length) * 10) / 10;
  }, [graph, selectedCourseId, visibleNodes]);

  const statusCounts = useMemo(() => {
    const counts: Record<MasteryStatus, number> = {
      mastered: 0,
      improving: 0,
      weak: 0,
      not_assessed: 0,
    };
    for (const n of visibleNodes) {
      counts[n.status] += 1;
    }
    return counts;
  }, [visibleNodes]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
      {/* Top HUD: Overall Mastery + Status Legend + Controls */}
      <Card variant="glass" className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div>
              <p className="text-caption uppercase tracking-wider text-muted-foreground">
                Overall Mastery
              </p>
              <div className="flex items-baseline gap-3 mt-1">
                <AnimatedCounter
                  value={displayedOverallMastery}
                  decimals={0}
                  className="text-5xl font-bold tracking-tight gradient-text tabular-nums"
                />
                <span className="text-body text-muted-foreground">
                  {visibleNodes.filter((n) => n.status !== "not_assessed").length} /{" "}
                  {visibleNodes.length} concepts assessed
                </span>
              </div>
            </div>
          </div>

          {/* 4-state legend */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-status-success/40 bg-status-success/10 px-3 py-1 text-caption text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-status-success" />
              Mastered ({statusCounts.mastered})
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-blue/40 bg-accent-blue/10 px-3 py-1 text-caption text-blue-300">
              <span className="h-2 w-2 rounded-full bg-accent-blue" />
              Improving ({statusCounts.improving})
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-status-danger/40 bg-status-danger/10 px-3 py-1 text-caption text-red-300">
              <span className="h-2 w-2 rounded-full bg-status-danger" />
              Weak ({statusCounts.weak})
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3 py-1 text-caption text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
              Not assessed ({statusCounts.not_assessed})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                loadGraph(false);
                loadRecommendation(selectedCourseId);
              }}
              aria-label="Refresh knowledge graph"
            >
              <RefreshCw className="h-4 w-4" />
              Sync
            </Button>
          </div>
        </div>

        {/* Course filter pills */}
        {courses.length > 1 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="text-caption text-muted-foreground mr-1">Course:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCourseId("all");
                setSelectedNodeId(null);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-caption transition-colors",
                selectedCourseId === "all"
                  ? "bg-brand-gradient text-white shadow-glow"
                  : "bg-surface-elevated text-muted-foreground hover:text-foreground"
              )}
            >
              All Courses
            </button>
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCourseId(c.id);
                  setSelectedNodeId(null);
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-caption transition-colors",
                  selectedCourseId === c.id
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "bg-surface-elevated text-muted-foreground hover:text-foreground"
                )}
              >
                {c.title}
              </button>
            ))}
          </div>
        ) : null}
      </Card>

      {/* Prerequisite Chain Inline Banner when a Weak Node is clicked */}
      <AnimatePresence>
        {selectedNode && selectedNode.status === "weak" ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass-panel flex flex-col gap-3 rounded-lg border-status-danger/40 bg-status-danger/[0.08] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-status-danger/20 text-status-danger">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <p className="text-body text-foreground">
                {prereqChain?.primaryPrereq ? (
                  <>
                    <span className="font-semibold text-red-200">
                      Revise {prereqChain.primaryPrereq.title} before moving to{" "}
                      {selectedNode.title}.
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Prerequisite chain highlighted below.
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-red-200">
                    {selectedNode.title} is a foundational weak concept — review it before advancing.
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {prereqChain?.primaryPrereq ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedNodeId(prereqChain.primaryPrereq!.id)}
                >
                  Inspect {prereqChain.primaryPrereq.title}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedNodeId(null)}
              >
                Clear focus
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Workspace: Interactive Graph + Side Panel */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div
          className={cn(
            "relative h-[540px] rounded-xl border border-border bg-surface/80 overflow-hidden shadow-surface transition-all",
            selectedNode ? "lg:col-span-8" : "lg:col-span-12"
          )}
        >
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-accent-violet" />
              <span>Loading your knowledge graph...</span>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-status-danger" />
              <p className="text-body text-foreground">{error}</p>
              <Button variant="secondary" size="sm" onClick={() => loadGraph(true)}>
                Try again
              </Button>
            </div>
          ) : visibleNodes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <Network className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-h3 text-foreground">No concepts found yet</h3>
              <p className="max-w-md text-body text-muted-foreground">
                Publish or seed course concepts in Supabase to visualize your interactive knowledge graph.
              </p>
            </div>
          ) : (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={NODE_TYPES}
              onInit={setRfInstance}
              onNodeClick={handleNodeClick}
              onPaneClick={() => setSelectedNodeId(null)}
              fitView
              fitViewOptions={{ padding: 0.24 }}
              minZoom={0.4}
              maxZoom={1.6}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={22}
                size={1.2}
                color="rgba(148, 163, 184, 0.18)"
              />
              <Controls className="!bg-surface-elevated !border-border-strong !rounded-lg [&>button]:!bg-surface-elevated [&>button]:!border-border [&>button]:!text-foreground hover:[&>button]:!bg-muted" />
              <MiniMap
                pannable
                zoomable
                className="!bg-surface/90 !border !border-border-strong !rounded-lg"
                maskColor="rgba(10, 14, 26, 0.72)"
                nodeColor={(n) => {
                  const status = (n.data as ConceptFlowNode["data"])?.concept?.status;
                  if (status === "mastered") return "#10B981";
                  if (status === "improving") return "#3B82F6";
                  if (status === "weak") return "#EF4444";
                  return "#64748B";
                }}
              />
            </ReactFlow>
          )}
        </div>

        {/* Glass Side Panel on Node Click */}
        <AnimatePresence>
          {selectedNode ? (
            <motion.aside
              key={selectedNode.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="lg:col-span-4"
            >
              <Card variant="glass" className="h-[540px] flex flex-col overflow-hidden">
                <CardHeader className="border-b border-border pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_BADGE_VARIANT[selectedNode.status]}>
                          {STATUS_LABEL[selectedNode.status]}
                        </Badge>
                        <span className="text-caption text-muted-foreground">
                          {selectedNode.course_title}
                        </span>
                      </div>
                      <CardTitle className="pt-1">{selectedNode.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Close detail panel"
                      onClick={() => setSelectedNodeId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedNode.summary ? (
                    <p className="text-caption text-muted-foreground mt-1">
                      {selectedNode.summary}
                    </p>
                  ) : null}
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto py-4 space-y-5">
                  {/* Mastery Metrics */}
                  <div className="rounded-lg border border-border bg-surface/60 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-caption text-muted-foreground">
                        Current Mastery
                      </span>
                      <span className="text-h2 font-bold text-foreground tabular-nums">
                        {selectedNode.mastery_score !== null
                          ? `${Math.round(selectedNode.mastery_score)}%`
                          : "Not assessed"}
                      </span>
                    </div>
                    {selectedNode.confidence !== null ? (
                      <p className="mt-1 text-caption text-muted-foreground">
                        Confidence: {Math.round(selectedNode.confidence * 100)}%
                      </p>
                    ) : null}
                  </div>

                  {/* Past Mistakes & Questions Attempted */}
                  <div className="space-y-2.5">
                    <h4 className="text-caption font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      Past Attempts & Mistakes
                    </h4>
                    {selectedNode.past_attempts.length === 0 ? (
                      <p className="rounded-md border border-border bg-surface/40 p-3 text-caption text-muted-foreground">
                        No quiz attempts recorded for this concept yet.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedNode.past_attempts.map((attempt) => (
                          <div
                            key={attempt.result_id}
                            className="rounded-md border border-border bg-surface/50 p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-caption font-medium text-foreground truncate">
                                {attempt.assessment_title}
                              </span>
                              <span
                                className={cn(
                                  "text-caption font-semibold tabular-nums",
                                  attempt.passed
                                    ? "text-status-success"
                                    : "text-status-danger"
                                )}
                              >
                                {Math.round(attempt.score)}%
                              </span>
                            </div>
                            {attempt.mistakes.length > 0 ? (
                              <div className="space-y-1.5 border-t border-border pt-2">
                                {attempt.mistakes.map((m, i) => (
                                  <div
                                    key={`${attempt.result_id}-${m.question_id}-${i}`}
                                    className="text-caption space-y-0.5"
                                  >
                                    <p className="text-red-300 font-medium">
                                      Missed: {m.prompt}
                                    </p>
                                    <p className="text-muted-foreground">{m.feedback}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-caption text-emerald-300/90 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                All questions answered accurately.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recommended Next Exercises */}
                  <div className="space-y-2.5">
                    <h4 className="text-caption font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      Recommended Next Exercises
                    </h4>
                    {selectedNode.recommended_exercises.length > 0 ? (
                      <div className="space-y-2">
                        {selectedNode.recommended_exercises.map((ex) => (
                          <Link
                            key={ex.assessment_id}
                            href="/assessments"
                            className="flex items-center justify-between rounded-md border border-border bg-surface/60 px-3 py-2.5 text-caption transition-colors hover:border-accent-violet/60 hover:bg-surface-elevated"
                          >
                            <div>
                              <p className="font-medium text-foreground">{ex.title}</p>
                              <p className="text-muted-foreground capitalize">
                                {ex.assessment_type.replace("_", " ")} • Pass {Math.round(ex.passing_score)}%
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-accent-blue shrink-0" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-md border border-border bg-surface/40 p-3 text-caption text-muted-foreground">
                        No linked quizzes yet — practice directly with the AI Tutor.
                      </p>
                    )}

                    <Button variant="secondary" size="sm" className="w-full" asChild>
                      <Link
                        href={`/tutor?topic=${encodeURIComponent(selectedNode.title)}`}
                      >
                        <Bot className="h-4 w-4" />
                        Practice {selectedNode.title} with AI Tutor
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>

      {/* AI Recommendation Panel (Gemini) */}
      <Card variant="glass" className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-2.5 py-0.5 text-caption font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5" />
                AI Next-Step Recommendation
              </span>
              {recommendation?.concept_title ? (
                <Badge variant={recommendation.status ? STATUS_BADGE_VARIANT[recommendation.status] : "outline"}>
                  Focus: {recommendation.concept_title}
                  {recommendation.mastery_score !== null &&
                  recommendation.mastery_score !== undefined
                    ? ` (${Math.round(recommendation.mastery_score)}%)`
                    : ""}
                </Badge>
              ) : null}
              {recommendation?.prerequisites?.length ? (
                <span className="text-caption text-muted-foreground">
                  Prerequisites: {recommendation.prerequisites.join(", ")}
                </span>
              ) : null}
            </div>

            {recLoading ? (
              <div className="h-10 w-full max-w-xl animate-pulse rounded-md bg-surface-elevated" />
            ) : recError ? (
              <p className="text-body text-status-danger">{recError}</p>
            ) : (
              <p className="text-body text-foreground leading-relaxed">
                {recommendation?.recommendation}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadRecommendation(selectedCourseId)}
              disabled={recLoading}
            >
              <RefreshCw className={cn("h-4 w-4", recLoading && "animate-spin")} />
              Refresh AI
            </Button>
            {recommendation?.concept_title ? (
              <Button variant="primary" size="sm" asChild>
                <Link
                  href={`/tutor?topic=${encodeURIComponent(
                    recommendation.concept_title
                  )}`}
                >
                  <Bot className="h-4 w-4" />
                  Study Now
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
    </main>
  );
}
