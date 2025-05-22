import React from 'react';

type BadgeVariant = 'ativo' | 'manutenção' | 'desativado' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variante?: BadgeVariant;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variante = 'default',
  className = '' 
}) => {
  const getVariantClasses = () => {
    switch (variante) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'manutenção':
        return 'bg-yellow-100 text-yellow-800';
      case 'desativado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantClasses()} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;