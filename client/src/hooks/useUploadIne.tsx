import { useMutation } from '@tanstack/react-query';
import { uploadIne } from '../lib/api/profileService';

interface UploadIneVariables {
  ineFrontFile: File;
  ineBackFile: File;
}

export const useUploadIne = () => {
  return useMutation<
    any, // Replace 'any' with the expected success response type
    Error, // Default error type
    UploadIneVariables // Type for the variables passed to the mutation function
  >({
    mutationFn: ({ ineFrontFile, ineBackFile }) => uploadIne(ineFrontFile, ineBackFile),
  });
};
