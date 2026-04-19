-- =============================================================================
-- setup-cicd-schema.sql
-- Run once as ADMIN against ATP to create the CICD_USER schema.
-- The GitHub Actions pipeline runs this on every deploy — it is idempotent.
-- =============================================================================

-- Create CICD_USER if it doesn't exist
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM dba_users WHERE username = 'CICD_USER';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE USER CICD_USER IDENTIFIED BY "' || '&CICD_DB_PASSWORD' || '"';
    EXECUTE IMMEDIATE 'GRANT CONNECT, RESOURCE TO CICD_USER';
    EXECUTE IMMEDIATE 'GRANT UNLIMITED TABLESPACE TO CICD_USER';
    DBMS_OUTPUT.PUT_LINE('CICD_USER created.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('CICD_USER already exists, skipping.');
  END IF;
END;
/

-- Create DEPLOYMENTS table if it doesn't exist
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM all_tables
  WHERE owner = 'CICD_USER' AND table_name = 'DEPLOYMENTS';

  IF v_count = 0 THEN
    EXECUTE IMMEDIATE '
      CREATE TABLE CICD_USER.DEPLOYMENTS (
        id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        commit_sha    VARCHAR2(40)  NOT NULL,
        image_tag     VARCHAR2(40)  NOT NULL,
        status        VARCHAR2(10)  NOT NULL CHECK (status IN (''success'', ''failure'')),
        triggered_by  VARCHAR2(100),
        deployed_at   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
      )
    ';
    DBMS_OUTPUT.PUT_LINE('DEPLOYMENTS table created.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('DEPLOYMENTS table already exists, skipping.');
  END IF;
END;
/

EXIT;