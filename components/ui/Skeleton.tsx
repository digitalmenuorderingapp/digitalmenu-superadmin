'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton = ({ className = '', width, height, circle = false }: SkeletonProps) => {
  return (
    <div 
      className={`relative overflow-hidden bg-slate-800/50 ${circle ? 'rounded-full' : 'rounded-[0.75rem]'} ${className}`}
      style={{ width, height }}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
    </div>
  );
};

export const MetricSkeleton = () => (
  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 shadow-xl">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton circle width={32} height={32} />
      <Skeleton width="40%" height={10} />
    </div>
    <div className="space-y-2">
      <Skeleton width="70%" height={24} />
      <Skeleton width="30%" height={10} />
    </div>
  </div>
);

export const CompactStatSkeleton = () => (
  <div className="bg-slate-800/20 border border-white/5 rounded-xl p-3 relative overflow-hidden">
     <div className="flex items-center gap-2 mb-2">
        <Skeleton circle width={16} height={16} />
        <Skeleton width="40%" height={8} />
     </div>
     <div className="flex items-baseline gap-1.5">
        <Skeleton width="30%" height={20} />
        <Skeleton width="20%" height={8} />
     </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr className="border-b border-white/5">
    {Array(columns).fill(0).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton width="80%" height={12} />
      </td>
    ))}
  </tr>
);

export const MetricCardSkeleton = () => (
   <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex justify-between items-center">
         <Skeleton circle width={36} height={36} />
         <Skeleton circle width={16} height={16} />
      </div>
      <div className="space-y-3">
         <Skeleton width="40%" height={10} className="opacity-50" />
         <Skeleton width="60%" height={32} />
         <Skeleton width="30%" height={10} className="opacity-30" />
      </div>
   </div>
);


export const ServiceCardSkeleton = () => (
  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
    <div className="p-4 bg-white/5 rounded-2xl mb-6 inline-block">
      <Skeleton width={24} height={24} />
    </div>
    <div className="flex items-center justify-between mb-4">
      <Skeleton width={120} height={16} />
      <div className="flex items-center gap-2">
        <Skeleton width={40} height={10} />
        <Skeleton circle width={14} height={14} />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton width="100%" height={10} />
      <Skeleton width="60%" height={10} />
    </div>
  </div>
);
