import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Calendar,
  User,
  Heart,
  Frown,
  Eye,
  Clock,
} from "lucide-react";
import { PostCard } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  usePostDetail,
  useComments,
  useCreateCommentWithNotification,
  useToggleReaction,
} from "../../lib/queries";
import { getUserPosts } from "../../lib/supabase";
import { User as UserType, Post, Comment } from "../../types";
import { AVAILABLE_TOPICS } from "../../types";

// PostDetailSidebar component
const PostDetailSidebar: React.FC<{
  post: Post;
  comments: Comment[];
  onUserClick: (user: UserType) => void;
}> = ({ post, comments, onUserClick }) => {
  const { data: authorPosts } = useQuery({
    queryKey: ["userPosts", post.author.id],
    queryFn: () => getUserPosts(post.author.id),
    enabled: !!post.author.id,
  });

  const displayName =
    post.author.full_name || post.author.username || "Usuario";
  const postDate = new Date(post.createdAt);

  const getTopicById = (id: string) => {
    return AVAILABLE_TOPICS.find((topic) => topic.id === id);
  };

  const terminalBar = (
    <div className="flex items-center h-8 px-4 bg-[#23272e] border-b border-gray-700 rounded-t-2xl">
      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
      <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Post Stats */}
      <div className="relative bg-[#23272e] rounded-2xl border border-gray-800 shadow-lg font-mono text-white p-0 overflow-hidden w-full">
        {terminalBar}
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-bold text-white">Estadísticas</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {post.reactions.happy.length}
              </div>
              <div className="text-sm text-gray-400 flex items-center justify-center">
                <Heart className="h-3 w-3 mr-1" />
                Smiles
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {post.reactions.sad.length}
              </div>
              <div className="text-sm text-gray-400 flex items-center justify-center">
                <Frown className="h-3 w-3 mr-1" />
                Sads
              </div>
            </div>
            <div className="text-center col-span-2">
              <div className="text-2xl font-bold text-purple-400">
                {comments.length}
              </div>
              <div className="text-sm text-gray-400 flex items-center justify-center">
                <MessageCircle className="h-3 w-3 mr-1" />
                Comentarios
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Info */}
      <div className="relative bg-[#23272e] rounded-2xl border border-gray-800 shadow-lg font-mono text-white p-0 overflow-hidden w-full">
        {terminalBar}
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-bold text-white">Autor</h3>
          </div>

          <div className="space-y-4">
            {/* Author */}
            <div>
              <div className="flex items-center space-x-3">
                {post.author.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{displayName}</p>
                  <p className="text-gray-400 text-sm">
                    @{post.author.username || post.author.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onUserClick(post.author)}
                className="mt-2 w-fit text-left px-3 py-2 btn-primary text-white rounded-lg  transition-colors text-sm cursor-pointer"
              >
                Ver perfil completo
              </button>
            </div>

            {/* Date */}
            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {postDate.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Topics */}
            {post.topics && post.topics.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">
                  Temas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {post.topics.map((topicId: string) => {
                    const topic = getTopicById(topicId);
                    if (!topic) return null;
                    return (
                      <span
                        key={topicId}
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${topic.bgColor} ${topic.color}`}
                        style={{ borderColor: "currentColor" }}
                      >
                        {topic.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Other Posts by Author */}
      {authorPosts && authorPosts.length > 1 && (
        <div className="relative bg-[#23272e] rounded-2xl border border-gray-800 shadow-lg font-mono text-white p-0 overflow-hidden w-full">
          {terminalBar}
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-bold text-white">
                Más posts de {displayName}
              </h3>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {authorPosts
                .filter((p: Post) => p.id !== post.id)
                .slice(0, 3)
                .map((otherPost: Post) => (
                  <div
                    key={otherPost.id}
                    className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/post/${otherPost.id}`)
                    }
                  >
                    <p className="text-white text-sm line-clamp-2">
                      {otherPost.content}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(otherPost.createdAt).toLocaleDateString(
                        "es-ES"
                      )}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Generate random colors for the header (similar to UserProfile)
  const headerColors = React.useMemo(() => {
    const generateRandomColor = () => {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 70 + Math.floor(Math.random() * 30);
      const lightness = 45 + Math.floor(Math.random() * 20);
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    return {
      color1: generateRandomColor(),
      color2: generateRandomColor(),
      color3: generateRandomColor(),
    };
  }, []);

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

  const handleUserClick = (clickedUser: UserType) => {
    if (clickedUser.username) {
      navigate(`/user/${clickedUser.username}`);
    } else {
      navigate(`/profile/${clickedUser.id}`);
    }
  };

  const handleBackClick = () => {
    navigate("/");
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
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Comments error
  if (commentsError) {
    console.error("Error loading comments:", commentsError);
  }

  const displayName =
    post.author.full_name || post.author.username || "Usuario";
  const postDate = new Date(post.createdAt);

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <div
        className="relative"
        style={{
          background: `linear-gradient(90deg, ${headerColors.color1} 0%, ${headerColors.color2} 50%, ${headerColors.color3} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="py-8">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al Inicio
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              {/* Author Avatar */}
              <div className="relative">
                {post.author.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={displayName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/20 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full border-4 border-white/20 flex items-center justify-center">
                    <span className="text-white font-bold text-xl sm:text-2xl">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Post Info */}
              <div className="mt-4 sm:mt-0 flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-purple-200 mb-1">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">Post detallado</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      Post de {displayName}
                    </h1>
                    <p className="text-purple-200 text-lg mb-2">
                      @{post.author.username || post.author.email}
                    </p>
                    <div className="flex items-center space-x-4 text-white/80 flex-wrap gap-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          Publicado el{" "}
                          {postDate.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">
                          {comments.length} comentario
                          {comments.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleUserClick(post.author)}
                      className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PostDetailSidebar
              post={post}
              comments={comments}
              onUserClick={handleUserClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
