import React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getPosts,
  getPostsPaginated,
  getPostById,
  getCommentsForPosts,
  createPost as createPostAPI,
  createComment as createCommentAPI,
  getPostReactions,
  toggleReaction,
  followUser,
  unfollowUser,
  checkIfFollowing,
  getFollowedUsers,
  getFollowingPosts,
  getFollowerCount,
  getFollowingCount,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationsAsRead,
  createFollowNotification,
  createCommentNotification,
  subscribeToNotifications,
} from "./supabase";
import { Post, Comment, User } from "../types";

// Query keys for consistent caching
export const queryKeys = {
  posts: ["posts"] as const,
  paginatedPosts: ["paginatedPosts"] as const,
  postDetail: (postId: string) => ["postDetail", postId] as const,
  comments: (postIds: string[]) => ["comments", postIds] as const,
  userProfile: (userId: string) => ["profile", userId] as const,
  followStatus: (followerId: string, followingId: string) =>
    ["followStatus", followerId, followingId] as const,
  followedUsers: (userId: string) => ["followedUsers", userId] as const,
  followingPosts: (userId: string) => ["followingPosts", userId] as const,
  followerCount: (userId: string) => ["followerCount", userId] as const,
  followingCount: (userId: string) => ["followingCount", userId] as const,
  notifications: (userId: string) => ["notifications", userId] as const,
  unreadNotificationCount: (userId: string) =>
    ["unreadNotificationCount", userId] as const,
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

      // Get post IDs for fetching reactions
      const postIds = (fetchedPosts as PostDetails[]).map((post) => post.id);

      // Fetch reactions for all posts
      const reactions = await getPostReactions(postIds);

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
          reactions: reactions[post.id] || { happy: [], sad: [] },
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

// Custom hook for fetching posts with pagination and caching
export const usePaginatedPosts = () => {
  return useInfiniteQuery({
    queryKey: queryKeys.paginatedPosts,
    queryFn: async ({ pageParam = 0 }): Promise<Post[]> => {
      const fetchedPosts = await getPostsPaginated(20, pageParam);

      if (!fetchedPosts || fetchedPosts.length === 0) {
        return [];
      }

      // Get post IDs for fetching reactions
      const postIds = (fetchedPosts as PostDetails[]).map((post) => post.id);

      // Fetch reactions for all posts
      const reactions = await getPostReactions(postIds);

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
          reactions: reactions[post.id] || { happy: [], sad: [] },
        })
      );

      return formattedPosts;
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer than 20 posts, there are no more pages
      if (lastPage.length < 20) {
        return undefined;
      }
      // Return the offset for the next page
      return allPages.length * 20;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
};

// Custom hook for fetching a single post by ID
export const usePostDetail = (postId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.postDetail(postId),
    queryFn: async (): Promise<Post> => {
      const fetchedPost = await getPostById(postId);

      // Get reactions for the post
      const reactions = await getPostReactions([postId]);

      const formattedPost: Post = {
        id: fetchedPost.id,
        content: fetchedPost.content,
        image: fetchedPost.image ?? undefined,
        createdAt: fetchedPost.createdAt,
        author: {
          id: fetchedPost.author.id,
          username: fetchedPost.author.username,
          full_name: fetchedPost.author.full_name ?? undefined,
          avatar_url: fetchedPost.author.avatar_url ?? undefined,
        },
        topics: fetchedPost.topics,
        commentsCount: fetchedPost.commentsCount,
        reactions: reactions[postId] || { happy: [], sad: [] },
      };

      return formattedPost;
    },
    enabled: enabled && !!postId,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.paginatedPosts });

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
      queryClient.invalidateQueries({ queryKey: queryKeys.paginatedPosts });
    },
    onError: (error: Error) => {
      console.error("Failed to create comment:", error);
    },
  });
};

