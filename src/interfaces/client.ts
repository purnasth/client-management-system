export interface Client {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  contact?: string;
  organization?: string;
  designation?: string;
  [key: string]: unknown;
}
