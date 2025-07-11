export interface User {
  id: string;
  username?: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  provider?: "google" | "github";
  username_set?: boolean;
}

export interface Post {
  id: string;
  content: string;
  image?: string;
  author: User;
  createdAt: Date;
  reactions: {
    happy: string[];
    sad: string[];
  };
  commentsCount: number;
  topics: string[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string; // For replies to comments
  createdAt: Date;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  userId: string;
  type: "new_post" | "mention" | "follow" | "comment";
  title: string;
  message: string;
  relatedPostId?: string;
  relatedUserId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export type Theme = "light" | "dark";

export type AuthModalType = "login" | null;

export interface Topic {
  id: string;
  name: string;
  color: string;
  bgColor: string;
}

export const AVAILABLE_TOPICS: Topic[] = [
  {
    id: "javascript",
    name: "JavaScript",
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  {
    id: "typescript",
    name: "TypeScript",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    id: "react",
    name: "React",
    color: "text-cyan-700 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
  },
  {
    id: "vue",
    name: "Vue.js",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  {
    id: "angular",
    name: "Angular",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
  {
    id: "nodejs",
    name: "Node.js",
    color: "text-lime-700 dark:text-lime-400",
    bgColor: "bg-lime-100 dark:bg-lime-900/20",
  },
  {
    id: "python",
    name: "Python",
    color: "text-indigo-700 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
  },
  {
    id: "java",
    name: "Java",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
  },
  {
    id: "csharp",
    name: "C#",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    id: "php",
    name: "PHP",
    color: "text-violet-700 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/20",
  },
  {
    id: "css",
    name: "CSS",
    color: "text-pink-700 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
  },
  {
    id: "html",
    name: "HTML",
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/20",
  },
  {
    id: "database",
    name: "Database",
    color: "text-teal-700 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/20",
  },
  {
    id: "devops",
    name: "DevOps",
    color: "text-slate-700 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-900/20",
  },
  {
    id: "mobile",
    name: "Mobile",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
  },
  {
    id: "ai",
    name: "AI/ML",
    color: "text-fuchsia-700 dark:text-fuchsia-400",
    bgColor: "bg-fuchsia-100 dark:bg-fuchsia-900/20",
  },
  {
    id: "career",
    name: "Career",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
  },
  {
    id: "tutorial",
    name: "Tutorial",
    color: "text-sky-700 dark:text-sky-400",
    bgColor: "bg-sky-100 dark:bg-sky-900/20",
  },
  {
    id: "pregunta",
    name: "Pregunta",
    color: "text-gray-400 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
  },
  {
    id: "discusion",
    name: "Discusión",
    color: "text-stone-400 dark:text-stone-400",
    bgColor: "bg-stone-100 dark:bg-stone-900/20",
  },
];
