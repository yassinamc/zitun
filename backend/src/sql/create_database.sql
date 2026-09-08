-- Run as PostgreSQL superuser (postgres), once:
--   psql -U postgres -f create_database.sql

CREATE USER oliveflow WITH PASSWORD 'oliveflow_dev_pass_2026';
CREATE DATABASE oliveflow OWNER oliveflow;
GRANT ALL PRIVILEGES ON DATABASE oliveflow TO oliveflow;

\c oliveflow
GRANT ALL ON SCHEMA public TO oliveflow;
ALTER SCHEMA public OWNER TO oliveflow;
