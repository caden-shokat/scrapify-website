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
        MIN("Id")::text            AS source_id,
        EXTRACT(WEEK FROM "Date")::INT   AS week,
        EXTRACT(YEAR FROM "Date")::INT   AS year,
        "Headline"                 AS headline,
        "Brand"                    AS brand,
        "Image Url"                 AS image_url,
        COUNT(*)                   AS frequency
      FROM public."Scrape Data"
      WHERE
        "Headline" IS NOT NULL
        AND CHAR_LENGTH("Headline") > 25    -- only longer headlines
        AND "Brand"    IS NOT NULL
        AND "Image Url" IS NOT NULL
      GROUP BY
        year, week, "Headline", "Brand", "Image Url"
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