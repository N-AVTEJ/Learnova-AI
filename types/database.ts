export type UserRole = "learner" | "instructor" | "admin";
export type CourseDifficulty = "beginner" | "intermediate" | "advanced";
export type AssessmentType = "diagnostic" | "quiz" | "mastery_check";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  difficulty: CourseDifficulty;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Concept {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  summary: string | null;
  order_index: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ConceptDependency {
  id: string;
  course_id: string;
  prerequisite_concept_id: string;
  dependent_concept_id: string;
  weight: number;
  created_at: string;
}

export interface Assessment {
  id: string;
  course_id: string;
  concept_id: string | null;
  title: string;
  assessment_type: AssessmentType;
  questions: unknown[];
  passing_score: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentResult {
  id: string;
  user_id: string;
  assessment_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, unknown>;
  completed_at: string;
}

export interface MasteryScore {
  id: string;
  user_id: string;
  concept_id: string;
  score: number;
  confidence: number;
  last_assessed_at: string | null;
  updated_at: string;
}
