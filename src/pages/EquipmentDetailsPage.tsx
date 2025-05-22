import React, { useState, useEffect } from 'react';
import { Equipment, HistoryEntry } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import EquipmentDetails from '../components/equipment/EquipmentDetails';
import { ArrowLeft } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEquipmentData = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    if (equipmentId) {
      loadEquipmentData();
    }
  }, [equipmentId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <Card>
        <div className="text-center py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Equipamento não encontrado'}
          </h3>
          <p className="text-gray-500 mb-4">
            Não foi possível carregar os detalhes deste equipamento.
          </p>
          <Button onClick={onBack} icon={<ArrowLeft size={16} />} variant="outline">
            Voltar para Lista
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={onBack}
          className="mr-4"
        >
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Detalhes do Equipamento</h1>
      </div>

      <EquipmentDetails 
        equipment={equipment}
        history={history}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default EquipmentDetailsPage;