interface Props { severity: 'high' | 'medium' | 'low'; }

const MAP = {
  high:   'badge badge-red',
  medium: 'badge badge-yellow',
  low:    'badge badge-blue',
};
const LABEL = { high: 'HIGH', medium: 'MED', low: 'LOW' };

export default function IssueBadge({ severity }: Props) {
  return <span className={MAP[severity]}>{LABEL[severity]}</span>;
}
