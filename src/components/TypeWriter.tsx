import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface TypeWriterProps {
  text: string;
  delay?: number;
  className?: string;
}

export function TypeWriter({ text, delay = 0, className = "" }: TypeWriterProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  } as const;

  if (!isVisible) {
    return <span className={className} style={{ opacity: 0 }}>{text}</span>;
  }

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {text.split("").map((char, index) => (
        <motion.span variants={child} key={index}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
