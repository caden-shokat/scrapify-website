select cron.schedule(
  'topWeeklyAIHeadlines',     -- job name
  '02 22 * * 5',               -- every Friday at 22:00 UTC
  $$
  with
    -- 1) what we’ve already processed
    last as (
      select coalesce(max(year * 100 + week), 0) as last_yrwk
      from public."topWeeklyAIHeadlines"
    ),

    -- 2) the brand new rows to ingest
    new_rows as (
      select
        th.source_id,
        th.week,
        th.year,
        th.headline,
        th.frequency
      from
        public."topWeeklyHeadlines" th
        cross join last l
      where
        (th.year * 100 + th.week) > l.last_yrwk
    ),

    -- 3) insert those base records into your AI table
    inserted as (
      insert into public."topWeeklyAIHeadlines" (
        source_id, week, year, headline, frequency
      )
      select
        source_id, week, year, headline, frequency
      from new_rows
      on conflict (source_id, week, year) do nothing
      returning *
    )

  -- 4) and in the very same statement, fire off a single HTTP POST
  select net.http_post(
    url     := (
                select decrypted_secret
                from vault.decrypted_secrets
                where name = 'PROJECT_URL'
              ) || '/functions/v1/generate-top-headlines',
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' ||
                   (
                     select decrypted_secret
                     from vault.decrypted_secrets
                     where name = 'ANON_KEY'
                   )
               ),
    body    := jsonb_build_object(
                 'run_at', now(),
                 'items',
                   (
                     select jsonb_agg(
                       jsonb_build_object(
                         'source_id', source_id,
                         'week',      week,
                         'year',      year,
                         'headline',  headline,
                         'frequency', frequency
                       )
                     )
                     from new_rows
                   )
               )
  ) as trigger_id;
  $$
);
