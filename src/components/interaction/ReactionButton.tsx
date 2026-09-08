import React, { useState, useRef, useEffect } from 'react';
import { TargetType, ReactionType, REACTION_DEFINITIONS } from '../../types/interaction';
import { reactionsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Smile } from 'lucide-react';
import { fireReactionConfetti } from '../../utils/confetti';

interface ReactionButtonProps {
  targetType: TargetType;
  targetId: string;
  counts: Record<string, number>;
  userReactions: string[];
  onUpdated?: (counts: Record<string, number>, userReactions: string[]) => void;
  size?: 'sm' | 'md' | 'lg';
  mode?: 'bar' | 'popover';
  availableTypes?: ReactionType[];
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  targetType,
  targetId,
  counts: initialCounts,
  userReactions: initialUserReactions,
  onUpdated,
  size = 'md',
  mode,
  availableTypes,
}) => {
  const { requireAuth } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts || {});
  const [userReactions, setUserReactions] = useState<string[]>(initialUserReactions || []);
  const [showPopover, setShowPopover] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const popoverTimeoutRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCounts(initialCounts || {});
  }, [initialCounts]);

  useEffect(() => {
    setUserReactions(initialUserReactions || []);
  }, [initialUserReactions]);

  // Click outside to close popover & breakdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPopover(false);
        setShowBreakdown(false);
      }
    };
    if (showPopover || showBreakdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover, showBreakdown]);

  const displayedDefinitions = availableTypes
    ? REACTION_DEFINITIONS.filter((d) => availableTypes.includes(d.type))
    : REACTION_DEFINITIONS;

  // Total count
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  // Active user reaction if any
  const activeReactionType = userReactions.length > 0 ? (userReactions[0] as ReactionType) : null;
  const activeDefinition = activeReactionType
    ? REACTION_DEFINITIONS.find((d) => d.type === activeReactionType || (d.type === 'love' && activeReactionType === 'heart'))
    : null;

  const handleToggle = (type: ReactionType, e?: React.MouseEvent) => {
    setShowPopover(false);
    const clientX = e?.clientX;
    const clientY = e?.clientY;

    requireAuth(async () => {
      try {
        const isAdding = !userReactions.includes(type);
        if (isAdding) {
          fireReactionConfetti(type, clientX, clientY);
        }

        const res = await reactionsApi.toggleReaction(targetType, targetId, type);
        setCounts(res.counts);
        setUserReactions(res.userReactions);
        if (onUpdated) {
          onUpdated(res.counts, res.userReactions);
        }
      } catch (err) {
        console.error('Reaction toggle error:', err);
      }
    }, 'Đăng nhập để bày tỏ cảm xúc của bạn!');
  };

  const handleMouseEnter = () => {
    if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    popoverTimeoutRef.current = setTimeout(() => {
      setShowPopover(false);
    }, 350);
  };

  // Determine mode: if target is comment and mode not explicitly 'bar', use 'popover'
  const isPopoverMode = mode === 'popover' || (mode === undefined && targetType === 'comment');

  // Popover mode (Zalo style for comments)
  if (isPopoverMode) {
    return (
      <div
        ref={containerRef}
        className="relative inline-flex items-center gap-1.5"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Floating Reaction Picker */}
        {showPopover && (
          <div className="absolute bottom-full left-0 mb-1.5 z-30 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-900 px-2.5 py-1.5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {displayedDefinitions.map((def) => {
              const isActive = activeReactionType === def.type || (def.type === 'love' && activeReactionType === 'heart');
              return (
                <button
                  key={def.type}
                  type="button"
                  onClick={(e) => handleToggle(def.type, e)}
                  title={def.label}
                  className={`group relative flex items-center justify-center p-1 rounded-full transition-all duration-150 hover:scale-135 active:scale-95 ${
                    isActive ? 'scale-115 ring-2 ring-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/50' : ''
                  }`}
                >
                  <img
                    src={def.iconUrl}
                    alt={def.label}
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain pointer-events-none drop-shadow-xs"
                    loading="lazy"
                  />
                  {/* Tooltip on hover */}
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none animate-in fade-in duration-100">
                    {def.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Reaction Trigger Button with Mobile Smile Picker */}
        <div className="inline-flex items-center rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <button
            type="button"
            onClick={(e) => handleToggle(activeReactionType || 'like', e)}
            className={`group inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-l-lg transition-all ${
              activeDefinition
                ? `${activeDefinition.colorClass} font-bold shadow-2xs`
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <img
              src={activeDefinition ? activeDefinition.iconUrl : '/reactions/like.png'}
              alt={activeDefinition ? activeDefinition.label : 'Thích'}
              className={`w-4 h-4 object-contain ${
                activeDefinition
                  ? 'animate-in zoom-in-75 duration-150'
                  : 'grayscale contrast-75 opacity-70 group-hover:grayscale-0 group-hover:opacity-100'
              } transition-all`}
            />
            <span>{activeDefinition ? activeDefinition.label : 'Thích'}</span>
          </button>

          {/* Quick Picker toggle button (touch friendly) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPopover(!showPopover);
            }}
            title="Chọn cảm xúc khác"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-r-lg border-l border-slate-200/60 dark:border-slate-700/60 transition-colors"
          >
            <Smile className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Total Reactions Count Badge with Breakdown Popover */}
        {totalCount > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              title="Xem chi tiết lượt cảm xúc"
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
            >
              <div className="flex -space-x-1 items-center">
                {displayedDefinitions
                  .filter((def) => ((counts[def.type] || 0) + (def.type === 'love' ? counts['heart'] || 0 : 0)) > 0)
                  .slice(0, 3)
                  .map((def) => (
                    <img
                      key={def.type}
                      src={def.iconUrl}
                      alt={def.label}
                      className="w-3.5 h-3.5 object-contain inline-block rounded-full bg-white dark:bg-slate-800 ring-1 ring-white dark:ring-slate-800 shrink-0"
                    />
                  ))}
              </div>
              <span className="font-bold ml-0.5">{totalCount}</span>
            </button>

            {/* Breakdown Popup */}
            {showBreakdown && (
              <div className="absolute bottom-full left-0 mb-1.5 z-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2.5 min-w-[140px] animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                  Chi tiết cảm xúc
                </div>
                <div className="space-y-1">
                  {displayedDefinitions
                    .filter((def) => ((counts[def.type] || 0) + (def.type === 'love' ? counts['heart'] || 0 : 0)) > 0)
                    .map((def) => {
                      const c = (counts[def.type] || 0) + (def.type === 'love' ? counts['heart'] || 0 : 0);
                      return (
                        <div key={def.type} className="flex items-center justify-between gap-2 text-xs py-0.5">
                          <div className="flex items-center gap-1.5">
                            <img src={def.iconUrl} alt={def.label} className="w-4 h-4 object-contain" />
                            <span className="text-slate-700 dark:text-slate-300 text-[11px]">{def.label}</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white text-[11px]">{c}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full Bar mode (for Chapters, Quizzes, and Section Docks)
  const isSmall = size === 'sm';

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 w-full">
      {displayedDefinitions.map((def) => {
        const count = (counts[def.type] || 0) + (def.type === 'love' ? counts['heart'] || 0 : 0);
        const isActive = userReactions.includes(def.type) || (def.type === 'love' && userReactions.includes('heart'));

        return (
          <button
            key={def.type}
            type="button"
            onClick={(e) => handleToggle(def.type, e)}
            title={`${def.label} (${count})`}
            className={`group relative w-full flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border transition-all duration-150 active:scale-95 cursor-pointer ${
              isSmall ? 'px-2 py-1.5 text-xs' : 'px-2.5 py-2 sm:py-2.5 text-xs sm:text-sm'
            } ${
              isActive
                ? `${def.colorClass} font-bold shadow-xs ring-2 ring-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/40 scale-[1.02]`
                : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/50 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
            }`}
          >
            <img
              src={def.iconUrl}
              alt={def.label}
              className={`${
                isSmall ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'
              } object-contain transition-transform duration-150 group-hover:scale-125 group-active:scale-95 shrink-0 drop-shadow-xs`}
              loading="lazy"
            />
            <span className="font-semibold text-xs sm:text-[13px] truncate">
              {def.label}
            </span>
            {count > 0 && (
              <span
                className={`font-bold rounded-full px-1.5 py-0.2 text-[10px] sm:text-xs transition-colors shrink-0 ${
                  isActive
                    ? 'bg-white/90 dark:bg-slate-800/90 text-inherit shadow-2xs'
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
