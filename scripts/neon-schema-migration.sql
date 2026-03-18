-- ============================================================
-- Neon schema migration — add article_types, target_audience,
-- and demographic fields to posts
-- ============================================================

-- 1. ENUM TYPES
-- ============================================================
CREATE TYPE public.enum_target_audience_business_sizes AS ENUM ('solo', 'micro', 'small', 'medium', 'large');
CREATE TYPE public.enum_posts_target_business_size AS ENUM ('solo', 'micro', 'small', 'medium', 'large');
CREATE TYPE public.enum__posts_v_version_target_business_size AS ENUM ('solo', 'micro', 'small', 'medium', 'large');


-- 2. article_types TABLE
-- ============================================================
CREATE TABLE public.article_types (
    id integer NOT NULL,
    label character varying NOT NULL,
    description character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.article_types_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.article_types_id_seq OWNED BY public.article_types.id;
ALTER TABLE ONLY public.article_types ALTER COLUMN id SET DEFAULT nextval('public.article_types_id_seq'::regclass);
ALTER TABLE ONLY public.article_types ADD CONSTRAINT article_types_pkey PRIMARY KEY (id);
CREATE INDEX article_types_created_at_idx ON public.article_types USING btree (created_at);
CREATE INDEX article_types_updated_at_idx ON public.article_types USING btree (updated_at);


-- 3. target_audience TABLE
-- ============================================================
CREATE TABLE public.target_audience (
    id integer NOT NULL,
    industry character varying NOT NULL,
    notes character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.target_audience_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.target_audience_id_seq OWNED BY public.target_audience.id;
ALTER TABLE ONLY public.target_audience ALTER COLUMN id SET DEFAULT nextval('public.target_audience_id_seq'::regclass);
ALTER TABLE ONLY public.target_audience ADD CONSTRAINT target_audience_pkey PRIMARY KEY (id);
CREATE INDEX target_audience_created_at_idx ON public.target_audience USING btree (created_at);
CREATE INDEX target_audience_updated_at_idx ON public.target_audience USING btree (updated_at);


-- 4. target_audience_business_sizes TABLE
-- ============================================================
CREATE TABLE public.target_audience_business_sizes (
    "order" integer NOT NULL,
    parent_id integer NOT NULL,
    value public.enum_target_audience_business_sizes,
    id integer NOT NULL
);
CREATE SEQUENCE public.target_audience_business_sizes_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.target_audience_business_sizes_id_seq OWNED BY public.target_audience_business_sizes.id;
ALTER TABLE ONLY public.target_audience_business_sizes ALTER COLUMN id SET DEFAULT nextval('public.target_audience_business_sizes_id_seq'::regclass);
ALTER TABLE ONLY public.target_audience_business_sizes ADD CONSTRAINT target_audience_business_sizes_pkey PRIMARY KEY (id);
CREATE INDEX target_audience_business_sizes_order_idx ON public.target_audience_business_sizes USING btree ("order");
CREATE INDEX target_audience_business_sizes_parent_idx ON public.target_audience_business_sizes USING btree (parent_id);
ALTER TABLE ONLY public.target_audience_business_sizes ADD CONSTRAINT target_audience_business_sizes_parent_fk FOREIGN KEY (parent_id) REFERENCES public.target_audience(id) ON DELETE CASCADE;


-- 5. target_audience_keywords TABLE
-- ============================================================
CREATE TABLE public.target_audience_keywords (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    keyword character varying NOT NULL
);
ALTER TABLE ONLY public.target_audience_keywords ADD CONSTRAINT target_audience_keywords_pkey PRIMARY KEY (id);
CREATE INDEX target_audience_keywords_order_idx ON public.target_audience_keywords USING btree (_order);
CREATE INDEX target_audience_keywords_parent_id_idx ON public.target_audience_keywords USING btree (_parent_id);
ALTER TABLE ONLY public.target_audience_keywords ADD CONSTRAINT target_audience_keywords_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.target_audience(id) ON DELETE CASCADE;


-- 6. target_audience_rels TABLE
-- ============================================================
CREATE TABLE public.target_audience_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    posts_id integer
);
CREATE SEQUENCE public.target_audience_rels_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.target_audience_rels_id_seq OWNED BY public.target_audience_rels.id;
ALTER TABLE ONLY public.target_audience_rels ALTER COLUMN id SET DEFAULT nextval('public.target_audience_rels_id_seq'::regclass);
ALTER TABLE ONLY public.target_audience_rels ADD CONSTRAINT target_audience_rels_pkey PRIMARY KEY (id);
CREATE INDEX target_audience_rels_order_idx ON public.target_audience_rels USING btree ("order");
CREATE INDEX target_audience_rels_parent_idx ON public.target_audience_rels USING btree (parent_id);
CREATE INDEX target_audience_rels_path_idx ON public.target_audience_rels USING btree (path);
CREATE INDEX target_audience_rels_posts_id_idx ON public.target_audience_rels USING btree (posts_id);
ALTER TABLE ONLY public.target_audience_rels ADD CONSTRAINT target_audience_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.target_audience(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.target_audience_rels ADD CONSTRAINT target_audience_rels_posts_fk FOREIGN KEY (posts_id) REFERENCES public.posts(id) ON DELETE CASCADE;


-- 7. NEW COLUMNS ON posts
-- ============================================================
ALTER TABLE public.posts ADD COLUMN primary_keyword character varying;
ALTER TABLE public.posts ADD COLUMN article_type_id integer;
CREATE INDEX posts_article_type_idx ON public.posts USING btree (article_type_id);
ALTER TABLE ONLY public.posts ADD CONSTRAINT posts_article_type_id_article_types_id_fk FOREIGN KEY (article_type_id) REFERENCES public.article_types(id) ON DELETE SET NULL;


-- 8. posts_target_business_size TABLE
-- ============================================================
CREATE TABLE public.posts_target_business_size (
    "order" integer NOT NULL,
    parent_id integer NOT NULL,
    value public.enum_posts_target_business_size,
    id integer NOT NULL
);
CREATE SEQUENCE public.posts_target_business_size_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.posts_target_business_size_id_seq OWNED BY public.posts_target_business_size.id;
ALTER TABLE ONLY public.posts_target_business_size ALTER COLUMN id SET DEFAULT nextval('public.posts_target_business_size_id_seq'::regclass);
ALTER TABLE ONLY public.posts_target_business_size ADD CONSTRAINT posts_target_business_size_pkey PRIMARY KEY (id);
CREATE INDEX posts_target_business_size_order_idx ON public.posts_target_business_size USING btree ("order");
CREATE INDEX posts_target_business_size_parent_idx ON public.posts_target_business_size USING btree (parent_id);
ALTER TABLE ONLY public.posts_target_business_size ADD CONSTRAINT posts_target_business_size_parent_fk FOREIGN KEY (parent_id) REFERENCES public.posts(id) ON DELETE CASCADE;


-- 9. NEW COLUMN ON posts_rels
-- ============================================================
ALTER TABLE public.posts_rels ADD COLUMN target_audience_id integer;
CREATE INDEX posts_rels_target_audience_id_idx ON public.posts_rels USING btree (target_audience_id);
ALTER TABLE ONLY public.posts_rels ADD CONSTRAINT posts_rels_target_audience_fk FOREIGN KEY (target_audience_id) REFERENCES public.target_audience(id) ON DELETE CASCADE;


-- 10. NEW COLUMNS ON _posts_v (versioning table)
-- ============================================================
ALTER TABLE public._posts_v ADD COLUMN version_primary_keyword character varying;
ALTER TABLE public._posts_v ADD COLUMN version_article_type_id integer;
CREATE INDEX _posts_v_version_version_article_type_idx ON public._posts_v USING btree (version_article_type_id);
ALTER TABLE ONLY public._posts_v ADD CONSTRAINT _posts_v_version_article_type_id_article_types_id_fk FOREIGN KEY (version_article_type_id) REFERENCES public.article_types(id) ON DELETE SET NULL;


-- 11. _posts_v_version_target_business_size TABLE
-- ============================================================
CREATE TABLE public._posts_v_version_target_business_size (
    "order" integer NOT NULL,
    parent_id integer NOT NULL,
    value public.enum__posts_v_version_target_business_size,
    id integer NOT NULL
);
CREATE SEQUENCE public._posts_v_version_target_business_size_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public._posts_v_version_target_business_size_id_seq OWNED BY public._posts_v_version_target_business_size.id;
ALTER TABLE ONLY public._posts_v_version_target_business_size ALTER COLUMN id SET DEFAULT nextval('public._posts_v_version_target_business_size_id_seq'::regclass);
ALTER TABLE ONLY public._posts_v_version_target_business_size ADD CONSTRAINT _posts_v_version_target_business_size_pkey PRIMARY KEY (id);
CREATE INDEX _posts_v_version_target_business_size_order_idx ON public._posts_v_version_target_business_size USING btree ("order");
CREATE INDEX _posts_v_version_target_business_size_parent_idx ON public._posts_v_version_target_business_size USING btree (parent_id);
ALTER TABLE ONLY public._posts_v_version_target_business_size ADD CONSTRAINT _posts_v_version_target_business_size_parent_fk FOREIGN KEY (parent_id) REFERENCES public._posts_v(id) ON DELETE CASCADE;


-- 12. NEW COLUMN ON _posts_v_rels
-- ============================================================
ALTER TABLE public._posts_v_rels ADD COLUMN target_audience_id integer;
CREATE INDEX _posts_v_rels_target_audience_id_idx ON public._posts_v_rels USING btree (target_audience_id);
ALTER TABLE ONLY public._posts_v_rels ADD CONSTRAINT _posts_v_rels_target_audience_fk FOREIGN KEY (target_audience_id) REFERENCES public.target_audience(id) ON DELETE CASCADE;


-- 13. NEW COLUMNS ON payload_locked_documents_rels
-- ============================================================
ALTER TABLE public.payload_locked_documents_rels ADD COLUMN target_audience_id integer;
ALTER TABLE public.payload_locked_documents_rels ADD COLUMN article_types_id integer;
CREATE INDEX payload_locked_documents_rels_target_audience_id_idx ON public.payload_locked_documents_rels USING btree (target_audience_id);
CREATE INDEX payload_locked_documents_rels_article_types_id_idx ON public.payload_locked_documents_rels USING btree (article_types_id);
ALTER TABLE ONLY public.payload_locked_documents_rels ADD CONSTRAINT payload_locked_documents_rels_target_audience_fk FOREIGN KEY (target_audience_id) REFERENCES public.target_audience(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payload_locked_documents_rels ADD CONSTRAINT payload_locked_documents_rels_article_types_fk FOREIGN KEY (article_types_id) REFERENCES public.article_types(id) ON DELETE CASCADE;
