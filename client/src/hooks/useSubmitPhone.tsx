import { useMutation } from '@tanstack/react-query';
import { submitPhoneNumber } from '../lib/api/profileService';

export const useSubmitPhone = () => {
  return useMutation({ mutationFn: submitPhoneNumber });
};
