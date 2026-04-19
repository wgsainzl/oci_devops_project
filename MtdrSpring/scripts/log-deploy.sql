-- =============================================================================
-- log-deploy.sql
-- Run by the GitHub Actions pipeline after every deploy.
-- Variables are substituted by the pipeline before execution:
--   COMMIT_SHA, IMAGE_TAG, DEPLOY_STATUS, TRIGGERED_BY
-- =============================================================================

INSERT INTO CICD_USER.DEPLOYMENTS (commit_sha, image_tag, status, triggered_by)
VALUES ('&COMMIT_SHA', '&IMAGE_TAG', '&DEPLOY_STATUS', '&TRIGGERED_BY');

COMMIT;

EXIT;