import { Post, User, Comment } from "../types";

const mockUsers: User[] = [
  {
    id: "1",
    username: "codemaster",
    full_name: "Alex Rodriguez",
    email: "alex.rodriguez@gmail.com",
    avatar_url:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    provider: "google",
  },
  {
    id: "2",
    username: "reactguru",
    full_name: "Emma Chen",
    email: "emma.chen@users.noreply.github.com",
    avatar_url:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100",
    provider: "github",
  },
  {
    id: "3",
    username: "pythonista",
    full_name: "Michael Thompson",
    email: "michael.thompson@gmail.com",
    avatar_url:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
    provider: "google",
  },
];

export const mockPosts: Post[] = [
  {
    id: "1",
    content:
      "Just discovered this amazing TypeScript feature that automatically infers complex union types. Mind blown! 🤯",
    topics: ["typescript", "tutorial"],
    author: mockUsers[0],
    createdAt: new Date("2024-12-15T10:30:00"),
    reactions: {
      happy: ["2", "3"],
      sad: [],
    },
    commentsCount: 5,
  },
  {
    id: "2",
    content:
      "I hate PHP. There, I said it. The inconsistent function naming drives me crazy every single day.",
    topics: ["php", "discussion"],
    image:
      "https://images.pexels.com/photos/177598/pexels-photo-177598.jpeg?auto=compress&cs=tinysrgb&w=800",
    author: mockUsers[1],
    createdAt: new Date("2024-12-15T09:15:00"),
    reactions: {
      happy: ["1"],
      sad: ["3"],
    },
    commentsCount: 10,
  },
  {
    id: "3",
    content:
      "Hot take: CSS Grid is better than Flexbox for 90% of layouts. Fight me! 😤",
    topics: ["css", "discussion"],
    author: mockUsers[2],
    createdAt: new Date("2024-12-15T08:45:00"),
    reactions: {
      happy: ["1", "2"],
      sad: [],
    },
    commentsCount: 12,
  },
  {
    id: "4",
    content:
      "Finally understood closures in JavaScript after 2 years of web development. Better late than never! 📚",
    topics: ["javascript", "career", "tutorial"],
    image:
      "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800",
    author: mockUsers[0],
    createdAt: new Date("2024-12-14T16:20:00"),
    reactions: {
      happy: ["2", "3"],
      sad: [],
    },
    commentsCount: 7,
  },
];

export const mockComments: Comment[] = [
  {
    id: "1",
    content: "Same here! TypeScript keeps surprising me with its power.",
    author: mockUsers[1],
    postId: "1",
    createdAt: new Date("2024-12-15T10:45:00"),
  },
  {
    id: "2",
    content:
      "Which feature specifically? I'm always looking to learn more TS tricks.",
    author: mockUsers[2],
    postId: "1",
    createdAt: new Date("2024-12-15T11:00:00"),
  },
  {
    id: "3",
    content: "Conditional types and mapped types are game changers!",
    author: mockUsers[0],
    postId: "1",
    parentId: "2",
    createdAt: new Date("2024-12-15T11:15:00"),
  },
  {
    id: "4",
    content: "Thanks! I'll look into those.",
    author: mockUsers[2],
    postId: "1",
    parentId: "3",
    createdAt: new Date("2024-12-15T11:30:00"),
  },
  {
    id: "5",
    content:
      "PHP has its problems, but the ecosystem is solid. Laravel makes it bearable.",
    author: mockUsers[0],
    postId: "2",
    createdAt: new Date("2024-12-15T09:30:00"),
  },
  {
    id: "6",
    content:
      "Laravel is great, but the language itself still has inconsistencies.",
    author: mockUsers[1],
    postId: "2",
    parentId: "5",
    createdAt: new Date("2024-12-15T09:45:00"),
  },
  {
    id: "7",
    content: "True, but every language has quirks. PHP 8+ is much better.",
    author: mockUsers[2],
    postId: "2",
    parentId: "6",
    createdAt: new Date("2024-12-15T10:00:00"),
  },
];
