SELECT 'CREATE DATABASE agent'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'agent')\gexec

SELECT 'CREATE DATABASE skill'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'skill')\gexec

SELECT 'CREATE DATABASE mcp'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mcp')\gexec

SELECT 'CREATE DATABASE knowledge'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'knowledge')\gexec

SELECT 'CREATE DATABASE crew'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'crew')\gexec
