-- Initialize all project databases
-- This script is automatically run when PostgreSQL container starts

-- Create individual databases for each project
CREATE DATABASE bizbot;
CREATE DATABASE commentbot;
CREATE DATABASE adabot;
CREATE DATABASE wisebot;

-- Enable pgvector extension for vector similarity search
-- (requires pgvector to be installed in the PostgreSQL image)
\c bizbot
CREATE EXTENSION IF NOT EXISTS vector;

\c commentbot
CREATE EXTENSION IF NOT EXISTS vector;

\c adabot
CREATE EXTENSION IF NOT EXISTS vector;

\c wisebot
CREATE EXTENSION IF NOT EXISTS vector;

-- Return to default database
\c postgres
