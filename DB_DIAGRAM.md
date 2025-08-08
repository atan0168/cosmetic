Table manufacturers {
  id int [pk, increment]
  name varchar
  country varchar
  total_cancelled_products int [note: 'Calculated field for risk scoring']
}

Table products {
  id int [pk, increment]
  product_name varchar
  notification_number varchar [unique]
  notification_status varchar [note: 'Approved, Cancelled']
  manufacturer_id int [ref: > manufacturers.id]
  category varchar
  form varchar
  intended_use varchar
  date_notified date
  date_cancelled date
  cancellation_reason text
}

Table ingredients {
  id int [pk, increment]
  name varchar
  cas_number varchar
  risk_level varchar [note: 'Low, Moderate, High, Banned']
  description text
  total_appearances int [note: 'Calculated field for frequency']
}

Table product_ingredients {
  product_id int [ref: > products.id]
  ingredient_id int [ref: > ingredients.id]
  concentration varchar
  purpose varchar
  primary key (product_id, ingredient_id)
}

Table regulations {
  id int [pk, increment]
  ingredient_id int [ref: > ingredients.id]
  region varchar
  status varchar [note: 'Banned, Restricted, Allowed']
  notes text
  source_url varchar
}

Table risk_alerts {
  id int [pk, increment]
  product_id int [ref: > products.id]
  alert_level varchar [note: 'Info, Warning, High Risk']
  reason text [note: 'E.g., contains banned ingredient; high cancellation rate; frequent problematic substance']
  date_created date
}