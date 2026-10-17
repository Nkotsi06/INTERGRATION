import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Checkbox from '../../components/common/Checkbox';
import { useNotification } from '../../context/NotificationContext';
import apiClient from '../../api/apiClient';

function InformationManagement() {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useNotification();

  useEffect(() => {
    apiClient.get('/information/topics').then(setTopics).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/information/admin/topics/${selected.code}`, selected);
      success('Information updated');
      setSelected(null);
    } catch (err) {
      showError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper title="Information Services" showBack backPath="/home-affairs/dashboard">
      <h1>Information Services</h1>
      <p className="text-muted">Manage the information shown to citizens for Immigration, Citizenship, Refugees, and Livestock.</p>

      {!selected ? (
        <div className="document-list">
          {topics.map(t => (
            <div key={t.code} className="card card-flat" style={{ padding: 15, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{t.title}</strong>
                <p className="text-muted">{t.is_published ? 'Published' : 'Hidden'}</p>
              </div>
              <Button variant="secondary" onClick={() => setSelected({ ...t })}>Edit</Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="form-section">
          <h3 className="form-section-title">Edit: {selected.title}</h3>
          <label className="form-label">Content</label>
          <textarea 
            className="form-input" 
            rows={8} 
            value={selected.content} 
            onChange={e => setSelected({ ...selected, content: e.target.value })} 
          />
          <Input 
            label="Contact Details" 
            value={selected.contact_details || ''} 
            onChange={e => setSelected({ ...selected, contact_details: e.target.value })} 
          />
          <Checkbox 
            label="Published (visible to citizens)" 
            checked={selected.is_published} 
            onChange={e => setSelected({ ...selected, is_published: e.target.checked })} 
          />
          <div style={{ marginTop: 20 }}>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
            <Button variant="secondary" onClick={() => setSelected(null)} style={{ marginLeft: 10 }}>Cancel</Button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default InformationManagement;