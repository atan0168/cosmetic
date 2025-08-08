import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  date,
  decimal,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Companies table
export const companies = pgTable(
  "companies",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
  },
  (table) => [uniqueIndex("idx_companies_name").on(table.name)]
);

// Company metrics table - computed nightly from products → company history
export const companyMetrics = pgTable("company_metrics", {
  companyId: integer("company_id")
    .primaryKey()
    .references(() => companies.id),
  totalNotifs: integer("total_notifs").notNull(),
  firstNotifiedDate: date("first_notified_date").notNull(),
  cancelledCount: integer("cancelled_count").notNull(),
  reputationScore: decimal("reputation_score", {
    precision: 3,
    scale: 2,
  }).notNull(), // 0-1 composite brand score
});

// Category metrics table - computed nightly from products → category history
export const categoryMetrics = pgTable("category_metrics", {
  productCategory: varchar("product_category", { length: 255 }).primaryKey(),
  totalNotifs: integer("total_notifs").notNull(),
  cancelledCount: integer("cancelled_count").notNull(),
  riskScore: decimal("risk_score", { precision: 3, scale: 2 }).notNull(), // cancelled_count/total_notifs, 0-1
});

// Products table
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    notifNo: varchar("notif_no", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 255 }).notNull(),
    applicantCompanyId: integer("applicant_company_id")
      .references(() => companies.id)
      .notNull(),
    manufacturerCompanyId: integer("manufacturer_company_id").references(
      () => companies.id
    ),
    dateNotified: date("date_notified").notNull(),
    status: varchar("status", { length: 50 }).notNull(), // 'Notified' or 'Cancelled'
    reasonForCancellation: text("reason_for_cancellation"), // populated when status='Cancelled'
    isVerticallyIntegrated: boolean("is_vertically_integrated")
      .notNull()
      .default(false), // applicant_company_id == manufacturer_company_id
    recencyScore: decimal("recency_score", {
      precision: 3,
      scale: 2,
    }).notNull(), // 0-1 normalized within this category
    searchVector: text("search_vector"), // PostgreSQL tsvector for full-text search
  },
  (table) => [
    uniqueIndex("idx_products_notif_no").on(table.notifNo),
    index("idx_products_category").on(table.category),
    index("idx_products_status").on(table.status),
  ]
);

// Recommended alternatives table
export const recommendedAlternatives = pgTable(
  "recommended_alternatives",
  {
    id: serial("id").primaryKey(),
    cancelledProductId: integer("cancelled_product_id")
      .references(() => products.id)
      .notNull(),
    recommendedProductId: integer("recommended_product_id")
      .references(() => products.id)
      .notNull(),
    brandScore: decimal("brand_score", { precision: 3, scale: 2 }).notNull(), // from company_metrics.reputation_score
    categoryRiskScore: decimal("category_risk_score", {
      precision: 3,
      scale: 2,
    }).notNull(), // from category_metrics.risk_score
    isVerticallyIntegrated: boolean("is_vertically_integrated").notNull(), // from products.is_vertically_integrated
    recencyScore: decimal("recency_score", {
      precision: 3,
      scale: 2,
    }).notNull(), // snapshot of products.recency_score
    relevanceScore: decimal("relevance_score", {
      precision: 5,
      scale: 4,
    }).notNull(), // composite: w1*brand + w2*recency – w3*risk + w4*vertical
  },
  (table) => [
    index("idx_reco_cancelled").on(table.cancelledProductId),
    index("idx_reco_recommended").on(table.recommendedProductId),
  ]
);

// Master list of all banned ingredients - metadata for each banned substance
export const bannedIngredients = pgTable(
  "banned_ingredients",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    alternativeNames: text("alternative_names"), // Comma-separated INCI/synonyms
    healthRiskDescription: text("health_risk_description").notNull(),
    regulatoryStatus: varchar("regulatory_status", { length: 100 }), // e.g. Prohibited, Restricted
    sourceUrl: varchar("source_url", { length: 500 }), // Link to MOH regulation or ref
  },
  (table) => [uniqueIndex("idx_banned_ingredients_name").on(table.name)]
);

// Link cancelled products to the banned ingredients they contained
export const cancelledProductIngredients = pgTable(
  "cancelled_product_ingredients",
  {
    cancelledProductId: integer("cancelled_product_id")
      .references(() => products.id)
      .notNull(),
    bannedIngredientId: integer("banned_ingredient_id")
      .references(() => bannedIngredients.id)
      .notNull(),
  },
  (table) => [
    index("idx_cpi_product").on(table.cancelledProductId),
    index("idx_cpi_ingredient").on(table.bannedIngredientId),
  ]
);

// Nightly metrics on each banned ingredient's appearance in cancelled set
export const bannedIngredientMetrics = pgTable("banned_ingredient_metrics", {
  ingredientId: integer("ingredient_id")
    .primaryKey()
    .references(() => bannedIngredients.id),
  occurrencesCount: integer("occurrences_count").notNull(), // How many cancelled notifications contained it
  firstAppearanceDate: date("first_appearance_date").notNull(),
  lastAppearanceDate: date("last_appearance_date").notNull(),
  riskScore: decimal("risk_score", { precision: 3, scale: 2 }).notNull(), // Normalized 0–1 by frequency or severity
});
