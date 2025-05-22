import React, { useState, useEffect } from 'react';
import { Equipment } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { PlusCircle, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface EquipmentListProps {
  equipment: Equipment[];
  onViewDetails: (id: string) => void;
  onAddNew: () => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  equipment,
  onViewDetails,
  onAddNew
}) => {
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Equipment>('assetNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique locations for filter
  const locations = [...new Set(equipment.map(item => item.location))];

  // Apply filters
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Apply sorting
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Handle sort
  const handleSort = (field: keyof Equipment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: keyof Equipment) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipamentos</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie todos os equipamentos do seu inventário</p>
        </div>
        <Button 
          className="mt-4 sm:mt-0" 
          onClick={onAddNew}
          icon={<PlusCircle size={16} />}
        >
          Adicionar Equipamento
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="w-40">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos Status</option>
                  <option value="ativo">Ativo</option>
                  <option value="manutenção">Em Manutenção</option>
                  <option value="desativado">Desativado</option>
                </select>
              </div>
              
              <div className="w-48">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="all">Todas Localizações</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('assetNumber')}
                  >
                    <div className="flex items-center">
                      Patrimônio
                      {renderSortIndicator('assetNumber')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      Descrição
                      {renderSortIndicator('description')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center">
                      Localização
                      {renderSortIndicator('location')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {renderSortIndicator('status')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center">
                      Valor
                      {renderSortIndicator('value')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEquipment.length > 0 ? (
                  sortedEquipment.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => onViewDetails(item.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {item.assetNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variante={item.status}>
                          {item.status === 'ativo' ? 'Ativo' : 
                           item.status === 'manutenção' ? 'Em Manutenção' : 'Desativado'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.value)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum equipamento encontrado com os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-700 pt-4">
            <div>
              Mostrando <span className="font-medium">{sortedEquipment.length}</span> de <span className="font-medium">{equipment.length}</span> equipamentos
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EquipmentList;