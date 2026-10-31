-- Migration: Initial Schema Setup
-- Version: 001
-- Description: Creates the initial BVSRadio schema.
--
-- Run with psql from any working directory. \ir resolves relative to this file.
-- Production data/seeds must be provisioned separately; this migration deliberately
-- does not create default accounts or credentials.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\ir ../models/schema.sql
