
import React from 'react';

interface SkeletonCardProps {
  count?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 animate-pulse"
        >
          <div className="aspect-[4/3] bg-stone-200 dark:bg-stone-800" />
          <div className="p-5 space-y-3">
            <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded-lg w-3/4" />
            <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-full" />
            <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-2/3" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-stone-200 dark:bg-stone-800 rounded-full" />
              <div className="h-6 w-12 bg-stone-200 dark:bg-stone-800 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export const SkeletonProfileHeader: React.FC = () => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 mb-8 animate-pulse">
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
      {/* Avatar skeleton */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-stone-200 dark:bg-stone-800" />

      {/* Info skeleton */}
      <div className="flex-1 text-center sm:text-left w-full">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-4">
          <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded-lg w-48" />
        </div>
        <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-64 mx-auto sm:mx-0 mb-6" />

        {/* Stats skeleton */}
        <div className="flex justify-center sm:justify-start gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-12 bg-stone-200 dark:bg-stone-800 rounded mb-1 mx-auto" />
              <div className="h-3 w-16 bg-stone-200 dark:bg-stone-800 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonCard;
