import React, { useState, useMemo, useEffect } from "react";
import { Filter } from "lucide-react";
import { Post, Comment, User } from "../../types";
import { useNavigate } from "react-router-dom";
import { PostCard, TopicSidebar } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import CreatePost from "../../components/CreatePost";
import {
  createPost,
  getPosts,
  createComment,
  getCommentsForPosts,
} from "../../lib/supabase";

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
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilterTopics, setSelectedFilterTopics] = useState<string[]>(
    []
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't fetch posts while auth is still loading to prevent clearing posts during refresh
    if (authLoading) {
      return;
    }

    const fetchPostsAndComments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setPosts([]); // Clear posts immediately when starting to load
        setComments([]); // Clear comments as well
        const fetchedPosts = await getPosts();

        if (!fetchedPosts || fetchedPosts.length === 0) {
          setPosts([]);
          setComments([]);
          return;
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

        setPosts(formattedPosts);

        const postIds = formattedPosts.map((p) => p.id);
        if (postIds.length > 0) {
          const fetchedComments = await getCommentsForPosts(postIds);

          if (fetchedComments) {
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
            setComments(formattedComments);
          }
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to fetch posts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostsAndComments();
  }, [authLoading, user]);

  const handleCreatePost = async (
    content: string,
    topics: string[],
    image?: string
  ) => {
    if (!user) return;

    try {
      const newPostData = (await createPost(
        {
          content,
          author_id: user.id,
          image_url: image,
        },
        topics
      )) as PostDetails;

      if (!newPostData) return;

      const formattedPost: Post = {
        id: newPostData.id,
        content: newPostData.content,
        image: newPostData.image_url ?? undefined,
        createdAt: new Date(newPostData.created_at),
        author: {
          id: newPostData.author.id,
          username: newPostData.author.username,
          full_name: newPostData.author.full_name ?? undefined,
          avatar_url: newPostData.author.avatar_url ?? undefined,
        },
        topics: newPostData.topics,
        commentsCount: newPostData.comments_count,
        reactions: { happy: [], sad: [] }, // Placeholder
      };

      setPosts((prev) => [formattedPost, ...prev]);
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("There was an error creating your post. Please try again.");
    }
  };

  const handleReaction = (postId: string, type: "happy" | "sad") => {
    if (!user) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const reactions = { ...post.reactions };
          const otherType = type === "happy" ? "sad" : "happy";

          // Remove from other reaction if exists
          reactions[otherType] = reactions[otherType].filter(
            (id) => id !== user.id
          );

          // Toggle current reaction
          if (reactions[type].includes(user.id)) {
            reactions[type] = reactions[type].filter((id) => id !== user.id);
          } else {
            reactions[type] = [...reactions[type], user.id];
          }

          return { ...post, reactions };
        }
        return post;
      })
    );
  };

  const handleComment = async (
    postId: string,
    content: string,
    parentId?: string
  ) => {
    if (!user) return;

    try {
      const newCommentData = await createComment({
        post_id: postId,
        author_id: user.id,
        content,
        parent_id: parentId,
      });

      if (!newCommentData) return;

      const formattedComment: Comment = {
        id: newCommentData.id,
        content: newCommentData.content,
        author: user,
        postId: postId,
        parentId: newCommentData.parent_id,
        createdAt: new Date(newCommentData.created_at),
      };

      setComments((prev) => [...prev, formattedComment]);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("There was an error creating your comment. Please try again.");
    }
  };

  const handleUserClick = (clickedUser: User) => {
    navigate(`/user/${clickedUser.username}`);
  };

  const handleTopicFilterToggle = (topicId: string) => {
    setSelectedFilterTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleClearAllFilters = () => {
    setSelectedFilterTopics([]);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter posts based on selected topics
  const filteredPosts = useMemo(() => {
    if (selectedFilterTopics.length === 0) {
      return posts;
    }

    return posts.filter(
      (post) =>
        post.topics &&
        post.topics.some((topic) => selectedFilterTopics.includes(topic))
    );
  }, [posts, selectedFilterTopics]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
        >
          <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters{" "}
            {selectedFilterTopics.length > 0 &&
              `(${selectedFilterTopics.length})`}
          </span>
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="absolute inset-x-0 top-0 min-h-screen bg-gray-800 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 max-h-[80vh] overflow-y-auto">
            <TopicSidebar
              selectedTopics={selectedFilterTopics}
              onTopicToggle={handleTopicFilterToggle}
              onClearAll={handleClearAllFilters}
              isMobile={true}
              onClose={() => setShowMobileFilters(false)}
            />
          </div>
        </div>
      )}

      <div className="flex gap-8 justify-between">
        {/* Main Content */}
        <div className="flex-1 max-w-full lg:max-w-2xl">
          <CreatePost onCreatePost={handleCreatePost} />

          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Loading posts...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Filter Status */}
          {!isLoading && !error && selectedFilterTopics.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Mostrando posts filtrados por {selectedFilterTopics.length}{" "}
                  tema
                  {selectedFilterTopics.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline cursor-pointer"
                >
                  Ver todos los posts
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                comments={comments}
                onReaction={handleReaction}
                onComment={handleComment}
                onUserClick={handleUserClick}
              />
            ))}
          </div>

          {!isLoading &&
            filteredPosts.length === 0 &&
            selectedFilterTopics.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No se encontraron posts para los temas seleccionados.
                </p>
                <button
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

          {!isLoading && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No hay posts todavía. Sé el primero en compartir algo!
              </p>
            </div>
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <TopicSidebar
            selectedTopics={selectedFilterTopics}
            onTopicToggle={handleTopicFilterToggle}
            onClearAll={handleClearAllFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default Feed;
