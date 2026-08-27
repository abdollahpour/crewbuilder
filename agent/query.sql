-- name: CheckDatabase :one
SELECT 1 AS ok;

-- name: ListAgents :many
SELECT
    name,
    model,
    role,
    goal,
    backstory,
    tools,
    mcps,
    skills,
    knowledge,
    created_at,
    updated_at
FROM agents
ORDER BY name;

-- name: GetAgent :one
SELECT
    name,
    model,
    role,
    goal,
    backstory,
    tools,
    mcps,
    skills,
    knowledge,
    created_at,
    updated_at
FROM agents
WHERE name = sqlc.arg(name);

-- name: CreateAgent :one
INSERT INTO agents (
    name,
    model,
    role,
    goal,
    backstory,
    tools,
    mcps,
    skills,
    knowledge
)
VALUES (
    sqlc.arg(name),
    sqlc.arg(model),
    sqlc.arg(role),
    sqlc.arg(goal),
    sqlc.arg(backstory),
    sqlc.arg(tools)::jsonb,
    sqlc.arg(mcps)::jsonb,
    sqlc.arg(skills)::jsonb,
    sqlc.arg(knowledge)::jsonb
)
ON CONFLICT (name) DO NOTHING
RETURNING
    name,
    model,
    role,
    goal,
    backstory,
    tools,
    mcps,
    skills,
    knowledge,
    created_at,
    updated_at;

-- name: UpdateAgent :one
UPDATE agents
SET
    model = sqlc.arg(model),
    role = sqlc.arg(role),
    goal = sqlc.arg(goal),
    backstory = sqlc.arg(backstory),
    tools = sqlc.arg(tools)::jsonb,
    mcps = sqlc.arg(mcps)::jsonb,
    skills = sqlc.arg(skills)::jsonb,
    knowledge = sqlc.arg(knowledge)::jsonb,
    updated_at = now()
WHERE name = sqlc.arg(name)
RETURNING
    name,
    model,
    role,
    goal,
    backstory,
    tools,
    mcps,
    skills,
    knowledge,
    created_at,
    updated_at;

-- name: DeleteAgent :one
DELETE FROM agents
WHERE name = sqlc.arg(name)
RETURNING name;

-- name: ListAgentNamesForMcp :many
SELECT name
FROM agents
WHERE mcps @> jsonb_build_array(sqlc.arg(mcp_name)::text)
ORDER BY name;

-- name: ListAgentNamesForSkill :many
SELECT name
FROM agents
WHERE skills @> jsonb_build_array(sqlc.arg(skill_name)::text)
ORDER BY name;

-- name: ListAgentNamesForKnowledge :many
SELECT name
FROM agents
WHERE knowledge @> jsonb_build_array(sqlc.arg(knowledge_name)::text)
ORDER BY name;
