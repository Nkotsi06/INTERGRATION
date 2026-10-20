import Barcode from './Barcode';

function DeathCertificateView({ data }) {
  return (
    <div className="a4-page print-container">
      <div className="watermark">SAMPLE</div>
      
      <div className="cert-header">
        <div>
          <strong>Certificate Number</strong><br />
          {data.certificate_number}
        </div>
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src="/Logo.jpeg" 
            alt="Lesotho Coat of Arms" 
            style={{ width: 70, height: 70, objectFit: 'contain' }} 
          />
          <div style={{ marginTop: 4, fontWeight: 'bold', fontSize: '14px' }}>KINGDOM OF LESOTHO</div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <img 
            src="/background.jpg" 
            alt="Lesotho Flag" 
            style={{ width: 60, height: 40, objectFit: 'cover', border: '1px solid #ccc', marginBottom: 8 }} 
          />
          <Barcode value={data.certificate_number} />
        </div>
      </div>

      <div className="cert-title">
        <h1>DEATH CERTIFICATE</h1>
        <hr />
      </div>

      <table className="cert-fields">
        <tbody>
          <tr><td>1. ID Number</td><td>{data.deceased_national_id || '—'}</td></tr>
          <tr><td>2. Name(s)</td><td>{data.deceased_full_name?.split(' ').slice(0, -1).join(' ')}</td></tr>
          <tr><td>3. Surname</td><td>{data.deceased_full_name?.split(' ').slice(-1)[0]}</td></tr>
          <tr><td>4. Gender</td><td>{data.gender || '—'}</td></tr>
          <tr><td>5. Age</td><td>{data.age || '—'}</td></tr>
          <tr><td>6. Nationality</td><td>MOSOTHO</td></tr>
          <tr><td>7. Profession or Occupation</td><td>{data.occupation || '—'}</td></tr>
          <tr><td>8. Date of Death</td><td>{data.date_of_death}</td></tr>
          <tr><td>9. Place of Death</td><td>{data.place_of_death}</td></tr>
          <tr><td>10. Cause of Death</td><td>{data.cause_of_death || 'NATURAL CAUSES'}</td></tr>
          <tr><td>11. Residential Address at Death</td><td>{data.residential_address || '—'}</td></tr>
          <tr><td>12. Date of Registration</td><td>{new Date(data.created_at).toLocaleDateString('en-GB')}</td></tr>
        </tbody>
      </table>

      <div className="cert-footer">
        <p>
          I hereby certify that the above certificate is a true copy of the particulars recorded in relation to the death of the above person in the National Identity Register kept at the National Identity & Civil Registry Office, Maseru, Lesotho.
        </p>
        <p style={{ marginTop: 20 }}>
          Dated this {new Date().getDate()}{['st','nd','rd'][(new Date().getDate()-1)%10] || 'th'} day of {new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="cert-signatures">
        <div className="signature-box" style={{ textAlign: 'left', borderTop: 'none' }}>
          <div style={{ border: '1px solid #333', padding: 10, width: 150, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', transform: 'rotate(-15deg)' }}>
            CERTIFIED CORRECT
          </div>
        </div>
        <div className="signature-box">
          <div style={{ fontFamily: 'cursive', fontSize: 24, marginBottom: 5 }}>
             <em>Signed</em>
          </div>
          <strong>NAPO EPHRAIM</strong><br />
          Senior National Identity and Civil Registry
        </div>
      </div>
    </div>
  );
}

export default DeathCertificateView;