import React, { useState } from 'react';
import { Equipment, HistoryEntry } from '../../types';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { 
  Edit, 
  Trash, 
  Clock, 
  Download, 
  FileText, 
  Laptop,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Package,
  Activity,
  ChevronRight,
  History,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';

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

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'criou':
        return 'bg-green-100 text-green-800';
      case 'editou':
        return 'bg-blue-100 text-blue-800';
      case 'excluiu':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleExportDetails = () => {
    const content = `
RELATÓRIO DE EQUIPAMENTO
========================

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

Gerado em: ${new Date().toLocaleString('pt-BR')}
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
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start lg:items-center flex-col lg:flex-row gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{equipment.assetNumber}</h2>
                <p className="text-sm text-gray-600 mt-0.5">{equipment.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variante={equipment.status}>
                {equipment.status === 'ativo' ? 'Ativo' : 
                 equipment.status === 'manutenção' ? 'Em Manutenção' : 'Desativado'}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Edit size={16} />}
              onClick={() => onEdit(equipment.id)}
              className="hover:shadow-md transition-shadow"
            >
              Editar
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              icon={<Trash size={16} />}
              onClick={() => onDelete(equipment.id)}
              className="hover:shadow-md transition-shadow"
            >
              Excluir
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Download size={16} />}
              onClick={handleExportDetails}
              className="hover:shadow-md transition-shadow"
            >
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-6 -mb-px">
          <button
            className={`py-3 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'details'
                ? 'bg-white text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('details')}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              Detalhes
            </div>
          </button>
          <button
            className={`ml-2 py-3 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-white text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <div className="flex items-center gap-2">
              <History size={16} />
              Histórico
              {history.length > 0 && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'details' ? (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText size={16} className="text-blue-600" />
                </div>
                Informações Básicas
              </h3>
              
              <div className="space-y-3">
                <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors group">
                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-medium">{equipment.location}</dd>
                    </div>
                    <MapPin className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
                
                <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors group">
                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-medium">{equipment.responsible}</dd>
                    </div>
                    <User className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
                
                <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors group">
                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Aquisição</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-medium">{formatDate(equipment.acquisitionDate)}</dd>
                    </div>
                    <Calendar className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-blue-700 uppercase tracking-wider">Valor de Aquisição</dt>
                      <dd className="mt-1 text-lg text-blue-900 font-bold">{formatCurrency(equipment.value)}</dd>
                    </div>
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detalhes Técnicos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Laptop size={16} className="text-purple-600" />
                </div>
                Detalhes Técnicos
              </h3>
              
              <div className="space-y-3">
                <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{equipment.brand}</dd>
                </div>
                
                <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{equipment.model}</dd>
                </div>
                
                <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Especificações</dt>
                  <dd className="mt-2 text-sm text-gray-900 whitespace-pre-line">{equipment.specs || 'Nenhuma especificação cadastrada'}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-all duration-200 transform hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Activity className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeTypeColor(entry.changeType)}`}>
                            {entry.changeType === 'criou' ? 'Criação' : 
                             entry.changeType === 'editou' ? 'Edição' : 
                             entry.changeType === 'excluiu' ? 'Exclusão' : 
                             'Alteração de Status'}
                          </span>
                          <span className="text-xs text-gray-500">
                            por <span className="font-medium text-gray-700">{entry.user}</span>
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                          {entry.changeType === 'criou' ? (
                            <p>Novo equipamento cadastrado no sistema</p>
                          ) : entry.changeType === 'excluiu' ? (
                            <p>Equipamento <span className="font-medium">{entry.oldValue}</span> foi removido do sistema</p>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">{entry.field || 'Campo não especificado'}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-red-600 line-through">{entry.oldValue || 'Vazio'}</span>
                                <ChevronRight className="h-3 w-3 text-gray-400" />
                                <span className="text-green-600 font-medium">{entry.newValue || 'Vazio'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDateTime(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum histórico disponível para este equipamento.</p>
              <p className="text-sm text-gray-400 mt-2">As alterações futuras serão registradas aqui.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentDetails;