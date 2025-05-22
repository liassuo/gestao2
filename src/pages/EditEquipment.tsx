import React, { useState, useEffect } from 'react';
import { Equipment } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ArrowLeft, Save, X } from 'lucide-react';
import LoadingOverlay from '../components/common/LoadingOverlay';
import inventoryService from '../services/inventoryService';

interface EditEquipmentProps {
  equipmentId: string;
  onBack: () => void;
  onSubmit: (data: Partial<Equipment>) => void;
}

const EditEquipment: React.FC<EditEquipmentProps> = ({ 
  equipmentId, 
  onBack, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<Equipment | null>(null);
  const [originalData, setOriginalData] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getEquipmentById(equipmentId);
        if (!data) {
          throw new Error('Equipamento não encontrado');
        }
        setFormData(data);
        setOriginalData(data);
      } catch (err) {
        console.error('Error loading equipment:', err);
        setError((err as Error).message || 'Erro ao carregar equipamento');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [equipmentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    
    let parsedValue: string | number = value;
    if (name === 'value') {
      // Remove non-numeric characters and convert to number
      parsedValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    setFormData(prev => ({
      ...prev!,
      [name]: parsedValue
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    if (!formData) return false;
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.assetNumber.trim()) {
      newErrors.assetNumber = 'O número do patrimônio é obrigatório';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'A marca é obrigatória';
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'O modelo é obrigatório';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'A localização é obrigatória';
    }
    
    if (!formData.responsible.trim()) {
      newErrors.responsible = 'O responsável é obrigatório';
    }
    
    if (!formData.acquisitionDate) {
      newErrors.acquisitionDate = 'A data de aquisição é obrigatória';
    }
    
    if (formData.value <= 0) {
      newErrors.value = 'O valor deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData) return;
    
    if (validate()) {
      // Only send changed fields
      const changedData: Partial<Equipment> = {};
      
      Object.keys(formData).forEach(key => {
        const typedKey = key as keyof Equipment;
        if (formData[typedKey] !== originalData?.[typedKey]) {
          changedData[typedKey] = formData[typedKey];
        }
      });
      
      // Always include ID
      changedData.id = equipmentId;
      
      onSubmit(changedData);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const numericValue = parseInt(rawValue, 10) / 100 || 0;
    
    setFormData(prev => ({
      ...prev!,
      value: numericValue
    }));
    
    // Clear error when field is edited
    if (errors.value) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.value;
        return newErrors;
      });
    }
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    
    if (!hasChanges || confirm('Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.')) {
      onBack();
    }
  };

  if (loading) {
    return <div className="py-6 animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="h-64 bg-gray-200 rounded-lg"></div>
    </div>;
  }

  if (error || !formData) {
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
            Voltar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
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
        <h1 className="text-2xl font-bold text-gray-900">Editar Equipamento</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Informações Básicas</h3>
              
              <div>
                <label htmlFor="assetNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Patrimônio *
                </label>
                <input
                  type="text"
                  id="assetNumber"
                  name="assetNumber"
                  value={formData.assetNumber}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                    ${errors.assetNumber 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
                />
                {errors.assetNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.assetNumber}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                    ${errors.description 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="ativo">Ativo</option>
                  <option value="manutenção">Em Manutenção</option>
                  <option value="desativado">Desativado</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Localização *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                    ${errors.location 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="responsible" className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável *
                </label>
                <input
                  type="text"
                  id="responsible"
                  name="responsible"
                  value={formData.responsible}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                    ${errors.responsible 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
                />
                {errors.responsible && (
                  <p className="mt-1 text-sm text-red-600">{errors.responsible}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Detalhes Técnicos</h3>
              
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                    ${errors.brand 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
                />
                {errors.brand && (
                  <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                    ${errors.model 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600">{errors.model}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="specs" className="block text-sm font-medium text-gray-700 mb-1">
                  Especificações
                </label>
                <textarea
                  id="specs"
                  name="specs"
                  rows={3}
                  value={formData.specs || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Aquisição *
                </label>
                <input
                  type="date"
                  id="acquisitionDate"
                  name="acquisitionDate"
                  value={formData.acquisitionDate.split('T')[0]}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                    ${errors.acquisitionDate 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
                />
                {errors.acquisitionDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.acquisitionDate}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="text"
                    id="value"
                    name="value"
                    value={formatCurrency(formData.value).replace('R$', '').trim()}
                    onChange={handleValueChange}
                    className={`block w-full rounded-md pl-12 shadow-sm sm:text-sm 
                      ${errors.value 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
                    placeholder="0,00"
                  />
                </div>
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              icon={<X size={16} />}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={16} />}
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditEquipment;