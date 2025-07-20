export const SKILL_LEVEL = ["beginner", "intermediate", "advanced"] as const;
export type SkillLevel = typeof SKILL_LEVEL[number];
