export const SEXOTYPES = ['Macho', 'Fêmea'] as const;
export type SexoType = typeof SEXOTYPES[number];

export const CORTYPES = [
    'Frajola',
    'Tigrado',
    'Laranja',
    'Escaminha',
    'Tricolor',
    'Preto Sólido',
    'Branco Sólido',
    'Cinza Sólido',
    'Sialata',
    'Branco com Tigrado',
    'Branco com Laranja'

] as const;
export type CorType = typeof CORTYPES[number];



export const FIVFELVTYPES = ['Negativo', 'FIV+', 'FeLV+', 'FIV+ FeLV+'] as const;
export type FivFeLVType = typeof FIVFELVTYPES[number];



export const PERSONALIDADETYPES = [
    'Afetuoso', 'Sociável', 'Tímido', 'Independente', 'Gato de Colo', 
  'Brincalhão', 'Ativo', 'Calmo', 'Explorador', 
  'Amigo de Gatos', 'Amigo de Cães', 'Paciente com Crianças', 'Gato Único',
  'Vocal', 'Silencioso', 'Destemido'
] as const;
export type PersonalidadeType = typeof PERSONALIDADETYPES[number];



export const STATUSTYPES = ['Disponível', 'Em Tratamento', 'Reservado', 'Adotado'] as const;
export type StatusType = typeof STATUSTYPES[number];