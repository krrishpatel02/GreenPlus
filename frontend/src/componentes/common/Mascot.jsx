import { motion, AnimatePresence } from "framer-motion";

const Mascot = ({ mood = "happy", outfit = "default", speechText = "" }) => {
  // Color configuration
  const bodyColor = "#10b981"; // Emerald green
  const eyeColor = "#1f2937"; // Dark slate
  const cheekColor = "#fca5a5"; // Light pink blush
  
  // Expressions mapping
  const renderEyes = () => {
    switch (mood) {
      case "celebrate":
        return (
          <>
            {/* Starry eyes */}
            <path d="M125,120 L130,130 L140,130 L132,136 L135,146 L125,140 L115,146 L118,136 L110,130 L120,130 Z" fill="#eab308" />
            <path d="M175,120 L180,130 L190,130 L182,136 L185,146 L175,140 L165,146 L168,136 L160,130 L170,130 Z" fill="#eab308" />
          </>
        );
      case "sad":
        return (
          <>
            {/* Teary/sad eyes */}
            <path d="M115,135 Q125,125 135,135" stroke={eyeColor} strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M165,135 Q175,125 185,135" stroke={eyeColor} strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Tear drop */}
            <motion.circle
              cx="120"
              cy="145"
              r="4"
              fill="#60a5fa"
              animate={{ y: [0, 8, 8], opacity: [1, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </>
        );
      case "thinking":
        return (
          <>
            {/* One questioning arched eyebrow, eyes looking sideways */}
            <motion.path d="M115,120 Q125,110 135,115" stroke={eyeColor} strokeWidth="3" fill="none" />
            <circle cx="128" cy="132" r="7" fill={eyeColor} />
            <circle cx="129" cy="131" r="2.5" fill="#fff" />
            
            <motion.path d="M165,115 Q175,115 185,120" stroke={eyeColor} strokeWidth="3" fill="none" />
            <circle cx="172" cy="132" r="7" fill={eyeColor} />
            <circle cx="173" cy="131" r="2.5" fill="#fff" />
          </>
        );
      case "happy":
      default:
        return (
          <>
            {/* Big happy round eyes */}
            <circle cx="125" cy="130" r="8" fill={eyeColor} />
            <circle cx="127" cy="128" r="3" fill="#fff" />
            
            <circle cx="175" cy="130" r="8" fill={eyeColor} />
            <circle cx="177" cy="128" r="3" fill="#fff" />
          </>
        );
    }
  };

  const renderMouth = () => {
    switch (mood) {
      case "sad":
        return <path d="M140,165 Q150,155 160,165" stroke={eyeColor} strokeWidth="4" strokeLinecap="round" fill="none" />;
      case "thinking":
        return <path d="M142,160 Q150,160 158,158" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" fill="none" />;
      case "celebrate":
        return (
          <path
            d="M138,155 Q150,175 162,155 Z"
            fill="#ef4444"
            stroke={eyeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      case "happy":
      default:
        return <path d="M138,155 Q150,170 162,155" stroke={eyeColor} strokeWidth="4" strokeLinecap="round" fill="none" />;
    }
  };

  // Render accessories based on outfits purchased/selected
  const renderOutfit = () => {
    switch (outfit) {
      case "solar-cap":
        return (
          <g id="solar-cap">
            {/* Yellow cap with grid pattern */}
            <path d="M110,85 C110,50 190,50 190,85 Z" fill="#eab308" stroke="#1f2937" strokeWidth="3" />
            <line x1="150" y1="53" x2="150" y2="85" stroke="#1f2937" strokeWidth="2" />
            <line x1="130" y1="62" x2="170" y2="62" stroke="#1f2937" strokeWidth="2" />
            <circle cx="150" cy="51" r="5" fill="#ef4444" />
            {/* Little solar ray indicator */}
            <motion.path
              d="M150,30 L150,42 M135,33 L142,40 M165,33 L158,40"
              stroke="#eab308"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </g>
        );
      case "water-goggles":
        return (
          <g id="water-goggles" transform="translate(0, 10)">
            {/* Blue swimming goggles */}
            <rect x="110" y="118" width="30" height="22" rx="10" fill="rgba(59, 130, 246, 0.7)" stroke="#3b82f6" strokeWidth="3" />
            <rect x="160" y="118" width="30" height="22" rx="10" fill="rgba(59, 130, 246, 0.7)" stroke="#3b82f6" strokeWidth="3" />
            <line x1="140" y1="129" x2="160" y2="129" stroke="#3b82f6" strokeWidth="4" />
            <line x1="95" y1="129" x2="110" y2="129" stroke="#3b82f6" strokeWidth="3" />
            <line x1="190" y1="129" x2="205" y2="129" stroke="#3b82f6" strokeWidth="3" />
          </g>
        );
      case "gardener-hat":
        return (
          <g id="gardener-hat" transform="translate(-10, -5)">
            {/* Brown gardener straw hat */}
            <path d="M110,85 C120,60 180,60 190,85 Z" fill="#b45309" stroke="#1f2937" strokeWidth="3" />
            {/* Brim */}
            <ellipse cx="150" cy="85" rx="65" ry="12" fill="#d97706" stroke="#1f2937" strokeWidth="3" />
            {/* Green ribbon */}
            <path d="M121,80 Q150,75 179,80" stroke="#059669" strokeWidth="6" fill="none" />
            {/* Little flower in hat */}
            <circle cx="180" cy="72" r="5" fill="#facc15" />
            <circle cx="180" cy="72" r="2.5" fill="#fff" />
          </g>
        );
      case "default":
      default:
        return (
          // Cute little red hair bow or standard leaf vein
          <path d="M150,70 Q145,50 148,32" stroke="#059669" strokeWidth="3" strokeLinecap="round" fill="none" />
        );
    }
  };

  // Jump animation for celebrating, breathing for happy, shaking for sad
  const getAnimationProps = () => {
    switch (mood) {
      case "celebrate":
        return {
          y: [0, -25, 0, -15, 0],
          scaleY: [1, 0.85, 1, 0.95, 1],
          transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        };
      case "sad":
        return {
          rotate: [-2, 2, -2],
          y: [0, 4, 0],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        };
      case "thinking":
        return {
          rotate: [-3, 3, -3],
          scale: [1, 1.02, 1],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        };
      case "happy":
      default:
        return {
          y: [0, -6, 0],
          scaleX: [1, 1.02, 1],
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        };
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 select-none p-4">
      <motion.div
        className="w-48 h-48 flex items-center justify-center cursor-pointer"
        animate={getAnimationProps()}
        whileHover={{ scale: 1.05 }}
      >
        <svg viewBox="50 30 200 200" className="w-full h-full drop-shadow-lg">
          {/* Stem/Legs */}
          <path d="M135,190 L130,215 Q125,220 120,215" stroke="#047857" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M165,190 L170,215 Q175,220 180,215" stroke="#047857" strokeWidth="6" strokeLinecap="round" fill="none" />
          
          {/* Main Leaf Body */}
          <path
            d="M150,60 C90,110 90,180 150,195 C210,180 210,110 150,60 Z"
            fill={bodyColor}
            stroke="#047857"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Main Vein */}
          <path d="M150,110 L150,190" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
          <path d="M150,130 Q130,120 115,125" stroke="#059669" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M150,150 Q170,140 185,145" stroke="#059669" strokeWidth="2" strokeLinecap="round" fill="none" />
          
          {/* Cheeks (Blush) */}
          <circle cx="110" cy="144" r="7" fill={cheekColor} opacity="0.6" />
          <circle cx="190" cy="144" r="7" fill={cheekColor} opacity="0.6" />

          {/* Eyes */}
          {renderEyes()}

          {/* Mouth */}
          {renderMouth()}

          {/* Outfit/Accessories */}
          {renderOutfit()}

          {/* Waving Arm */}
          {mood === "celebrate" ? (
            <motion.path
              d="M100,150 Q75,130 80,110"
              stroke="#047857"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              animate={{ rotate: [-10, 15, -10] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ originX: "100px", originY: "150px" }}
            />
          ) : (
            <path d="M100,150 Q80,160 70,150" stroke="#047857" strokeWidth="5" strokeLinecap="round" fill="none" />
          )}
          <path d="M200,150 Q220,160 230,150" stroke="#047857" strokeWidth="5" strokeLinecap="round" fill="none" />
        </svg>
      </motion.div>

      {/* Duolingo style speech bubble */}
      <AnimatePresence mode="wait">
        {speechText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative bg-white border-2 border-emerald-500 rounded-2xl p-5 max-w-sm shadow-md"
          >
            {/* Arrow */}
            <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-emerald-500 hidden md:block"></div>
            <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[10px] border-r-white hidden md:block"></div>
            
            {/* Mobile arrow */}
            <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-emerald-500 md:hidden"></div>
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[10px] border-b-white md:hidden"></div>

            <p className="text-gray-800 font-medium leading-relaxed font-sans">{speechText}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Mascot;
