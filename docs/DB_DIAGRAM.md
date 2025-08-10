```
//// --------------------------------------------------------------------------
//// DBML for Cosmetics Safety App
//// --------------------------------------------------------------------------

Table companies {
  id   int     [pk, increment]
  name varchar [not null, unique]

  Indexes {
    name [unique, name: "idx_companies_name"]
  }
}

Table company_metrics {
  company_id          int     [pk, ref: > companies.id]
  total_notifs        int     [not null, note: "COUNT of all notifications"]
  first_notified_date date    [not null, note: "earliest date_notified"]
  cancelled_count     int     [not null, note: "COUNT of status='Cancelled'"]
  reputation_score    decimal [not null, note: "0–1 composite brand score"]

  Note: "Computed nightly from products → company history"
}

Table category_metrics {
  product_category varchar [pk, note: "matches products.category"]
  total_notifs     int     [not null]
  cancelled_count  int     [not null]
  risk_score       decimal [not null, note: "cancelled_count/total_notifs, 0–1"]

  Note: "Computed nightly from products → category history"
}

Table products {
  id                      int       [pk, increment]
  notif_no                varchar   [not null, unique]
  name                    varchar   [not null]
  category                varchar   [not null]
  applicant_company_id    int       [ref: > companies.id]
  manufacturer_company_id int       [ref: > companies.id, null]
  date_notified           date      [not null]
  status                  varchar   [not null, note: "'Approved' or 'Cancelled'"]
  reason_for_cancellation text      [null, note: "populated when status='Cancelled'"]

  is_vertically_integrated boolean  [not null, default: false, note: "applicant_company_id == manufacturer_company_id"]
  recency_score           decimal  [not null, note: "0–1 normalized within this category"]

  Indexes {
    (notif_no)  [unique, name: "idx_products_notif_no"]
    (category)  [name: "idx_products_category"]
    (status)    [name: "idx_products_status"]
  }
}

Table recommended_alternatives {
  id                      int      [pk, increment]
  cancelled_product_id    int      [ref: > products.id, not null]
  recommended_product_id  int      [ref: > products.id, not null]

  brand_score             decimal  [not null, note: "from company_metrics.reputation_score"]
  category_risk_score     decimal  [not null, note: "from category_metrics.risk_score"]
  is_vertically_integrated boolean [not null, note: "from products.is_vertically_integrated"]
  recency_score           decimal  [not null, note: "snapshot of products.recency_score"]
  relevance_score         decimal  [not null, note: "composite: w1*brand + w2*manuf + w3*recency – w4*risk + w5*vertical"]

  Indexes {
    (cancelled_product_id)    [name: "idx_reco_cancelled"]
    (recommended_product_id)  [name: "idx_reco_recommended"]
  }
}

// Master list of all banned ingredients you care about
Table banned_ingredients {
  id                        int       [pk, increment]
  name                      varchar   [not null, unique]
  alternative_names         text      [note: "Comma-separated INCI/synonyms"]
  health_risk_description   text      [not null]
  regulatory_status         varchar   [note: "e.g. Prohibited, Restricted"]
  source_url                varchar   [note: "Link to MOH regulation or ref"]

  Indexes {
    name [unique, name: "idx_banned_ingredients_name"]
  }

  Note: "Master metadata for each banned substance"
}

// Only link cancelled products to the banned ingredients they contained
Table cancelled_product_ingredients {
  cancelled_product_id   int  [ref: > products.id]
  banned_ingredient_id   int  [ref: > banned_ingredients.id]

  Indexes {
    (cancelled_product_id) [name: "idx_cpi_product"]
    (banned_ingredient_id) [name: "idx_cpi_ingredient"]
  }

  Note: "Populate from MOH CSV: one row per (notif_no, banned-ingredient)"
}

// Nightly metrics on each banned ingredient’s appearance in your cancelled set
Table banned_ingredient_metrics {
  ingredient_id           int      [pk, ref: > banned_ingredients.id]
  occurrences_count       int      [not null, note: "How many cancelled notifications contained it"]
  first_appearance_date   date     [not null]
  last_appearance_date    date     [not null]
  risk_score              decimal  [not null, note: "Normalized 0–1 by frequency or severity"]

  Note: "Recomputed nightly from cancelled_product_ingredients → products"
}
```
