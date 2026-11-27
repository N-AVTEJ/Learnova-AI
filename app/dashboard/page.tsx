import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import {
  DashboardClient,
  type DashboardCourseItem,
  type RecentPerformanceItem,
  type RecommendedLessonItem,
  type WeeklyActivityPoint,
} from "@/components/dashboard/dashboard-client";
import { createClient } from "@/lib/supabase/server";

function computeStreakDays(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const uniqueDays = new Set(
    completedDates.map((iso) => new Date(iso).toISOString().slice(0, 10))
  );

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (!uniqueDays.has(todayKey) && !uniqueDays.has(yesterdayKey)) {
    return 0;
  }

  let streak = 0;
  const cursor = new Date(uniqueDays.has(todayKey) ? today : yesterday);
  while (uniqueDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function buildWeeklyActivity(
  results: { score: number; completed_at: string }[]
): WeeklyActivityPoint[] {
  const days: WeeklyActivityPoint[] = [];
  const today = new Date();

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - offset);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    });

    const dayResults = results.filter(
      (r) => new Date(r.completed_at).toISOString().slice(0, 10) === key
    );
    const avgScore =
      dayResults.length > 0
        ? Math.round(
            dayResults.reduce((sum, r) => sum + Number(r.score), 0) /
              dayResults.length
          )
        : 0;

    days.push({
      day: label,
      assessments: dayResults.length,
      avgScore,
    });
  }

  return days;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [coursesRes, conceptsRes, masteryRes, resultsRes] = await Promise.all([
    supabase
      .from("courses")
      .select("id, slug, title, description, difficulty")
      .order("created_at", { ascending: true }),
    supabase
      .from("concepts")
      .select("id, course_id, title, summary, order_index")
      .order("order_index", { ascending: true }),
    supabase
      .from("mastery_scores")
      .select("concept_id, score")
      .eq("user_id", user.id),
    supabase
      .from("assessment_results")
      .select("id, score, passed, completed_at, assessments(title, assessment_type)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(50),
  ]);

  const coursesData = coursesRes.data ?? [];
  const conceptsData = conceptsRes.data ?? [];
  const masteryData = masteryRes.data ?? [];
  const resultsData = resultsRes.data ?? [];

  const masteryMap = new Map<string, number>();
  for (const row of masteryData) {
    masteryMap.set(row.concept_id, Number(row.score));
  }

  const courseTitleMap = new Map<string, string>();
  for (const c of coursesData) {
    courseTitleMap.set(c.id, c.title);
  }

  const courses: DashboardCourseItem[] = coursesData.map((course) => {
    const courseConcepts = conceptsData.filter(
      (concept) => concept.course_id === course.id
    );
    const avgMastery =
      courseConcepts.length > 0
        ? courseConcepts.reduce(
            (sum, concept) => sum + (masteryMap.get(concept.id) ?? 0),
            0
          ) / courseConcepts.length
        : 0;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      conceptCount: courseConcepts.length,
      masteryPercent: Math.round(avgMastery),
    };
  });

  const overallMastery =
    masteryData.length > 0
      ? masteryData.reduce((sum, m) => sum + Number(m.score), 0) /
        masteryData.length
      : 0;

  const masteredConceptsCount = masteryData.filter(
    (m) => Number(m.score) >= 80
  ).length;

  const streakDays = computeStreakDays(
    resultsData.map((r) => r.completed_at)
  );

  const weeklyActivity = buildWeeklyActivity(
    resultsData.map((r) => ({
      score: Number(r.score),
      completed_at: r.completed_at,
    }))
  );

  const recentPerformance: RecentPerformanceItem[] = resultsData
    .slice(0, 4)
    .map((r) => {
      const assessmentRel = Array.isArray(r.assessments)
        ? r.assessments[0]
        : r.assessments;
      return {
        id: r.id,
        assessmentTitle: assessmentRel?.title || "Assessment",
        assessmentType: assessmentRel?.assessment_type || "quiz",
        score: Number(r.score),
        passed: Boolean(r.passed),
        completedAt: r.completed_at,
      };
    });

  const recommendedLessons: RecommendedLessonItem[] = conceptsData
    .map((concept) => ({
      conceptId: concept.id,
      conceptTitle: concept.title,
      courseTitle: courseTitleMap.get(concept.course_id) || "Course",
      summary: concept.summary,
      masteryScore: masteryMap.get(concept.id) ?? 0,
    }))
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background bg-radial-spotlight">
      <Navbar userEmail={user.email} />
      <DashboardClient
        userEmail={user.email || ""}
        overallMastery={overallMastery}
        streakDays={streakDays}
        completedCount={resultsData.length}
        masteredConceptsCount={masteredConceptsCount}
        totalConceptsCount={conceptsData.length}
        courses={courses}
        weeklyActivity={weeklyActivity}
        recentPerformance={recentPerformance}
        recommendedLessons={recommendedLessons}
      />
    </div>
  );
}
