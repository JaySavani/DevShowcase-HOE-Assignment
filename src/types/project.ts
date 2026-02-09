export type ProjectStatus = "pending" | "approved" | "rejected";

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  projectCount: number;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  githubUrl: string;
  websiteUrl: string | null;
  categories: Category[];
  status: ProjectStatus;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    upvotes: number;
    downvotes: number;
    commentCount: number;
  };
}
