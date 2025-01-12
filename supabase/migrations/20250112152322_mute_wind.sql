/*
  # Create Strava tokens table

  1. New Tables
    - `strava_tokens`
      - `id` (uuid, primary key)
      - `user_id` (text, references auth.users)
      - `access_token` (text)
      - `refresh_token` (text)
      - `expires_at` (bigint)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `strava_tokens` table
    - Add policy for users to read their own tokens
    - Add policy for users to update their own tokens
*/

CREATE TABLE IF NOT EXISTS strava_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at bigint NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE strava_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens"
  ON strava_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own tokens"
  ON strava_tokens
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_strava_tokens_updated_at
  BEFORE UPDATE
  ON strava_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();