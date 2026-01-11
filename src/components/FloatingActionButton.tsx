import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, PawPrint, Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingActionButton() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Hide FAB on pages with sticky action buttons
    const hideOnPaths = ['/case/', '/campaigns/', '/clinics/', '/create-case', '/create-adoption'];
    const shouldHide = hideOnPaths.some(path => location.pathname.includes(path)) || location.pathname === '/campaigns';

    if (shouldHide) return null;

    return (
        <div className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8 flex flex-col items-end">
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Options */}
            <div className={cn(
                "flex flex-col items-end gap-2 mb-2 transition-all duration-200",
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}>
                <Link
                    to="/create-case"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-full shadow-md text-sm"
                >
                    <PawPrint className="w-4 h-4" />
                    <span className="font-medium">Report Animal</span>
                </Link>
                <Link
                    to="/create-adoption"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 bg-accent text-accent-foreground px-3 py-2 rounded-full shadow-md text-sm"
                >
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">List for Adoption</span>
                </Link>
            </div>

            {/* Main Button - Smaller */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-200",
                    isOpen
                        ? "bg-foreground text-background rotate-45"
                        : "bg-primary text-primary-foreground"
                )}
            >
                {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
        </div>
    );
}
