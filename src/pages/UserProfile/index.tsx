import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Calendar,
  Edit3,
  Github,
  Mail,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { PostCard } from "../../components";
import { getUserProfile, getUserPosts } from "../../lib/supabase";
import {
  useComments,
  useCreateComment,
  useToggleReaction,
} from "../../lib/queries";
import { Post, User as UserType } from "../../types";

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts");

  // Query for user profile
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: () =>
      username
        ? getUserProfile(username)
        : Promise.reject(new Error("No username")),
    enabled: !!username,
  });

  // Query for user posts
  const {
    data: userPosts,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery({
    queryKey: ["userPosts", userProfile?.id],
    queryFn: () =>
      userProfile?.id ? getUserPosts(userProfile.id) : Promise.resolve([]),
    enabled: !!userProfile?.id && activeTab === "posts",
  });

  // Query for comments (for all user posts)
  const postIds = userPosts?.map((post: Post) => post.id) || [];
  const { data: comments } = useComments(postIds, activeTab === "posts");

  // Mutations
  const createCommentMutation = useCreateComment();
  const toggleReactionMutation = useToggleReaction();

  const isOwnProfile = currentUser?.id === userProfile?.id;

  const handleReaction = (postId: string, type: "happy" | "sad") => {
    if (!currentUser) return;
    toggleReactionMutation.mutate({
      postId,
      userId: currentUser.id,
      reactionType: type,
    });
  };

  const handleComment = (
    postId: string,
    content: string,
    parentId?: string
  ) => {
    if (!currentUser) return;
    createCommentMutation.mutate({
      postId,
      authorId: currentUser.id,
      content,
      parentId,
    });
  };

  const handleUserClick = (user: UserType) => {
    if (user.username && user.username !== userProfile?.username) {
      navigate(`/user/${user.username}`);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (profileError || !userProfile) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Usuario no encontrado
          </h1>
          <p className="text-gray-400 mb-4">
            El perfil que buscas no existe o ha sido eliminado.
          </p>
          <button
            onClick={() => navigate("/feed")}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Feed
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    userProfile.full_name || userProfile.username || "Usuario";
  const joinDate = new Date(userProfile.created_at || Date.now());

  // Generar colores aleatorios
  const randomColor1 = "#" + Math.floor(Math.random() * 16777215).toString(16);
  const randomColor2 = "#" + Math.floor(Math.random() * 16777215).toString(16);
  const randomColor3 = "#" + Math.floor(Math.random() * 16777215).toString(16);

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <div
        className="relative"
        style={{
          background: `linear-gradient(90deg, ${randomColor1} 0%, ${randomColor2} 50%, ${randomColor3} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="py-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              {/* Avatar */}
              <div className="relative">
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={displayName}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full border-4 border-white/20 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl sm:text-3xl">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="mt-4 sm:mt-0 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {displayName}
                    </h1>
                    <p className="text-purple-200 text-lg">
                      @{userProfile.username || userProfile.email}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-white/80">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          Miembro desde{" "}
                          {joinDate.toLocaleDateString("es-ES", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isOwnProfile && (
                    <button className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors cursor-pointer">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              {/* About Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-3">
                  Acerca de
                </h3>
                <div className="space-y-3">
                  {userProfile.email && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{userProfile.email}</span>
                    </div>
                  )}

                  {userProfile.provider && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      {userProfile.provider === "github" ? (
                        <Github className="h-4 w-4 text-gray-500" />
                      ) : (
                        <User className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm capitalize">
                        Conectado via {userProfile.provider}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-3">
                  Estadísticas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">
                      {userPosts?.length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">0</div>
                    <div className="text-sm text-gray-400">Seguidores</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "posts"
                      ? "border-purple-500 text-purple-400"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Posts ({userPosts?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("about")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "about"
                      ? "border-purple-500 text-purple-400"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Actividad
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                {postsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : postsError ? (
                  <div className="text-center py-8">
                    <div className="text-red-400 mb-2">Error loading posts</div>
                    <p className="text-gray-500">Please try again later</p>
                  </div>
                ) : userPosts && userPosts.length > 0 ? (
                  userPosts.map((post: Post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      comments={comments || []}
                      onReaction={handleReaction}
                      onComment={handleComment}
                      onUserClick={handleUserClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">
                      {isOwnProfile
                        ? "No has publicado nada aún"
                        : "No hay posts aún"}
                    </h3>
                    <p className="text-gray-500">
                      {isOwnProfile
                        ? "¡Comparte tu primera publicación con la comunidad!"
                        : "Este usuario aún no ha compartido ninguna publicación."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">
                    Actividad Reciente
                  </h3>
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500">Funcionalidad en desarrollo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
