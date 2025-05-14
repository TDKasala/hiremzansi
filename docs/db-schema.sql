-- ATSBoost Database Schema
-- Generated on 2025-05-14T06:59:49.565Z

-- Table: deep_analysis_reports
CREATE TABLE IF NOT EXISTS deep_analysis_reports (
  id integer NOT NULL DEFAULT nextval('deep_analysis_reports_id_seq'::regclass),
  cv_id integer NOT NULL,
  user_id integer NOT NULL,
  report_url text,
  status text NOT NULL DEFAULT 'pending'::text,
  detailed_analysis json,
  industry_comparison json,
  regional_recommendations json,
  paid_amount integer,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Foreign Key: deep_analysis_reports_cv_id_cvs_id_fk
ALTER TABLE deep_analysis_reports ADD CONSTRAINT deep_analysis_reports_cv_id_cvs_id_fk FOREIGN KEY (cv_id) REFERENCES cvs(id);

-- Foreign Key: deep_analysis_reports_user_id_users_id_fk
ALTER TABLE deep_analysis_reports ADD CONSTRAINT deep_analysis_reports_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id);

-- Index: idx_deep_analysis_reports_cv_id
CREATE INDEX idx_deep_analysis_reports_cv_id ON public.deep_analysis_reports USING btree (cv_id);

-- Table: cvs
CREATE TABLE IF NOT EXISTS cvs (
  id integer NOT NULL DEFAULT nextval('cvs_id_seq'::regclass),
  user_id integer NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  content text NOT NULL,
  title text DEFAULT 'My CV'::text,
  description text,
  is_default boolean DEFAULT false,
  target_position text,
  target_industry text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  job_description text,
  PRIMARY KEY (id)
);

-- Foreign Key: cvs_user_id_users_id_fk
ALTER TABLE cvs ADD CONSTRAINT cvs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id);

-- Index: idx_cvs_user_id
CREATE INDEX idx_cvs_user_id ON public.cvs USING btree (user_id);

-- Table: ats_scores
CREATE TABLE IF NOT EXISTS ats_scores (
  id integer NOT NULL DEFAULT nextval('ats_scores_id_seq'::regclass),
  cv_id integer NOT NULL,
  score integer NOT NULL,
  skills_score integer NOT NULL,
  context_score integer NOT NULL,
  format_score integer NOT NULL,
  strengths ARRAY,
  improvements ARRAY,
  issues ARRAY,
  sa_keywords_found ARRAY,
  sa_context_score integer,
  bbbee_detected boolean DEFAULT false,
  nqf_detected boolean DEFAULT false,
  keyword_recommendations json,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Foreign Key: ats_scores_cv_id_cvs_id_fk
ALTER TABLE ats_scores ADD CONSTRAINT ats_scores_cv_id_cvs_id_fk FOREIGN KEY (cv_id) REFERENCES cvs(id);

-- Index: idx_ats_scores_cv_id
CREATE INDEX idx_ats_scores_cv_id ON public.ats_scores USING btree (cv_id);

-- Table: sa_profiles
CREATE TABLE IF NOT EXISTS sa_profiles (
  id integer NOT NULL DEFAULT nextval('sa_profiles_id_seq'::regclass),
  user_id integer NOT NULL,
  province text,
  city text,
  bbbee_status text,
  bbbee_level integer,
  nqf_level integer,
  preferred_languages ARRAY,
  industries ARRAY,
  job_types ARRAY,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  whatsapp_enabled boolean DEFAULT false,
  whatsapp_number text,
  whatsapp_verified boolean DEFAULT false,
  PRIMARY KEY (id)
);

-- Foreign Key: sa_profiles_user_id_users_id_fk
ALTER TABLE sa_profiles ADD CONSTRAINT sa_profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id);

-- Index: sa_profiles_user_id_unique
CREATE UNIQUE INDEX sa_profiles_user_id_unique ON public.sa_profiles USING btree (user_id);

-- Index: idx_sa_profiles_user_id
CREATE INDEX idx_sa_profiles_user_id ON public.sa_profiles USING btree (user_id);

-- Table: subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id integer NOT NULL DEFAULT nextval('subscriptions_id_seq'::regclass),
  user_id integer NOT NULL,
  plan_id integer NOT NULL,
  status character varying NOT NULL DEFAULT 'active'::character varying,
  current_period_start timestamp without time zone NOT NULL,
  current_period_end timestamp without time zone NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  payment_method text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  scans_used integer DEFAULT 0,
  last_scan_reset timestamp without time zone,
  PRIMARY KEY (id)
);

-- Foreign Key: subscriptions_user_id_users_id_fk
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id);

-- Foreign Key: subscriptions_plan_id_plans_id_fk
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_id_plans_id_fk FOREIGN KEY (plan_id) REFERENCES plans(id);

-- Index: idx_subscriptions_user_id
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);

-- Table: plans
CREATE TABLE IF NOT EXISTS plans (
  id integer NOT NULL DEFAULT nextval('plans_id_seq'::regclass),
  name character varying NOT NULL,
  description text,
  price integer NOT NULL,
  interval character varying NOT NULL DEFAULT 'month'::character varying,
  features ARRAY,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  is_popular boolean DEFAULT false,
  scan_limit integer DEFAULT 0,
  PRIMARY KEY (id)
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  username text NOT NULL,
  password text NOT NULL,
  email text NOT NULL,
  name text,
  profile_picture text,
  role text NOT NULL DEFAULT 'user'::text,
  is_active boolean NOT NULL DEFAULT true,
  last_login timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  reset_token text,
  reset_token_expiry timestamp without time zone,
  PRIMARY KEY (id)
);

-- Index: users_username_unique
CREATE UNIQUE INDEX users_username_unique ON public.users USING btree (username);

-- Index: users_email_unique
CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);

-- Index: idx_users_email
CREATE INDEX idx_users_email ON public.users USING btree (email);

-- Index: idx_users_reset_token
CREATE INDEX idx_users_reset_token ON public.users USING btree (reset_token) WHERE (reset_token IS NOT NULL);

-- Table: schema_migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
  id integer NOT NULL DEFAULT nextval('schema_migrations_id_seq'::regclass),
  version character varying NOT NULL,
  applied_at timestamp without time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Index: schema_migrations_version_key
CREATE UNIQUE INDEX schema_migrations_version_key ON public.schema_migrations USING btree (version);

