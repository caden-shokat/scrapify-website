with exploded as (
    select
      unnest(
        regexp_split_to_array(
          lower(
            regexp_replace("Headline", '[^\w\s]', '', 'g')
          ),
        '\s+')
      ) as word
    from "Scrape Data"
    where "Date" >= start_ts
      and "Date"  < end_ts
      and "Headline" is not null
  )
  select
    word,
    count(*)::bigint as frequency
  from exploded
  where char_length(word) >= 3
    and word not in (
      'the','and','or','but','in','on','at','to','for','of','with','by',
      'this','that','these','those','a','an','is','are','was','were','be',
      'have','has','had','do','does','did','will','would','could','should'
    )
  group by word
  order by frequency desc
  limit limit_n;