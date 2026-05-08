import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute gap-x-[10px] gap-y-[10px] grid-cols-[repeat(1,fit-content(100%))] grid-rows-[repeat(1,fit-content(100%))] inline-grid left-1/2 -translate-x-1/2 p-[10px] top-1/2 -translate-y-1/2"
      data-name="Logo"
    >
      <div className="col-1 flex flex-col font-['Unbounded',sans-serif] font-medium justify-center justify-self-start leading-[0] relative row-1 self-start shrink-0 text-[#1e334c] text-[47.57px] text-center tracking-[-1.9028px] whitespace-nowrap">
        <p className="leading-[1.1]">BlueCore</p>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Fade in (0.8s) + hold (1s) + fade out (0.8s) = 2.6s total
    const timer = setTimeout(() => {
      navigate("/app");
    }, 2600);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-[#dfebfe] relative size-full"
      data-name="Landing"
    >
      <Logo />
    </motion.div>
  );
}
