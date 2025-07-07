import React, { useState } from "react";
import { Smile, Frown, MessageCircle, Tag } from "lucide-react";
import { Post as PostType, Comment, AVAILABLE_TOPICS, User } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import CommentSection from "../CommentsSection";

interface PostProps {
  post: PostType;
  comments: Comment[];
  onReaction: (postId: string, type: "happy" | "sad") => void;
  onComment: (postId: string, content: string) => void;
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
  const { user } = useAuth();

  const formatDate = (date: Date) => {
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

  const getTopicById = (id: string) => {
    return AVAILABLE_TOPICS.find((topic) => topic.id === id);
  };

  const postComments = comments.filter((comment) => comment.postId === post.id);

  return (
    <article className="font-mono bg-[#1a1b26] rounded-lg border border-[#414868] shadow-lg overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-[#282a36] flex items-center justify-between px-4 py-2 border-b border-[#414868]">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-[#ff5f57] rounded-full"></span>
          <span className="w-3 h-3 bg-[#ffbd2e] rounded-full"></span>
          <span className="w-3 h-3 bg-[#28c940] rounded-full"></span>
        </div>
        <div className="text-xs text-[#c0caf5]">
          {post.author.username}@devsocial — zsh
        </div>
        <div></div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <button
            onClick={handleUserClick}
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

          {/* Content Body */}
          <div className="flex-1 min-w-0">
            {/* User Info */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleUserClick}
                className="text-[#7aa2f7] text-sm hover:underline cursor-pointer"
              >
                <span className="text-[#e0af68]">~/{post.author.username}</span>
              </button>
              <div className="text-xs text-[#565f89]">
                {formatDate(post.createdAt)}
              </div>
            </div>

            {/* Post Text */}
            <div className="text-[#c0caf5] text-sm whitespace-pre-wrap mb-4">
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
          } ${!user ? "cursor-not-allowed opacity-50" : ""} cursor-pointer`}
        >
          <Smile className="h-4 w-4" />
          <span>
            {post.reactions.happy.length}{" "}
            <span className="hidden md:inline">upvotes</span>
          </span>
        </button>

        <button
          onClick={() => handleReaction("sad")}
          disabled={!user}
          className={`flex items-center space-x-1 text-base transition-colors duration-200 ${
            hasUserReacted("sad")
              ? "text-[#f7768e]"
              : "text-[#565f89] hover:text-[#f7768e]"
          } ${!user ? "cursor-not-allowed opacity-50" : ""} cursor-pointer`}
        >
          <Frown className="h-4 w-4" />
          <span>
            {post.reactions.sad.length}{" "}
            <span className="hidden md:inline">downvotes</span>
          </span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-base text-[#565f89] hover:text-[#7aa2f7] transition-colors duration-200 cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          <span>
            {post.commentsCount}{" "}
            <span className="hidden md:inline">comments</span>
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
    </article>
  );
};

export default Post;
