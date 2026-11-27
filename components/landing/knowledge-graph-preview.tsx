"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  mastery: number;
  status: "mastered" | "active" | "locked";
}

const NODES: GraphNode[] = [
  { id: "basics", label: "Arrays & Big-O", x: 110, y: 150, mastery: 94, status: "mastered" },
  { id: "recursion", label: "Recursion", x: 280, y: 75, mastery: 88, status: "mastered" },
  { id: "trees", label: "Binary Trees", x: 280, y: 225, mastery: 76, status: "active" },
  { id: "graphs", label: "Graph Traversal", x: 465, y: 150, mastery: 62, status: "active" },
  { id: "dp", label: "Dynamic Prog.", x: 640, y: 150, mastery: 20, status: "locked" },
];

const EDGES: [string, string][] = [
  ["basics", "recursion"],
  ["basics", "trees"],
  ["recursion", "graphs"],
  ["trees", "graphs"],
  ["graphs", "dp"],
];

function getNode(id: string): GraphNode {
  return NODES.find((n) => n.id === id) || NODES[0];
}

export function KnowledgeGraphPreview() {
  return (
    <div className="glass-panel relative overflow-hidden rounded-xl p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-violet animate-pulse" />
          <span className="text-caption font-medium text-foreground">
            Live Knowledge Graph Preview
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Mastered</Badge>
          <Badge variant="accent">In Progress</Badge>
          <Badge variant="outline">Prerequisite Locked</Badge>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-surface/80">
        <svg
          viewBox="0 0 760 300"
          className="h-auto w-full"
          role="img"
          aria-label="Animated knowledge graph preview"
        >
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>
            <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Subtle background grid */}
          <pattern id="kg-grid" width="38" height="38" patternUnits="userSpaceOnUse">
            <path
              d="M 38 0 L 0 0 0 38"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
          </pattern>
          <rect width="760" height="300" fill="url(#kg-grid)" />

          {/* Edges */}
          {EDGES.map(([fromId, toId], idx) => {
            const from = getNode(fromId);
            const to = getNode(toId);
            return (
              <g key={`${fromId}-${toId}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="2"
                />
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="url(#edgeGradient)"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  initial={{ strokeDashoffset: 48, opacity: 0.4 }}
                  animate={{ strokeDashoffset: 0, opacity: 0.95 }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.4,
                    ease: "linear",
                    delay: idx * 0.25,
                  }}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((node, idx) => {
            const strokeColor =
              node.status === "mastered"
                ? "#10B981"
                : node.status === "active"
                ? "#7C3AED"
                : "rgba(255,255,255,0.25)";

            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
              >
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={34}
                  fill="#111629"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  filter={node.status !== "locked" ? "url(#nodeGlow)" : undefined}
                  animate={
                    node.status === "active"
                      ? { scale: [1, 1.06, 1] }
                      : undefined
                  }
                  transition={{
                    repeat: Infinity,
                    duration: 2.6,
                    ease: "easeInOut",
                  }}
                />
                <text
                  x={node.x}
                  y={node.y - 2}
                  textAnchor="middle"
                  fill="#F1F5F9"
                  fontSize="11"
                  fontWeight="600"
                >
                  {node.mastery}%
                </text>
                <text
                  x={node.x}
                  y={node.y + 13}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                >
                  {node.status === "mastered"
                    ? "Mastered"
                    : node.status === "active"
                    ? "Active"
                    : "Locked"}
                </text>
                <rect
                  x={node.x - 54}
                  y={node.y + 42}
                  width="108"
                  height="22"
                  rx="6"
                  fill="#171E36"
                  stroke="rgba(255,255,255,0.1)"
                />
                <text
                  x={node.x}
                  y={node.y + 56}
                  textAnchor="middle"
                  fill="#F1F5F9"
                  fontSize="10.5"
                  fontWeight="500"
                >
                  {node.label}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
