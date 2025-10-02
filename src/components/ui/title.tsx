interface TitleProps {
  title: string;
  description?: string;
  className?: string;
}

export default function Title({ title, description, className = "" }: TitleProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
