export function formatScanDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const hoursStr = hours.toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
}

export function formatHistoryDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = months[date.getMonth()];
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const hoursStr = hours.toString().padStart(2, '0');
  return `${day} ${month}, ${hoursStr}:${minutes} ${ampm}`;
}
