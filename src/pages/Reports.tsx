import React, { useState } from 'react';
import { Equipment } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { FileText, Download, Filter, PieChart, BarChart } from 'lucide-react';

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
    
    // Filtro por data se fornecido
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

  // Data for status chart
  const statusData = {
    active: filteredEquipment.filter(item => item.status === 'ativo').length,
    maintenance: filteredEquipment.filter(item => item.status === 'manutenção').length,
    inactive: filteredEquipment.filter(item => item.status === 'desativado').length
  };

  // Data for location chart
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-1 text-sm text-gray-500">Gere relatórios detalhados do seu inventário</p>
        </div>
        <Button 
          className="mt-4 sm:mt-0" 
          onClick={handleExport}
          icon={<Download size={16} />}
          disabled={filteredEquipment.length === 0}
        >
          Exportar CSV
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter size={18} className="mr-2 text-primary" />
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Período</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  placeholder="Data inicial"
                />
                <input
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  placeholder="Data final"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="manutenção">Em Manutenção</option>
                <option value="desativado">Desativado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Localização</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">Todas</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText size={18} className="mr-2 text-primary" />
            Resumo do Relatório
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm transition-transform hover:scale-105 duration-300">
              <p className="text-sm text-gray-500">Total de Equipamentos</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredEquipment.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm transition-transform hover:scale-105 duration-300">
              <p className="text-sm text-gray-500">Valor Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm transition-transform hover:scale-105 duration-300">
              <p className="text-sm text-gray-500">Média por Equipamento</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(filteredEquipment.length > 0 ? totalValue / filteredEquipment.length : 0)}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Visualização Gráfica</h4>
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    chartView === 'status'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setChartView('status')}
                >
                  Por Status
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                    chartView === 'location'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setChartView('location')}
                >
                  Por Localização
                </button>
              </div>
            </div>

            {chartView === 'status' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-3 p-4 bg-white rounded-lg border">
                  <h5 className="font-medium text-gray-700 mb-4 flex items-center">
                    <PieChart size={16} className="mr-2 text-primary" />
                    Distribuição por Status
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-sm text-gray-500">Ativos</p>
                      <p className="text-xl font-semibold text-green-600">{statusData.active}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {filteredEquipment.length > 0 
                          ? `${Math.round((statusData.active / filteredEquipment.length) * 100)}%` 
                          : '0%'}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${filteredEquipment.length > 0 ? (statusData.active / filteredEquipment.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <p className="text-sm text-gray-500">Em Manutenção</p>
                      <p className="text-xl font-semibold text-yellow-600">{statusData.maintenance}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {filteredEquipment.length > 0 
                          ? `${Math.round((statusData.maintenance / filteredEquipment.length) * 100)}%` 
                          : '0%'}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${filteredEquipment.length > 0 ? (statusData.maintenance / filteredEquipment.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <p className="text-sm text-gray-500">Desativados</p>
                      <p className="text-xl font-semibold text-red-600">{statusData.inactive}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {filteredEquipment.length > 0 
                          ? `${Math.round((statusData.inactive / filteredEquipment.length) * 100)}%` 
                          : '0%'}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${filteredEquipment.length > 0 ? (statusData.inactive / filteredEquipment.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-lg border">
                <h5 className="font-medium text-gray-700 mb-4 flex items-center">
                  <BarChart size={16} className="mr-2 text-primary" />
                  Distribuição por Localização
                </h5>
                {locationData.length > 0 ? (
                  <div className="space-y-4">
                    {locationData.map(item => (
                      <div key={item.location} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-gray-900">{item.location}</p>
                          <p className="text-sm text-gray-500">{item.count} equipamentos</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${filteredEquipment.length > 0 ? (item.count / filteredEquipment.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Valor total: <span className="font-medium text-blue-700">{formatCurrency(item.value)}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Nenhum dado disponível para visualização.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText size={18} className="mr-2 text-primary" />
            Detalhamento
          </h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patrimônio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {item.assetNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.responsible}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {statusLabels[item.status]}
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
      </Card>
    </div>
  );
};

export default Reports;