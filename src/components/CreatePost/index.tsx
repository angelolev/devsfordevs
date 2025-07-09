import React, { useState, useRef } from "react";
import { Image, Send, X, Loader2, Tag } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { uploadImage } from "../../lib/supabase";
import { AVAILABLE_TOPICS, Topic } from "../../types";

interface CreatePostProps {
  onCreatePost: (content: string, topics: string[], image?: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onCreatePost }) => {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  if (!user) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona una imagen");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("El tamaño de la imagen debe ser menor a 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getTopicById = (id: string): Topic | undefined => {
    return AVAILABLE_TOPICS.find((topic) => topic.id === id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsUploading(true);

    try {
      let imageUrl: string | undefined;

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile, user.id);
      }

      onCreatePost(content, selectedTopics, imageUrl);

      // Reset form
      setContent("");
      setSelectedTopics([]);
      setSelectedFile(null);
      setImagePreview("");
      setIsExpanded(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleTextareaFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    if (!content.trim() && selectedTopics.length === 0 && !selectedFile) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="card p-6 mb-6  bg-[#23272e] border-gray-800 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main textarea */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleTextareaFocus}
            placeholder="<>¿Qué tienes para decir hoy?</>"
            className="input w-full resize-none transition-all duration-200 px-3 py-2 border rounded-lg bg-white border-[#d1d5db] text-[#111827]  dark:bg-[#1a1a1a] dark:border-[#4b5563] dark:text-[#f9fafb]"
            rows={isExpanded ? 3 : 2}
            maxLength={280}
            disabled={isUploading}
          />

          {/* Character count and image button aligned */}
          {isExpanded && (
            <div className="flex items-center justify-between mt-2">
              {/* Image upload button - icon only */}
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={isUploading}
                className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${
                  selectedFile
                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                } cursor-pointer`}
                title={selectedFile ? "Change image" : "Add image"}
              >
                <Image className="h-5 w-5" />
              </button>

              {/* Character count */}
              <span
                className={`text-xs ${
                  content.length > 250
                    ? "text-red-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {content.length}/280
              </span>
            </div>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="space-y-4 animate-fade-in">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Image preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Topic Selection */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">
                  Elige temas ({selectedTopics.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2">
                {AVAILABLE_TOPICS.map((topic) => {
                  const isSelected = selectedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleTopicToggle(topic.id)}
                      disabled={isUploading}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                        isSelected
                          ? `${topic.bgColor} ${topic.color} shadow-sm transform scale-105`
                          : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                      } disabled:opacity-50 cursor-pointer`}
                      style={isSelected ? { borderColor: "currentColor" } : {}}
                    >
                      {topic.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Topics Display */}
            {selectedTopics.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mr-2">
                  Seleccionados:
                </span>
                {selectedTopics.map((topicId) => {
                  const topic = getTopicById(topicId);
                  if (!topic) return null;
                  return (
                    <span
                      key={topicId}
                      className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${topic.bgColor} ${topic.color}`}
                      style={{
                        borderColor: "currentColor",
                      }}
                    >
                      <span>{topic.name}</span>
                      <button
                        type="button"
                        onClick={() => handleTopicToggle(topicId)}
                        disabled={isUploading}
                        className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors duration-200 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Action buttons at bottom */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>Formatos: JPG, PNG, GIF, WebP • Tamaño máximo: 5MB</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-red-400   transition-colors duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || isUploading}
                  className={`btn-primary flex items-center space-x-1 ${
                    isUploading || !content.trim()
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  } cursor-pointer`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Publicar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
