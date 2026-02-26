import type { Categoria } from '@/types';

interface CategoriaChipProps {
  categoria: Categoria;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
}

export const CategoriaChip: React.FC<CategoriaChipProps> = ({
  categoria,
  selected = false,
  onClick,
  small = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center rounded-full font-medium transition-all duration-200
        ${small ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'}
        ${selected 
          ? 'bg-[#064e3b] text-white shadow-md' 
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }
      `}
    >
      <span 
        className={`rounded-full mr-2 ${small ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}
        style={{ backgroundColor: categoria.color }}
      />
      {categoria.nombre}
    </button>
  );
}
