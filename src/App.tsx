import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetailsPage from './pages/EquipmentDetailsPage';
import AddEquipment from './pages/AddEquipment';
import EditEquipment from './pages/EditEquipment';
import Reports from './pages/Reports';
import LoadingOverlay from './components/common/LoadingOverlay';
import Toast from './components/common/Toast';
import DeleteConfirmationModal from './components/common/DeleteConfirmationModal';
import { Equipment, HistoryEntry, ToastType } from './types';
import inventoryService from './services/inventoryService';
import { v4 as uuidv4 } from 'uuid';

function App() {
  // Estado para controle de rotas
  const [route, setRoute] = useState('dashboard');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  
  // Estado para dados da aplicação
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // Estado para UI
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Dados do usuário atual (em uma aplicação real, viria de autenticação)
  const currentUser = 'Administrador';

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Carregar equipamentos
        const equipmentData = await inventoryService.getAllEquipment();
        setEquipment(equipmentData);
        
        // Carregar atividades recentes
        const recentActivities = await inventoryService.getRecentActivities(10);
        setHistory(recentActivities);
        
        // Para desenvolvimento: popular com dados de amostra se estiver vazio
        if (equipmentData.length === 0) {
          await inventoryService.populateSampleData(currentUser);
          // Recarregar após população
          const refreshedEquipment = await inventoryService.getAllEquipment();
          const refreshedActivities = await inventoryService.getRecentActivities(10);
          setEquipment(refreshedEquipment);
          setHistory(refreshedActivities);
          
          showToastMessage('Dados de exemplo carregados com sucesso', 'info');
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        showToastMessage(`Erro ao carregar dados: ${(error as Error).message}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Função para mostrar toast
  const showToastMessage = (message: string, type: ToastType = 'info') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  // Funções para navegação entre rotas
  const handleViewDetails = (id: string) => {
    setSelectedEquipmentId(id);
    setRoute('equipment-details');
  };

  const handleEditEquipment = (id: string) => {
    setSelectedEquipmentId(id);
    setRoute('edit-equipment');
  };

  // Função para iniciar o processo de exclusão (mostrar modal)
  const handleStartDelete = (id: string) => {
    setEquipmentToDelete(id);
    setShowDeleteModal(true);
  };

  // Função para confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!equipmentToDelete) return;
    
    setLoading(true);
    
    try {
      // Excluir equipamento
      await inventoryService.deleteEquipment(equipmentToDelete, currentUser);
      
      // Atualizar lista de equipamentos
      const updatedEquipment = await inventoryService.getAllEquipment();
      setEquipment(updatedEquipment);
      
      // Atualizar histórico
      const updatedHistory = await inventoryService.getRecentActivities(10);
      setHistory(updatedHistory);
      
      showToastMessage('Equipamento excluído com sucesso', 'success');
      
      // Fechar modal e redirecionar
      setShowDeleteModal(false);
      setEquipmentToDelete(null);
      setRoute('equipment');
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error);
      showToastMessage(`Erro ao excluir equipamento: ${(error as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para cancelar exclusão
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEquipmentToDelete(null);
  };

  // Função para adicionar novo equipamento
  const handleAddEquipment = async (data: Omit<Equipment, 'id'>) => {
    setLoading(true);
    
    try {
      // Adicionar equipamento
      await inventoryService.createEquipment(data, currentUser);
      
      // Atualizar lista de equipamentos
      const updatedEquipment = await inventoryService.getAllEquipment();
      setEquipment(updatedEquipment);
      
      // Atualizar histórico
      const updatedHistory = await inventoryService.getRecentActivities(10);
      setHistory(updatedHistory);
      
      showToastMessage('Equipamento adicionado com sucesso', 'success');
      
      // Redirecionar
      setRoute('equipment');
    } catch (error) {
      console.error('Erro ao adicionar equipamento:', error);
      showToastMessage(`Erro ao adicionar equipamento: ${(error as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar equipamento existente
  const handleUpdateEquipment = async (id: string, data: Partial<Equipment>) => {
    setLoading(true);
    
    try {
      // Atualizar equipamento
      await inventoryService.updateEquipment(id, data, currentUser);
      
      // Atualizar lista de equipamentos
      const updatedEquipment = await inventoryService.getAllEquipment();
      setEquipment(updatedEquipment);
      
      // Atualizar histórico
      const updatedHistory = await inventoryService.getRecentActivities(10);
      setHistory(updatedHistory);
      
      showToastMessage('Equipamento atualizado com sucesso', 'success');
      
      // Redirecionar
      setSelectedEquipmentId(id);
      setRoute('equipment-details');
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      showToastMessage(`Erro ao atualizar equipamento: ${(error as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Carregar histórico específico ao visualizar detalhes
  useEffect(() => {
    const loadEquipmentHistory = async () => {
      if (route === 'equipment-details' && selectedEquipmentId) {
        try {
          setLoading(true);
          const equipmentHistory = await inventoryService.getEquipmentHistory(selectedEquipmentId);
          setHistory(equipmentHistory);
        } catch (error) {
          console.error('Erro ao carregar histórico do equipamento:', error);
          showToastMessage(`Erro ao carregar histórico: ${(error as Error).message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadEquipmentHistory();
  }, [route, selectedEquipmentId]);

  // Renderização de rotas
  const renderCurrentRoute = () => {
    switch (route) {
      case 'dashboard':
        return <Dashboard equipment={equipment} historyEntries={history} />;
      
      case 'equipment':
        return (
          <EquipmentList 
            equipment={equipment}
            onViewDetails={handleViewDetails} 
            onAddNew={() => setRoute('add-equipment')} 
          />
        );
      
      case 'equipment-details':
        return (
          <EquipmentDetailsPage 
            equipmentId={selectedEquipmentId || ''}
            onBack={() => setRoute('equipment')}
            onEdit={handleEditEquipment}
            onDelete={handleStartDelete}
          />
        );
      
      case 'add-equipment':
        return (
          <AddEquipment 
            onBack={() => setRoute('equipment')}
            onSubmit={handleAddEquipment}
          />
        );
      
      case 'edit-equipment':
        return (
          <EditEquipment 
            equipmentId={selectedEquipmentId || ''}
            onBack={() => {
              setSelectedEquipmentId(selectedEquipmentId);
              setRoute('equipment-details');
            }}
            onSubmit={(data) => handleUpdateEquipment(selectedEquipmentId!, data)}
          />
        );
      
      case 'reports':
        return <Reports equipment={equipment} />;
      
      default:
        return <Dashboard equipment={equipment} historyEntries={history} />;
    }
  };

  return (
    <>
      <Layout activeRoute={route} onNavigate={setRoute}>
        {renderCurrentRoute()}
      </Layout>
      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita."
        itemName={equipment.find(item => item.id === equipmentToDelete)?.assetNumber || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      
      {loading && <LoadingOverlay />}
      
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))} 
        />
      )}
    </>
  );
}

export default App;