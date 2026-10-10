function CitizenReadOnlyBlock({ citizen }) {
  if (!citizen) return null;

  return (
    <div className="card card-flat" style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0 }}>Verified citizen</h3>
        <span className="badge badge-success">Verified by Home Affairs</span>
      </div>

      <div className="form-grid">
        <ReadOnly label="Full name" value={citizen.fullName} />
        <ReadOnly label="National ID" value={citizen.nationalId} />
        <ReadOnly
          label="Date of birth"
          value={citizen.dateOfBirth ? String(citizen.dateOfBirth).slice(0, 10) : '—'}
        />
        <ReadOnly label="Gender" value={citizen.gender} />
        <ReadOnly
          label="Address"
          value={citizen.address}
          full
        />
      </div>

      <p className="text-muted" style={{ marginTop: 12 }}>
        Only Home Affairs can change these details.
      </p>
    </div>
  );
}

function ReadOnly({ label, value, full = false }) {
  return (
    <div
      className="form-field"
      style={full ? { gridColumn: '1 / -1' } : undefined}
    >
      <label className="form-label">{label}</label>
      <div className="form-input form-input-readonly">{value || '—'}</div>
    </div>
  );
}

export default CitizenReadOnlyBlock;