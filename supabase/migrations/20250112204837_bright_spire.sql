/*
  # Add unique constraint to strava_tokens

  1. Changes
    - Add unique constraint on user_id column in strava_tokens table
    
  2. Purpose
    - Ensures each user can only have one set of Strava tokens
    - Enables proper upsert functionality
*/

ALTER TABLE strava_tokens ADD CONSTRAINT strava_tokens_user_id_key UNIQUE (user_id);