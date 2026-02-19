
export enum HairType {
  STRAIGHT = 'Liso',
  WAVY = 'Ondulado',
  CURLY = 'Cacheado',
  COILY = 'Crespo'
}

export enum ScalpType {
  DRY = 'Seco',
  OILY = 'Oleoso',
  NORMAL = 'Normal',
  SENSITIVE = 'Sensível'
}

export enum MainGoal {
  GROWTH = 'Crescimento',
  STRENGTH = 'Força/Queda',
  HYDRATION = 'Hidratação/Brilho',
  DEFINITION = 'Definição',
  DAMAGE_REPAIR = 'Reparação de Danos'
}

export interface HairDiagnosis {
  hairType: HairType;
  scalpType: ScalpType;
  porosity: 'Baixa' | 'Média' | 'Alta';
  hasChemicals: boolean;
  frequencyOfWash: string;
  budgetLevel: 'Baixo (Caseiro)' | 'Médio' | 'Premium';
  mainGoal: MainGoal;
}

export interface DayTask {
  day: number;
  title: string;
  category: 'Hidratação' | 'Nutrição' | 'Reconstrução' | 'Descanso' | 'Detox';
  description: string;
  recipe?: string;
  completed: boolean;
}

export interface HairPlan {
  id: string;
  createdAt: string;
  diagnosis: HairDiagnosis;
  tasks: DayTask[];
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}