// Mutation hook for toggling reactions with optimistic updates
export const useToggleReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      userId,
      reactionType,
    }: {
      postId: string;
      userId: string;
      reactionType: "happy" | "sad";
    }) => {
      return await toggleReaction(postId, userId, reactionType);
    },
    onMutate: async ({ postId, userId, reactionType }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.posts });
      await queryClient.cancelQueries({ queryKey: queryKeys.paginatedPosts });
      await queryClient.cancelQueries({
        queryKey: queryKeys.postDetail(postId),
      });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<Post[]>(queryKeys.posts);
      const previousPaginatedPosts = queryClient.getQueryData<{
        pages: Post[][];
        pageParams: number[];
      }>(queryKeys.paginatedPosts);
      const previousPostDetail = queryClient.getQueryData<Post>(
        queryKeys.postDetail(postId)
      );

      // Optimistically update the cache
      if (previousPosts) {
        const updatedPosts = previousPosts.map((post) => {
          if (post.id === postId) {
            const oppositeType = reactionType === "happy" ? "sad" : "happy";
            const hasCurrentReaction =
              post.reactions[reactionType].includes(userId);
            const hasOppositeReaction =
              post.reactions[oppositeType].includes(userId);

            const newReactions = { ...post.reactions };

            if (hasCurrentReaction) {
              // Remove current reaction
              newReactions[reactionType] = newReactions[reactionType].filter(
                (id) => id !== userId
              );
            } else {
              // Add current reaction and remove opposite if exists
              newReactions[reactionType] = [
                ...newReactions[reactionType],
                userId,
              ];
              if (hasOppositeReaction) {
                newReactions[oppositeType] = newReactions[oppositeType].filter(
                  (id) => id !== userId
                );
              }
            }

            return { ...post, reactions: newReactions };
          }
          return post;
        });

        queryClient.setQueryData(queryKeys.posts, updatedPosts);
      }

      // Optimistically update the paginated posts cache
      if (previousPaginatedPosts) {
        const updatedPaginatedData = {
          ...previousPaginatedPosts,
          pages: previousPaginatedPosts.pages.map((page: Post[]) =>
            page.map((post) => {
              if (post.id === postId) {
                const oppositeType = reactionType === "happy" ? "sad" : "happy";
                const hasCurrentReaction =
                  post.reactions[reactionType].includes(userId);
                const hasOppositeReaction =
                  post.reactions[oppositeType].includes(userId);

                const newReactions = { ...post.reactions };

                if (hasCurrentReaction) {
                  // Remove current reaction
                  newReactions[reactionType] = newReactions[
                    reactionType
                  ].filter((id) => id !== userId);
                } else {
                  // Add current reaction and remove opposite if exists
                  newReactions[reactionType] = [
                    ...newReactions[reactionType],
                    userId,
                  ];
                  if (hasOppositeReaction) {
                    newReactions[oppositeType] = newReactions[
                      oppositeType
                    ].filter((id) => id !== userId);
                  }
                }

                return { ...post, reactions: newReactions };
              }
              return post;
            })
          ),
        };

        queryClient.setQueryData(
          queryKeys.paginatedPosts,
          updatedPaginatedData
        );
      }

      // Optimistically update the post detail cache
      if (previousPostDetail) {
        const oppositeType = reactionType === "happy" ? "sad" : "happy";
        const hasCurrentReaction =
          previousPostDetail.reactions[reactionType].includes(userId);
        const hasOppositeReaction =
          previousPostDetail.reactions[oppositeType].includes(userId);

        const newReactions = { ...previousPostDetail.reactions };

        if (hasCurrentReaction) {
          // Remove current reaction
          newReactions[reactionType] = newReactions[reactionType].filter(
            (id) => id !== userId
          );
        } else {
          // Add current reaction and remove opposite if exists
          newReactions[reactionType] = [...newReactions[reactionType], userId];
          if (hasOppositeReaction) {
            newReactions[oppositeType] = newReactions[oppositeType].filter(
              (id) => id !== userId
            );
          }
        }

        const updatedPostDetail = {
          ...previousPostDetail,
          reactions: newReactions,
        };
        queryClient.setQueryData(
          queryKeys.postDetail(postId),
          updatedPostDetail
        );
      }

      // Return a context object with the snapshot for rollback
      return { previousPosts, previousPaginatedPosts, previousPostDetail };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, rollback to the previous state
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts, context.previousPosts);
      }
      if (context?.previousPaginatedPosts) {
        queryClient.setQueryData(
          queryKeys.paginatedPosts,
          context.previousPaginatedPosts
        );
      }
      if (context?.previousPostDetail) {
        queryClient.setQueryData(
          queryKeys.postDetail(variables.postId),
          context.previousPostDetail
        );
      }
      console.error("Failed to toggle reaction:", err);
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after success or error to ensure we have the correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      queryClient.invalidateQueries({ queryKey: queryKeys.paginatedPosts });
      queryClient.invalidateQueries({
        queryKey: queryKeys.postDetail(variables.postId),
      });
    },
  });
};

// Follow status query hook
export const useFollowStatus = (followerId?: string, followingId?: string) => {
  return useQuery({
    queryKey: queryKeys.followStatus(followerId || "", followingId || ""),
    queryFn: () => checkIfFollowing(followerId!, followingId!),
    enabled: !!followerId && !!followingId && followerId !== followingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Follow user mutation hook
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }) => {
      return await followUser(followerId, followingId);
    },
    onSuccess: (_, { followerId, followingId }) => {
      // Invalidate follow status
      queryClient.invalidateQueries({
        queryKey: queryKeys.followStatus(followerId, followingId),
      });
      // Invalidate followed users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.followedUsers(followerId),
      });
      // Invalidate following posts
      queryClient.invalidateQueries({
        queryKey: queryKeys.followingPosts(followerId),
      });
      // Invalidate counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.followerCount(followingId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.followingCount(followerId),
      });
    },
    onError: (error: Error) => {
      console.error("Failed to follow user:", error);
    },
  });
};

