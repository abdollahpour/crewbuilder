\c mcp

CREATE TABLE IF NOT EXISTS mcps (
    name TEXT PRIMARY KEY,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DELETE FROM mcps;

INSERT INTO mcps (name, config)
VALUES
(
    'book-flight',
    '{
        "url": "https://book-flight-mcp.demo.abdollahpour.com/mcp"
    }'::jsonb
),
(
    'book-hotel',
    '{
        "url": "https://book-hotel-mcp.demo.abdollahpour.com/mcp"
    }'::jsonb
);
