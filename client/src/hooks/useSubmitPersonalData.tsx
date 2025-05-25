import { useMutation } from '@tanstack/react-query';
import { submitPersonalData, type PersonalDataPayload, type PersonalDataResponse } from '../lib/api/onboardingService';

export const useSubmitPersonalData = () => {
  return useMutation<PersonalDataResponse, Error, PersonalDataPayload>({
    mutationFn: (data: PersonalDataPayload) => submitPersonalData(data),
    // Puedes añadir onSuccess, onError, onSettled aquí si necesitas
    // manejar efectos secundarios después de la mutación.
  });
}; 