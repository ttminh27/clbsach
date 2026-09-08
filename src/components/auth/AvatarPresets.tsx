import React from 'react';
import { Bird, Cat, Dog, Rabbit, Fish, Turtle, BookOpen, Crown } from 'lucide-react';

export interface AvatarOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar-owl',
    name: 'Cú Thông Thái',
    icon: Bird,
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/80',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'avatar-cat',
    name: 'Mèo Hiếu Kỳ',
    icon: Cat,
    bgColor: 'bg-indigo-100 dark:bg-indigo-950/80',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'avatar-dog',
    name: 'Cún Trung Thành',
    icon: Dog,
    bgColor: 'bg-amber-100 dark:bg-amber-950/80',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'avatar-rabbit',
    name: 'Thỏ Nhanh Nhẹn',
    icon: Rabbit,
    bgColor: 'bg-rose-100 dark:bg-rose-950/80',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'avatar-fish',
    name: 'Cá Sáng Tạo',
    icon: Fish,
    bgColor: 'bg-sky-100 dark:bg-sky-950/80',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'avatar-turtle',
    name: 'Rùa Kiên Trì',
    icon: Turtle,
    bgColor: 'bg-teal-100 dark:bg-teal-950/80',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
];

export function getAvatarOption(avatarId?: string): AvatarOption {
  // Direct match
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  if (found) return found;

  // Numeric index match e.g. avatar-1 ... avatar-6
  if (avatarId && avatarId.startsWith('avatar-')) {
    const num = parseInt(avatarId.replace('avatar-', ''), 10);
    if (!isNaN(num) && num >= 1 && num <= AVATAR_OPTIONS.length) {
      return AVATAR_OPTIONS[num - 1];
    }
  }

  // Backward compatibility mappings for older IDs
  if (avatarId === 'avatar-fox') {
    return {
      id: 'avatar-fox',
      name: 'Cáo Nhanh Nhẹn',
      icon: Rabbit,
      bgColor: 'bg-amber-100 dark:bg-amber-950/80',
      iconColor: 'text-amber-600 dark:text-amber-400',
    };
  }
  if (avatarId === 'avatar-panda') {
    return {
      id: 'avatar-panda',
      name: 'Gấu Trúc Điềm Tĩnh',
      icon: Turtle,
      bgColor: 'bg-slate-200 dark:bg-slate-800',
      iconColor: 'text-slate-700 dark:text-slate-300',
    };
  }
  if (avatarId === 'avatar-dolphin') {
    return {
      id: 'avatar-dolphin',
      name: 'Cá Heo Sáng Tạo',
      icon: Fish,
      bgColor: 'bg-sky-100 dark:bg-sky-950/80',
      iconColor: 'text-sky-600 dark:text-sky-400',
    };
  }
  if (avatarId === 'avatar-lion') {
    return {
      id: 'avatar-lion',
      name: 'Sư Tử Quyết Đoán',
      icon: Crown,
      bgColor: 'bg-orange-100 dark:bg-orange-950/80',
      iconColor: 'text-orange-600 dark:text-orange-400',
    };
  }

  // Default fallback
  return {
    id: 'avatar-default',
    name: 'Đọc Giả',
    icon: BookOpen,
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/80',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  };
}

export function getAvatarBg(avatarId?: string): string {
  return getAvatarOption(avatarId).bgColor;
}

export const AvatarIcon: React.FC<{
  avatarId?: string;
  className?: string;
}> = ({ avatarId, className = 'h-4 w-4' }) => {
  const opt = getAvatarOption(avatarId);
  const Icon = opt.icon;
  return <Icon className={`${opt.iconColor} ${className}`} />;
};
