export const POST_STATUS = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUS)[number];
