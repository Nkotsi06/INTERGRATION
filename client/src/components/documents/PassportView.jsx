function displayDate(value) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleDateString('en-GB');
}

function PassportView({ data, photoUrl }) {
  const statusLabels = {
    COLLECTED: 'Collected',
    COMPLETED: 'Collected',
    READY_FOR_COLLECTION: 'Ready for Collection',
  };
  const status = statusLabels[data.status] || data.status;

  return (
    <article className="card card-flat print-container" style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      
      {/* Header with Coat of Arms and Flag */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '2px solid #1A5276', paddingBottom: 16 }}>
        <img 
          src="/Logo.jpeg" 
          alt="Lesotho Coat of Arms" 
          className="document-logo" 
        />
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#1A5276' }}>Kingdom of Lesotho</h2>
          <h3 style={{ margin: 0, color: '#555' }}>Passport</h3>
        </div>
        
        <img 
          src="/background.jpg" 
          alt="Lesotho Flag" 
          style={{ width: 60, height: 40, objectFit: 'cover', border: '1px solid #ccc' }} 
        />
      </header>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ width: 150, height: 190, border: '1px solid #ccc', background: '#f2f2f2' }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Passport holder"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ padding: 12, textAlign: 'center' }}>Photo unavailable</div>
          )}
        </div>
        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '10px 20px', margin: 0 }}>
          <dt>Passport number</dt>
          <dd style={{ margin: 0 }}>{data.passport_number || '—'}</dd>
          <dt>Type</dt>
          <dd style={{ margin: 0 }}>{data.passport_type || '—'}</dd>
          <dt>Issue date</dt>
          <dd style={{ margin: 0 }}>{displayDate(data.issued_at || data.issue_date)}</dd>
          <dt>Expiry date</dt>
          <dd style={{ margin: 0 }}>{displayDate(data.expiry_date)}</dd>
          <dt>Status</dt>
          <dd style={{ margin: 0 }}>{status || '—'}</dd>
          {data.collection_branch && (
            <>
              <dt>Collection branch</dt>
              <dd style={{ margin: 0 }}>{data.collection_branch}</dd>
            </>
          )}
        </dl>
      </div>
      {data.signature_data && (
        <div style={{ marginTop: 24 }}>
          <img
            src={data.signature_data}
            alt="Passport holder signature"
            style={{ width: 180, height: 60, objectFit: 'contain' }}
          />
          <div>Signature of holder</div>
        </div>
      )}
    </article>
  );
}

export default PassportView;