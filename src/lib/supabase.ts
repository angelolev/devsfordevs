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
