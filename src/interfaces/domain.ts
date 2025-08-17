export interface Domain {
  id?: string;
  domain?: string;
  server?: string;
  clientid?: string | number;
  organization?: string;
  client_title?: string;
  hosting_type?: string; // "Yes" | "No"
  domain_type?: string; // "Yes" | "No"
  type?: string;
  ssldate?: string | boolean;
  quota?: string;
  used_quota?: string;
  domain_renew?: string;
  domain_expiry?: string;
  server_expiry?: string;
  status?: string;
  email_type?: string;
  email?: string | number;
  reg_date?: string;
  dns_a?: string;
  dns_b?: string;
  registrar?: string;
  ns_provider?: string;
  created_by?: string;
}
