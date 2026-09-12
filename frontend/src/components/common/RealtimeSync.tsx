import { useNotesRealtime } from '../../hooks/useNotesRealtime';

export function RealtimeSync() {
  useNotesRealtime();
  return null;
}