// Unfollow user mutation hook
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }) => {
      return await unfollowUser(followerId, followingId);
    },
    onSuccess: (_, { followerId, followingId }) => {
      // Invalidate follow status
      queryClient.invalidateQueries({
        queryKey: queryKeys.followStatus(followerId, followingId),
      });
      // Invalidate followed users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.followedUsers(followerId),
      });
      // Invalidate following posts
      queryClient.invalidateQueries({
        queryKey: queryKeys.followingPosts(followerId),
      });
      // Refetch counts immediately to update UI
      queryClient.refetchQueries({
        queryKey: queryKeys.followerCount(followingId),
      });
      queryClient.refetchQueries({
        queryKey: queryKeys.followingCount(followerId),
      });
    },
    onError: (error: Error) => {
      console.error("Failed to unfollow user:", error);
    },
  });
};

// Get followed users query hook
export const useFollowedUsers = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.followedUsers(userId),
    queryFn: () => getFollowedUsers(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get following posts query hook
export const useFollowingPosts = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.followingPosts(userId),
    queryFn: async (): Promise<Post[]> => {
      const fetchedPosts = await getFollowingPosts(userId);

      if (!fetchedPosts || fetchedPosts.length === 0) {
        return [];
      }

      // Get post IDs for fetching reactions
      const postIds = (fetchedPosts as PostDetails[]).map((post) => post.id);

      // Fetch reactions for all posts
      const reactions = await getPostReactions(postIds);

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
          reactions: reactions[post.id] || { happy: [], sad: [] },
        })
      );

      return formattedPosts;
    },
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get follower count query hook
export const useFollowerCount = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.followerCount(userId),
    queryFn: () => getFollowerCount(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get following count query hook
export const useFollowingCount = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.followingCount(userId),
    queryFn: () => getFollowingCount(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

// Notification interface
export interface Notification {
  id: string;
  type: "follow" | "comment" | "mention" | "post_reaction";
  title: string;
  message: string;
  is_read: boolean;
  related_post_id?: string;
  related_comment_id?: string;
  created_at: string;
  actor_id: string;
  actor_username?: string;
  actor_full_name?: string;
  actor_avatar_url?: string;
}

// Get user notifications query hook
export const useUserNotifications = (
  userId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: queryKeys.notifications(userId),
    queryFn: async (): Promise<Notification[]> => {
      const notifications = await getUserNotifications(userId);
      return notifications || [];
    },
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get unread notification count query hook
export const useUnreadNotificationCount = (
  userId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: queryKeys.unreadNotificationCount(userId),
    queryFn: () => getUnreadNotificationCount(userId),
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Poll every 2 minutes
  });
};

// Mark notifications as read mutation hook
export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      return await markNotificationsAsRead(notificationIds);
    },
    onSuccess: () => {
      // Update notification queries
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadNotificationCount"],
      });
    },
    onError: (error: Error) => {
      console.error("Failed to mark notifications as read:", error);
    },
  });
};

// Enhanced follow user mutation hook with notification
export const useFollowUserWithNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }) => {
      // Follow user
      const followResult = await followUser(followerId, followingId);

      // Create notification
      await createFollowNotification(followerId, followingId);

      return followResult;
    },
    onSuccess: (_, { followerId, followingId }) => {
      // Invalidate follow status
      queryClient.invalidateQueries({
        queryKey: queryKeys.followStatus(followerId, followingId),
      });
      // Invalidate followed users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.followedUsers(followerId),
      });
      // Invalidate following posts
      queryClient.invalidateQueries({
        queryKey: queryKeys.followingPosts(followerId),
      });
      // Refetch counts immediately to update UI
      queryClient.refetchQueries({
        queryKey: queryKeys.followerCount(followingId),
      });
      queryClient.refetchQueries({
        queryKey: queryKeys.followingCount(followerId),
      });
      // Invalidate notifications for the followed user
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(followingId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.unreadNotificationCount(followingId),
      });
    },
    onError: (error: Error) => {
      console.error("Failed to follow user:", error);
    },
  });
};

// Enhanced create comment mutation hook with notification
export const useCreateCommentWithNotification = () => {
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
      // Create comment
      const commentResult = await createCommentAPI({
        post_id: postId,
        author_id: authorId,
        content,
        parent_id: parentId,
      });

      // Create notification
      if (commentResult?.id) {
        await createCommentNotification(authorId, postId, commentResult.id);
      }

      return commentResult;
    },
    onSuccess: () => {
      // Invalidate comments for the post
      queryClient.invalidateQueries({
        queryKey: ["comments"],
      });
      // Invalidate post data to update comment count
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.paginatedPosts,
      });
      // Invalidate notifications (we don't know the post author here, so invalidate all)
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadNotificationCount"],
      });
    },
    onError: (error: Error) => {
      console.error("Failed to create comment:", error);
    },
  });
};

// Real-time notifications subscription hook
export const useNotificationSubscription = (
  userId: string,
  onNotification: (notification: Notification) => void
) => {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!userId) return;

    const subscription = subscribeToNotifications(userId, (payload) => {
      const newNotification = payload.new as Notification;

      // Call the callback
      onNotification(newNotification);

      // Invalidate notification queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.unreadNotificationCount(userId),
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, onNotification, queryClient]);
};
