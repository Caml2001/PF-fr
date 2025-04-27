import { useMutation } from '@tanstack/react-query';
import { applyForCredit } from '../lib/api/creditService';

export const useApplyCredit = () => {
  return useMutation({
    mutationFn: applyForCredit,
    // Add onSuccess, onError callbacks
  });
};

// Optional: Add a hook for checking credit status if needed
// import { useQuery } from '@tanstack/react-query';
// import { getCreditStatus } from '../lib/api/creditService';
// export const useCreditStatus = (applicationId: string) => {
//   return useQuery({ queryKey: ['creditStatus', applicationId], queryFn: () => getCreditStatus(applicationId) });
// };
