import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPosts,
  getCommentsForPosts,
  createPost as createPostAPI,
  createComment as createCommentAPI,
} from "./supabase";
import { Post, Comment, User } from "../types";

// Query keys for consistent caching
export const queryKeys = {
  posts: ["posts"] as const,
  comments: (postIds: string[]) => ["comments", postIds] as const,
  userProfile: (userId: string) => ["profile", userId] as const,
} as const;

// Type definitions for API responses
type PostDetails = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  topics: string[];
  comments_count: number;
};

type FetchedComment = {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  post_id: string;
  author: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

// Custom hook for fetching posts with caching
export const usePosts = () => {
  return useQuery({
    queryKey: queryKeys.posts,
    queryFn: async (): Promise<Post[]> => {
      const fetchedPosts = await getPosts();

      if (!fetchedPosts || fetchedPosts.length === 0) {
        return [];
      }

      const formattedPosts: Post[] = (fetchedPosts as PostDetails[]).map(
        (post) => ({
          id: post.id,
          content: post.content,
          image: post.image_url ?? undefined,
          createdAt: new Date(post.created_at),
          author: {
            id: post.author.id,
            username: post.author.username,
            full_name: post.author.full_name ?? undefined,
            avatar_url: post.author.avatar_url ?? undefined,
          },
          topics: post.topics,
          commentsCount: post.comments_count,
          reactions: { happy: [], sad: [] }, // Placeholder
        })
      );

      return formattedPosts;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
};

// Custom hook for fetching comments with caching
export const useComments = (postIds: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.comments(postIds),
    queryFn: async (): Promise<Comment[]> => {
      if (postIds.length === 0) return [];

      const fetchedComments = await getCommentsForPosts(postIds);

      if (!fetchedComments) return [];

      const formattedComments: Comment[] = (
        fetchedComments as unknown as FetchedComment[]
      )
        .map((comment) => {
          if (!comment.author) {
            return null;
          }
          const author = comment.author;

          const authorData: User = { id: author.id };
          if (author.username) {
            authorData.username = author.username;
          }
          if (author.full_name) {
            authorData.full_name = author.full_name;
          }
          if (author.avatar_url) {
            authorData.avatar_url = author.avatar_url;
          }

          const newComment: Comment = {
            id: comment.id,
            content: comment.content,
            author: authorData,
            postId: comment.post_id,
            createdAt: new Date(comment.created_at),
          };

          if (comment.parent_id) {
            newComment.parentId = comment.parent_id;
          }

          return newComment;
        })
        .filter((c): c is Comment => c !== null);

      return formattedComments;
    },
    enabled: enabled && postIds.length > 0,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Mutation hook for creating posts with optimistic updates
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      authorId,
      topics,
      image,
    }: {
      content: string;
      authorId: string;
      topics: string[];
      image?: string;
    }) => {
      const newPostData = await createPostAPI(
        {
          content,
          author_id: authorId,
          image_url: image,
        },
        topics
      );
      return newPostData;
    },
    onSuccess: () => {
      // Invalidate and refetch posts to include the new post
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });

      // Optionally, we could also do optimistic updates here
      // by directly updating the cache without refetching
    },
    onError: (error: Error) => {
      console.error("Failed to create post:", error);
    },
  });
};

// Mutation hook for creating comments with optimistic updates
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      authorId,
      content,
      parentId,
    }: {
      postId: string;
      authorId: string;
      content: string;
      parentId?: string;
    }) => {
      const newCommentData = await createCommentAPI({
        post_id: postId,
        author_id: authorId,
        content,
        parent_id: parentId,
      });
      return newCommentData;
    },
    onSuccess: () => {
      // Invalidate comments cache to include the new comment
      const allPostIds =
        queryClient
          .getQueryData<Post[]>(queryKeys.posts)
          ?.map((p: Post) => p.id) || [];
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(allPostIds),
      });

      // Also invalidate posts to update comment counts
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
    onError: (error: Error) => {
      console.error("Failed to create comment:", error);
    },
  });
};

// Helper function to prefetch data
export const prefetchPosts = (
  queryClient: ReturnType<typeof import("@tanstack/react-query").useQueryClient>
) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.posts,
    queryFn: getPosts,
    staleTime: 1000 * 60 * 5,
  });
};
