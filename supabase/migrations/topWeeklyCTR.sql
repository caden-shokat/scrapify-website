
select cron.schedule(
'topWeeklyCTR',
'0 22 * * 5',
$$
WITH max_loaded AS (
  SELECT COALESCE(MAX("year" * 100 + "week"), 0) AS max_yrwk
    FROM public."topWeeklyCTR"
),

-- 2) raw frequency calculation
week_counts AS (
  SELECT
    "Id",
    "Position",
    "Headline",
    date_part('year', "Date")::INT   AS "Year",
    date_part('week', "Date")::INT   AS "Week",
    "Brand",
    "Platform",
    COUNT(*) OVER (
      PARTITION BY
        date_part('year', "Date"),
        date_part('week', "Date"),
        "Headline"
    ) AS frequency
  FROM "Scrape Data"
  WHERE "Position" BETWEEN 1 AND 5
    AND char_length("Headline") BETWEEN 30 AND 80
    AND "Headline" NOT LIKE '%$%'
    AND "Headline" NOT LIKE '%/%'
    AND "Headline" NOT LIKE '%\%%' ESCAPE '\'
    AND lower("Headline") NOT LIKE '%cost%'
    AND lower("Headline") NOT LIKE '%price%'
),

-- 3) pick just the top row per (Year,Week,Headline)
top_per_headline AS (
  SELECT DISTINCT ON ("Year", "Week", "Headline")
    "Id","Position","Headline","Year","Week","Brand","Platform"
  FROM week_counts
  ORDER BY
    "Year","Week","Headline",
    frequency DESC
)

-- 4) only insert those with YrWk > max_loaded
INSERT INTO public."topWeeklyCTR" (
  "id","position","headline","year","week","brand","platform"
)
SELECT
  t."Id", t."Position", t."Headline",
  t."Year", t."Week", t."Brand", t."Platform"
FROM top_per_headline t
CROSS JOIN max_loaded m
WHERE (t."Year" * 100 + t."Week") > m.max_yrwk
ON CONFLICT ON CONSTRAINT uq_topWeeklyCTR_week_year_headline
DO NOTHING;
$$
);