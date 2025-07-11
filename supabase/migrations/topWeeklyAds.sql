WITH
    -- Figure out the last week we already processed
    last AS (
      SELECT
        COALESCE(MAX(year * 100 + week), 0) AS last_yrwk
      FROM public."topWeeklyAds"
    ),

    -- Count occurrences of each unique (Headline, Brand, ImageURL) per week
    weekly_counts AS (
      SELECT
        MIN("id")::text            AS source_id,
        EXTRACT(WEEK FROM "date")::INT   AS week,
        EXTRACT(YEAR FROM "date")::INT   AS year,
        "headline"                 AS headline,
        "brand"                    AS brand,
        "image_url"                 AS image_url,
        COUNT(*)                   AS frequency
      FROM public."Scrape Data"
      WHERE
        "headline" IS NOT NULL
        AND CHAR_LENGTH("headline") > 25    -- only longer headlines
        AND "brand"    IS NOT NULL
        AND "image_url" IS NOT NULL
      GROUP BY
        year, week, "headline", "brand", "image_url"
    ),

    -- Rank them by frequency within each week
    ranked AS (
      SELECT
        source_id,
        week,
        year,
        headline,
        brand,
        image_url,
        frequency,
        ROW_NUMBER() OVER (
          PARTITION BY year, week
          ORDER BY frequency DESC
        ) AS rn
      FROM weekly_counts
    ),

    -- Take the top 20 *new* rows since last run
    to_insert AS (
      SELECT
        r.source_id,
        r.week,
        r.year,
        r.headline,
        r.brand,
        r.image_url,
        r.frequency
      FROM ranked r
      CROSS JOIN last l
      WHERE
        r.rn <= 20
        AND (r.year * 100 + r.week) > l.last_yrwk
    )

  -- Insert them, skipping any conflicts
  INSERT INTO public."topWeeklyAds"
    (source_id, week, year, headline, brand, image_url, frequency)
  SELECT
    source_id, week, year, headline, brand, image_url, frequency
  FROM to_insert
  ON CONFLICT (source_id, week, year) DO NOTHING;