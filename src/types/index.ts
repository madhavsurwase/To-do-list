export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type FilterType = "all" | "active" | "completed";
export type SortByType = "newest" | "oldest" | "alphabetical";
