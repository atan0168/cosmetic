### 1. Brand Reputation Score

**What it measures**  
– How prolific a company is (more approved products → more established)  
– How long they’ve been on the market (tenure)  
– How “clean” their track record is (low cancellation rate)

**How to compute**

1. **Gather per-company stats**

   ```sql
   WITH company_stats AS (
     SELECT
       c.id                          AS company_id,
       COUNT(p.id)                  AS total_notifs,
       MIN(p.date_notified)         AS first_date,
       SUM(CASE WHEN p.status='Cancelled' THEN 1 ELSE 0 END) AS cancelled_count
     FROM products p
     JOIN companies c ON p.applicant_company_id = c.id
     GROUP BY c.id
   )
   ```

2. **Turn into normalized sub-scores**

   ```sql
   , normalized AS (
     SELECT
       company_id,
       total_notifs,
       EXTRACT(EPOCH FROM CURRENT_DATE - first_date)       AS tenure_secs,
       cancelled_count,
       -- normalize to 0–1 by dividing by the dataset max
       LOG(1 + total_notifs) / LOG(1 + (SELECT MAX(total_notifs) FROM company_stats)) AS notif_score,
       LEAST(1, (EXTRACT(YEAR FROM AGE(CURRENT_DATE, first_date)) /
                 (SELECT MAX(EXTRACT(YEAR FROM AGE(CURRENT_DATE, first_date))) FROM company_stats))
            )                                                           AS tenure_score,
       1 - (cancelled_count::float / NULLIF(total_notifs,0))         AS clean_score
     FROM company_stats
   )
   ```

3. **Composite “reputation_score”**

   ```sql
   SELECT
     company_id,
     -- weight these as you like (here 50% notif, 30% tenure, 20% clean)
     notif_score * 0.5
     + tenure_score * 0.3
     + clean_score  * 0.2
     AS reputation_score
   FROM normalized;
   ```

### 2. Recency Score

Products launched more recently may use newer, safer formulations.

```sql
WITH dates AS (
  SELECT
    MIN(date_notified) AS min_dt,
    MAX(date_notified) AS max_dt
  FROM products
  WHERE product_category = :same_category
)
SELECT
  p.id,
  EXTRACT(EPOCH FROM p.date_notified - d.min_dt)
  / NULLIF(EXTRACT(EPOCH FROM d.max_dt - d.min_dt),0)
  AS recency_score
FROM products p, dates d
WHERE p.product_category = :same_category;
```

### 3. Category-Risk Score

> **What it is:** For each product category, what fraction of all notifications ended up cancelled?  
> **Why it helps:** If you’re recommending a “whitening cream,” you know that category has, say, a 5% cancellation rate—so you can gently penalize all products in that category.

```dbml
Table category_metrics {
  product_category   varchar [pk, note: "Same as products.category"]
  total_notifs       int     [not null, note: "COUNT(*) from all CSV"]
  cancelled_count    int     [not null, note: "COUNT(*) from cancelled CSV"]
  risk_score         decimal [not null, note: "cancelled_count/total_notifs, 0–1"]
}
```

### 4. Vertical-Integration Flag (Simple Binary)

> **What it is:** Does the _applicant_ also _manufacture_ this product?  
> **Why it helps:** Companies that fully control their supply-chain often have tighter QC.

Just add to your `products` or to `recommended_alternatives`:

```dbml
Table products {
  …
  is_vertically_integrated  boolean [not null, default: false
    , note: "company == manufacturer"]
}
```

You can backfill with:

```sql
UPDATE products p
SET is_vertically_integrated =
    (p.applicant_company = p.manufacturer);
```

Then give `+0.1` (for example) whenever `true`.

### 5. Putting it All Together: Composite Relevance Score

Once you’ve precomputed the four sub-scores above (`reputation_score`, `similarity_score`, `recency_score`, `safety_score`), you can join them and compute:

```sql
SELECT
  sim.cancelled_product_id,
  sim.recommended_product_id,
  -- example weights: 40% similarity, 30% reputation, 20% safety, 10% recency
  sim.brand_score * 0.6
  - saf.category_risk_score * 0.1
  + rec.recency_score    * 0.2
  + sim.is_vertically_integrated * 0.2
  AS relevance_score
FROM recommended_alternatives sim
JOIN reputation_table     rep ON rep.company_id = sim.recommendation_company_id
JOIN safety_table         saf ON saf.product_id   = sim.recommended_product_id
JOIN recency_table        rec ON rec.id           = sim.recommended_product_id
ORDER BY relevance_score DESC;
```

You’d load it with something like:

```sql
INSERT INTO category_metrics
SELECT
  p.product_category,
  COUNT(*)                            AS total_notifs,
  SUM(CASE WHEN c.notif_no IS NOT NULL THEN 1 ELSE 0 END) AS cancelled_count,
  SUM(CASE WHEN c.notif_no IS NOT NULL THEN 1 ELSE 0 END)::float
    / NULLIF(COUNT(*),0)             AS risk_score
FROM all_products p
LEFT JOIN cancelled_products c USING (notif_no)
GROUP BY p.product_category;
```

And in your `recommended_alternatives`:

```dbml
Table recommended_alternatives {
  …
  brand_score              decimal [not null]
  manufacturer_score       decimal [not null]
  category_risk_score      decimal [not null]
  is_vertically_integrated boolean [not null]
  recency_score            decimal [not null]
  relevance_score          decimal [not null]
}
```

Then a toy scoring formula might be:

```
relevance_score =
    0.35 * brand_score
  + 0.25 * manufacturer_score
  - 0.15 * category_risk_score
  + 0.10 * recency_score
  + 0.15 * is_vertically_integrated
```

Feel free to tweak weights, or drop the integration flag if it moves the needle less than you expect. But with **just** those two CSVs you now have:

1. **brand_score** (applicant track record)
2. **category_risk_score** (how “risky” this category is)
3. **recency_score**
4. **vertical_integration**

…combined into one transparent, explainable `relevance_score`.
