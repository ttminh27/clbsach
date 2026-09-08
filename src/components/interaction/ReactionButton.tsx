import React, { useState, useRef, useEffect } from 'react';
import { TargetType, ReactionType, REACTION_DEFINITIONS } from '../../types/interaction';
import { reactionsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
  const [isHovered, setIsHovered] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const popoverTimeoutRef = useRef<any>(null);

  React.useEffect(() => {
    setCounts(initialCounts || {});
  }, [initialCounts]);

  React.useEffect(() => {
    setUserReactions(initialUserReactions || []);
  }, [initialUserReactions]);

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

  const handleToggle = (type: ReactionType) => {
    setShowPopover(false);
    requireAuth(async () => {
      try {
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
    }, 300);
  };

  // Determine mode: if target is comment and mode not explicitly 'bar', use 'popover'
  const isPopoverMode = mode === 'popover' || (mode === undefined && targetType === 'comment');

  // Popover mode (Zalo style for comments)
  if (isPopoverMode) {
    return (
      <div
        className="relative inline-flex items-center gap-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Floating Zalo Reaction Picker */}
        {showPopover && (
          <div className="absolute bottom-full left-0 mb-2 z-30 flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 px-3 py-2 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {displayedDefinitions.map((def) => {
              const isActive = activeReactionType === def.type || (def.type === 'love' && activeReactionType === 'heart');
              return (
                <button
                  key={def.type}
                  type="button"
                  onClick={() => handleToggle(def.type)}
                  title={def.label}
                  className={`relative flex items-center justify-center p-1 rounded-full transition-all duration-150 hover:scale-135 active:scale-95 ${
                    isActive ? 'scale-120 filter drop-shadow' : ''
                  }`}
                >
                  <img
                    src={def.iconUrl}
                    alt={def.label}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain pointer-events-none drop-shadow-xs"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Main Trigger Button */}
        <button
          type="button"
          onClick={() => handleToggle(activeReactionType || 'like')}
          className={`group inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
            activeDefinition
              ? `${activeDefinition.colorClass} font-bold shadow-2xs`
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <img
            src={activeDefinition ? activeDefinition.iconUrl : '/reactions/like.png'}
            alt={activeDefinition ? activeDefinition.label : 'Thích'}
            className={`w-4 h-4 object-contain ${activeDefinition ? '' : 'grayscale contrast-75 opacity-70 group-hover:grayscale-0 group-hover:opacity-100'} transition-all`}
          />
          <span>{activeDefinition ? activeDefinition.label : 'Thích'}</span>
        </button>

        {/* Render badges of existing reactions */}
        {totalCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            <div className="flex -space-x-1 items-center">
              {displayedDefinitions
                .filter((def) => ((counts[def.type] || 0) + (def.type === 'love' ? counts['heart'] || 0 : 0)) > 0)
                .slice(0, 3)
                .map((def) => (
                  <img
                    key={def.type}
                    src={def.iconUrl}
                    alt={def.label}
                    className="w-3.5 h-3.5 object-contain inline-block rounded-full bg-white dark:bg-slate-800 ring-1 ring-white dark:ring-slate-800"
                  />
                ))}
            </div>
            <span className="font-bold ml-0.5">{totalCount}</span>
          </div>
        )}
      </div>
    );
  }

  // Full Bar mode (for Chapters and Quiz Questions)
  const isSmall = size === 'sm';

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {displayedDefinitions.map((def) => {
        const count = (counts[def.type] || 0) + (def.type === 'love' ? counts['heart'] || 0 : 0);
        const isActive = userReactions.includes(def.type) || (def.type === 'love' && userReactions.includes('heart'));

        return (
          <button
            key={def.type}
            type="button"
            onClick={() => handleToggle(def.type)}
            title={`${def.label} (${count})`}
            className={`group inline-flex items-center gap-2 rounded-full border transition-all active:scale-95 ${
              isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm'
            } ${
              isActive
                ? `${def.colorClass} font-bold shadow-xs ring-2 ring-emerald-500/20 scale-105`
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <img
              src={def.iconUrl}
              alt={def.label}
              className={`${
                isSmall ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'
              } object-contain transition-transform duration-150 group-hover:scale-125`}
              loading="lazy"
            />
            <span className="hidden sm:inline font-medium">
              {def.label}
            </span>
            {count > 0 && (
              <span className={`font-bold ml-0.5 ${isActive ? '' : 'text-slate-500 dark:text-slate-400'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
