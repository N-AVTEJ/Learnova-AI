"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KnowledgeGraphNodeData, MasteryStatus } from "./types";

export interface ConceptFlowNodeData extends Record<string, unknown> {
  concept: KnowledgeGraphNodeData;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  transitionFrom?: MasteryStatus | null;
}

export type ConceptFlowNode = Node<ConceptFlowNodeData, "concept">;

const STATUS_STYLE: Record<
  MasteryStatus,
  {
    label: string;
    container: string;
    bar: string;
    pill: string;
    iconColor: string;
  }
> = {
  mastered: {
    label: "Mastered",
    container:
      "border-status-success/65 bg-status-success/[0.11] shadow-[0_0_26px_-6px_rgba(16,185,129,0.5)]",
    bar: "bg-status-success",
    pill: "bg-status-success/20 text-emerald-300 border-status-success/40",
    iconColor: "text-status-success",
  },
  improving: {
    label: "Improving",
    container:
      "border-accent-blue/65 bg-accent-blue/[0.11] shadow-[0_0_24px_-6px_rgba(59,130,246,0.48)]",
    bar: "bg-accent-blue",
    pill: "bg-accent-blue/20 text-blue-300 border-accent-blue/40",
    iconColor: "text-accent-blue",
  },
  weak: {
    label: "Weak",
    container:
      "border-status-danger/65 bg-status-danger/[0.11] shadow-[0_0_24px_-6px_rgba(239,68,68,0.45)]",
    bar: "bg-status-danger",
    pill: "bg-status-danger/20 text-red-300 border-status-danger/40",
    iconColor: "text-status-danger",
  },
  not_assessed: {
    label: "Not assessed",
    container:
      "border-border-strong bg-surface/90 shadow-surface",
    bar: "bg-muted-foreground/40",
    pill: "bg-muted/80 text-muted-foreground border-border-strong",
    iconColor: "text-muted-foreground",
  },
};

function StatusIcon({ status, className }: { status: MasteryStatus; className?: string }) {
  switch (status) {
    case "mastered":
      return <CheckCircle2 className={cn("h-4 w-4", className)} />;
    case "improving":
      return <TrendingUp className={cn("h-4 w-4", className)} />;
    case "weak":
      return <AlertTriangle className={cn("h-4 w-4", className)} />;
    default:
      return <CircleDashed className={cn("h-4 w-4", className)} />;
  }
}

function ConceptNodeComponent({ data }: NodeProps<ConceptFlowNode>) {
  const { concept, isSelected, isHighlighted, isDimmed, transitionFrom } = data;
  const style = STATUS_STYLE[concept.status];
  const scorePct = concept.mastery_score !== null ? Math.round(concept.mastery_score) : 0;
  const hasTransition = Boolean(transitionFrom && transitionFrom !== concept.status);

  return (
    <motion.div
      layout
      initial={hasTransition ? { scale: 0.92 } : { opacity: 0, scale: 0.96 }}
      animate={{
        opacity: isDimmed ? 0.22 : 1,
        scale: hasTransition ? [1.08, 1] : isSelected ? 1.03 : 1,
      }}
      transition={{
        duration: hasTransition ? 0.65 : 0.28,
        ease: "easeOut",
      }}
      whileHover={{ scale: isDimmed ? 1 : 1.02 }}
      className={cn(
        "relative w-[248px] rounded-lg border p-3.5 backdrop-blur-md transition-colors duration-300 cursor-pointer select-none",
        style.container,
        isSelected && "ring-2 ring-accent-violet shadow-glow",
        isHighlighted && !isSelected && "ring-2 ring-accent-blue/80 shadow-glow"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-border-strong"
      />

      {hasTransition && transitionFrom ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-3 right-3 rounded-full border border-accent-violet/50 bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold text-purple-200 shadow-glow"
        >
          {STATUS_STYLE[transitionFrom].label} → {style.label}
        </motion.div>
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium text-muted-foreground truncate">
          {concept.course_title}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium shrink-0",
            style.pill
          )}
        >
          <StatusIcon status={concept.status} className={cn("h-3 w-3", style.iconColor)} />
          {style.label}
        </span>
      </div>

      <h3 className="mt-1.5 text-sm font-semibold text-foreground leading-snug line-clamp-2">
        {concept.title}
      </h3>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-muted-foreground">Mastery</span>
          <span className="font-semibold text-foreground tabular-nums">
            {concept.mastery_score !== null ? `${scorePct}%` : "—"}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/70">
          <motion.div
            className={cn("h-full rounded-full", style.bar)}
            initial={{ width: hasTransition ? "10%" : `${scorePct}%` }}
            animate={{ width: `${concept.mastery_score !== null ? scorePct : 0}%` }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-border-strong"
      />
    </motion.div>
  );
}

export const ConceptNode = memo(ConceptNodeComponent);
