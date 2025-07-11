
-- 2. Ensure the target table exists
create table if not exists public."topWeeklyImages" (
  source_id   text    not null,
  week        integer not null,
  year        integer not null,
  image_url   text    not null,
  frequency   bigint  not null,
  primary key (source_id, week, year)
);

-- 3. Schedule the weekly job (runs every Sunday at 00:00)
select cron.schedule(
  'topWeeklyImages',
  '0 21 * * 5',
  $$
    with
      last as (
        select
          coalesce(max(year * 100 + week), 0) as last_yrwk
        from
          public."topWeeklyImages"
      ),
      weekly_counts as (
        select
          min("id")::text                   as source_id,
          extract(week  from "date")::int   as week,
          extract(year  from "datee")::int   as year,
          "image_url"                       as image_url,
          count(*)                          as frequency
        from
          public."Scrape Data"
        where
          "image_url" is not null
        group by
          year,
          week,
          "image_url"
      ),
      ranked as (
        select
          source_id,
          week,
          year,
          image_url,
          frequency,
          row_number() over (
            partition by year, week
            order by frequency desc
          ) as rn
        from
          weekly_counts
      ),
      to_insert as (
        select
          source_id,
          week,
          year,
          image_url,
          frequency
        from
          ranked r
          cross join last l
        where
          r.rn <= 20
          and (r.year * 100 + r.week) > l.last_yrwk
      )
    insert into public."topWeeklyImages"
      (source_id, week, year, image_url, frequency)
    select
      source_id, week, year, image_url, frequency
    from
      to_insert
    on conflict (source_id, week, year) do nothing;
  $$ 
);
