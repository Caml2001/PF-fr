import { useState, useEffect } from 'react';
import { getCreditInfo, CreditInfo } from '@/lib/api/creditService';

// Clave para localStorage
const CREDIT_INFO_STORAGE_KEY = 'pf-credit-info';

// Valor vacío inicial
const emptyCredit: CreditInfo = {
  limit: 0,
  used: 0,
  available: 0,
  currency: 'MXN'
};

// Recuperar datos guardados en localStorage si existen
const getSavedCreditInfo = (): CreditInfo | null => {
  try {
    const savedData = localStorage.getItem(CREDIT_INFO_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error al recuperar datos de crédito guardados:', error);
  }
  return null;
};

export const useCreditInfo = () => {
  // Intentar recuperar datos guardados, o usar valores vacíos
  const savedData = getSavedCreditInfo();
  const [creditInfo, setCreditInfo] = useState<CreditInfo>(savedData || emptyCredit);
  
  // Si tenemos datos guardados, no necesitamos mostrar carga inicial
  const [isLoading, setIsLoading] = useState<boolean>(!savedData);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(!!savedData);

  // Guardar datos en localStorage
  const saveCreditInfo = (data: CreditInfo) => {
    try {
      localStorage.setItem(CREDIT_INFO_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error al guardar datos de crédito:', error);
    }
  };

  const fetchCreditInfo = async (showLoader = true) => {
    // Solo mostramos estado de carga si no hay datos guardados o si se solicita explícitamente
    if (showLoader && !savedData) {
      setIsLoading(true);
    }
    
    setError(null);
    
    try {
      const data = await getCreditInfo();
      setCreditInfo(data);
      
      // Guardar en localStorage para futuras sesiones
      saveCreditInfo(data);
      
      if (!isInitialized) {
        setIsInitialized(true);
      }
    } catch (err) {
      setError('Error al cargar información de crédito');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizaciones silenciosas en segundo plano
  const refreshSilently = async () => {
    try {
      const data = await getCreditInfo();
      setCreditInfo(data);
      
      // Actualizar localStorage
      saveCreditInfo(data);
    } catch (error) {
      console.error("Error en actualización silenciosa:", error);
    }
  };

  useEffect(() => {
    // Cargar datos frescos al iniciar, pero usar los guardados mientras tanto
    fetchCreditInfo(!savedData);
    
    // Actualizaciones silenciosas cada 5 minutos
    const interval = setInterval(() => {
      refreshSilently();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    creditInfo,
    isLoading,
    error,
    refetch: () => fetchCreditInfo(true), // Refrescar con loader si es necesario
    refreshSilently, // Refrescar sin loader
    isInitialized
  };
};

export default useCreditInfo; 