interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto max-w-7xl px-4 md:px-8 ${className}`.trim()}>
      {children}
    </div>
  );
}
