CREATE TABLE leads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  company_domain TEXT,
  audit_score INTEGER,
  estimated_liability NUMERIC,
  interest_level TEXT DEFAULT 'roadmap_request', -- tracking their intent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);