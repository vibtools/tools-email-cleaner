export interface CleanedEmail {
  original: string;
  email: string;
  status: 'valid' | 'corrected' | 'suspicious';
}

export interface Stats {
  total: number;
  duplicates: number;
  invalid: number;
  cleaned: number;
  corrected: number;
}
