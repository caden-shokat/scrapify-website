-- make sure the table exists
create table if not exists public."topWeeklyHeadlines" (
  source_id TEXT not null,
  week       INTEGER not null,
  year       INTEGER not null,
  headline   TEXT not null,
  frequency  BIGINT not null,
  primary key (source_id, week, year)
);

select cron.schedule(
  'topWeeklyHeadlines',
  '0 21 * * 5',
  $$
  with
    last as (
      select
        coalesce(max(year * 100 + week), 0) as last_yrwk
      from
        public."topWeeklyHeadlines"
    ),
    weekly_counts as (
      select
        min("id")::text                  as source_id,
        extract(week  from "date")::int  as week,
        extract(year  from "date")::int  as year,
        "headline"                       as headline,
        count(*)                         as frequency
      from
        public."Scrape Data"
      where
        "headline" is not null
        and char_length("headline") > 25        -- only headlines > 25 chars
      group by
        year,
        week,
        "headline"
    ),
    ranked as (
      select
        source_id,
        week,
        year,
        headline,
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
        r.source_id,
        r.week,
        r.year,
        r.headline,
        r.frequency
      from
        ranked r
        cross join last l
      where
        r.rn <= 20
        and (r.year * 100 + r.week) > l.last_yrwk
    )
  insert into public."topWeeklyHeadlines" (source_id, week, year, headline, frequency)
    select source_id, week, year, headline, frequency
    from to_insert
  on conflict (source_id, week, year) do nothing;
  $$
);
