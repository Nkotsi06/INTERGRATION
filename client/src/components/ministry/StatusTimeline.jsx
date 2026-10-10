import { FiCheckCircle, FiCircle, FiXCircle, FiClock } from 'react-icons/fi';

function StatusTimeline({ history }) {
  if (!history || history.length === 0) return null;

  const getIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <FiCheckCircle />;
      case 'REJECTED':
        return <FiXCircle />;
      case 'UNDER_REVIEW':
        return <FiClock />;
      default:
        return <FiCircle />;
    }
  };

  return (
    <div className="status-timeline">
      {history.map((item, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-icon">{getIcon(item.status)}</div>
          <div className="timeline-content">
            <span className="timeline-status">{item.statusLabel || item.status}</span>
            <span className="timeline-date">{item.date}</span>
            {item.notes && <p className="timeline-notes">{item.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatusTimeline;