import type { StatusMessage } from '../../app/types';

export default function getStatusMessage(status: StatusMessage, isCurrentUser: boolean) {
  if (!isCurrentUser && status.isEdited) return '(edited)';
  if (!isCurrentUser) return '';

  if (status.isReaded && status.isEdited) return '(edited) read ✓✓';
  if (status.isDelivered && status.isEdited) return '(edited) delivered ✓';

  if (status.isReaded) return 'read ✓✓';
  if (status.isDelivered) return 'delivered ✓';
  if (status.isEdited) return '(edited) sent';
  return 'sent';
}
