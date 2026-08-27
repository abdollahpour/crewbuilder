-- name: CheckDatabase :one
SELECT 1 AS ok;

-- name: ListMcps :many
SELECT
    name,
    config,
    created_at,
    updated_at
FROM mcps
ORDER BY name;

-- name: GetMcp :one
SELECT
    name,
    config,
    created_at,
    updated_at
FROM mcps
WHERE name = sqlc.arg(name);

-- name: CreateMcp :one
INSERT INTO mcps (
    name,
    config
)
VALUES (
    sqlc.arg(name),
    sqlc.arg(config)::jsonb
)
ON CONFLICT (name) DO NOTHING
RETURNING
    name,
    config,
    created_at,
    updated_at;

-- name: UpdateMcp :one
UPDATE mcps
SET
    config = sqlc.arg(config)::jsonb,
    updated_at = now()
WHERE name = sqlc.arg(name)
RETURNING
    name,
    config,
    created_at,
    updated_at;

-- name: DeleteMcp :one
DELETE FROM mcps
WHERE name = sqlc.arg(name)
RETURNING name;
