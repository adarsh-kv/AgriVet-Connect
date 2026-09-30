import { useEffect, useRef, useState, useCallback } from "react";
import API from "../services/api";

const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short"
    });
};

const getTypeBadge = (type) => {
    switch (type) {
        case "SCHEME_APPLICATION":
        case "SCHEME_STATUS":
            return (
                <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-xs bg-[#1F3B2C]/10 text-[#1F3B2C]">
                    Scheme
                </span>
            );
        case "INSURANCE_APPLICATION":
        case "INSURANCE_STATUS":
            return (
                <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-xs bg-[#D9A441]/20 text-[#8E6316]">
                    Insurance
                </span>
            );
        case "VET_REQUEST":
        case "VET_REQUEST_STATUS":
            return (
                <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-xs bg-blue-100 text-blue-800">
                    Veterinary
                </span>
            );
        case "VACCINATION_DUE":
            return (
                <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-xs bg-amber-100 text-amber-800">
                    Vaccination
                </span>
            );
        default:
            return (
                <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-xs bg-gray-100 text-gray-700">
                    Alert
                </span>
            );
    }
};

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const dropdownRef = useRef(null);


    // Fetch all notifications
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data || []);
            // Update unread count based on returned list
            const unread = (res.data || []).filter((n) => !n.is_read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            setError(err.response?.data?.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial count fetch & periodic polling every 30 seconds
    useEffect(() => {
        let isMounted = true;

        const getCount = async () => {
            try {
                const res = await API.get("/notifications/unread-count");
                if (isMounted) {
                    setUnreadCount(Number(res.data?.unread_count || 0));
                }
            } catch (err) {
                console.error("Failed to fetch unread notification count:", err);
            }
        };

        getCount();
        const interval = setInterval(getCount, 30000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // Handle toggle dropdown
    const handleToggleDropdown = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            fetchNotifications();
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Mark single notification as read
    const handleMarkAsRead = async (notif) => {
        if (notif.is_read) return;

        try {
            await API.put(`/notifications/${notif.notification_id}/read`);
            setNotifications((prev) =>
                prev.map((item) =>
                    item.notification_id === notif.notification_id
                        ? { ...item, is_read: true }
                        : item
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error marking notification read:", err);
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await API.put("/notifications/read-all");
            setNotifications((prev) =>
                prev.map((item) => ({ ...item, is_read: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Error marking all read:", err);
        }
    };

    // Delete single notification
    const handleDelete = async (e, notifId, isRead) => {
        e.stopPropagation();

        try {
            await API.delete(`/notifications/${notifId}`);
            setNotifications((prev) =>
                prev.filter((item) => item.notification_id !== notifId)
            );
            if (!isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* BELL BUTTON */}
            <button
                type="button"
                onClick={handleToggleDropdown}
                className="relative p-2 text-[#5F574D] hover:text-[#1F3B2C] hover:bg-[#EEE8DC]/50 rounded-xs transition-colors focus:outline-hidden"
                aria-label="View notifications"
                aria-expanded={isOpen}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {/* UNREAD BADGE */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-bold text-white bg-[#A8452F] rounded-full ring-2 ring-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* DROPDOWN POPOVER PANEL */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#DED7C9] rounded-sm shadow-xl z-50 overflow-hidden font-[Inter,sans-serif]">
                    {/* DROPDOWN HEADER */}
                    <div className="p-4 border-b border-[#EEE8DC] bg-[#F6F1E4]/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-[#2B2620]">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#A8452F]/10 text-[#A8452F] rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                className="text-[11px] text-[#1F3B2C] hover:underline font-medium uppercase tracking-wider"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* ERROR STATE */}
                    {error && (
                        <div className="p-3 bg-[#A8452F]/[0.08] border-b border-[#A8452F]/20 text-xs text-[#A8452F]">
                            {error}
                        </div>
                    )}

                    {/* NOTIFICATIONS LIST */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-[#EEE8DC]">
                        {loading ? (
                            <div className="p-8 text-center text-xs text-[#8A8072] flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#1F3B2C] border-t-transparent rounded-full animate-spin" />
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-sm font-medium text-[#2B2620] mb-0.5">
                                    No notifications
                                </p>
                                <p className="text-xs text-[#8A8072]">
                                    You are all caught up with your farm activities.
                                </p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const isUnread = !notif.is_read;

                                return (
                                    <div
                                        key={notif.notification_id}
                                        onClick={() => handleMarkAsRead(notif)}
                                        className={`p-4 transition-colors cursor-pointer flex items-start gap-3 text-left ${
                                            isUnread
                                                ? "bg-[#F6F1E4]/50 hover:bg-[#F6F1E4] border-l-3 border-[#D9A441]"
                                                : "hover:bg-[#F6F1E4]/30 border-l-3 border-transparent"
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {getTypeBadge(notif.notification_type)}
                                                    <span className="text-[10px] text-[#8A8072]">
                                                        {formatTimeAgo(notif.created_at)}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleDelete(
                                                            e,
                                                            notif.notification_id,
                                                            notif.is_read
                                                        )
                                                    }
                                                    title="Delete notification"
                                                    className="text-[#8A8072] hover:text-[#A8452F] p-1 rounded-xs transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <h4
                                                className={`text-xs mb-1 line-clamp-1 ${
                                                    isUnread
                                                        ? "font-semibold text-[#2B2620]"
                                                        : "font-medium text-[#5F574D]"
                                                }`}
                                            >
                                                {notif.title}
                                            </h4>

                                            <p className="text-xs text-[#5F574D] line-clamp-2 leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* DROPDOWN FOOTER */}
                    {notifications.length > 0 && (
                        <div className="p-2.5 border-t border-[#EEE8DC] bg-white text-center">
                            <span className="text-[11px] text-[#8A8072]">
                                Click notification to mark as read
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
