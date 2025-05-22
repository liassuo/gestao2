import React, { useState } from 'react';
import { Equipment, HistoryEntry } from '../../types';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Edit, Trash, Clock, Download, FileText } from 'lucide-react';

interface EquipmentDetailsProps {
  equipment: Equipment;
  history: HistoryEntry[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ 
  equipment, 
  history,
  onEdit,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleExportDetails = () => {
    const content = `
Número de Patrimônio: ${equipment.assetNumber}
Descrição: ${equipment.description}
Marca: ${equipment.brand}
Modelo: ${equipment.model}
Especificações: ${equipment.specs || 'N/A'}
Status: ${equipment.status}
Localização: ${equipment.location}
Responsável: ${equipment.responsible}
Data de Aquisição: ${formatDate(equipment.acquisitionDate)}
Valor: ${formatCurrency(equipment.value)}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipamento-${equipment.assetNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center mb-4 sm:mb-0">
            <h2 className="text-xl font-bold text-gray-900 mr-3">{equipment.assetNumber}</h2>
            <Badge variante={equipment.status}>
              {equipment.status === 'ativo' ? 'Ativo' : 
               equipment.status === 'manutenção' ? 'Em Manutenção' : 'Desativado'}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Edit size={16} />}
              onClick={() => onEdit(equipment.id)}
            >
              Editar
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              icon={<Trash size={16} />}
              onClick={() => onDelete(equipment.id)}
            >
              Excluir
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Download size={16} />}
              onClick={handleExportDetails}
            >
              Exportar
            </Button>
          </div>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button
            className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Detalhes
          </button>
          <button
            className={`ml-8 py-3 px-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Histórico
          </button>
        </div>
      </div>

      {activeTab === 'details' ? (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <FileText size={18} className="mr-2 text-primary" />
                Informações Básicas
              </h3>
              <dl className="grid grid-cols-1 gap-y-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <dt className="text-sm font-medium text-gray-500">Descrição</dt>
                  <dd className="mt-1 text-sm text-gray-900">{equipment.description || 'N/A'}</dd>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <dt className="text-sm font-medium text-gray-500">Localização</dt>
                  <dd className="mt-1 text-sm text-gray-900">{equipment.location}</dd>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <dt className="text-sm font-medium text-gray-500">Responsável</dt>
                  <dd className="mt-1 text-sm text-gray-900">{equipment.responsible}</dd>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <dt className="text-sm font-medium text-gray-500">Data de Aquisição</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(equipment.acquisitionDate)}</dd>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <dt className="text-sm font-medium text-gray-500">Valor</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold text-primary-dark">{formatCurrency(equipment.value)}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Laptop size={18} className="mr-2 text-primary" />
                Detalhes Técnicos
              </h3>
              <dl className="grid grid-cols-1 gap-y-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <dt className="text-sm font-medium text-gray-500">Marca</dt>
                  <dd className="mt-1 text-sm text-gray-900">{equipment.brand}</dd>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <dt className="text-sm font-medium text-gray-500">Modelo</dt>
                  <dd className="mt-1 text-sm text-gray-900">{equipment.model}</dd>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <dt className="text-sm font-medium text-gray-500">Especificações</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{equipment.specs || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Alteração</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes da Alteração</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.length > 0 ? (
                  history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-gray-400" />
                          {formatDateTime(entry.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.changeType === 'criou' ? 'Criação' : 
                         entry.changeType === 'editou' ? 'Edição' : 
                         entry.changeType === 'excluiu' ? 'Exclusão' : 
                         'Alteração de Status'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.changeType === 'criou' ? (
                          'Novo equipamento cadastrado'
                        ) : entry.changeType === 'excluiu' ? (
                          `Equipamento ${entry.oldValue} foi excluído`
                        ) : (
                          <div className="space-y-1">
                            <p><span className="text-gray-500 font-medium">Campo:</span> {entry.field || 'N/A'}</p>
                            <p><span className="text-gray-500">De:</span> {entry.oldValue || 'N/A'}</p>
                            <p><span className="text-gray-500">Para:</span> {entry.newValue || 'N/A'}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.user}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum histórico disponível para este equipamento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetails;