-- name: CheckDatabase :one
SELECT 1 AS ok;

-- name: ListCrews :many
SELECT
    name,
    model,
    role,
    goal,
    backstory,
    agents,
    created_at,
    updated_at
FROM crews
ORDER BY name;

-- name: GetCrew :one
SELECT
    name,
    model,
    role,
    goal,
    backstory,
    agents,
    created_at,
    updated_at
FROM crews
WHERE name = sqlc.arg(name);

-- name: CreateCrew :one
INSERT INTO crews (
    name,
    model,
    role,
    goal,
    backstory,
    agents
)
VALUES (
    sqlc.arg(name),
    sqlc.arg(model),
    sqlc.arg(role),
    sqlc.arg(goal),
    sqlc.arg(backstory),
    sqlc.arg(agents)::jsonb
)
ON CONFLICT (name) DO NOTHING
RETURNING
    name,
    model,
    role,
    goal,
    backstory,
    agents,
    created_at,
    updated_at;

-- name: UpdateCrew :one
UPDATE crews
SET
    model = sqlc.arg(model),
    role = sqlc.arg(role),
    goal = sqlc.arg(goal),
    backstory = sqlc.arg(backstory),
    agents = sqlc.arg(agents)::jsonb,
    updated_at = now()
WHERE name = sqlc.arg(name)
RETURNING
    name,
    model,
    role,
    goal,
    backstory,
    agents,
    created_at,
    updated_at;

-- name: DeleteCrew :one
DELETE FROM crews
WHERE name = sqlc.arg(name)
RETURNING name;

-- name: ListCrewNamesForAgent :many
SELECT name
FROM crews
WHERE agents @> jsonb_build_array(sqlc.arg(agent_name)::text)
ORDER BY name;
