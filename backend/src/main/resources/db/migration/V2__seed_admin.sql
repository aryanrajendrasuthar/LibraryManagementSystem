-- Default admin user (password: Admin@123)
INSERT INTO members (name, email, password, membership_id, role, borrowing_limit)
VALUES (
    'System Admin',
    'admin@library.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iAs2',
    'ADMIN-0001',
    'ADMIN',
    100
) ON CONFLICT DO NOTHING;
