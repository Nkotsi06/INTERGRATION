import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import { getApplication, updateApplicationStatus, recordCollection } from '../../api/homeAffairsApi';
import { useNotification } from '../../context/NotificationContext';

function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Collection Form State
  const [collectorName, setCollectorName] = useState('');
  const [idChecked, setIdChecked] = useState(false);

  const load = async () => {
    try {
      const data = await getApplication(id);
      setApp(data);
    } catch (err) {
      showError('Failed to load application.');
      navigate('/home-affairs/applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setProcessing(true);
    try {
      await updateApplicationStatus(id, newStatus);
      success(`Application marked as ${newStatus.replace(/_/g, ' ')}`);
      load();
    } catch (err) {
      showError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRecordCollection = async () => {
    if (!collectorName) return showError('Please enter the name of the person collecting.');
    if (!idChecked) return showError('You must confirm the ID was checked.');

    setProcessing(true);
    try {
      await recordCollection(id, { collectedByName: collectorName, idChecked });
      success('Collection recorded successfully.');
      navigate('/home-affairs/applications');
    } catch (err) {
      showError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <PageWrapper title="Application"><p>Loading...</p></PageWrapper>;
  if (!app) return <PageWrapper title="Application"><p>Not found.</p></PageWrapper>;

  return (
    <PageWrapper title="Process Application" showBack backPath="/home-affairs/applications">
      <h1>Application: {app.reference_number}</h1>
      
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
             <div className="stat-label">Service</div>
             <div className="stat-value" style={{ fontSize: 18 }}>{app.data?.serviceName}</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
             <div className="stat-label">Status</div>
             <div className="stat-value"><StatusBadge variant={app.status.toLowerCase()} label={app.status.replace(/_/g, ' ')} /></div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
             <div className="stat-label">Collection Branch</div>
             <div className="stat-value" style={{ fontSize: 16 }}>{app.branch_name || 'Not Selected'}</div>
          </div>
        </Card>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Citizen Details</h3>
        <p><strong>Name:</strong> {app.first_name} {app.last_name}</p>
        <p><strong>National ID:</strong> {app.citizen_national_id}</p>
        <p><strong>Submitted:</strong> {new Date(app.submitted_at).toLocaleString()}</p>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Processing Actions</h3>
        
        {app.status === 'SUBMITTED' && (
          <Button variant="primary" onClick={() => handleStatusChange('UNDER_REVIEW')} loading={processing}>
            Mark as Under Review
          </Button>
        )}

        {app.status === 'UNDER_REVIEW' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="primary" onClick={() => handleStatusChange('IN_PRODUCTION')} loading={processing}>
              Approve & Mark In Production
            </Button>
            <Button variant="danger" onClick={() => handleStatusChange('REJECTED')} loading={processing}>
              Reject
            </Button>
          </div>
        )}

        {app.status === 'IN_PRODUCTION' && (
          <Button variant="primary" onClick={() => handleStatusChange('READY_FOR_COLLECTION')} loading={processing}>
            Mark as Ready for Collection
          </Button>
        )}
      </div>

      {app.status === 'READY_FOR_COLLECTION' && (
        <div className="form-section" style={{ border: '1px solid #27AE60', padding: 20, borderRadius: 8 }}>
          <h3 className="form-section-title" style={{ color: '#27AE60' }}>Record Collection</h3>
          <p>The citizen must collect the document from <strong>{app.branch_name}</strong>.</p>
          
          <Input 
            label="Name of person collecting" 
            value={collectorName} 
            onChange={(e) => setCollectorName(e.target.value)} 
            required 
          />
          <div style={{ margin: '15px 0' }}>
            <Checkbox 
              label="I have verified the person's National ID" 
              checked={idChecked} 
              onChange={(e) => setIdChecked(e.target.checked)} 
            />
          </div>
          <Button variant="primary" onClick={handleRecordCollection} loading={processing}>
            Confirm Collection
          </Button>
        </div>
      )}

      {app.status === 'COLLECTED' && (
        <Alert type="success" title="Collected" message={`This document was collected by ${app.collected_by_name} on ${new Date(app.collected_at).toLocaleString()}.`} />
      )}
    </PageWrapper>
  );
}

export default ApplicationDetail;