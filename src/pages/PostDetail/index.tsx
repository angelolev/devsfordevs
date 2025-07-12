import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { PostCard } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import {
  usePostDetail,
  useComments,
  useCreateCommentWithNotification,
  useToggleReaction,
} from "../../lib/queries";
import { User } from "../../types";

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch the post details
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = usePostDetail(postId || "", !!postId);

  // Fetch comments for this post
  const {
    data: comments = [],
    isLoading: commentsLoading,
    error: commentsError,
  } = useComments(postId ? [postId] : [], !!postId);

  // Mutations
  const createCommentMutation = useCreateCommentWithNotification();
  const toggleReactionMutation = useToggleReaction();

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
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("There was an error creating your comment. Please try again.");
    }
  };

  const handleUserClick = (clickedUser: User) => {
    if (clickedUser.username) {
      navigate(`/user/${clickedUser.username}`);
    } else {
      navigate(`/profile/${clickedUser.id}`);
    }
  };

  const handleBackClick = () => {
    navigate("/feed");
  };

  // Loading state
  if (postLoading || commentsLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Error state
  if (postError || !post) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Post no encontrado
          </h1>
          <p className="text-gray-400 mb-4">
            El post que buscas no existe o ha sido eliminado.
          </p>
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Feed
          </button>
        </div>
      </div>
    );
  }

  // Comments error
  if (commentsError) {
    console.error("Error loading comments:", commentsError);
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-16">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al Feed
            </button>
          </div>

          {/* Post Details Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <MessageCircle className="h-4 w-4" />
              <span>Post detallado</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-2">
              Post de {post.author.full_name || post.author.username}
            </h1>
          </div>

          {/* Post Card */}
          <div className="mb-8">
            <PostCard
              post={post}
              comments={comments}
              onReaction={handleReaction}
              onComment={handleComment}
              onUserClick={handleUserClick}
              hideOpenButton={true}
            />
          </div>

          {/* Comments Summary */}
          {comments.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                {comments.length} comentario{comments.length !== 1 ? "s" : ""}{" "}
                en este post
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
