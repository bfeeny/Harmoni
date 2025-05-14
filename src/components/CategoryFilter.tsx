import { SoundCategory } from '../utils/types';

interface CategoryFilterProps {
  activeCategory: SoundCategory | null;
  onCategoryChange: (category: SoundCategory | null) => void;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const categories = Object.values(SoundCategory);
  
  return (
    <div className="category-filter">
      <button
        className={activeCategory === null ? 'active' : ''}
        onClick={() => onCategoryChange(null)}
      >
        All
      </button>
      
      {categories.map(category => (
        <button
          key={category}
          className={activeCategory === category ? 'active' : ''}
          onClick={() => onCategoryChange(category)}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      ))}
    </div>
  );
}