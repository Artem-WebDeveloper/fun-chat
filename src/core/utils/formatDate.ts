export default function formatDate(datetime: number) {
  const date = new Date(datetime).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
  const hours = String(new Date(datetime).getHours()).padStart(2, '0');
  const minutes = String(new Date(datetime).getMinutes()).padStart(2, '0');

  return `${date}, ${hours}:${minutes}`;
}
