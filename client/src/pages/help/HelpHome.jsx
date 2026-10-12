import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';

const TOPICS = [
  {
    title: 'Getting started',
    description: 'Create an account and log in for the first time.',
    to: '/help/getting-started',
  },
  {
    title: 'Identity verification',
    description: 'Why Home Affairs verifies you and what to bring.',
    to: '/help/verification',
  },
  {
    title: 'Services and applications',
    description: 'How to apply for a passport, licence, tax, pension and more.',
    to: '/help/services',
  },
  {
    title: 'Documents and uploads',
    description: 'Accepted file types, sizes, and how to upload.',
    to: '/help/documents',
  },
  {
    title: 'Contacts and offices',
    description: 'Where to find us and how to reach each ministry.',
    to: '/help/offices',
  },
  {
    title: 'Accessibility',
    description: 'Keyboard shortcuts, screen readers, and language options.',
    to: '/help/accessibility',
  },
];

function HelpHome() {
  return (
    <PageWrapper title="Help and Support">
      <h1>Help and Support</h1>
      <p className="text-muted">
        Find answers about using the Integrated Government Services System.
        If you cannot find what you need, contact the nearest office.
      </p>

      <div className="services-grid" style={{ marginTop: 24 }}>
        {TOPICS.map((topic) => (
          <Link
            key={topic.to}
            to={topic.to}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card variant="bordered" className="service-card">
              <div className="service-card-body">
                <span className="service-card-name">{topic.title}</span>
                <span className="text-muted">{topic.description}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
}

export default HelpHome;