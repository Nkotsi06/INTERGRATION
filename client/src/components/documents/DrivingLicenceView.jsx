import { formatDate } from '../../utils/formatters';

function DrivingLicenceView({ data, photoUrl }) {
  const isValid = data.isValid ?? data.is_valid;
  const licenceNumber = data.licenceNumber || data.licence_number;
  const fullName = data.fullName || data.full_name ||
    [data.first_name, data.last_name].filter(Boolean).join(' ');
  const issueDate = data.issueDate || data.issue_date;
  const expiryDate = data.expiryDate || data.expiry_date;
  const firstIssueDate = data.firstIssueDate || data.first_issue_date || issueDate;
  const nationalId = data.nationalId || data.national_id;
  const surname = data.lastName || data.last_name || fullName.split(' ').slice(-1)[0];
  const givenNames = data.firstName || data.first_name ||
    fullName.split(' ').slice(0, -1).join(' ');

  return (
    <article className="driving-licence-card print-container" aria-label="Lesotho driving licence">
      <div className="licence-card-security-pattern" aria-hidden="true" />
      <header className="licence-card-header">
        <img className="licence-card-crest" src="/Logo.jpeg" alt="Lesotho coat of arms" />
        <div className="licence-card-heading">
          <div className="licence-card-country">KINGDOM OF LESOTHO</div>
          <div className="licence-card-title">DRIVING LICENCE</div>
          <div className="licence-card-translations">CARTA DE CONDUÇÃO · PERMIS DE CONDUIRE</div>
        </div>
        <div className="licence-card-country-mark" aria-label="Lesotho">LS</div>
      </header>

      <div className="licence-card-body">
        <div className="licence-card-photo-column">
          <div className="licence-card-category">SADC</div>
          <div className="licence-card-photo">
            {photoUrl ? (
              <img src={photoUrl} alt={`Licence holder ${fullName}`} />
            ) : (
              <span>{fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
            )}
          </div>
          <div className="licence-card-signature">
            {data.signature_data || data.signatureData ? (
              <img src={data.signature_data || data.signatureData} alt="Licence holder signature" />
            ) : (
              <span>{givenNames}</span>
            )}
            <small>Signature</small>
          </div>
        </div>

        <div className="licence-card-details">
          <strong className="licence-card-surname">{surname}</strong>
          <strong className="licence-card-given-names">{givenNames}</strong>
          <LicenceField label="I.D. No:" value={nationalId} />
          <LicenceField label="Birth Date:" value={formatDate(data.dateOfBirth || data.date_of_birth)} />
          <LicenceField label="License No:" value={licenceNumber} />
          <LicenceField
            label="Validity Period:"
            value={`${formatDate(issueDate)} / ${formatDate(expiryDate)}`}
          />
          <LicenceField label="Issuing Centre:" value={data.issuingCentre || data.issuing_centre || 'Maseru'} />
          <LicenceField label="Code:" value={data.code || data.licenceType || data.licence_type} />
          <LicenceField label="Vehicle Restriction:" value={data.vehicleRestriction || data.vehicle_restriction || '0'} />
          <LicenceField label="First Issue:" value={formatDate(firstIssueDate)} />
        </div>

        <div className={`licence-card-validity ${isValid ? 'is-valid' : 'is-expired'}`}>
          {isValid ? 'VALID' : 'EXPIRED'}
        </div>
      </div>
      <footer className="licence-card-footer">
        <span>Issued by the Traffic Department · Lesotho</span>
        <span>{data.status || (isValid ? 'ACTIVE' : 'EXPIRED')}</span>
      </footer>
    </article>
  );
}

function LicenceField({ label, value }) {
  return (
    <div className="licence-card-field">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  );
}

export default DrivingLicenceView;
