import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    backgroundColor: string;
    borderColor: string;
    glowColor: string;
    title: string;
    content: string;
    icon: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    backgroundColor,
    borderColor,
    glowColor,
    title,
    content,
    icon,
}) => {
    return (
        <motion.div
            className="relative w-full h-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: borderColor }}
                animate={{
                    boxShadow: [
                        `0 0 20px ${glowColor}`,
                        `0 0 60px ${glowColor}`,
                        `0 0 20px ${glowColor}`,
                    ],
                }}
                transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className={`
                    relative z-10 w-full h-full rounded-lg p-6
                    border-2 border-solid backdrop-blur-sm
                `}
                style={{
                    backgroundColor: `${backgroundColor}`,
                    borderColor,
                }}
            >
                <div className="relative h-full">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        {icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
                    <p className="text-lg font-semibold text-gray-600">{content}</p>
                </div>
            </motion.div>
        </motion.div>
    );
};
