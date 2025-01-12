/*
  # Add insert policy for strava_tokens

  1. Changes
    - Add policy to allow authenticated users to insert their own tokens
    
  2. Security
    - Users can only insert tokens for their own user_id
    - Maintains data isolation between users
*/

CREATE POLICY "Users can insert own tokens"
  ON strava_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);