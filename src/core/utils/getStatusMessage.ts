import type { StatusMessage } from '../../app/types';

export default function getStatusMessage(status: StatusMessage, isCurrentUser: boolean) {
  if (!isCurrentUser) return '';

  if (status.isReaded) return 'read';
  if (status.isDelivered) return 'delivered';
  return 'sent';
}
