import React from 'react';
import { Equipment, HistoryEntry } from '../types';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { Laptop, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';

interface DashboardProps {
  equipment: Equipment[];
  historyEntries: HistoryEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ equipment, historyEntries }) => {
  // Statistics calculations
  const totalEquipment = equipment.length;
  const activeEquipment = equipment.filter(item => item.status === 'ativo').length;
  const maintenanceEquipment = equipment.filter(item => item.status === 'manutenção').length;
  const inactiveEquipment = equipment.filter(item => item.status === 'desativado').length;
  const totalValue = equipment.reduce((sum, item) => sum + item.value, 0);
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel de Controle</h1>
        <p className="mt-1 text-sm text-gray-500">Visão geral do seu inventário de equipamentos</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
              <Laptop size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total de Equipamentos</p>
              <p className="text-2xl font-semibold text-blue-900">{totalEquipment}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white mr-4">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Equipamentos Ativos</p>
              <p className="text-2xl font-semibold text-green-900">{activeEquipment}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 text-white mr-4">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-600">Em Manutenção</p>
              <p className="text-2xl font-semibold text-yellow-900">{maintenanceEquipment}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 text-white mr-4">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600">Valor Total</p>
              <p className="text-2xl font-semibold text-purple-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <Card title="Atividades Recentes">
            <div className="space-y-6">
              {historyEntries.length > 0 ? (
                historyEntries.map((entry) => {
                  const equipmentItem = equipment.find(e => e.id === entry.equipmentId);
                  return (
                    <div key={entry.id} className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Clock size={16} className="text-gray-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entry.user} {entry.changeType} {equipmentItem?.assetNumber || 'um equipamento'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(entry.timestamp)}
                        </p>
                        {entry.field && entry.oldValue && entry.newValue && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">{entry.field}:</span> {entry.oldValue} → {entry.newValue}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma atividade recente.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Status summary */}
        <div>
          <Card title="Status dos Equipamentos">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Badge variante="ativo" className="mr-2">Ativo</Badge>
                    <span className="text-sm text-gray-700">{activeEquipment} equipamentos</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {totalEquipment > 0 ? Math.round((activeEquipment / totalEquipment) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${totalEquipment > 0 ? (activeEquipment / totalEquipment) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Badge variante="manutenção" className="mr-2">Manutenção</Badge>
                    <span className="text-sm text-gray-700">{maintenanceEquipment} equipamentos</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {totalEquipment > 0 ? Math.round((maintenanceEquipment / totalEquipment) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${totalEquipment > 0 ? (maintenanceEquipment / totalEquipment) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Badge variante="desativado" className="mr-2">Desativado</Badge>
                    <span className="text-sm text-gray-700">{inactiveEquipment} equipamentos</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {totalEquipment > 0 ? Math.round((inactiveEquipment / totalEquipment) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${totalEquipment > 0 ? (inactiveEquipment / totalEquipment) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card title="Próximos Vencimentos" className="mt-6">
            <p className="text-gray-500 text-sm py-4 text-center">
              Nenhum vencimento programado nos próximos 30 dias.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;