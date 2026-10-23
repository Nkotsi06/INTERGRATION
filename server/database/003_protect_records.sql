BEGIN;

-- Function: Prevent deletion of government debt records
CREATE OR REPLACE FUNCTION refuse_delete_government_debt()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'Government debt records are retained. Set status to CLEARED instead.';
END;
$$ LANGUAGE plpgsql;

-- Create debt trigger only if the table exists
DO $$
BEGIN
  IF to_regclass('public.government_debts') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS before_delete_government_debt
      ON public.government_debts;

    CREATE TRIGGER before_delete_government_debt
      BEFORE DELETE ON public.government_debts
      FOR EACH ROW
      EXECUTE FUNCTION refuse_delete_government_debt();
  ELSE
    RAISE NOTICE 'Skipping government debt trigger: government_debts table does not exist.';
  END IF;
END;
$$;


-- Function: Prevent deletion of government employee records
CREATE OR REPLACE FUNCTION refuse_delete_government_employee()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'Government employee records are retained. Update status to RETIRED/RESIGNED instead.';
END;
$$ LANGUAGE plpgsql;

-- Create employee trigger only if the table exists
DO $$
BEGIN
  IF to_regclass('public.government_employees') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS before_delete_government_employee
      ON public.government_employees;

    CREATE TRIGGER before_delete_government_employee
      BEFORE DELETE ON public.government_employees
      FOR EACH ROW
      EXECUTE FUNCTION refuse_delete_government_employee();
  ELSE
    RAISE NOTICE 'Skipping government employee trigger: government_employees table does not exist.';
  END IF;
END;
$$;


-- Function: Prevent deletion of audit logs
CREATE OR REPLACE FUNCTION refuse_delete_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'Audit logs are retained for legal compliance and cannot be deleted.';
END;
$$ LANGUAGE plpgsql;

-- Create audit log trigger only if the table exists
DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS before_delete_audit_log
      ON public.audit_logs;

    CREATE TRIGGER before_delete_audit_log
      BEFORE DELETE ON public.audit_logs
      FOR EACH ROW
      EXECUTE FUNCTION refuse_delete_audit_log();
  ELSE
    RAISE NOTICE 'Skipping audit log trigger: audit_logs table does not exist.';
  END IF;
END;
$$;

COMMIT;