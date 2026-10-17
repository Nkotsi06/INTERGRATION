import Barcode from './Barcode';

function NationalIdCardView({ data, photoUrl }) {
  return (
    <div className="id-card-page print-container" style={{ background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
      
      {/* Green curved band background */}
      <div style={{ position: 'absolute', top: '20mm', left: '-10mm', width: '120mm', height: '40mm', background: '#e8f5e9', borderRadius: '50%', transform: 'rotate(-10deg)', zIndex: 0 }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 8, fontWeight: 'bold', color: '#000' }}>
          {/* Flag placeholder */}
          <div style={{ width: 20, height: 14, background: '#0033A0', borderTop: '4px solid #fff', borderBottom: '4px solid #009543', marginBottom: 2 }}></div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#0033A0' }}>Kingdom of Lesotho</div>
          <div style={{ fontSize: 8, fontWeight: 'bold', color: '#555' }}>NATIONAL IDENTITY CARD</div>
        </div>
        <div style={{ fontSize: 8 }}>
           {/* Coat of arms placeholder */}
           <div style={{ width: 24, height: 20, background: '#ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 5 }}>CoA</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', marginTop: '3mm', position: 'relative', zIndex: 1 }}>
        
        {/* Photo */}
        <div style={{ width: '20mm', height: '24mm', background: '#ccc', border: '1px solid #999', overflow: 'hidden' }}>
           {photoUrl ? (
             <img src={photoUrl} alt="Holder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           ) : (
             <div style={{ fontSize: 6, textAlign: 'center', marginTop: 20 }}>NO PHOTO</div>
           )}
        </div>

        {/* Details */}
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
            <span>{new Date(data.dateOfBirth).toLocaleDateString('en-GB')}</span>
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

        {/* Right side faded photo & signature */}
        <div style={{ width: '15mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '10mm', height: '12mm', background: '#eee', opacity: 0.5, border: '1px solid #ccc' }}></div>
          <div style={{ marginTop: 'auto', fontSize: '6px', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #000', width: '15mm', height: '5mm', fontFamily: 'cursive' }}>
              {/* Signature goes here */}
            </div>
            Signature of Holder
          </div>
        </div>
      </div>

      {/* Bottom stripe / security seal */}
      <div style={{ position: 'absolute', bottom: 2, left: 4, right: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: '10mm', height: '4mm', background: 'linear-gradient(to right, gold, silver)', borderRadius: 2 }}></div>
        <div style={{ fontSize: '5px', color: '#666' }}>This card is the property of the Government of Lesotho</div>
      </div>
    </div>
  );
}

export default NationalIdCardView;