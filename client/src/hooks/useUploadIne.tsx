import { useMutation } from '@tanstack/react-query';
import { uploadIne, ProfileUploadResponse } from '../lib/api/profileService';

interface UploadIneVariables {
  ineFrontFile: File;
  ineBackFile: File;
}

export const useUploadIne = () => {
  return useMutation<
    ProfileUploadResponse, // Usar la interfaz definida para la respuesta exitosa
    Error, // Default error type
    UploadIneVariables // Type for the variables passed to the mutation function
  >({
    mutationFn: ({ ineFrontFile, ineBackFile }) => uploadIne(ineFrontFile, ineBackFile),
    // onSuccess y onError pueden ser manejados por el componente que usa el hook,
    // o se pueden agregar manejadores por defecto aquí si es necesario.
  });
};
