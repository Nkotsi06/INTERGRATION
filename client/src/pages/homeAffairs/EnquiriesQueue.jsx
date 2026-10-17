import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import apiClient from '../../api/apiClient';
import { formatDate } from '../../utils/formatters';

function EnquiriesQueue() {
  const [enquiries, setEnquiries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const { success, error: showError } = useNotification();

  const load = () => {
    apiClient.get('/information/admin/enquiries').then(setEnquiries).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const openEnquiry = async (id) => {
    try {
      const data = await apiClient.get(`/information/admin/enquiries/${id}`);
      setSelected(data);
      setReplyText('');
    } catch (err) {
      showError('Could not load enquiry.');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await apiClient.post(`/information/admin/enquiries/${selected.id}/reply`, { message: replyText });
      success('Reply sent.');
      setSelected(null);
      load();
    } catch (err) {
      showError('Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'subject', label: 'Subject' },
    { key: 'first_name', label: 'Citizen', render: (r) => `${r.first_name} ${r.last_name}` },
    { key: 'created_at', label: 'Date', render: (r) => formatDate(r.created_at) },
    { 
      key: 'status', 
      label: 'Status',
      render: (r) => <span className={`badge badge-${r.status === 'OPEN' ? 'warning' : 'success'}`}>{r.status}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => <Button size="small" variant="secondary" onClick={() => openEnquiry(r.id)}>View / Reply</Button>
    }
  ];

  return (
    <PageWrapper title="Citizen Enquiries" showBack backPath="/home-affairs/dashboard">
      <h1>Enquiries</h1>
      <p className="text-muted">Respond to questions and support requests from citizens.</p>

      <Table columns={columns} data={enquiries} />

      {selected && (
        <Modal isOpen onClose={() => setSelected(null)} title={`Enquiry: ${selected.reference_number}`} size="large">
          <div style={{ padding: 10, background: '#f9f9f9', borderRadius: 4, marginBottom: 15 }}>
            <strong>Subject:</strong> {selected.subject}<br />
            <strong>Message:</strong> {selected.message}
          </div>

          <h4>Conversation History</h4>
          {selected.messages?.map(m => (
            <div key={m.id} style={{ marginBottom: 10, padding: 10, borderLeft: `4px solid ${m.role === 'CITIZEN' ? '#3498db' : '#27ae60'}` }}>
              <strong>{m.username} ({m.role})</strong> - <small>{formatDate(m.created_at)}</small>
              <p>{m.message}</p>
            </div>
          ))}
          {selected.messages?.length === 0 && <p className="text-muted">No replies yet.</p>}

          <div className="form-field" style={{ marginTop: 20 }}>
            <label className="form-label">Your Reply</label>
            <textarea className="form-input" rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} />
          </div>
          <div style={{ marginTop: 15 }}>
            <Button variant="primary" onClick={handleReply} loading={sending}>Send Reply & Resolve</Button>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}

export default EnquiriesQueue;