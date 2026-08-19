import { motion, useScroll, useSpring } from "framer-motion";
import "./AnimatedPage.css";

export const Reveal = ({ children, className = "", delay = 0, direction = "up" }) => {
  const offsets = {
    up: { y: 24, x: 0 },
    left: { y: 0, x: -24 },
    right: { y: 0, x: 24 },
  };
  const offset = offsets[direction] || offsets.up;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: offset.y, x: offset.x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedPage = ({ children, className = "" }) => {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.25 });

  return (
    <div className={`animated-page ${className}`}>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />
      <div className="page-atmosphere" aria-hidden="true">
        <span className="atmosphere-shape atmosphere-shape-one" />
        <span className="atmosphere-shape atmosphere-shape-two" />
        <span className="atmosphere-grid" />
      </div>
      <div className="animated-page__content">{children}</div>
    </div>
  );
};

export default AnimatedPage;
