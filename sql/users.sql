-- Table: public.Users

-- DROP TABLE IF EXISTS public."Users";

CREATE TABLE IF NOT EXISTS public."Users"
(
    userid integer NOT NULL DEFAULT nextval('"Users_userid_seq"'::regclass),
    username character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    registrationdate timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    about text COLLATE pg_catalog."default",
    CONSTRAINT "Users_pkey" PRIMARY KEY (userid),
    CONSTRAINT "Users_email_key" UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Users"
    OWNER to postgres;

    

-- Table: public.articles

-- DROP TABLE IF EXISTS public.articles;

CREATE TABLE IF NOT EXISTS public.articles
(
    articleid integer NOT NULL DEFAULT nextval('articles_articleid_seq'::regclass),
    userid integer,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    postdate timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT articles_pkey PRIMARY KEY (articleid),
    CONSTRAINT articles_userid_fkey FOREIGN KEY (userid)
        REFERENCES public."Users" (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.articles
    OWNER to postgres;


-- Table: public.comments

-- DROP TABLE IF EXISTS public.comments;

CREATE TABLE IF NOT EXISTS public.comments
(
    commentid integer NOT NULL DEFAULT nextval('comments_commentid_seq'::regclass),
    articleid integer,
    userid integer,
    content text COLLATE pg_catalog."default" NOT NULL,
    postdate timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comments_pkey PRIMARY KEY (commentid),
    CONSTRAINT comments_articleid_fkey FOREIGN KEY (articleid)
        REFERENCES public.articles (articleid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT comments_userid_fkey FOREIGN KEY (userid)
        REFERENCES public."Users" (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.comments
    OWNER to postgres;