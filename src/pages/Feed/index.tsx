import React, { useState, useMemo, useEffect } from "react";
import { Filter } from "lucide-react";
import { Post, Comment, User } from "../../types";
import { mockPosts, mockComments } from "../../data/mockData";
import { useNavigate } from "react-router-dom";
import { PostCard, TopicSidebar } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import CreatePost from "../../components/CreatePost";

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedFilterTopics, setSelectedFilterTopics] = useState<string[]>(
    []
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreatePost = (
    content: string,
    topics: string[],
    image?: string
  ) => {
    if (!user) return;

    const newPost: Post = {
      id: Date.now().toString(),
      content,
      image,
      topics,
      author: user,
      createdAt: new Date(),
      reactions: {
        happy: [],
        sad: [],
      },
      commentsCount: 0,
    };

    setPosts((prev) => [newPost, ...prev]);
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

  const handleComment = (
    postId: string,
    content: string,
    parentId?: string
  ) => {
    if (!user) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: user,
      postId,
      parentId,
      createdAt: new Date(),
    };

    setComments((prev) => [...prev, newComment]);
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post
      )
    );
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
          <div className="absolute inset-x-0 top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 max-h-[80vh] overflow-y-auto">
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

          {/* Filter Status */}
          {selectedFilterTopics.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Showing posts filtered by {selectedFilterTopics.length} topic
                  {selectedFilterTopics.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline cursor-pointer"
                >
                  Show all posts
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

          {filteredPosts.length === 0 && selectedFilterTopics.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No posts found for the selected topics.
              </p>
              <button
                onClick={handleClearAllFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No posts yet. Be the first to share something!
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
