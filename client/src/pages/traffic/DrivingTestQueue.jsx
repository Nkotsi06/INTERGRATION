import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getStaffDrivingTests, processDrivingTest } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

function DrivingTestQueue() {
  const { data, loading, error, refetch } = useFetch(getStaffDrivingTests, [], {
    pollInterval: 30000,
  });
  const [processingId, setProcessingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const { success } = useNotification();

  const process = async (test, result) => {
    setProcessingId(test.id);
    setActionError(null);
    try {
      const updated = await processDrivingTest(test.id, { result });
      if (result === 'PASSED') {
        success(`Test passed. Reference: ${updated.test_reference}`);
      } else {
        success('Driving test result recorded.');
      }
      refetch();
    } catch (err) {
      setActionError(err.message || 'Could not record the test result.');
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    { key: 'first_name', label: 'Citizen', render: (row) => `${row.first_name} ${row.last_name}` },
    { key: 'national_id', label: 'National ID' },
    { key: 'test_type', label: 'Test type' },
    { key: 'test_date', label: 'Date', render: (row) => formatDate(row.test_date) },
    { key: 'time_slot', label: 'Time' },
    { key: 'location', label: 'Location' },
    {
      key: 'actions',
      label: 'Result',
      render: (row) => (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="success"
            loading={processingId === row.id}
            disabled={processingId !== null}
            onClick={() => process(row, 'PASSED')}
          >
            Pass
          </Button>
          <Button
            size="small"
            variant="danger"
            loading={processingId === row.id}
            disabled={processingId !== null}
            onClick={() => process(row, 'FAILED')}
          >
            Fail
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Driving Test Results"
      showBack
      backPath="/traffic/staff"
      accentColour="#B9770E"
    >
      <h1>Driving test results</h1>
      <p className="text-muted">
        Record completed tests. Passed tests receive a reference number citizens can use in their licence application.
      </p>
      {(error || actionError) && (
        <Alert type="error" message={actionError || error} />
      )}
      {loading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : Array.isArray(data) && data.length > 0 ? (
        <Table columns={columns} data={data} />
      ) : (
        <EmptyState
          title="No driving tests awaiting results"
          message="New test bookings will appear here."
        />
      )}
    </PageWrapper>
  );
}

export default DrivingTestQueue;
