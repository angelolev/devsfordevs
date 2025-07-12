import React, { useState } from "react";
import { Send, Calendar, ChevronDown, ChevronUp, Reply } from "lucide-react";
import { Comment, User } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  onComment: (postId: string, content: string, parentId?: string) => void;
  onUserClick?: (user: User) => void;
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onComment: (postId: string, content: string, parentId?: string) => void;
  onUserClick?: (user: User) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onComment,
  onUserClick,
  depth = 0,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const { user } = useAuth();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Hace instantes";
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    return date.toLocaleDateString();
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;

    onComment(postId, replyContent, comment.id);
    setReplyContent("");
    setShowReplyForm(false);
  };

  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick(comment.author);
    }
  };

  const maxDepth = 3; // Limit nesting depth
  const canReply = depth < maxDepth;

  return (
    <div
      className={`${
        depth > 0
          ? "ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-600"
          : ""
      }`}
    >
      <div className="flex space-x-3 mb-3">
        <button
          onClick={handleUserClick}
          className="w-8 h-8 flex-shrink-0 hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          {comment.author.avatar_url ? (
            <img
              src={comment.author.avatar_url}
              alt={comment.author.username}
              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {comment.author.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2 mb-1">
              <button
                onClick={handleUserClick}
                className="font-bold text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer"
              >
                @{comment.author.username}
              </button>
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">{formatDate(comment.createdAt)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-2">
            {canReply && user && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="reaction-btn p-1.5 cursor-pointer"
                aria-label="Reply"
              >
                <Reply className="h-4 w-4" />
              </button>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer"
              >
                {showReplies ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                <span>
                  {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "reply" : "replies"}
                </span>
              </button>
            )}
          </div>

          {showReplyForm && user && (
            <form onSubmit={handleReplySubmit} className="mt-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to @${comment.author.username}...`}
                  className="input flex-1 text-sm px-3 py-2 border rounded-lg bg-white border-[#d1d5db] text-[#111827]  dark:bg-[#1a1a1a] dark:border-[#4b5563] dark:text-[#f9fafb]"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!replyContent.trim()}
                  className="btn-primary px-3 py-2 cursor-pointer"
                >
                  <Send color="#fff" className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onComment={onComment}
              onUserClick={onUserClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  postId,
  onComment,
  onUserClick,
}) => {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    onComment(postId, newComment);
    setNewComment("");
  };

  // Organize comments into a tree structure
  const organizeComments = (comments: Comment[]) => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree structure
    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const organizedComments = organizeComments(comments);

  return (
    <div className="pt-6 px-4 border-t border-gray-200 dark:border-gray-600">
      {user && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex space-x-3">
            <div className="w-8 h-8 flex-shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Añadir un comentario..."
                  className="input flex-1 text-sm px-3 py-2 border rounded-lg bg-white border-[#d1d5db] text-[#111827]  dark:bg-[#1a1a1a] dark:border-[#4b5563] dark:text-[#f9fafb]"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="btn-primary px-3 py-2 cursor-pointer"
                >
                  <Send color="#fff" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {organizedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            onComment={onComment}
            onUserClick={onUserClick}
          />
        ))}
      </div>

      {!user && organizedComments.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
          No hay comentarios aún. Inicia sesión para ser el primero en comentar!
        </p>
      )}
    </div>
  );
};

export default CommentSection;
