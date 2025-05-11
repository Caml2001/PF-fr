import { useState, useEffect } from 'react';
import { getCreditInfo, CreditInfo } from '@/lib/api/creditService';

export const useCreditInfo = () => {
  const [creditInfo, setCreditInfo] = useState<CreditInfo>({
    limit: 0,
    used: 0,
    available: 0,
    currency: 'MXN'
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCreditInfo();
      setCreditInfo(data);
    } catch (err) {
      setError('Error al cargar información de crédito');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditInfo();
  }, []);

  return {
    creditInfo,
    isLoading,
    error,
    refetch: fetchCreditInfo
  };
};

export default useCreditInfo; 