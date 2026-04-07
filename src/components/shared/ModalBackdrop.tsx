import { AnimatePresence, motion, type Variants } from "framer-motion";
import { type FC, type ReactNode } from "react";

interface ModalBackdropProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  /** Framer Motion transition type, default "spring" */
  transitionType?: "spring" | "tween";
  /** Spring damping, default 20 */
  springDamping?: number;
  /** Scale initial value, default 0.94 */
  initialScale?: number;
}

const springTransition = (damping: number) => ({
  type: "spring" as const,
  damping,
});

const tweenTransition = {
  duration: 0.25,
  ease: "easeOut" as const,
};

export const ModalBackdrop: FC<ModalBackdropProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  overlayClassName = "",
  transitionType = "spring",
  springDamping = 20,
  initialScale = 0.94,
}) => {
  const contentVariants: Variants = {
    hidden: { opacity: 0, scale: initialScale },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: initialScale },
  };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const transition =
    transitionType === "spring"
      ? springTransition(springDamping)
      : tweenTransition;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`fixed inset-0 z-40 flex items-center justify-center p-4 ${overlayClassName}`.trim()}
          onClick={onClose}
        >
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className={`relative ${className}`.trim()}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalBackdrop;
