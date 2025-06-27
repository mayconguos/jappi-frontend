export interface DocumentType {
  value: string;
  label: string;
}

export const DOCUMENT_TYPES: DocumentType[] = [
  { value: '0', label: 'Otros' },
  { value: '1', label: 'DNI' },
  { value: '4', label: 'Carnet de extranjería' },
  { value: '6', label: 'RUC' },
  { value: '7', label: 'Pasaporte' },
  { value: 'A', label: 'Ced. Diplomática de identidad' },
];

// Constante para el tipo de documento por defecto
export const DEFAULT_DOCUMENT_TYPE = '1'; // DNI

// Función helper para obtener el label de un tipo de documento por su valor
export const getDocumentTypeLabel = (value: string): string => {
  const documentType = DOCUMENT_TYPES.find(type => type.value === value.toString());
  return documentType ? documentType.label : 'Desconocido';
};
