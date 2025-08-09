// Types for raw SQL result rows used by the DB layer (e.g., full-text search)

export interface ProductFullTextRow {
  id: number;
  notif_no: string;
  name: string;
  category: string;
  status: string;
  reason_for_cancellation: string | null;
  applicant_company_id: number | null;
  applicant_company_name: string | null;
  manufacturer_company_id: number | null;
  manufacturer_company_name: string | null;
}

export interface CountRow {
  total: string | number;
}
