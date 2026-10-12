import PageWrapper from '../../components/layout/PageWrapper';

const OFFICES = [
  {
    name: 'Home Affairs — Maseru',
    address: 'Corner Kingsway and Parliament Road, Maseru 100',
    phone: '+266 2232 0000',
    email: 'homeaffairs@gov.ls',
  },
  {
    name: 'Home Affairs — Leribe',
    address: 'Main Road, Hlotse, Leribe 300',
    phone: '+266 2240 0000',
    email: 'leribe.homeaffairs@gov.ls',
  },
  {
    name: 'Traffic — Maseru Testing Centre',
    address: 'Industrial Area, Maseru 100',
    phone: '+266 2231 0000',
    email: 'traffic@gov.ls',
  },
  {
    name: 'Police — Maseru Central',
    address: 'Police Headquarters, Maseru 100',
    phone: '112',
    email: 'police@gov.ls',
  },
  {
    name: 'Finance — Revenue Office',
    address: 'Finance House, Kingsway, Maseru 100',
    phone: '+266 2231 5000',
    email: 'finance@gov.ls',
  },
  {
    name: 'Pensions Office',
    address: 'Pension House, Maseru 100',
    phone: '+266 2231 7000',
    email: 'pensions@gov.ls',
  },
  {
    name: 'Passport Office — Maseru',
    address: 'Immigration Building, Maseru 100',
    phone: '+266 2231 8000',
    email: 'passport@gov.ls',
  },
];

function HelpOffices() {
  return (
    <PageWrapper title="Contacts and Offices" showBack backPath="/help">
      <h1>Contacts and offices</h1>
      <p className="text-muted">
        Find the right office for your enquiry. For emergencies, call 112.
      </p>

      {OFFICES.map((o) => (
        <div key={o.name} className="card card-flat" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>{o.name}</h3>
          <p style={{ margin: '4px 0' }}>
            <strong>Address:</strong> {o.address}
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>Phone:</strong> {o.phone}
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>Email:</strong> {o.email}
          </p>
        </div>
      ))}
    </PageWrapper>
  );
}

export default HelpOffices;