
select cron.schedule(
'topWeeklyCTR',
'0 21 * * 5',
$$
WITH max_loaded AS (
  SELECT COALESCE(MAX("year" * 100 + "week"), 0) AS max_yrwk
    FROM public."topWeeklyCTR"
),

-- 2) raw frequency calculation
week_counts AS (
  SELECT
    "id",
    "position",
    "headline",
    date_part('year', "date")::INT   AS "year",
    date_part('week', "date")::INT   AS "week",
    "brand",
    "platform",
    COUNT(*) OVER (
      PARTITION BY
        date_part('year', "date"),
        date_part('week', "date"),
        "headline"
    ) AS frequency
  FROM "Scrape Data"
  WHERE "position" BETWEEN 1 AND 5
    AND char_length("headline") BETWEEN 30 AND 80
    AND "headline" NOT LIKE '%$%'
    AND "headline" NOT LIKE '%/%'
    AND "headline" NOT LIKE '%\%%' ESCAPE '\'
    AND lower("headline") NOT LIKE '%cost%'
    AND lower("headline") NOT LIKE '%price%'
),

-- 3) pick just the top row per (Year,Week,Headline)
top_per_headline AS (
  SELECT DISTINCT ON ("year", "week", "headline")
    "id","position","headline","year","week","brand","platform"
  FROM week_counts
  ORDER BY
    "year","week","headline",
    frequency DESC
)

-- 4) only insert those with YrWk > max_loaded
INSERT INTO public."topWeeklyCTR" (
  "id","position","headline","year","week","brand","platform"
)
SELECT
  t."id", t."position", t."headline",
  t."year", t."week", t."brand", t."platform"
FROM top_per_headline t
CROSS JOIN max_loaded m
WHERE (t."year" * 100 + t."week") > m.max_yrwk
ON CONFLICT ON CONSTRAINT uq_topWeeklyCTR_week_year_headline
DO NOTHING;
$$
);