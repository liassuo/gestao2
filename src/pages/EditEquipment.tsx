import React, { useState, useEffect } from 'react';
import { Equipment } from '../types';
import Button from '../components/common/Button';
import { 
  ArrowLeft, 
  Save,
  Package,
  MapPin,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Info
} from 'lucide-react';
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
  const [hasChanges, setHasChanges] = useState(false);

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

  useEffect(() => {
    if (formData && originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    
    let parsedValue: string | number = value;
    if (name === 'value') {
      parsedValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    setFormData(prev => ({
      ...prev!,
      [name]: parsedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const numericValue = parseInt(rawValue, 10) / 100 || 0;
    
    setFormData(prev => ({
      ...prev!,
      value: numericValue
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const validate = (): boolean => {
    if (!formData) return false;
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.assetNumber.trim()) newErrors.assetNumber = 'Obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Obrigatório';
    if (!formData.brand.trim()) newErrors.brand = 'Obrigatório';
    if (!formData.model.trim()) newErrors.model = 'Obrigatório';
    if (!formData.location.trim()) newErrors.location = 'Obrigatório';
    if (!formData.responsible.trim()) newErrors.responsible = 'Obrigatório';
    if (formData.value <= 0) newErrors.value = 'Valor inválido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!formData) return;
    
    if (validate()) {
      const changedData: Partial<Equipment> = {};
      
      Object.keys(formData).forEach(key => {
        const typedKey = key as keyof Equipment;
        if (formData[typedKey] !== originalData?.[typedKey]) {
          changedData[typedKey] = formData[typedKey] as any;
        }
      });
      
      changedData.id = equipmentId;
      onSubmit(changedData);
    }
  };

  const handleCancel = () => {
    if (!hasChanges || confirm('Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.')) {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Equipamento não encontrado'}
          </h3>
          <p className="text-gray-500 mb-6">
            Não foi possível carregar os detalhes deste equipamento.
          </p>
          <Button onClick={onBack} icon={<ArrowLeft size={16} />} variant="outline">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Equipamento</h1>
            <p className="text-gray-600 mt-2">Atualize as informações do equipamento {formData.assetNumber}</p>
          </div>
          {hasChanges && (
            <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
              <Info className="h-4 w-4 mr-1" />
              Alterações não salvas
            </div>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-8">
        {/* Identificação */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Identificação</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Patrimônio
              </label>
              <input
                type="text"
                name="assetNumber"
                value={formData.assetNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.assetNumber ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.assetNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.assetNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="ativo">Ativo</option>
                <option value="manutenção">Em Manutenção</option>
                <option value="desativado">Desativado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description}</p>
              )}
            </div>
          </div>
        </section>

        {/* Localização e Responsável */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Localização e Responsável</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Localização
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-600">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Responsável
              </label>
              <input
                type="text"
                name="responsible"
                value={formData.responsible}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.responsible ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.responsible && (
                <p className="mt-1 text-xs text-red-600">{errors.responsible}</p>
              )}
            </div>
          </div>
        </section>

        {/* Informações Técnicas */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações Técnicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Marca
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.brand ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.brand && (
                <p className="mt-1 text-xs text-red-600">{errors.brand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.model ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.model && (
                <p className="mt-1 text-xs text-red-600">{errors.model}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificações
              </label>
              <textarea
                name="specs"
                value={formData.specs || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Processador, memória, armazenamento... (opcional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </section>

        {/* Informações Financeiras */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações Financeiras</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data de Aquisição
              </label>
              <input
                type="date"
                name="acquisitionDate"
                value={formData.acquisitionDate.split('T')[0]}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="text"
                  name="value"
                  value={formatCurrency(formData.value).replace('R$', '').trim()}
                  onChange={handleValueChange}
                  placeholder="0,00"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.value ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.value && (
                <p className="mt-1 text-xs text-red-600">{errors.value}</p>
              )}
            </div>
          </div>
        </section>

        {/* Success Preview */}
        {hasChanges && Object.keys(errors).length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Alterações detectadas</p>
              <p className="mt-1">Clique em "Salvar Alterações" para aplicar as mudanças.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 pb-8">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            icon={<Save className="h-4 w-4" />}
            disabled={!hasChanges}
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEquipment;