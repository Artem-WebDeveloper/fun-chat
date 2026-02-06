export default function generateId(login: string) {
  return `${String(Date.now())}_${login}`;
}
