-- name: CheckDatabase :one
SELECT 1 AS ok;

-- name: ListSkills :many
SELECT
    name,
    description,
    skill_md,
    tools_required,
    mcps,
    knowledge,
    created_at,
    updated_at
FROM skills
ORDER BY name;

-- name: GetSkill :one
SELECT
    name,
    description,
    skill_md,
    tools_required,
    mcps,
    knowledge,
    created_at,
    updated_at
FROM skills
WHERE name = sqlc.arg(name);

-- name: CreateSkill :one
INSERT INTO skills (
    name,
    description,
    skill_md,
    tools_required,
    knowledge
)
VALUES (
    sqlc.arg(name),
    sqlc.arg(description),
    sqlc.arg(skill_md),
    sqlc.arg(tools_required)::jsonb,
    sqlc.arg(knowledge)::jsonb
)
ON CONFLICT (name) DO NOTHING
RETURNING
    name,
    description,
    skill_md,
    tools_required,
    mcps,
    knowledge,
    created_at,
    updated_at;

-- name: UpdateSkill :one
UPDATE skills
SET
    description = sqlc.arg(description),
    skill_md = sqlc.arg(skill_md),
    tools_required = sqlc.arg(tools_required)::jsonb,
    knowledge = sqlc.arg(knowledge)::jsonb,
    updated_at = now()
WHERE name = sqlc.arg(name)
RETURNING
    name,
    description,
    skill_md,
    tools_required,
    mcps,
    knowledge,
    created_at,
    updated_at;

-- name: DeleteSkill :one
DELETE FROM skills
WHERE name = sqlc.arg(name)
RETURNING name;

-- name: ListSkillNamesForKnowledge :many
SELECT name
FROM skills
WHERE knowledge @> jsonb_build_array(sqlc.arg(knowledge_name)::text)
ORDER BY name;

-- name: ListSkillNamesForMcp :many
SELECT name
FROM skills
WHERE mcps @> jsonb_build_array(sqlc.arg(mcp_name)::text)
ORDER BY name;
