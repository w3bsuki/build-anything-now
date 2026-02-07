import type { ForumBoard, ForumCategory, ForumSort } from "@/types";

export const BOARD_OPTIONS: Array<{ value: ForumBoard; label: string }> = [
  { value: "rescue", label: "Rescue" },
  { value: "community", label: "Community" },
];

export const CATEGORY_OPTIONS: Record<ForumBoard, Array<{ value: ForumCategory; label: string }>> = {
  rescue: [
    { value: "urgent_help", label: "Urgent Help" },
    { value: "case_update", label: "Case Update" },
    { value: "adoption", label: "Adoption" },
    { value: "advice", label: "Advice" },
  ],
  community: [
    { value: "general", label: "General" },
    { value: "advice", label: "Advice" },
    { value: "announcements", label: "Announcements" },
  ],
};

export const SORT_OPTIONS: Array<{ value: ForumSort; label: string }> = [
  { value: "local_recent", label: "Local + Recent" },
  { value: "newest", label: "Newest" },
  { value: "top", label: "Top" },
];

export const REPORT_REASON_OPTIONS: Array<{
  value: "spam" | "harassment" | "misinformation" | "scam" | "animal_welfare" | "other";
  label: string;
}> = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "misinformation", label: "Misinformation" },
  { value: "scam", label: "Scam" },
  { value: "animal_welfare", label: "Animal welfare concern" },
  { value: "other", label: "Other" },
];
