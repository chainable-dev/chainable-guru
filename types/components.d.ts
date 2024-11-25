declare module "@/components/custom/overview" {
  interface OverviewProps {
    onActionClick: (action: string) => void;
  }
  
  export function Overview(props: OverviewProps): JSX.Element;
} 