import { formatDate } from '../../utils/formatters';

function NationalIdCardView({ data, photoUrl }) {
  const signatureData = data.signatureData || data.signature_data;
  const dateOfBirth = data.dateOfBirth || data.date_of_birth;

  return (
    <div className="id-card-page print-container" style={{ background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
      
      <div style={{ position: 'absolute', top: '20mm', left: '-10mm', width: '120mm', height: '40mm', background: '#e8f5e9', borderRadius: '50%', transform: 'rotate(-10deg)', zIndex: 0 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 8, fontWeight: 'bold', color: '#000' }}>
          <img 
            src="/background.jpg" 
            alt="Lesotho Flag" 
            style={{ width: 25, height: 18, objectFit: 'cover', border: '1px solid #ccc' }} 
          />
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#0033A0' }}>Kingdom of Lesotho</div>
          <div style={{ fontSize: 8, fontWeight: 'bold', color: '#555' }}>NATIONAL IDENTITY CARD</div>
        </div>
        
        <div style={{ fontSize: 8 }}>
           {/* Rounded logo styling applied via inline for the small ID card format */}
           <img 
            src="/Logo.jpeg" 
            alt="Coat of Arms" 
            style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: '50%', border: '1px solid #1A5276' }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', marginTop: '3mm', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '20mm', height: '24mm', background: '#ccc', border: '1px solid #999', overflow: 'hidden' }}>
           {photoUrl ? (
             <img src={photoUrl} alt="Holder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           ) : (
             <div style={{ fontSize: 6, textAlign: 'center', marginTop: 20 }}>NO PHOTO</div>
           )}
        </div>

        <div style={{ flex: 1, marginLeft: '4mm', display: 'flex', flexDirection: 'column', gap: '1mm', fontSize: '8px', fontWeight: 'bold', color: '#333' }}>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '25mm' }}>ID Number</span>
            <span>{data.nationalId}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '25mm' }}>Surname</span>
            <span>{data.lastName}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '25mm' }}>First Name</span>
            <span>{data.firstName}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '25mm' }}>Nationality</span>
            <span>Mosotho</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '25mm' }}>Date of Birth</span>
            <span>{formatDate(dateOfBirth)}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '25mm' }}>Sex</span>
            <span>{data.gender} <span style={{ marginLeft: 10, color: '#0033A0', fontSize: 10 }}>C</span></span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '25mm' }}>Place of Issue</span>
            <span>Maseru</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '25mm' }}>Date of Issue</span>
            <span>{new Date().toLocaleDateString('en-GB')}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '25mm' }}>Date of Expiry</span>
            <span>{new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toLocaleDateString('en-GB')}</span>
          </div>
        </div>

        <div style={{ width: '15mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '10mm', height: '12mm', background: '#eee', opacity: 0.5, border: '1px solid #ccc' }}></div>
          <div style={{ marginTop: 'auto', fontSize: '6px', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #000', width: '15mm', height: '5mm', fontFamily: 'cursive' }}>
              {signatureData && (
                <img
                  src={signatureData}
                  alt="Holder signature"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
            Signature of Holder
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 2, left: 4, right: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: '10mm', height: '4mm', background: 'linear-gradient(to right, gold, silver)', borderRadius: 2 }}></div>
        <div style={{ fontSize: '5px', color: '#666' }}>This card is the property of the Government of Lesotho</div>
      </div>
    </div>
  );
}

export default NationalIdCardView;