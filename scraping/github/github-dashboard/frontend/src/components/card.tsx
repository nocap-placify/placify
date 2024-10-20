interface CardProps {
    backgroundColor: string;
    borderColor: string;
    glowColor: string;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    backgroundColor,
    borderColor,
    glowColor,
    className,
}: CardProps) => {
    return (
        <div 
            className={`w-full h-full rounded-lg p-6 transition-shadow duration-300 ${className}`}
            style={{
                backgroundColor,
                borderColor,
                boxShadow: `0 0 10px ${glowColor}`,
                border: `1px solid ${borderColor}`,
            }}
        >
        </div>
    );
};