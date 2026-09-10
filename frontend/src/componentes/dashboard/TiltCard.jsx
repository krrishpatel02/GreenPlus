import { useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const TiltCard = ({ children, className = "", ...props }) => {
  const [gloss, setGloss] = useState({ x: 50, y: 50 });
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: 0.7 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: 0.7 });

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    rotateX.set(((y / bounds.height) - 0.5) * -8);
    rotateY.set(((x / bounds.width) - 0.5) * 8);
    setGloss({ x: (x / bounds.width) * 100, y: (y / bounds.height) * 100 });
  };

  return (
    <motion.div
      {...props}
      className={`dashboard-tilt-card ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
        setGloss({ x: 50, y: 50 });
      }}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
    >
      <span
        className="dashboard-tilt-card__gloss"
        style={{ background: `radial-gradient(circle at ${gloss.x}% ${gloss.y}%, rgba(184, 243, 107, 0.16), transparent 34%)` }}
        aria-hidden="true"
      />
      <div className="dashboard-tilt-card__content">{children}</div>
    </motion.div>
  );
};

export default TiltCard;
