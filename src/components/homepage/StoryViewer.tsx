import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Share2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

// Story content types
export interface Story {
    id: string;
    type: "case_update" | "donation" | "milestone" | "case_created" | "system_announcement";
    timestamp: number;
    imageUrl?: string | null;
    title: string;
    subtitle: string;
    emoji?: string;
    user?: {
        name: string;
        avatar?: string;
    };
    caseId?: Id<"cases">;
}

export interface StoryGroup {
    id: string;
    name: string;
    avatar?: string;
    type: "user" | "case" | "system";
    userId?: Id<"users">;
    caseId?: Id<"cases">;
}

interface StoryViewerProps {
    isOpen: boolean;
    onClose: () => void;
    storyGroup: StoryGroup | null;
    initialStoryIndex?: number;
}

// Progress bar component for story timing
function StoryProgressBar({ 
    total, 
    current, 
    progress 
}: { 
    total: number; 
    current: number; 
    progress: number;
}) {
    return (
        <div className="flex gap-1 px-2 pt-2 pb-1">
            {Array.from({ length: total }).map((_, i) => (
                <div 
                    key={i}
                    className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                >
                    <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                            width: i < current ? "100%" : i === current ? `${progress}%` : "0%" 
                        }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
            ))}
        </div>
    );
}

// Story header with user info
function StoryHeader({
    storyGroup,
    story,
    onClose,
}: {
    storyGroup: StoryGroup;
    story: Story;
    onClose: () => void;
}) {
    const timeAgo = formatTimeAgo(story.timestamp);

    return (
        <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                    {story.emoji ? (
                        <span className="text-lg">{story.emoji}</span>
                    ) : storyGroup.avatar ? (
                        <img 
                            src={storyGroup.avatar} 
                            alt={storyGroup.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-sm font-medium text-white">
                            {storyGroup.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                {/* Name and time */}
                <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">{storyGroup.name}</span>
                    <span className="text-white/60 text-xs">{timeAgo}</span>
                </div>
            </div>
            {/* Close button */}
            <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
                <X className="w-5 h-5 text-white" />
            </button>
        </div>
    );
}

// Main story content
function StoryContent({ story }: { story: Story }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
            {/* Image or emoji placeholder */}
            {story.imageUrl ? (
                <div className="w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden bg-black/50 mb-6">
                    <img
                        src={story.imageUrl}
                        alt={story.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : story.emoji ? (
                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-6">
                    <span className="text-6xl">{story.emoji}</span>
                </div>
            ) : (
                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-6">
                    <span className="text-4xl">🐾</span>
                </div>
            )}

            {/* Story type badge */}
            <div className="mb-3">
                <StoryTypeBadge type={story.type} />
            </div>

            {/* Title */}
            <h2 className="text-white text-xl font-bold text-center mb-2">
                {story.title}
            </h2>

            {/* Subtitle */}
            <p className="text-white/80 text-center text-sm max-w-xs line-clamp-3">
                {story.subtitle}
            </p>

            {/* User attribution */}
            {story.user && (
                <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-white/10">
                    {story.user.avatar ? (
                        <img 
                            src={story.user.avatar}
                            alt={story.user.name}
                            className="w-5 h-5 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-xs text-white">{story.user.name.charAt(0)}</span>
                        </div>
                    )}
                    <span className="text-white/90 text-xs">{story.user.name}</span>
                </div>
            )}
        </div>
    );
}

// Story type badge
function StoryTypeBadge({ type }: { type: Story["type"] }) {
    const badges: Record<Story["type"], { label: string; className: string }> = {
        case_update: { 
            label: "Update", 
            className: "bg-primary/80" 
        },
        donation: { 
            label: "Donation", 
            className: "bg-success/80" 
        },
        milestone: { 
            label: "Milestone", 
            className: "bg-warning/80" 
        },
        case_created: { 
            label: "New Case", 
            className: "bg-destructive/80" 
        },
        system_announcement: { 
            label: "Announcement", 
            className: "bg-accent/80" 
        },
    };

    const badge = badges[type];

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium text-white",
            badge.className
        )}>
            {badge.label}
        </span>
    );
}

// Story actions footer
function StoryActions({ story: _story, onClose: _onClose }: { story: Story; onClose: () => void }) {
    return (
        <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Like</span>
                </button>
                <button className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">Reply</span>
                </button>
            </div>
            <button className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Share</span>
            </button>
        </div>
    );
}

// Helper function to format time ago
function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
}

// Auto-advance duration per story (5 seconds)
const STORY_DURATION = 5000;

// Internal component that handles the story viewing logic
function StoryViewerContent({ 
    onClose, 
    storyGroup,
    initialStoryIndex = 0,
}: Omit<StoryViewerProps, 'isOpen'>) {
    const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const progressRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedAtRef = useRef<number>(0);

    // Fetch stories based on story group type
    const userStories = useQuery(
        api.activity.getUserStories,
        storyGroup?.type === "user" && storyGroup.userId
            ? { userId: storyGroup.userId, limit: 10 }
            : "skip"
    );

    const caseStories = useQuery(
        api.activity.getCaseStories,
        storyGroup?.type === "case" && storyGroup.caseId
            ? { caseId: storyGroup.caseId, limit: 10 }
            : "skip"
    );

    const systemStories = useQuery(
        api.activity.getSystemStories,
        storyGroup?.type === "system" ? {} : "skip"
    );

    // Determine which stories to show
    const stories: Story[] = React.useMemo(() => {
        if (storyGroup?.type === "user" && userStories) {
            return userStories as Story[];
        }
        if (storyGroup?.type === "case" && caseStories) {
            return caseStories as Story[];
        }
        if (storyGroup?.type === "system" && systemStories) {
            return systemStories as Story[];
        }
        return [];
    }, [storyGroup, userStories, caseStories, systemStories]);

    const currentStory = stories[currentIndex];
    const totalStories = stories.length;

    // Progress animation
    useEffect(() => {
        if (isPaused || !currentStory) return;

        startTimeRef.current = Date.now() - (pausedAtRef.current > 0 ? pausedAtRef.current : 0);
        
        const animate = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                // Move to next story
                if (currentIndex < totalStories - 1) {
                    setCurrentIndex(prev => prev + 1);
                    setProgress(0);
                    pausedAtRef.current = 0;
                } else {
                    onClose();
                }
            } else {
                progressRef.current = requestAnimationFrame(animate);
            }
        };

        progressRef.current = requestAnimationFrame(animate);

        return () => {
            if (progressRef.current) {
                cancelAnimationFrame(progressRef.current);
            }
        };
    }, [isPaused, currentIndex, totalStories, currentStory, onClose]);

    // Navigation handlers
    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
            pausedAtRef.current = 0;
        }
    }, [currentIndex]);

    const goToNext = useCallback(() => {
        if (currentIndex < totalStories - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
            pausedAtRef.current = 0;
        } else {
            onClose();
        }
    }, [currentIndex, totalStories, onClose]);

    // Touch/click handlers for navigation
    const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        if (x < width / 3) {
            goToPrevious();
        } else if (x > (width * 2) / 3) {
            goToNext();
        }
    }, [goToPrevious, goToNext]);

    // Pause on hold
    const handlePointerDown = useCallback(() => {
        pausedAtRef.current = Date.now() - startTimeRef.current;
        setIsPaused(true);
    }, []);

    const handlePointerUp = useCallback(() => {
        setIsPaused(false);
    }, []);

    // Swipe down to close
    const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 100) {
            onClose();
        }
    }, [onClose]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":
                    goToPrevious();
                    break;
                case "ArrowRight":
                case " ":
                    goToNext();
                    break;
                case "Escape":
                    onClose();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goToPrevious, goToNext, onClose]);

    // Loading state
    const isLoading = !stories.length && 
        (storyGroup?.type === "user" ? userStories === undefined :
         storyGroup?.type === "case" ? caseStories === undefined :
         systemStories === undefined);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black"
        >
            <motion.div
                drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        className="w-full h-full flex flex-col"
                    >
                        {isLoading ? (
                            // Loading state
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        ) : !currentStory ? (
                            // No stories state
                            <div className="flex-1 flex flex-col items-center justify-center px-6">
                                <span className="text-6xl mb-4">📭</span>
                                <h2 className="text-white text-xl font-bold mb-2">No Stories Yet</h2>
                                <p className="text-white/60 text-center">
                                    Check back later for updates!
                                </p>
                                <button
                                    onClick={onClose}
                                    className="mt-6 px-6 py-2 bg-white/10 rounded-full text-white"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Progress bars */}
                                <StoryProgressBar 
                                    total={totalStories}
                                    current={currentIndex}
                                    progress={progress}
                                />

                                {/* Header */}
                                <StoryHeader 
                                    storyGroup={storyGroup}
                                    story={currentStory}
                                    onClose={onClose}
                                />

                                {/* Story content - tap zones */}
                                <div 
                                    className="flex-1 relative cursor-pointer select-none"
                                    onClick={handleTap}
                                    onPointerDown={handlePointerDown}
                                    onPointerUp={handlePointerUp}
                                    onPointerLeave={handlePointerUp}
                                >
                                    {/* Navigation hints */}
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                        {currentIndex > 0 && (
                                            <ChevronLeft className="w-8 h-8 text-white/50" />
                                        )}
                                    </div>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                        {currentIndex < totalStories - 1 && (
                                            <ChevronRight className="w-8 h-8 text-white/50" />
                                        )}
                                    </div>

                                    {/* Animated story content */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStory.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.2 }}
                                            className="h-full"
                                        >
                                            <StoryContent story={currentStory} />
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Actions footer */}
                                <StoryActions story={currentStory} onClose={onClose} />
                            </>
                        )}
                    </motion.div>
                </motion.div>
    );
}

// Main export - wrapper that uses key to reset state on story group change
export function StoryViewer({ 
    isOpen, 
    onClose, 
    storyGroup,
    initialStoryIndex = 0,
}: StoryViewerProps) {
    if (!isOpen || !storyGroup) {
        return null;
    }

    // Key on storyGroup.id forces remount when changing story groups
    return (
        <StoryViewerContent
            key={storyGroup.id}
            onClose={onClose}
            storyGroup={storyGroup}
            initialStoryIndex={initialStoryIndex}
        />
    );
}

export default StoryViewer;
