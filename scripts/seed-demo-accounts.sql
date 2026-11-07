-- For an isolated Neon demo database only. Do not use against live business data.
-- Run migrations and `npm run db:bootstrap-admin` first so the roles exist.
-- Password hashes below are bcrypt hashes for the demo credentials provided
-- separately; changing them requires regenerating the hashes.

BEGIN;

DO $$
DECLARE
  missing_roles TEXT;
BEGIN
  SELECT string_agg(required.key, ', ')
    INTO missing_roles
    FROM (VALUES
      ('SUPER_ADMIN'),
      ('OFFICE_MANAGER'),
      ('ACCOUNTANT'),
      ('SURVEYOR'),
      ('RECEPTIONIST'),
      ('VISITOR'),
      ('CLIENT')
    ) AS required(key)
    LEFT JOIN "Role" role ON role.key = required.key
    WHERE role.id IS NULL;

  IF missing_roles IS NOT NULL THEN
    RAISE EXCEPTION 'Missing roles: %. Run npm run db:bootstrap-admin first.', missing_roles;
  END IF;
END $$;

WITH accounts(id, email, name, password_hash, role_key) AS (
  VALUES
    ('demo_admin_seed', 'demo.admin@landledger.test', 'Demo Admin', '$2b$12$FAb9bN9URLsfLninbIo1suIntHHOFwgj9dJLHqf7F0OX7xEVSyfbC', 'SUPER_ADMIN'),
    ('demo_manager_seed', 'demo.manager@landledger.test', 'Demo Office Manager', '$2b$12$lANfW9hBZEnd9snm47fZxuqN7uSmv6g12FsBhvDPhae0RoZ5QzcmG', 'OFFICE_MANAGER'),
    ('demo_accountant_seed', 'demo.accountant@landledger.test', 'Demo Accountant', '$2b$12$eSJPsRMo6jdB/zSa4TvrqepdFZ3n8dTcmRE6DououHJFARLM2oJAm', 'ACCOUNTANT'),
    ('demo_surveyor_seed', 'demo.surveyor@landledger.test', 'Demo Surveyor', '$2b$12$4BQCWSxxVQx1URsoQBOoR.zSEKCVpWfLSYD5p9cppfmPUpgsr//sW', 'SURVEYOR'),
    ('demo_receptionist_seed', 'demo.receptionist@landledger.test', 'Demo Receptionist', '$2b$12$1R7NABVWT1R0MviwzYeOX.zh8SQCKJQw76EoJkO69M7gRczzsiJxG', 'RECEPTIONIST'),
    ('demo_visitor_seed', 'demo.visitor@landledger.test', 'Demo Visitor', '$2b$12$4B4n.kVmZnqcwlK6Dq5BSuc1SKnCAFC0jzul8STZoEZTmM649xuN6', 'VISITOR'),
    ('demo_client_seed', 'demo.client@landledger.test', 'Demo Land Client', '$2b$12$wvIyEyqXrdohSOuXZ2nt0uwQBwnnY7VFAfAO/7Xh0gHMP6HjcAFZi', 'CLIENT')
),
upserted_users AS (
  INSERT INTO "User" (
    id, email, name, "passwordHash", "jobTitle", status,
    "failedLoginAttempts", "lockoutCount", "lockoutUntil", "createdAt", "updatedAt"
  )
  SELECT id, email, name, password_hash, 'Demo account', 'ACTIVE',
         0, 0, NULL, NOW(), NOW()
    FROM accounts
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    "passwordHash" = EXCLUDED."passwordHash",
    "jobTitle" = EXCLUDED."jobTitle",
    status = 'ACTIVE',
    "failedLoginAttempts" = 0,
    "lockoutCount" = 0,
    "lockoutUntil" = NULL,
    "updatedAt" = NOW()
  RETURNING id, email
)
DELETE FROM "UserRole" user_role
USING upserted_users
WHERE user_role."userId" = upserted_users.id;

WITH accounts(email, role_key) AS (
  VALUES
    ('demo.admin@landledger.test', 'SUPER_ADMIN'),
    ('demo.manager@landledger.test', 'OFFICE_MANAGER'),
    ('demo.accountant@landledger.test', 'ACCOUNTANT'),
    ('demo.surveyor@landledger.test', 'SURVEYOR'),
    ('demo.receptionist@landledger.test', 'RECEPTIONIST'),
    ('demo.visitor@landledger.test', 'VISITOR'),
    ('demo.client@landledger.test', 'CLIENT')
)
INSERT INTO "UserRole" ("userId", "roleId")
SELECT user_record.id, role.id
  FROM accounts
  JOIN "User" user_record ON user_record.email = accounts.email
  JOIN "Role" role ON role.key = accounts.role_key;

INSERT INTO "ClientProfile" (id, "userId", "clientCode", address, region, city, "createdAt", "updatedAt")
SELECT 'demo_client_profile_seed', user_record.id, 'DEMO-CLIENT', 'Demo account',
       'Greater Accra', 'Accra', NOW(), NOW()
  FROM "User" user_record
 WHERE user_record.email = 'demo.client@landledger.test'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "LandHolding" (
  id, "clientId", title, region, district, community, "sizeAcres",
  "acquisitionDate", "acquisitionPrice", "currentValue", "titleStatus",
  status, notes, "createdAt", "updatedAt"
)
SELECT 'demo_client_holding_seed', profile.id, 'Adenta Ridge residential plots',
       'Greater Accra', 'Adenta Municipal', 'Adenta', 0.25,
       TIMESTAMP '2025-03-15 00:00:00', 220000, 245000, 'REGISTERED',
       'ACTIVE', 'Demo holding for the quick sign-in client account.', NOW(), NOW()
  FROM "ClientProfile" profile
 WHERE profile."clientCode" = 'DEMO-CLIENT'
ON CONFLICT (id) DO NOTHING;

COMMIT;
