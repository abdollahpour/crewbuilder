-- name: CheckDatabase :one
SELECT 1 AS ok;

-- name: ListKnowledge :many
SELECT
    name,
    content,
    created_at,
    updated_at
FROM knowledge
ORDER BY name;

-- name: GetKnowledge :one
SELECT
    name,
    content,
    created_at,
    updated_at
FROM knowledge
WHERE name = sqlc.arg(name);

-- name: CreateKnowledge :one
INSERT INTO knowledge (
    name,
    content
)
VALUES (
    sqlc.arg(name),
    sqlc.arg(content)
)
ON CONFLICT (name) DO NOTHING
RETURNING
    name,
    content,
    created_at,
    updated_at;

-- name: UpdateKnowledge :one
UPDATE knowledge
SET
    content = sqlc.arg(content),
    updated_at = now()
WHERE name = sqlc.arg(name)
RETURNING
    name,
    content,
    created_at,
    updated_at;

-- name: DeleteKnowledge :one
DELETE FROM knowledge
WHERE name = sqlc.arg(name)
RETURNING name;
