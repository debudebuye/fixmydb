declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string
    absoluteStrokeWidth?: boolean
  }
  type Icon = FC<IconProps>
  export const Activity: Icon
  export const AlertCircle: Icon
  export const AlertTriangle: Icon
  export const ArrowRight: Icon
  export const BarChart3: Icon
  export const Check: Icon
  export const CheckCircle2: Icon
  export const ChevronDown: Icon
  export const ChevronRight: Icon
  export const ClipboardPaste: Icon
  export const Code2: Icon
  export const Copy: Icon
  export const Database: Icon
  export const Download: Icon
  export const ExternalLink: Icon
  export const EyeOff: Icon
  export const FileText: Icon
  export const GitBranch: Icon
  export const GitFork: Icon
  export const Globe: Icon
  export const Heart: Icon
  export const Info: Icon
  export const KeyRound: Icon
  export const LayoutDashboard: Icon
  export const Lightbulb: Icon
  export const Lock: Icon
  export const Loader2: Icon
  export const Moon: Icon
  export const Network: Icon
  export const Play: Icon
  export const RefreshCw: Icon
  export const RotateCcw: Icon
  export const Server: Icon
  export const Shield: Icon
  export const ShieldAlert: Icon
  export const ShieldCheck: Icon
  export const Sparkles: Icon
  export const Sun: Icon
  export const Terminal: Icon
  export const TrendingUp: Icon
  export const Upload: Icon
  export const Users: Icon
  export const WifiOff: Icon
  export const XCircle: Icon
  export const Zap: Icon
}
