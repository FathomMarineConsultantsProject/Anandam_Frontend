function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

function MoodHistoryTable({ headers, history }) {
  return (
    <div className="mood-history-wrap">
      <table className="mood-history-table">
        <thead>
          <tr>
            <th>{headers.date}</th>
            <th>{headers.mood}</th>
          </tr>
        </thead>

        <tbody>
          {history.map((entry) => (
            <tr key={entry.id}>
              <td>{formatDate(entry.createdAt)}</td>
              <td className="mood-history-emoji-cell">{entry.emoji}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MoodHistoryTable;