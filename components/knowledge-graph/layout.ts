import dagre from "@dagrejs/dagre";
import type {
  KnowledgeGraphEdgeData,
  KnowledgeGraphNodeData,
} from "./types";

export const NODE_WIDTH = 248;
export const NODE_HEIGHT = 112;

export function computeDagrePositions(
  nodes: KnowledgeGraphNodeData[],
  edges: KnowledgeGraphEdgeData[],
  direction: "LR" | "TB" = "LR"
): Record<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 56,
    ranksep: 96,
    marginx: 32,
    marginy: 32,
  });

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const edge of edges) {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(g);

  const positions: Record<string, { x: number; y: number }> = {};
  for (const node of nodes) {
    const pos = g.node(node.id);
    if (pos) {
      positions[node.id] = {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      };
    } else {
      positions[node.id] = { x: 0, y: 0 };
    }
  }
  return positions;
}

export interface PrerequisiteChainResult {
  highlightedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
  primaryPrereq: KnowledgeGraphNodeData | null;
}

export function getPrerequisiteChain(
  targetId: string,
  nodes: KnowledgeGraphNodeData[],
  edges: KnowledgeGraphEdgeData[]
): PrerequisiteChainResult {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const highlightedNodeIds = new Set<string>([targetId]);
  const highlightedEdgeIds = new Set<string>();
  const ancestors: KnowledgeGraphNodeData[] = [];

  const queue: string[] = [targetId];
  const visited = new Set<string>([targetId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of edges) {
      if (edge.target === current) {
        highlightedEdgeIds.add(edge.id);
        if (!visited.has(edge.source)) {
          visited.add(edge.source);
          highlightedNodeIds.add(edge.source);
          queue.push(edge.source);
          const prereqNode = nodeById.get(edge.source);
          if (prereqNode) {
            ancestors.push(prereqNode);
          }
        }
      }
    }
  }

  // Pick the most actionable prerequisite X for "Revise X before moving to Y":
  // prefer weakest assessed or not_assessed prerequisite, otherwise direct/earliest prerequisite
  let primaryPrereq: KnowledgeGraphNodeData | null = null;
  if (ancestors.length > 0) {
    const sorted = [...ancestors].sort((a, b) => {
      const scoreA = a.mastery_score ?? -1;
      const scoreB = b.mastery_score ?? -1;
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.order_index - b.order_index;
    });
    primaryPrereq = sorted[0];
  }

  return {
    highlightedNodeIds,
    highlightedEdgeIds,
    primaryPrereq,
  };
}
