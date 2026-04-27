-- Fix avg_score precision to allow values like 10.00 (was DECIMAL(3,2) which maxed at 9.99)
ALTER TABLE games ALTER COLUMN avg_score TYPE DECIMAL(4, 2);
