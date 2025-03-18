export interface Collection {
  date: string;
  credits: number;
  weight: number;
}

export interface CreditsSummary {
  totalCredits: number;
  pendingCredits: number;
  lastCollection: Collection;
  nextRedemptionAvailable: boolean;
} 