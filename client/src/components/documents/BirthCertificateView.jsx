import Barcode from './Barcode';

function BirthCertificateView({ data }) {
  return (
    <div className="a4-page print-container">
      <div className="watermark">SAMPLE</div>
      
      <div className="cert-header">
        <div>
          <strong>Certificate Number</strong><br />
          {data.certificate_number}
        </div>
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Uses the document-logo class for consistent styling */}
          <img 
            src="/Logo.jpeg" 
            alt="Lesotho Coat of Arms" 
            className="document-logo" 
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
        <h1>BIRTH CERTIFICATE</h1>
        <hr />
      </div>

      <table className="cert-fields">
        <tbody>
          <tr><td>1. ID Number</td><td>{data.child_national_id || data.national_id || '—'}</td></tr>
          <tr><td>2. Name(s)</td><td>{data.child_full_name?.split(' ').slice(0, -1).join(' ')}</td></tr>
          <tr><td>3. Surname</td><td>{data.child_full_name?.split(' ').slice(-1)[0]}</td></tr>
          <tr><td>4. Gender</td><td>{data.child_gender}</td></tr>
          <tr><td>5. Date of Birth</td><td>{data.child_date_of_birth}</td></tr>
          <tr><td>6. Place of Birth</td><td>{data.place_of_birth}</td></tr>
          <tr><td>7. Name(s) of Father</td><td>{data.father_full_name || '—'}</td></tr>
          <tr><td>8. Nationality of Father</td><td>{data.father_nationality || 'Mosotho'}</td></tr>
          <tr><td>9. Name(s) of Mother</td><td>{data.mother_full_name || '—'}</td></tr>
          <tr><td>10. Maiden Surname</td><td>{data.mother_maiden_surname || '—'}</td></tr>
          <tr><td>11. Nationality of Mother</td><td>{data.mother_nationality || 'Mosotho'}</td></tr>
          <tr><td>12. Residence of Mother</td><td>{data.mother_residence || '—'}</td></tr>
          <tr><td>13. Name(s) and Capacity of Informant</td><td>{data.informant_full_name || data.child_full_name} (SELF)</td></tr>
          <tr><td>14. Residence of Informant</td><td>{data.place_of_birth}</td></tr>
          <tr><td>15. Date of Registration</td><td>{new Date(data.created_at).toLocaleDateString('en-GB')}</td></tr>
        </tbody>
      </table>

      <div className="cert-footer">
        <p>
          I hereby certify that the above certificate is a true copy of the particulars recorded in relation to the birth of the said child in the National Identity Register kept at the National Identity & Civil Registry Office, Maseru, Lesotho.
        </p>
        <p style={{ marginTop: 20 }}>
          Dated this {new Date().getDate()}{['st','nd','rd'][(new Date().getDate()-1)%10] || 'th'} day of {new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="cert-signatures">
        <div className="signature-box" style={{ textAlign: 'left', borderTop: 'none' }}>
          <div style={{ border: '1px dashed #999', padding: 10, width: 150, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            OFFICE STAMP
          </div>
        </div>
        <div className="signature-box">
          <div style={{ fontFamily: 'cursive', fontSize: 24, marginBottom: 5 }}>
            <em>Signed</em>
          </div>
          <strong>MOREMOHOLO MAIPATO</strong><br />
          District Manager
        </div>
      </div>
    </div>
  );
}

export default BirthCertificateView;