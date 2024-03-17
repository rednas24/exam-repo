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