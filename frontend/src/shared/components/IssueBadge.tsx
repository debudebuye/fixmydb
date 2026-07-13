import { memo } from 'react';

/** Colored severity badge — red for HIGH, yellow for MED, blue for LOW. */
interface Props { severity: 'high' | 'medium' | 'low'; }

const MAP = {
  high:   'badge badge-red',
  medium: 'badge badge-yellow',
  low:    'badge badge-blue',
};
const LABEL = { high: 'HIGH', medium: 'MED', low: 'LOW' };

function IssueBadgeInner({ severity }: Props) {
  return <span className={MAP[severity]}>{LABEL[severity]}</span>;
}

export default memo(IssueBadgeInner);
