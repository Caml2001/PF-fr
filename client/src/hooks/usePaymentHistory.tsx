import { useQuery } from '@tanstack/react-query';
import { getPaymentHistory } from '../lib/api/paymentService';

const PAYMENT_HISTORY_QUERY_KEY = ['paymentHistory'];

export const usePaymentHistory = () => {
  return useQuery({
    queryKey: PAYMENT_HISTORY_QUERY_KEY,
    queryFn: getPaymentHistory,
    // Add options as needed
  });
};

// Optional: Add a hook for making payments
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { makePayment } from '../lib/api/paymentService';
// export const useMakePayment = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: makePayment,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: PAYMENT_HISTORY_QUERY_KEY });
//     },
//   });
// };
