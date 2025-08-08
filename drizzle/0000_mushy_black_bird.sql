CREATE TABLE "banned_ingredient_metrics" (
	"ingredient_id" integer PRIMARY KEY NOT NULL,
	"occurrences_count" integer NOT NULL,
	"first_appearance_date" date NOT NULL,
	"last_appearance_date" date NOT NULL,
	"risk_score" numeric(3, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banned_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"alternative_names" text,
	"health_risk_description" text NOT NULL,
	"regulatory_status" varchar(100),
	"source_url" varchar(500),
	CONSTRAINT "banned_ingredients_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "cancelled_product_ingredients" (
	"cancelled_product_id" integer NOT NULL,
	"banned_ingredient_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_metrics" (
	"product_category" varchar(255) PRIMARY KEY NOT NULL,
	"total_notifs" integer NOT NULL,
	"cancelled_count" integer NOT NULL,
	"risk_score" numeric(3, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "companies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "company_metrics" (
	"company_id" integer PRIMARY KEY NOT NULL,
	"total_notifs" integer NOT NULL,
	"first_notified_date" date NOT NULL,
	"cancelled_count" integer NOT NULL,
	"reputation_score" numeric(3, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"notif_no" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"applicant_company_id" integer NOT NULL,
	"manufacturer_company_id" integer,
	"date_notified" date NOT NULL,
	"status" varchar(50) NOT NULL,
	"reason_for_cancellation" text,
	"is_vertically_integrated" boolean DEFAULT false NOT NULL,
	"recency_score" numeric(3, 2) NOT NULL,
	CONSTRAINT "products_notif_no_unique" UNIQUE("notif_no")
);
--> statement-breakpoint
CREATE TABLE "recommended_alternatives" (
	"id" serial PRIMARY KEY NOT NULL,
	"cancelled_product_id" integer NOT NULL,
	"recommended_product_id" integer NOT NULL,
	"brand_score" numeric(3, 2) NOT NULL,
	"category_risk_score" numeric(3, 2) NOT NULL,
	"is_vertically_integrated" boolean NOT NULL,
	"recency_score" numeric(3, 2) NOT NULL,
	"relevance_score" numeric(5, 4) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "banned_ingredient_metrics" ADD CONSTRAINT "banned_ingredient_metrics_ingredient_id_banned_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."banned_ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancelled_product_ingredients" ADD CONSTRAINT "cancelled_product_ingredients_cancelled_product_id_products_id_fk" FOREIGN KEY ("cancelled_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancelled_product_ingredients" ADD CONSTRAINT "cancelled_product_ingredients_banned_ingredient_id_banned_ingredients_id_fk" FOREIGN KEY ("banned_ingredient_id") REFERENCES "public"."banned_ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_metrics" ADD CONSTRAINT "company_metrics_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_applicant_company_id_companies_id_fk" FOREIGN KEY ("applicant_company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_manufacturer_company_id_companies_id_fk" FOREIGN KEY ("manufacturer_company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommended_alternatives" ADD CONSTRAINT "recommended_alternatives_cancelled_product_id_products_id_fk" FOREIGN KEY ("cancelled_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommended_alternatives" ADD CONSTRAINT "recommended_alternatives_recommended_product_id_products_id_fk" FOREIGN KEY ("recommended_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_banned_ingredients_name" ON "banned_ingredients" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_cpi_product" ON "cancelled_product_ingredients" USING btree ("cancelled_product_id");--> statement-breakpoint
CREATE INDEX "idx_cpi_ingredient" ON "cancelled_product_ingredients" USING btree ("banned_ingredient_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_companies_name" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_products_notif_no" ON "products" USING btree ("notif_no");--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_products_status" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reco_cancelled" ON "recommended_alternatives" USING btree ("cancelled_product_id");--> statement-breakpoint
CREATE INDEX "idx_reco_recommended" ON "recommended_alternatives" USING btree ("recommended_product_id");