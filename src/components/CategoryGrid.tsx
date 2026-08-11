import React from 'react';
import {
  AirVent,
  Droplets,
  Zap,
  Sparkles,
  Scissors,
  Hammer,
  ShieldAlert,
  Grid,
} from 'lucide-react';
import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  AirVent: <AirVent className="w-6 h-6 text-sky-600" />,
  Droplets: <Droplets className="w-6 h-6 text-blue-600" />,
  Zap: <Zap className="w-6 h-6 text-amber-500" />,
  Sparkles: <Sparkles className="w-6 h-6 text-purple-600" />,
  Scissors: <Scissors className="w-6 h-6 text-pink-600" />,
  Hammer: <Hammer className="w-6 h-6 text-orange-600" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-emerald-600" />,
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <section id="category-grid-section" className="mx-4 sm:mx-6 lg:mx-8 my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Explore Home Services
          </h2>
          <p className="text-xs text-slate-500">
            Select a category to view specialized packages & instant options
          </p>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            selectedCategoryId === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          View All Services
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center p-4 rounded-xl text-center border transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${
                  isSelected ? 'bg-white shadow-xs' : 'bg-slate-50'
                }`}
              >
                {ICON_MAP[cat.icon] || <Grid className="w-6 h-6 text-slate-600" />}
              </div>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 mb-0.5">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {cat.serviceCount} options
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
