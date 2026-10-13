import MinistryDashboardShell from '../../components/ministry/MinistryDashboardShell';

const SERVICES = [
  // Licence
  { code: 'LICENCE_VIEW',  name: 'View driving licence',              routePrefix: 'traffic/licence',          colourHex: '#B9770E' },
  { code: 'LICENCE_RENEW', name: 'Renew driving licence',             routePrefix: 'traffic/renew',            colourHex: '#B9770E' },
  { code: 'LEARNERS',      name: "Apply for learner's licence",       routePrefix: 'traffic/licence/learners', colourHex: '#B9770E' },
  { code: 'DRIVING',       name: 'Apply for driving licence',         routePrefix: 'traffic/licence/driving',  colourHex: '#B9770E' },
  { code: 'PDP',           name: 'Apply for public driving permit',   routePrefix: 'traffic/licence/pdp',      colourHex: '#B9770E' },
  { code: 'TEST',          name: 'Book a driving test',               routePrefix: 'traffic/book-test',        colourHex: '#B9770E' },
  { code: 'APPOINTMENTS',  name: 'My appointments',                   routePrefix: 'traffic/appointments',     colourHex: '#B9770E' },

  // Vehicles
  { code: 'VEHICLES',      name: 'My vehicles',                       routePrefix: 'traffic/vehicles',         colourHex: '#B9770E' },
  { code: 'INSPECTIONS',   name: 'Vehicle inspections',               routePrefix: 'traffic/inspections',      colourHex: '#B9770E' },
  { code: 'VEHICLE_LIC',   name: 'Vehicle licensing',                 routePrefix: 'traffic/vehicle-licences', colourHex: '#B9770E' },

  // Permits
  { code: 'PERMITS',       name: 'Transport permits',                 routePrefix: 'traffic/permits',          colourHex: '#B9770E' },

  // Applications
  { code: 'MY_APPS',       name: 'My applications',                   routePrefix: 'traffic/applications',     colourHex: '#B9770E' },
];

function TrafficDashboard() {
  return (
    <MinistryDashboardShell
      ministryCode="TRAFFIC"
      title="Traffic Services"
      accentColour="#B9770E"
      intro="Driving licences, vehicle registration, inspections, licensing, permits and applications."
      services={SERVICES}
    />
  );
}

export default TrafficDashboard;