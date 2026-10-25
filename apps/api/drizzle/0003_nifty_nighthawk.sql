CREATE TABLE "llm_usage_monthly" (
	"month" text NOT NULL,
	"provider" text NOT NULL,
	"tokens_in" bigint DEFAULT 0 NOT NULL,
	"tokens_out" bigint DEFAULT 0 NOT NULL,
	"cost_eur" numeric(12, 6) DEFAULT 0 NOT NULL,
	CONSTRAINT "llm_usage_monthly_month_provider_pk" PRIMARY KEY("month","provider")
);
