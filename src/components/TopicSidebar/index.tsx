import React from "react";
import { Filter, X } from "lucide-react";
import { AVAILABLE_TOPICS } from "../../types";

interface TopicSidebarProps {
  selectedTopics: string[];
  onTopicToggle: (topicId: string) => void;
  onClearAll: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const TopicSidebar: React.FC<TopicSidebarProps> = ({
  selectedTopics,
  onTopicToggle,
  onClearAll,
  isMobile = false,
  onClose,
}) => {
  const getTopicById = (id: string) => {
    return AVAILABLE_TOPICS.find((topic) => topic.id === id);
  };

  const handleTopicToggle = (topicId: string) => {
    onTopicToggle(topicId);
    // Auto-close mobile filters after selection for better UX
    if (isMobile && onClose) {
      setTimeout(() => onClose(), 150);
    }
  };

  const containerClasses =
    "relative bg-[#23272e] rounded-2xl border border-gray-800 shadow-lg font-mono text-white p-0 overflow-hidden w-full max-w-md mx-auto ";

  const terminalBar = (
    <div className="flex items-center h-8 px-4 bg-[#23272e] border-b border-gray-700 rounded-t-2xl">
      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
      <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
    </div>
  );

  const cardClasses = isMobile ? "p-6" : "p-6";

  return (
    <div className={containerClasses}>
      {terminalBar}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400 dark:text-gray-400" />
            <h3 className="text-lg font-bold text-white">Temas</h3>
          </div>
          <div className="flex items-center space-x-2">
            {selectedTopics.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Limpiar</span>
              </button>
            )}
            {isMobile && onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Selected Topics Count */}
        {selectedTopics.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Filtros activos ({selectedTopics.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedTopics.map((topicId) => {
                const topic = getTopicById(topicId);
                if (!topic) return null;
                return (
                  <span
                    key={topicId}
                    className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${topic.bgColor} ${topic.color}`}
                    style={{ borderColor: "currentColor" }}
                  >
                    <span>{topic.name}</span>
                    <button
                      onClick={() => onTopicToggle(topicId)}
                      className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors duration-200 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Topics Grid as Badges */}
        <div className="space-y-3">
          {/* <h4 className="text-sm font-semibold text-gray-400">
            Available Topics
          </h4> */}
          <div
            className={`flex flex-wrap gap-2 p-2 ${
              isMobile ? "max-h-96" : "max-h-80"
            } overflow-y-auto`}
          >
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  onClick={() => handleTopicToggle(topic.id)}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                    isSelected
                      ? `${topic.bgColor} ${topic.color} shadow-sm transform scale-105`
                      : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:transform hover:scale-105 cursor-pointer"
                  }`}
                  style={isSelected ? { borderColor: "currentColor" } : {}}
                >
                  {topic.name}
                  {isSelected && (
                    <div className="ml-1.5 w-1.5 h-1.5 bg-current rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* {selectedTopics.length === 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic">
              Click topic badges to filter posts
            </p>
          </div>
        )} */}

        {/* Mobile-specific close button */}
        {isMobile && onClose && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onClose}
              className="w-full btn-primary cursor-pointer"
            >
              Aplicar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicSidebar;
