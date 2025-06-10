import { motion } from 'framer-motion';

export const LLAnguageLogo = () => {
  return (
    <div className="flex flex-col items-start">
      {/* Main Logo */}
      <div className="relative flex items-center gap-1">
        {/* LLA in Rainbow Box */}
        <motion.div
          className="relative overflow-hidden rounded-lg p-2 md:p-2.5"
          style={{
            background: 'linear-gradient(135deg, #ffb3ba, #ffdfba, #ffffba, #baffc9, #bae1ff, #d4baff, #ffb3d9)'
          }}
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 25px rgba(255, 255, 255, 0.6)"
          }}
        >
          {/* Subtle shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
          
          <motion.span
            className="text-gray-700 font-black text-lg md:text-xl tracking-tight relative z-10 drop-shadow-sm"
            animate={{ 
              textShadow: [
                "1px 1px 2px rgba(0,0,0,0.1)",
                "1px 1px 4px rgba(0,0,0,0.15)",
                "1px 1px 2px rgba(0,0,0,0.1)"
              ]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            LLA
          </motion.span>
          
          {/* Twinkling stars inside the box */}
          <motion.div
            className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-white rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1
            }}
          />
        </motion.div>
        
        {/* "nguage" text */}
        <motion.span
          className="text-blue-600 font-bold text-xl md:text-2xl tracking-tight cursor-pointer select-none"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ 
            color: "#3b82f6",
            textShadow: "0 0 8px rgba(59, 130, 246, 0.3)"
          }}
        >
          nguage
        </motion.span>
        
        {/* Floating sparkles around the logo */}
        <motion.div
          className="absolute -top-2 left-8 w-1 h-1 rounded-full"
          style={{ background: 'linear-gradient(45deg, #ffb3ba, #bae1ff)' }}
          animate={{
            y: [-3, 3, -3],
            scale: [0.8, 1.2, 0.8],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-1 right-4 w-0.5 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(45deg, #baffc9, #ffffba)' }}
          animate={{
            y: [2, -2, 2],
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8
          }}
        />
      </div>
    </div>
  );
};

