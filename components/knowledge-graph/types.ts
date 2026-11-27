export type MasteryStatus = "mastered" | "improving" | "weak" | "not_assessed";

export interface MistakeItem {
  question_id: string;
  prompt: string;
  feedback: string;
  student_answer: string;
}

export interface ConceptAttempt {
  result_id: string;
  assessment_id: string;
  assessment_title: string;
  score: number;
  passed: boolean;
  completed_at: string;
  mistakes: MistakeItem[];
}

export interface RecommendedExercise {
  assessment_id: string;
  title: string;
  assessment_type: string;
  passing_score: number;
}

export interface KnowledgeGraphNodeData {
  id: string;
  course_id: string;
  course_title: string;
  slug: string;
  title: string;
  summary: string | null;
  order_index: number;
  mastery_score: number | null;
  confidence: number | null;
  status: MasteryStatus;
  last_assessed_at: string | null;
  past_attempts: ConceptAttempt[];
  recommended_exercises: RecommendedExercise[];
}

export interface KnowledgeGraphEdgeData {
  id: string;
  course_id: string;
  source: string;
  target: string;
  weight: number;
}

export interface KnowledgeGraphResponse {
  overall_mastery: number;
  assessed_count: number;
  total_count: number;
  status_counts: Record<MasteryStatus, number>;
  nodes: KnowledgeGraphNodeData[];
  edges: KnowledgeGraphEdgeData[];
}

export interface RecommendationResponse {
  concept_id: string | null;
  concept_title: string | null;
  course_title: string | null;
  mastery_score: number | null;
  status: MasteryStatus | null;
  prerequisites: string[];
  recommendation: string;
  generated_at: string;
}
