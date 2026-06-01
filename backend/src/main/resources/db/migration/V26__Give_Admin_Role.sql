INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'Raul' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;
