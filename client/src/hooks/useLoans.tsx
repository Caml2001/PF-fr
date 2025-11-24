import { useState, useEffect, useRef } from 'react';
import { getLoans, getLoanById, Loan } from '@/lib/api/loanService';

// Clave para localStorage
const LOANS_STORAGE_KEY = 'pf-loans';

// Recuperar préstamos guardados en localStorage si existen
const getSavedLoans = (): Loan[] | null => {
  try {
    const savedData = localStorage.getItem(LOANS_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error al recuperar préstamos guardados:', error);
  }
  return null;
};

// Guardar préstamos en localStorage
const saveLoans = (loans: Loan[]) => {
  try {
    localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
  } catch (error) {
    console.error('Error al guardar préstamos:', error);
  }
};

export const useLoans = () => {
  // Intentar recuperar préstamos guardados, o usar array vacío
  const savedLoans = getSavedLoans();
  const [loans, setLoans] = useState<Loan[]>(savedLoans || []);
  const [isLoading, setIsLoading] = useState<boolean>(!savedLoans || savedLoans.length === 0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(!!savedLoans && savedLoans.length > 0);

  // Flag to track if we're currently loading data
  const [isCurrentlyFetching, setIsCurrentlyFetching] = useState(false);

  // Cargar todos los préstamos
  const fetchLoans = async (showLoader = !isInitialized) => {
    // Prevent multiple simultaneous fetches
    if (isCurrentlyFetching) {
      return;
    }

    // Si ya tenemos datos, usamos un estado de "refreshing" en lugar de "loading"
    // para evitar mostrar skeletons si ya tenemos contenido
    if (showLoader) {
      setIsLoading(true);
    } else if (isInitialized) {
      setIsRefreshing(true);
    }

    setError(null);
    setIsCurrentlyFetching(true);

    try {
      const loansData = await getLoans();
      setLoans(loansData);

      // Actualizar el préstamo seleccionado si es necesario
      if (selectedLoanId) {
        const updatedSelectedLoan = loansData.find(loan => loan.id === selectedLoanId);
        if (updatedSelectedLoan) {
          setSelectedLoan(updatedSelectedLoan);
        }
      }

      // Guardar en localStorage para futuras sesiones
      saveLoans(loansData);

      if (!isInitialized) {
        setIsInitialized(true);
      }
    } catch (err) {
      setError('Error al cargar préstamos');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsCurrentlyFetching(false);
    }
  };

  // Flag para evitar peticiones duplicadas de préstamos individuales
  const [fetchingLoanIds, setFetchingLoanIds] = useState<{[key: string]: boolean}>({});

  // Cargar un préstamo específico por ID
  const fetchLoanById = async (id: string, showLoader = true) => {
    // Prevenir peticiones duplicadas para el mismo ID
    if (fetchingLoanIds[id]) {
      return;
    }

    // Solo mostramos loader si se solicita explícitamente
    if (showLoader) {
      setIsLoading(true);
    }

    setError(null);
    setFetchingLoanIds(prev => ({...prev, [id]: true}));

    try {
      const loanData = await getLoanById(id);
      if (loanData) {
        setSelectedLoan(loanData);

        // Actualizar este préstamo en el array de préstamos
        setLoans(prevLoans => {
          const updatedLoans = [...prevLoans];
          const index = updatedLoans.findIndex(loan => loan.id === id);
          if (index !== -1) {
            updatedLoans[index] = loanData;
          } else {
            // Si no existe, lo añadimos
            updatedLoans.push(loanData);
          }

          // Guardar en localStorage
          saveLoans(updatedLoans);

          return updatedLoans;
        });
      } else {
        setError('Préstamo no encontrado');
      }
    } catch (err) {
      setError('Error al cargar detalles del préstamo');
      console.error(err);
    } finally {
      setIsLoading(false);
      setFetchingLoanIds(prev => ({...prev, [id]: false}));
    }
  };

  // Seleccionar un préstamo (o por ID o por objeto completo)
  const selectLoan = (loanOrId: Loan | string, forceRefetch = false) => {
    const id = typeof loanOrId === 'string' ? loanOrId : loanOrId.id;
    const loan = typeof loanOrId === 'string' ? loans.find(l => l.id === loanOrId) : loanOrId;

    // Verificar si ya estamos gestionando este préstamo
    if (id === selectedLoanId && selectedLoan && selectedLoan.id === id && !forceRefetch) {
      return; // Evitar actualización innecesaria del estado
    }

    // Actualizar estado
    setSelectedLoanId(id);
    setSelectedLoan(loan || null);

    // Siempre cargar los detalles completos del préstamo desde el servidor
    // para asegurar que tenemos la información más actualizada
    if (!fetchingLoanIds[id]) {
      fetchLoanById(id, false); // No mostramos loader si ya tenemos datos básicos
    }
  };

  // Limpiar la selección
  const clearSelection = () => {
    setSelectedLoanId(null);
    setSelectedLoan(null);
  };

  // Carga inicial de préstamos
  useEffect(() => {
    fetchLoans();
    
    // Actualizaciones en segundo plano cada 5 minutos
    const interval = setInterval(() => {
      if (isInitialized) {
        fetchLoans(false); // Actualizar sin mostrar loader
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Usamos useRef para hacer seguimiento del ID seleccionado actual y evitar peticiones duplicadas
  const currentLoanIdRef = useRef<string | null>(null);

  // Cuando cambia el ID seleccionado, asegurar que el préstamo esté en el estado
  useEffect(() => {
    // Prevenir peticiones duplicadas para el mismo ID
    if (selectedLoanId === currentLoanIdRef.current) {
      return;
    }

    currentLoanIdRef.current = selectedLoanId;

    if (selectedLoanId && (!selectedLoan || selectedLoan.id !== selectedLoanId)) {
      const loan = loans.find(l => l.id === selectedLoanId);
      if (loan) {
        setSelectedLoan(loan);
      }
      // La carga de detalles se maneja ahora en selectLoan()
    }
  }, [selectedLoanId]);

  return {
    loans,
    isLoading,
    isRefreshing,
    error,
    selectedLoan,
    selectLoan,
    clearSelection,
    refreshLoans: fetchLoans,
    isInitialized
  };
};

export default useLoans; 