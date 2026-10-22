function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function label(status) {
  if (status === "COMPLETED") return "Session Completed";
  if (status === "CANCELLED") return "Session Cancelled";
  if (status === "NO_SHOW") return "No show";
  return status || "—";
}

export default function PractitionerHistoryTable({ appointments = [] }) {
  return (
    <div className="pr-history-wrap">
      <h3>Session History</h3>
      {appointments.length === 0 ? (
        <div className="pr-history-empty">No past sessions yet.</div>
      ) : (
        <div className="pr-table-scroll">
          <table className="pr-history-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Session</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment?.user?.fullName || "User"}</td>
                  <td>{appointment?.enquiry?.supportTopic || "Counselling"}</td>
                  <td>{formatDate(appointment.scheduledStart)}</td>
                  <td>{formatTime(appointment.scheduledStart)}</td>
                  <td>
                    <span className={`pr-history-status pr-history-${String(appointment.status || "").toLowerCase()}`}>
                      {label(appointment.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
