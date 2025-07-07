import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  User,
  MessageCircle,
  Heart,
  Calendar,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: "new_post" | "mention" | "follow" | "comment";
  title: string;
  message: string;
  relatedPostId?: string;
  relatedUserId?: string;
  relatedUsername?: string;
  relatedUserAvatar?: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationsDropdownProps {
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  unreadCount,
  onUnreadCountChange,
  isMobile = false,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock notifications data - replace with real API calls
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "new_post",
      title: "New post from @reactguru",
      message: "@reactguru shared a new post about React hooks",
      relatedPostId: "2",
      relatedUserId: "2",
      relatedUsername: "reactguru",
      relatedUserAvatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100",
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: "2",
      type: "follow",
      title: "New follower",
      message: "@pythonista started following you",
      relatedUserId: "3",
      relatedUsername: "pythonista",
      relatedUserAvatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "3",
      type: "comment",
      title: "New comment on your post",
      message: "@reactguru commented on your TypeScript post",
      relatedPostId: "1",
      relatedUserId: "2",
      relatedUsername: "reactguru",
      relatedUserAvatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100",
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: "4",
      type: "mention",
      title: "You were mentioned",
      message: "@pythonista mentioned you in a comment",
      relatedPostId: "3",
      relatedUserId: "3",
      relatedUsername: "pythonista",
      relatedUserAvatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ];

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, isMobile]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // In production, this would be a real API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDropdown = () => {
    if (isMobile && onClose) {
      // For mobile, this is handled by the parent menu
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }

    // Navigate based on notification type
    if (notification.type === "follow" && notification.relatedUsername) {
      navigate(`/user/${notification.relatedUsername}`);
    } else if (
      (notification.type === "new_post" ||
        notification.type === "comment" ||
        notification.type === "mention") &&
      notification.relatedPostId
    ) {
      navigate(`/?post=${notification.relatedPostId}`);
    }

    setIsOpen(false);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((notif) =>
          notificationIds.includes(notif.id)
            ? { ...notif, isRead: true }
            : notif
        )
      );

      // Update unread count
      const newUnreadCount = notifications.filter(
        (n) => !n.isRead && !notificationIds.includes(n.id)
      ).length;
      onUnreadCountChange(newUnreadCount);

      // In production, make API call to mark as read
      console.log("Marking notifications as read:", notificationIds);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const formatTimeAgo = (date: Date) => {
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_post":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <User className="h-4 w-4 text-green-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case "mention":
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!user) return null;

  // Mobile version (integrated into mobile menu)
  if (isMobile) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-600">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${notification.isRead
                      ? "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      : "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                    } cursor-pointer`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {notification.relatedUserAvatar ? (
                        <img
                          src={notification.relatedUserAvatar}
                          alt={notification.relatedUsername}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          notification.isRead
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                No notifications yet
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 rounded-lg cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-900" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 animate-fade-in z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 transition-colors duration-200 ${notification.isRead
                        ? "hover:bg-gray-50 dark:hover:bg-gray-700"
                        : "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      } cursor-pointer`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {notification.relatedUserAvatar ? (
                          <img
                            src={notification.relatedUserAvatar}
                            alt={notification.relatedUsername}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            notification.isRead
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Follow other developers to get notified of their posts
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
