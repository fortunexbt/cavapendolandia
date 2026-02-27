import { motion } from "framer-motion";

/**
 * Abstract shadow/silhouette element — evokes without showing.
 * Thin arched lines, a gentle oscillating presence at the edges.
 */
const AbstractShadow = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      className={`pointer-events-none select-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, ease: "easeOut" }}
    >
      <svg
        viewBox="0 0 200 300"
        className="w-full h-full animate-drift"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Thin arch — like a doorway or threshold */}
        <path
          d="M60 280 Q60 80 100 60 Q140 80 140 280"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-whisper"
          opacity="0.4"
        />
        {/* A single fine thread descending */}
        <line
          x1="100"
          y1="60"
          x2="100"
          y2="20"
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-whisper"
          opacity="0.3"
        />
        {/* Small circle — like an eye or a bell */}
        <circle
          cx="100"
          cy="16"
          r="3"
          stroke="currentColor"
          strokeWidth="0.4"
          fill="none"
          className="text-whisper animate-breathe"
          opacity="0.3"
        />
        {/* Abstract trace marks — like an invented alphabet */}
        <path
          d="M75 240 Q80 230 85 240"
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-whisper"
          opacity="0.2"
        />
        <path
          d="M110 220 Q118 210 126 220"
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-whisper"
          opacity="0.2"
        />
      </svg>
    </motion.div>
  );
};

export default AbstractShadow;
