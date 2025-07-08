-- Enable pg_cron extension for scheduled translation processing
SELECT cron.schedule(
  'process-translation-queue',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://mbwieeegglyprxoncckdj.supabase.co/functions/v1/auto-translate-system',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id2llZWdnbHlwcnhvbmNja2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzE3MzQsImV4cCI6MjA2NzM0NzczNH0.mSp5jZo9OgsP7xRYueRqUH9GyXiqoERbnoR2JHWnjPk"}'::jsonb,
    body := '{"mode": "continuous-monitor", "maxTextsPerBatch": 20}'::jsonb
  ) as request_id;
  $$
);