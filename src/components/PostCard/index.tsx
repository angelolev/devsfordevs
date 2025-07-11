import React, { useState, useRef, useEffect } from "react";
import {
  Smile,
  Frown,
  MessageCircle,
  Tag,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { Post as PostType, Comment, AVAILABLE_TOPICS, User } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import {
  useFollowStatus,
  useFollowUser,
  useUnfollowUser,
} from "../../lib/queries";
import CommentSection from "../CommentsSection";

interface PostProps {
  post: PostType;
  comments: Comment[];
  onReaction: (postId: string, type: "happy" | "sad") => void;
  onComment: (postId: string, content: string, parentId?: string) => void;
  onUserClick?: (user: User) => void;
}

const Post: React.FC<PostProps> = ({
  post,
  comments,
  onReaction,
  onComment,
  onUserClick,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isPopupLocked, setIsPopupLocked] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  // Follow status and mutations
  const { data: isFollowing } = useFollowStatus(user?.id, post.author.id);
  const followUserMutation = useFollowUser();
  const unfollowUserMutation = useUnfollowUser();

  const formatDate = (date: Date) => {
    // Safety check for invalid dates
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "Unknown";
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const hasUserReacted = (type: "happy" | "sad") => {
    return user && post.reactions[type].includes(user.id);
  };

  const handleReaction = (type: "happy" | "sad") => {
    if (!user) return;
    onReaction(post.id, type);
  };

  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick(post.author);
    }
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Inicia sesión para seguir usuarios");
      return;
    }

    if (isFollowing) {
      unfollowUserMutation.mutate({
        followerId: user.id,
        followingId: post.author.id,
      });
    } else {
      followUserMutation.mutate({
        followerId: user.id,
        followingId: post.author.id,
      });
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    setPopupPosition({
      x: e.clientX,
      y: e.clientY + 10, // Offset slightly below cursor
    });
    setShowUserPopup(true);
    setIsPopupLocked(false);

    // Clear any existing timer
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }

    // Lock the popup position after 500ms
    popupTimerRef.current = setTimeout(() => {
      setIsPopupLocked(true);
    }, 500);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showUserPopup && !isPopupLocked) {
      setPopupPosition({
        x: e.clientX,
        y: e.clientY + 10,
      });
    }
  };

  const handleMouseLeave = () => {
    setShowUserPopup(false);
    setIsPopupLocked(false);
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  const getTopicById = (id: string) => {
    return AVAILABLE_TOPICS.find((topic) => topic.id === id);
  };

  const postComments = comments.filter((comment) => comment.postId === post.id);

  return (
    <article className="font-mono bg-[#23272e] rounded-lg border-gray-800 shadow-lg overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-[#282a36] flex items-center justify-between px-4 py-2 border-b border-[#414868]">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-[#ff5f57] rounded-full"></span>
          <span className="w-3 h-3 bg-[#ffbd2e] rounded-full"></span>
          <span className="w-3 h-3 bg-[#28c940] rounded-full"></span>
        </div>
        <div className="text-xs md:text-base text-[#c0caf5]">
          {post.author.username}@devs4devs — zsh
        </div>
        <div></div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative">
            <button
              onClick={handleUserClick}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="flex-shrink-0 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            >
              {post.author.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.username}
                  className="w-12 h-12 rounded-md object-cover border-2 border-[#7aa2f7]"
                />
              ) : (
                <div className="w-12 h-12 bg-[#282a36] border-2 border-[#7aa2f7] rounded-md flex items-center justify-center">
                  <span className="text-[#7aa2f7] font-bold text-xl">
                    {post.author.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 min-w-0">
            {/* User Info */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleUserClick}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="text-[#7aa2f7] text-sm md:text-base hover:underline cursor-pointer transition-colors duration-200"
              >
                <span className="text-[#e0af68]">~/{post.author.username}</span>
              </button>
              <div className="text-xs text-[#565f89]">
                {formatDate(post.createdAt)}
              </div>
            </div>

            {/* Post Text */}
            <div className="text-[#c0caf5] text-sm md:text-base whitespace-pre-wrap mb-4">
              <span className="text-[#9ece6a] mr-2">$</span>
              {post.content}
            </div>

            {/* Image */}
            {post.image && (
              <div className="mt-3 rounded-md overflow-hidden border border-[#414868]">
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="w-full h-auto max-h-96 object-contain bg-black"
                />
              </div>
            )}

            {/* Topics */}
            {post.topics && post.topics.length > 0 && (
              <div className="flex items-center space-x-2 mt-4">
                <Tag className="h-4 w-4 text-[#565f89]" />
                <div className="flex flex-wrap gap-2">
                  {post.topics.map((topicId) => {
                    const topic = getTopicById(topicId);
                    if (!topic) return null;
                    return (
                      <span
                        key={topicId}
                        className="px-2 py-0.5 text-sm text-[#c0caf5] bg-[#282a36] rounded-full border border-[#414868]"
                      >
                        #{topic.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 pt-2 border-t border-[#414868] flex items-center justify-start space-x-4">
        <button
          onClick={() => handleReaction("happy")}
          disabled={!user}
          className={`flex items-center space-x-1 text-base transition-colors duration-200 ${
            hasUserReacted("happy")
              ? "text-[#9ece6a]"
              : "text-[#565f89] hover:text-[#9ece6a]"
          } ${!user ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <Smile className="h-4 w-4" />
          <span>
            {post.reactions.happy.length}{" "}
            <span className="hidden md:inline">smiles</span>
          </span>
        </button>

        <button
          onClick={() => handleReaction("sad")}
          disabled={!user}
          className={`flex items-center space-x-1 text-base transition-colors duration-200 ${
            hasUserReacted("sad")
              ? "text-[#f7768e]"
              : "text-[#565f89] hover:text-[#f7768e]"
          } ${!user ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <Frown className="h-4 w-4" />
          <span>
            {post.reactions.sad.length}{" "}
            <span className="hidden md:inline">sads</span>
          </span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-base text-[#565f89] hover:text-[#7aa2f7] transition-colors duration-200 cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          <span>
            {post.commentsCount}{" "}
            <span className="hidden md:inline">
              comentario{post.commentsCount > 1 ? "s" : ""}
            </span>
          </span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          comments={postComments}
          postId={post.id}
          onComment={onComment}
          onUserClick={onUserClick}
        />
      )}

      {/* User Popup - Positioned at cursor */}
      {showUserPopup && (
        <div
          className="fixed z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 animate-fade-in"
          style={{
            left: `${Math.min(popupPosition.x, window.innerWidth - 320)}px`,
            top: `${Math.min(popupPosition.y, window.innerHeight - 200)}px`,
          }}
          onMouseEnter={() => setShowUserPopup(true)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {post.author.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-bold text-xl">
                      {post.author.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 dark:text-white font-medium truncate">
                  {post.author.full_name || post.author.username || "Usuario"}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm truncate">
                  @{post.author.username || "usuario"}
                </div>
              </div>
            </div>

            {user && user.id !== post.author.id && (
              <button
                onClick={handleFollowClick}
                disabled={
                  followUserMutation.isPending || unfollowUserMutation.isPending
                }
                className={`mt-3 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  isFollowing
                    ? "bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {followUserMutation.isPending ||
                unfollowUserMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isFollowing ? (
                  <UserCheck className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span>{isFollowing ? "Siguiendo" : "Seguir"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default Post;
