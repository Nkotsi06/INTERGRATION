function StatusTimeline({ history }) {
  if (!history || history.length === 0) return null;

  const getSymbol = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return '✓';
      case 'REJECTED':
        return '✕';
      case 'UNDER_REVIEW':
        return '…';
      default:
        return '·';
    }
  };

  return (
    <div className="status-timeline">
      {history.map((item, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-icon">{getSymbol(item.status)}</div>
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