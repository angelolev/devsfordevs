import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Image upload utility
export const uploadImage = async (
  file: File,
  userId: string
): Promise<string> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

// Delete image utility
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const filePath = pathParts.slice(-2).join("/"); // Get userId/filename.ext

    const { error } = await supabase.storage
      .from("post-images")
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    // Don't throw error for deletion failures to avoid blocking other operations
  }
};

export const getPosts = async () => {
  const { data, error } = await supabase.rpc("get_posts_with_details");

  if (error) {
    console.error("Error fetching posts:", error);
    throw new Error(error.message);
  }

  return data;
};

export const getPostsPaginated = async (
  limit: number = 20,
  offset: number = 0
) => {
  // For now, use the existing RPC function and apply pagination manually
  // TODO: Create a proper paginated RPC function in Supabase for better performance
  const { data, error } = await supabase.rpc("get_posts_with_details");

  if (error) {
    console.error("Error fetching paginated posts:", error);
    throw new Error(error.message);
  }

  if (!data) return [];

  // Apply pagination manually (not optimal for large datasets)
  // Sort by created_at desc to get latest posts first
  const sortedData = data.sort(
    (a: { created_at: string }, b: { created_at: string }) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Apply pagination
  const paginatedData = sortedData.slice(offset, offset + limit);

  return paginatedData;
};

export const getCommentsForPosts = async (postIds: string[]) => {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      id,
      content,
      created_at,
      parent_id,
      post_id,
      author:profiles!inner (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .in("post_id", postIds);

  if (error) {
    console.error("Error fetching comments:", error);
    throw new Error(error.message);
  }

  return data;
};

export const createPost = async (
  postData: {
    content: string;
    author_id: string;
    image_url?: string;
  },
  topics: string[]
) => {
  // 1. Create the post
  const { data: newPost, error: postError } = await supabase
    .from("posts")
    .insert(postData)
    .select("id")
    .single();

  if (postError) {
    console.error("Error creating post:", postError);
    throw new Error(postError.message);
  }

  // 2. Link topics if any
  if (topics.length > 0) {
    const topicLinks = topics.map((topicId) => ({
      post_id: newPost.id,
      topic_id: topicId,
    }));
    const { error: topicsError } = await supabase
      .from("post_topics")
      .insert(topicLinks);

    if (topicsError) {
      console.error("Error linking topics:", topicsError);
      // We should probably delete the post if linking topics fails
      throw new Error(topicsError.message);
    }
  }

  // 3. Fetch the newly created post with all its details
  const { data: fullPost, error: fetchError } = await supabase
    .rpc("get_post_details_by_id", { p_id: newPost.id })
    .single();

  if (fetchError) {
    console.error("Error fetching new post:", fetchError);
    throw new Error(fetchError.message);
  }

  return fullPost;
};

export const createComment = async (commentData: {
  content: string;
  author_id: string;
  post_id: string;
  parent_id?: string;
}) => {
  const { data, error } = await supabase
    .from("comments")
    .insert(commentData)
    .select(
      `
      id,
      content,
      created_at,
      parent_id
    `
    )
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    throw new Error(error.message);
  }

  return data;
};

// Reaction functions
export const toggleReaction = async (
  postId: string,
  userId: string,
  reactionType: "happy" | "sad"
) => {
  try {
    // Check if user already reacted with this type
    const { data: existingReaction, error: checkError } = await supabase
      .from("post_reactions")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .eq("reaction_type", reactionType)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no rows found

    if (checkError) {
      throw checkError;
    }

    if (existingReaction) {
      // Remove existing reaction
      const { error: deleteError } = await supabase
        .from("post_reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (deleteError) {
        throw deleteError;
      }

      return { action: "removed", reactionType };
    } else {
      // Add new reaction (remove opposite reaction first if exists)
      const oppositeType = reactionType === "happy" ? "sad" : "happy";

      // Remove opposite reaction if exists (use maybeSingle here too)
      await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId)
        .eq("reaction_type", oppositeType);

      // Add new reaction
      const { error: insertError } = await supabase
        .from("post_reactions")
        .insert({
          post_id: postId,
          user_id: userId,
          reaction_type: reactionType,
        });

      if (insertError) {
        throw insertError;
      }

      return { action: "added", reactionType };
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
    throw new Error("Failed to update reaction");
  }
};

export const getPostReactions = async (postIds: string[]) => {
  try {
    const { data, error } = await supabase
      .from("post_reactions")
      .select("post_id, user_id, reaction_type")
      .in("post_id", postIds);

    if (error) {
      throw error;
    }

    // Group reactions by post and type
    const reactionsByPost: Record<string, { happy: string[]; sad: string[] }> =
      {};

    postIds.forEach((postId) => {
      reactionsByPost[postId] = { happy: [], sad: [] };
    });

    data?.forEach((reaction) => {
      if (
        reactionsByPost[reaction.post_id] &&
        (reaction.reaction_type === "happy" || reaction.reaction_type === "sad")
      ) {
        reactionsByPost[reaction.post_id][
          reaction.reaction_type as "happy" | "sad"
        ].push(reaction.user_id);
      }
    });

    return reactionsByPost;
  } catch (error) {
    console.error("Error fetching reactions:", error);
    throw new Error("Failed to fetch reactions");
  }
};

// User profile functions
export const getUserProfile = async (username: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    throw new Error(error.message);
  }

  return data;
};

export const getUserProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile by ID:", error);
    throw new Error(error.message);
  }

  return data;
};

export const getUserPosts = async (userId: string) => {
  const { data, error } = await supabase.rpc("get_posts_with_details");

  if (error) {
    console.error("Error fetching user posts:", error);
    throw new Error(error.message);
  }

  // Filter posts by the specific user and format them properly
  const userPosts = data?.filter(
    (post: { author: { id: string } }) => post.author.id === userId
  );

  // Transform the data to match the Post interface
  return (
    userPosts?.map(
      (post: {
        id: string;
        content: string;
        image_url?: string;
        created_at: string;
        author: {
          id: string;
          username: string;
          full_name?: string;
          avatar_url?: string;
        };
        topics?: string[];
        comments_count?: number;
      }) => ({
        id: post.id,
        content: post.content,
        image: post.image_url ?? undefined,
        createdAt: new Date(post.created_at), // Convert string to Date object
        author: {
          id: post.author.id,
          username: post.author.username,
          full_name: post.author.full_name ?? undefined,
          avatar_url: post.author.avatar_url ?? undefined,
        },
        topics: post.topics || [],
        commentsCount: post.comments_count || 0,
        reactions: { happy: [], sad: [] }, // We'll need to fetch reactions separately if needed
      })
    ) || []
  );
};

export const getPostById = async (postId: string) => {
  const { data, error } = await supabase.rpc("get_posts_with_details");

  if (error) {
    console.error("Error fetching post by ID:", error);
    throw new Error(error.message);
  }

  // Find the specific post by ID
  const post = data?.find((post: { id: string }) => post.id === postId);

  if (!post) {
    throw new Error("Post not found");
  }

  // Transform the data to match the Post interface
  return {
    id: post.id,
    content: post.content,
    image: post.image_url ?? undefined,
    createdAt: new Date(post.created_at), // Convert string to Date object
    author: {
      id: post.author.id,
      username: post.author.username,
      full_name: post.author.full_name ?? undefined,
      avatar_url: post.author.avatar_url ?? undefined,
    },
    topics: post.topics || [],
    commentsCount: post.comments_count || 0,
    reactions: { happy: [], sad: [] }, // We'll need to fetch reactions separately if needed
  };
};

// Follow functions
export const followUser = async (followerId: string, followingId: string) => {
  try {
    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingFollow) {
      throw new Error("Already following this user");
    }

    // Create follow relationship
    const { data, error } = await supabase
      .from("follows")
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error following user:", error);
    throw new Error("Failed to follow user");
  }
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  try {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw new Error("Failed to unfollow user");
  }
};

export const checkIfFollowing = async (
  followerId: string,
  followingId: string
) => {
  try {
    const { data, error } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
};

export const getFollowedUsers = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("follows")
      .select(
        `
        following_id,
        following:profiles!follows_following_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("follower_id", userId);

    if (error) {
      throw error;
    }

    return data?.map((follow) => follow.following).flat() || [];
  } catch (error) {
    console.error("Error fetching followed users:", error);
    throw new Error("Failed to fetch followed users");
  }
};

export const getFollowingPosts = async (userId: string) => {
  try {
    // First get the list of users being followed
    const { data: follows, error: followsError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (followsError) {
      throw followsError;
    }

    if (!follows || follows.length === 0) {
      return [];
    }

    const followingIds = follows.map((follow) => follow.following_id);

    // Get posts from all followed users
    const { data, error } = await supabase.rpc("get_posts_with_details");

    if (error) {
      throw error;
    }

    // Filter posts by followed users
    const followingPosts = data?.filter((post: { author: { id: string } }) =>
      followingIds.includes(post.author.id)
    );

    return followingPosts || [];
  } catch (error) {
    console.error("Error fetching following posts:", error);
    throw new Error("Failed to fetch following posts");
  }
};

export const getFollowerCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting follower count:", error);
    return 0;
  }
};

export const getFollowingCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting following count:", error);
    return 0;
  }
};

// Notification functions
export const getUserNotifications = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
) => {
  try {
    const { data, error } = await supabase.rpc("get_user_notifications", {
      user_id: userId,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
};

export const getUnreadNotificationCount = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc(
      "get_unread_notification_count",
      {
        user_id: userId,
      }
    );

    if (error) {
      throw error;
    }

    return data || 0;
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return 0;
  }
};

export const markNotificationsAsRead = async (notificationIds: string[]) => {
  try {
    const { data, error } = await supabase.rpc("mark_notifications_as_read", {
      notification_ids: notificationIds,
    });

    if (error) {
      throw error;
    }

    return data || 0;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw new Error("Failed to mark notifications as read");
  }
};

export const createFollowNotification = async (
  followerId: string,
  followingId: string
) => {
  try {
    const { data, error } = await supabase.rpc("create_follow_notification", {
      follower_id: followerId,
      following_id: followingId,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating follow notification:", error);
    // Don't throw error to avoid breaking the follow action
    return null;
  }
};

export const createCommentNotification = async (
  commenterId: string,
  postId: string,
  commentId: string
) => {
  try {
    const { data, error } = await supabase.rpc("create_comment_notification", {
      commenter_id: commenterId,
      post_id: postId,
      comment_id: commentId,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating comment notification:", error);
    // Don't throw error to avoid breaking the comment action
    return null;
  }
};

// Subscribe to real-time notifications
export const subscribeToNotifications = (
  userId: string,
  callback: (payload: { new: object; old: object; eventType: string }) => void
) => {
  return supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};
