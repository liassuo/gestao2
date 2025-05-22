import React, { useState, useEffect } from 'react';
import { Equipment, HistoryEntry } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import EquipmentDetails from '../components/equipment/EquipmentDetails';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Loader2, 
  Package,
  RefreshCw,
  Home,
  ChevronRight
} from 'lucide-react';
import inventoryService from '../services/inventoryService';

interface EquipmentDetailsPageProps {
  equipmentId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const EquipmentDetailsPage: React.FC<EquipmentDetailsPageProps> = ({
  equipmentId,
  onBack,
  onEdit,
  onDelete
}) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEquipmentData = async () => {
    try {
      setError(null);
      
      // Load equipment details
      const equipmentData = await inventoryService.getEquipmentById(equipmentId);
      if (!equipmentData) {
        throw new Error('Equipamento não encontrado');
      }
      setEquipment(equipmentData);

      // Load equipment history
      const historyData = await inventoryService.getEquipmentHistory(equipmentId);
      setHistory(historyData);
    } catch (err) {
      console.error('Error loading equipment details:', err);
      setError((err as Error).message || 'Erro ao carregar detalhes do equipamento');
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadEquipmentData();
      setLoading(false);
    };

    if (equipmentId) {
      initialLoad();
    }
  }, [equipmentId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEquipmentData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando equipamento...</h3>
          <p className="text-sm text-gray-500">Por favor, aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center py-8 px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Equipamento não encontrado'}
            </h3>
            <p className="text-gray-500 mb-6">
              Não foi possível carregar os detalhes deste equipamento. 
              Verifique se o ID está correto ou tente novamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleRefresh} 
                icon={<RefreshCw size={16} />} 
                variant="primary"
              >
                Tentar Novamente
              </Button>
              <Button 
                onClick={onBack} 
                icon={<ArrowLeft size={16} />} 
                variant="outline"
              >
                Voltar para Lista
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-3 flex items-center text-sm">
            <button 
              onClick={() => window.location.href = '/'} 
              className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
            >
              <Home size={16} className="mr-1" />
              Início
            </button>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <button 
              onClick={onBack} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Equipamentos
            </button>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">{equipment.assetNumber}</span>
          </div>

          {/* Header */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={onBack}
                className="hover:shadow-md transition-all"
              >
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Detalhes do Equipamento</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Visualize e gerencie as informações do equipamento
                  </p>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />}
              onClick={handleRefresh}
              disabled={refreshing}
              className="hover:shadow-md transition-all"
            >
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
          <EquipmentDetails 
            equipment={equipment}
            history={history}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo de Uso</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {equipment.acquisitionDate ? 
                    `${Math.floor((Date.now() - new Date(equipment.acquisitionDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} anos` 
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alterações Registradas</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{history.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Atualização</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {history.length > 0 
                    ? new Date(history[0].timestamp).toLocaleDateString('pt-BR')
                    : 'Sem alterações'
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailsPage;