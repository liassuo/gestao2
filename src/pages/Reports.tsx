import React, { useState } from 'react';
import { Equipment } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { FileText, Download, Filter, PieChart, BarChart, TrendingUp, Package, DollarSign } from 'lucide-react';

interface ReportsProps {
  equipment: Equipment[];
}

const Reports: React.FC<ReportsProps> = ({ equipment }) => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [chartView, setChartView] = useState<'status' | 'location'>('status');

  const locations = [...new Set(equipment.map(item => item.location))];
  
  const filteredEquipment = equipment.filter(item => {
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const itemDate = new Date(item.acquisitionDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = itemDate >= startDate && itemDate <= endDate;
    }
    
    return matchesStatus && matchesLocation && matchesDate;
  });

  const totalValue = filteredEquipment.reduce((sum, item) => sum + item.value, 0);

  const statusData = {
    active: filteredEquipment.filter(item => item.status === 'ativo').length,
    maintenance: filteredEquipment.filter(item => item.status === 'manutenção').length,
    inactive: filteredEquipment.filter(item => item.status === 'desativado').length
  };

  const locationData = locations.map(location => ({
    location,
    count: filteredEquipment.filter(item => item.location === location).length,
    value: filteredEquipment.filter(item => item.location === location)
      .reduce((sum, item) => sum + item.value, 0)
  }));

  const handleExport = () => {
    const headers = [
      'Número do Patrimônio',
      'Localização',
      'Responsável',
      'Status',
      'Descrição',
      'Modelo',
      'Marca',
      'Especificações',
      'Valor',
      'Data de Aquisição'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredEquipment.map(item => [
        `"${item.assetNumber}"`,
        `"${item.location}"`,
        `"${item.responsible}"`,
        `"${item.status}"`,
        `"${item.description}"`,
        `"${item.model}"`,
        `"${item.brand}"`,
        `"${item.specs || ''}"`,
        item.value,
        item.acquisitionDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_equipamentos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const statusLabels: Record<string, string> = {
    'ativo': 'Ativo',
    'manutenção': 'Em Manutenção',
    'desativado': 'Desativado',
    'all': 'Todos'
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-2 text-sm text-gray-600">Analise e exporte dados do seu inventário</p>
        </div>
        <Button 
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
          onClick={handleExport}
          icon={<Download size={18} />}
          disabled={filteredEquipment.length === 0}
        >
          Exportar Relatório
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Filter size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filtros de Pesquisa</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Período de Aquisição</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <input
                  type="date"
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="manutenção">Em Manutenção</option>
                <option value="desativado">Desativado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Localização</label>
              <select
                className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">Todas as Localizações</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-600">Total de Equipamentos</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{filteredEquipment.length}</p>
              <p className="text-xs text-gray-600 mt-1 truncate">
                {equipment.length > 0 
                  ? `${Math.round((filteredEquipment.length / equipment.length) * 100)}% do total`
                  : 'Nenhum equipamento'}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-white bg-opacity-60 rounded-full ml-3 flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-600">Valor Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 truncate">
                {formatCurrency(totalValue)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Valor acumulado</p>
            </div>
            <div className="p-2 sm:p-3 bg-white bg-opacity-60 rounded-full ml-3 flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-purple-600">Média por Equipamento</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 truncate">
                {formatCurrency(filteredEquipment.length > 0 ? totalValue / filteredEquipment.length : 0)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Valor médio</p>
            </div>
            <div className="p-2 sm:p-3 bg-white bg-opacity-60 rounded-full ml-3 flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Visualizações */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Análise Visual</h3>
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  chartView === 'status'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setChartView('status')}
              >
                <PieChart size={16} className="inline mr-2" />
                Por Status
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  chartView === 'location'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setChartView('location')}
              >
                <BarChart size={16} className="inline mr-2" />
                Por Local
              </button>
            </div>
          </div>

          {chartView === 'status' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-700">Equipamentos Ativos</p>
                    <span className="text-2xl font-bold text-green-700">{statusData.active}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {filteredEquipment.length > 0 
                      ? `${Math.round((statusData.active / filteredEquipment.length) * 100)}% do total` 
                      : '0%'}
                  </div>
                  <div className="w-full bg-green-200 bg-opacity-50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${filteredEquipment.length > 0 ? (statusData.active / filteredEquipment.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-200 rounded-full opacity-20" />
              </div>

              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-700">Em Manutenção</p>
                    <span className="text-2xl font-bold text-yellow-700">{statusData.maintenance}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {filteredEquipment.length > 0 
                      ? `${Math.round((statusData.maintenance / filteredEquipment.length) * 100)}% do total` 
                      : '0%'}
                  </div>
                  <div className="w-full bg-yellow-200 bg-opacity-50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${filteredEquipment.length > 0 ? (statusData.maintenance / filteredEquipment.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-200 rounded-full opacity-20" />
              </div>

              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-700">Desativados</p>
                    <span className="text-2xl font-bold text-red-700">{statusData.inactive}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {filteredEquipment.length > 0 
                      ? `${Math.round((statusData.inactive / filteredEquipment.length) * 100)}% do total` 
                      : '0%'}
                  </div>
                  <div className="w-full bg-red-200 bg-opacity-50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${filteredEquipment.length > 0 ? (statusData.inactive / filteredEquipment.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-200 rounded-full opacity-20" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {locationData.length > 0 ? (
                locationData.map((item, index) => {
                  const maxCount = Math.max(...locationData.map(l => l.count));
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={item.location} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-6 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">{item.location}</h4>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">{item.count} equipamentos</span>
                          <span className="text-sm font-medium text-blue-600">{formatCurrency(item.value)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-700 ease-out"
                          style={{ 
                            width: `${percentage}%`,
                            animationDelay: `${index * 100}ms`
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <BarChart size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">Nenhum dado disponível para visualização</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Tabela Detalhada */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Detalhamento dos Equipamentos</h3>
          </div>
          
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Patrimônio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600">{item.assetNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.responsible}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'manutenção'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.value)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <FileText size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500">Nenhum equipamento encontrado com os filtros aplicados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;