CREATE TABLE "answer_cache" (
	"lang" text NOT NULL,
	"question_hash" text NOT NULL,
	"answer" text NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "answer_cache_lang_question_hash_pk" PRIMARY KEY("lang","question_hash")
);
