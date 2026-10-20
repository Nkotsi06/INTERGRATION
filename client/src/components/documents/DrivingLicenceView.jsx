import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

function DrivingLicenceView({ data }) {
  const isValid = data.isValid ?? data.is_valid;
  const licenceNumber = data.licenceNumber || data.licence_number;
  const fullName = data.fullName || data.full_name;
  const licenceType = data.licenceType || data.licence_type;
  const issueDate = data.issueDate || data.issue_date;
  const expiryDate = data.expiryDate || data.expiry_date;

  return (
    <article className="card card-flat print-container" style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      
      {/* Header with Coat of Arms and Flag */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '2px solid #1A5276', paddingBottom: 16 }}>
        <img 
          src="/Logo.jpeg" 
          alt="Lesotho Coat of Arms" 
          style={{ width: 60, height: 60, objectFit: 'contain' }} 
        />
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#1A5276' }}>Kingdom of Lesotho</h2>
          <h3 style={{ margin: 0, color: '#555' }}>Driving Licence</h3>
        </div>
        
        <img 
          src="/background.jpg" 
          alt="Lesotho Flag" 
          style={{ width: 60, height: 40, objectFit: 'cover', border: '1px solid #ccc' }} 
        />
      </header>

      <div style={{ marginBottom: 16 }}>
        <StatusBadge
          variant={isValid ? 'verified' : 'rejected'}
          label={isValid ? 'Valid' : 'Expired'}
        />
      </div>

      <div className="form-grid" style={{ marginTop: 16 }}>
        <ReadOnly label="Licence number" value={licenceNumber} />
        <ReadOnly label="Full name" value={fullName} />
        <ReadOnly label="National ID" value={data.nationalId || data.national_id} />
        <ReadOnly label="Licence type" value={licenceType} />
        <ReadOnly label="Issue date" value={formatDate(issueDate)} />
        <ReadOnly label="Expiry date" value={formatDate(expiryDate)} />
      </div>

      {data.signature_data && (
        <div style={{ marginTop: 24 }}>
          <img
            src={data.signature_data}
            alt="Licence holder signature"
            style={{ width: 180, height: 60, objectFit: 'contain' }}
          />
          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: 4 }}>Signature of holder</div>
        </div>
      )}
    </article>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="form-input form-input-readonly">{value || '—'}</div>
    </div>
  );
}

export default DrivingLicenceView;