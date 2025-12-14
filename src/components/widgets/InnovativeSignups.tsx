import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa";
import { formatTimeAgo } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Head } from "../ui/body";

// Basit bir mobil kontrol hook'u
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

export default function InnovativeSignups({ signups, totalUsers }: { signups: any[], totalUsers: number }) {
  const isMobile = useIsMobile();
  // Mobilde son 3, masaüstünde tüm kayıtlar
  const displaySignups = isMobile ? (signups ? signups.slice(-5) : []) : (signups || []);

  return (
    <div className="w-full flex flex-col md:flex-row overflow-hidden shadow-xl pt-10">
      {/* Sol Panel - degrade her zaman görünür, tema uyumlu */}
      <div className="flex flex-col justify-start items-start w-full md:w-1/4 min-w-0 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 dark:from-blue-600 dark:via-blue-500 dark:to-blue-400 pt-6 pb-2 px-4 md:pt-8 md:pb-0 md:px-6 rounded-t-2xl rounded-b-none md:rounded-tl-2xl md:rounded-tr-none md:rounded-bl-none md:rounded-br-none">
        <h3 className="text-gray-900 text-white text-lg sm:text-xl md:text-2xl font-bold mb-1 md:mb-2 drop-shadow dark:drop-shadow-none">Son Kayıtlar</h3>
        <p className="text-gray-800/90 dark:text-white/90 text-white text-xs sm:text-sm md:text-base font-medium mb-1">Sunucumuza kayıt olan toplam <span className="font-bold">{totalUsers}</span> oyuncu!</p>
      </div>
      {/* Sağ Panel */}
      <div className="w-full md:w-3/4 flex items-center justify-center px-2 md:px-6 py-4 md:py-6 gap-2 md:gap-8 rounded-t-none rounded-b-none md:rounded-tr-2xl md:rounded-bl-none md:rounded-br-none bg-white dark:bg-[#0a1121] transition-colors">
        {(!displaySignups || displaySignups.length === 0) ? (
          <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-300">Son zamanlarda yeni katılan olmadı.</p>
        ) : (
          <div className="flex gap-2 md:gap-10 items-center w-full justify-center">
            {displaySignups.map((signup, idx) => (
              <motion.div
                key={signup.id}
                className="flex flex-col items-center px-1 md:px-6 relative min-w-0 max-w-[90px] md:max-w-none group"
                whileHover={{ scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Dikey ayraç */}
                {idx !== 0 && (
                  <span className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 h-12 border-l border-blue-300 dark:border-blue-700/40 dark:border-gray-700/60" />
                )}
                <Head
                    username={signup.username}
                    size={40}
                    className="shadow"
                  />
                <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base text-center break-all truncate w-full group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">
                  {signup.username}
                </span>
                <span className="text-[10px] sm:text-xs md:text-xs text-blue-500 dark:text-blue-100 dark:text-white/60 mt-0.5 md:mt-1">
                  {formatTimeAgo(signup.timestamp)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 