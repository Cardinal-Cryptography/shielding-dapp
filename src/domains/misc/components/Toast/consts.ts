import { IconName } from 'src/domains/misc/components/CIcon';
import vars from 'src/domains/styling/utils/vars';

export const STATUS_ICONS_DATA: Record<string, { icon: IconName, color: string | undefined }> = {
  success: {
    icon: 'CheckmarkRegular',
    color: vars('--color-status-success-foreground-1-rest'),
  },
  warning: {
    icon: 'WarningRegular',
    color: vars('--color-status-severe-foreground-1-rest'),
  },
  information: {
    icon: 'InfoRegular',
    color: vars('--color-neutral-foreground-2-rest'),
  },
  error: {
    icon: 'Dismiss',
    color: vars('--color-status-danger-foreground-1-rest'),
  },
  inProgress: {
    icon: 'Spinner',
    color: undefined,
  },
};
