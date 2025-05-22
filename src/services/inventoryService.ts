import { Equipment, HistoryEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock storage using localStorage
const EQUIPMENT_KEY = 'inventory_equipment';
const HISTORY_KEY = 'inventory_history';

// Sample data for initial population
const sampleEquipment: Omit<Equipment, 'id'>[] = [
  {
    assetNumber: 'COMP-001',
    description: 'Notebook Dell XPS',
    brand: 'Dell',
    model: 'XPS 15',
    specs: 'Intel i7, 16GB RAM, 512GB SSD',
    status: 'ativo',
    location: 'Escritório Principal',
    responsible: 'Maria Silva',
    acquisitionDate: '2023-01-15',
    value: 8500
  },
  {
    assetNumber: 'COMP-002',
    description: 'Desktop HP',
    brand: 'HP',
    model: 'EliteDesk 800',
    specs: 'Intel i5, 8GB RAM, 256GB SSD',
    status: 'ativo',
    location: 'Escritório Principal',
    responsible: 'João Santos',
    acquisitionDate: '2022-11-05',
    value: 4200
  },
  {
    assetNumber: 'MON-001',
    description: 'Monitor LG Ultrawide',
    brand: 'LG',
    model: '34WL500',
    specs: '34 polegadas, 2560x1080',
    status: 'ativo',
    location: 'Sala de Reuniões',
    responsible: 'Departamento de TI',
    acquisitionDate: '2023-03-20',
    value: 2800
  },
  {
    assetNumber: 'PROJ-001',
    description: 'Projetor Epson',
    brand: 'Epson',
    model: 'PowerLite S41+',
    specs: '3300 lumens, SVGA',
    status: 'manutenção',
    location: 'Sala de Conferências',
    responsible: 'Departamento de TI',
    acquisitionDate: '2022-08-12',
    value: 3200
  },
  {
    assetNumber: 'PRINT-001',
    description: 'Impressora Multifuncional',
    brand: 'Brother',
    model: 'MFC-L3750CDW',
    specs: 'Laser colorida, Wi-Fi',
    status: 'ativo',
    location: 'Departamento Administrativo',
    responsible: 'Ana Oliveira',
    acquisitionDate: '2023-02-08',
    value: 2500
  }
];

// Helper functions for localStorage
const getStoredEquipment = (): Equipment[] => {
  const data = localStorage.getItem(EQUIPMENT_KEY);
  return data ? JSON.parse(data) : [];
};

const setStoredEquipment = (equipment: Equipment[]): void => {
  localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(equipment));
};

const getStoredHistory = (): HistoryEntry[] => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

const setStoredHistory = (history: HistoryEntry[]): void => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

// Add history entry
const addHistoryEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void => {
  const history = getStoredHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: uuidv4(),
    timestamp: new Date().toISOString()
  };
  
  setStoredHistory([newEntry, ...history]);
};

// Inventory service
const inventoryService = {
  // Get all equipment
  getAllEquipment: async (): Promise<Equipment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getStoredEquipment());
      }, 300); // Simulate network delay
    });
  },
  
  // Get equipment by ID
  getEquipmentById: async (id: string): Promise<Equipment | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const equipment = getStoredEquipment();
        const item = equipment.find(item => item.id === id) || null;
        resolve(item);
      }, 300);
    });
  },
  
  // Create new equipment
  createEquipment: async (data: Omit<Equipment, 'id'>, user: string): Promise<Equipment> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const equipment = getStoredEquipment();
        const newEquipment: Equipment = {
          ...data,
          id: uuidv4()
        };
        
        const updatedEquipment = [...equipment, newEquipment];
        setStoredEquipment(updatedEquipment);
        
        // Add history entry
        addHistoryEntry({
          equipmentId: newEquipment.id,
          user,
          changeType: 'criou'
        });
        
        resolve(newEquipment);
      }, 500);
    });
  },
  
  // Update equipment
  updateEquipment: async (id: string, data: Partial<Equipment>, user: string): Promise<Equipment> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const equipment = getStoredEquipment();
          const existingIndex = equipment.findIndex(item => item.id === id);
          
          if (existingIndex === -1) {
            reject(new Error('Equipamento não encontrado'));
            return;
          }
          
          const existingEquipment = equipment[existingIndex];
          const updatedEquipment = { ...existingEquipment, ...data };
          
          // Create history entries for each changed field
          Object.keys(data).forEach(key => {
            if (key === 'id') return; // Skip ID field
            
            const oldValue = existingEquipment[key as keyof Equipment];
            const newValue = data[key as keyof Equipment];
            
            if (oldValue !== newValue) {
              addHistoryEntry({
                equipmentId: id,
                user,
                changeType: 'editou',
                field: key,
                oldValue: String(oldValue),
                newValue: String(newValue)
              });
            }
          });
          
          // Update equipment array
          equipment[existingIndex] = updatedEquipment;
          setStoredEquipment(equipment);
          
          resolve(updatedEquipment);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },
  
  // Delete equipment
  deleteEquipment: async (id: string, user: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const equipment = getStoredEquipment();
          const existingIndex = equipment.findIndex(item => item.id === id);
          
          if (existingIndex === -1) {
            reject(new Error('Equipamento não encontrado'));
            return;
          }
          
          const deletedEquipment = equipment[existingIndex];
          
          // Add history entry for deletion
          addHistoryEntry({
            equipmentId: id,
            user,
            changeType: 'excluiu',
            oldValue: deletedEquipment.assetNumber
          });
          
          // Remove from equipment array
          const updatedEquipment = equipment.filter(item => item.id !== id);
          setStoredEquipment(updatedEquipment);
          
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },
  
  // Get recent activities
  getRecentActivities: async (limit: number = 10): Promise<HistoryEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const history = getStoredHistory();
        resolve(history.slice(0, limit));
      }, 300);
    });
  },
  
  // Get equipment history
  getEquipmentHistory: async (equipmentId: string): Promise<HistoryEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const history = getStoredHistory();
        const equipmentHistory = history.filter(entry => entry.equipmentId === equipmentId);
        resolve(equipmentHistory);
      }, 300);
    });
  },
  
  // Populate with sample data
  populateSampleData: async (user: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const equipment = getStoredEquipment();
        
        // Only populate if empty
        if (equipment.length === 0) {
          const newEquipment = sampleEquipment.map(item => ({
            ...item,
            id: uuidv4()
          }));
          
          setStoredEquipment(newEquipment);
          
          // Add history entries for each new equipment
          newEquipment.forEach(item => {
            addHistoryEntry({
              equipmentId: item.id,
              user,
              changeType: 'criou'
            });
          });
        }
        
        resolve();
      }, 500);
    });
  }
};

export default inventoryService;