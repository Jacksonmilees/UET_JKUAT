import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-secondary/50 rounded ${className}`} />
  );
};

// Card Skeleton for stats/overview cards
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-4">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  );
};

// Transaction Skeleton
export const TransactionSkeleton: React.FC = () => {
  return (
    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded">
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="text-right">
        <Skeleton className="h-5 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
};

// Grid Skeleton for cards
export const GridSkeleton: React.FC<{ count?: number; columns?: number }> = ({ count = 4, columns = 4 }) => {
  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

// Product/Merchandise Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </div>
    </div>
  );
};

// Project Card Skeleton
export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <Skeleton className="w-full h-40" />
      <div className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-2/3 mb-4" />
        <Skeleton className="h-2 w-full rounded-full mb-2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
};

// Stats Overview Skeleton
export const OverviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <GridSkeleton count={4} />
      <GridSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
