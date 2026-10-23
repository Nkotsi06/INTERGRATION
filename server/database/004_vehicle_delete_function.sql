BEGIN;

CREATE OR REPLACE FUNCTION delete_vehicle(vehicle_uuid UUID, actor_uuid UUID)
RETURNS UUID AS $$
DECLARE
  found_vehicle RECORD;
  pending_licence_count INTEGER;
  pending_inspection_count INTEGER;
BEGIN
  SELECT * INTO found_vehicle FROM vehicles WHERE id = vehicle_uuid FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vehicle not found.' USING ERRCODE = 'P0002';
  END IF;

  SELECT COUNT(*) INTO pending_licence_count
    FROM vehicle_licences
   WHERE vehicle_id = vehicle_uuid
     AND status = 'PENDING';

  SELECT COUNT(*) INTO pending_inspection_count
    FROM vehicle_inspections
   WHERE vehicle_id = vehicle_uuid
     AND status = 'BOOKED';

  IF pending_licence_count > 0 OR pending_inspection_count > 0 THEN
    RAISE EXCEPTION
      'Vehicle has pending licences (%) or inspections (%).',
      pending_licence_count, pending_inspection_count
      USING ERRCODE = '23514';
  END IF;

  INSERT INTO audit_logs (user_id, action, record_type, record_id, result)
  VALUES (actor_uuid, 'VEHICLE_DELETED', 'VEHICLE', vehicle_uuid::text, 'SUCCESS');

  DELETE FROM vehicles WHERE id = vehicle_uuid;
  RETURN vehicle_uuid;
END;
$$ LANGUAGE plpgsql;

COMMIT;