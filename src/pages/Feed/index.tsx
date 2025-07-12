import React, { useState, useMemo } from "react";
import { Filter } from "lucide-react";
import { User } from "../../types";
import { useNavigate } from "react-router-dom";
import { PostCard, TopicSidebar } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import CreatePost from "../../components/CreatePost";
import {
  usePaginatedPosts,
  useComments,
  useCreatePost,
  useCreateCommentWithNotification,
  useToggleReaction,
} from "../../lib/queries";

const Feed: React.FC = () => {
  const [selectedFilterTopics, setSelectedFilterTopics] = useState<string[]>(
    []
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  // Use React Query hooks for data fetching with caching and pagination
  const {
    data: paginatedPostsData,
    isLoading: postsLoading,
    error: postsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePaginatedPosts();

  // Flatten all pages into a single array of posts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const posts = paginatedPostsData?.pages.flat() || [];

  const postIds = posts.map((post) => post.id);
  const {
    data: comments = [],
    isLoading: commentsLoading,
    error: commentsError,
  } = useComments(postIds, !authLoading && posts.length > 0);

  const createPostMutation = useCreatePost();
  const createCommentMutation = useCreateCommentWithNotification();
  const toggleReactionMutation = useToggleReaction();

  // Combine loading states
  const isLoading = postsLoading || commentsLoading;
  const error = postsError || commentsError;

  // No useEffect needed! React Query handles all the data fetching and caching

  const handleCreatePost = async (
    content: string,
    topics: string[],
    image?: string
  ) => {
    if (!user) return;

    try {
      await createPostMutation.mutateAsync({
        content,
        authorId: user.id,
        topics,
        image,
      });
      // React Query will automatically invalidate and refetch the posts
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("There was an error creating your post. Please try again.");
    }
  };

  const handleReaction = (postId: string, type: "happy" | "sad") => {
    if (!user) {
      alert("Inicia sesión para reaccionar a los posts");
      return;
    }

    toggleReactionMutation.mutate({
      postId,
      userId: user.id,
      reactionType: type,
    });
  };

  const handleComment = async (
    postId: string,
    content: string,
    parentId?: string
  ) => {
    if (!user) {
      alert("Inicia sesión para comentar en los posts");
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        postId,
        authorId: user.id,
        content,
        parentId,
      });
      // React Query will automatically invalidate and refetch comments
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("There was an error creating your comment. Please try again.");
    }
  };

  const handleUserClick = (clickedUser: User) => {
    navigate(`/user/${clickedUser.username}`);
  };

  const filteredPosts = useMemo(() => {
    if (selectedFilterTopics.length === 0) return posts;
    return posts.filter((post) =>
      selectedFilterTopics.some((topicId) => post.topics.includes(topicId))
    );
  }, [posts, selectedFilterTopics]);

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

  // Don't render feed until auth is resolved
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center space-x-2 px-4 py-2 btn-primary dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm  dark:hover:bg-gray-700 transition-colors text-white cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Filtrar por tema</span>
            {selectedFilterTopics.length > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {selectedFilterTopics.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
            <div className="absolute inset-x-0 top-0 min-h-screen bg-[#1a1a1a] dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-600 max-h-[80vh] overflow-y-auto pt-10 px-4">
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
            {user ? (
              <CreatePost onCreatePost={handleCreatePost} />
            ) : (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-700 dark:text-blue-300 text-sm text-center">
                  <span className="font-medium">¡Únete a la conversación!</span>{" "}
                  Inicia sesión para crear posts, comentar y reaccionar.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Cargando posts...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-500 dark:text-red-400">
                  {error instanceof Error
                    ? error.message
                    : "Failed to fetch posts. Please try again later."}
                </p>
                <button
                  onClick={() => fetchNextPage()}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Filter Status */}
            {selectedFilterTopics.length > 0 && !isLoading && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Mostrando posts filtrados por{" "}
                  {selectedFilterTopics.length === 1 ? "tema" : "temas"} (
                  {filteredPosts.length} de {posts.length})
                </p>
              </div>
            )}

            {/* Posts List */}
            {!isLoading && !error && (
              <div className="space-y-6">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      {selectedFilterTopics.length > 0
                        ? "No hay posts que coincidan con los filtros seleccionados."
                        : "No hay posts disponibles."}
                    </p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      comments={comments}
                      onReaction={handleReaction}
                      onComment={handleComment}
                      onUserClick={handleUserClick}
                    />
                  ))
                )}

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Cargando...</span>
                        </>
                      ) : (
                        <span>Cargar más posts</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-fit sticky top-20 self-start">
            <TopicSidebar
              selectedTopics={selectedFilterTopics}
              onTopicToggle={handleTopicFilterToggle}
              onClearAll={handleClearAllFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
