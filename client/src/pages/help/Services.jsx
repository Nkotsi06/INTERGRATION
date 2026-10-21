import PageWrapper from '../../components/layout/PageWrapper';

const MINISTRIES = [
  {
    name: 'Home Affairs',
    items: ['Citizen registration', 'National ID issuance', 'Record updates'],
  },
  {
    name: 'Traffic',
    items: ['Driving licence renewal', 'Book a driving test', 'View appointments'],
  },
  {
    name: 'Police',
    items: ['Report a case', 'Track your cases', 'Request clearance'],
  },
  {
    name: 'Pensions',
    items: ['View pension info', 'Existence verification', 'Verification history'],
  },
  {
    name: 'Passport',
    items: ['Apply for a passport', 'Renew a passport', 'Track application status'],
  },
];

function HelpServices() {
  return (
    <PageWrapper title="Services and Applications" showBack backPath="/help">
      <h1>Services and applications</h1>
      <p className="text-muted">
        Each ministry offers a different set of services. Below is what you can
        access once your identity has been verified by Home Affairs.
      </p>

      {MINISTRIES.map((m) => (
        <div key={m.name} className="form-section">
          <h3 className="form-section-title">{m.name}</h3>
          <ul>
            {m.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </PageWrapper>
  );
}

export default HelpServices;