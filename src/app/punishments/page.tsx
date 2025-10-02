"use client";

import React, { useContext, useEffect, useState } from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { AuthContext } from "@/lib/context/auth.context";
import { usePunishmentService } from "@/lib/services/punishment.service";
import { Punishment } from "@/lib/types/punishment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { 
  Ban, 
  MicOff, 
  AlertTriangle,
  Shield,
  Users,
  Clock,
  Search
} from "lucide-react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";
import Loading from "@/components/loading";
import { AnimatePresence, motion } from "framer-motion";

const punishmentTypes = [
  {
    type: "ban",
    title: "Yasaklamalar",
    description: "Sunucudan yasaklanan oyuncuları görüntüleyin",
    icon: Ban,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    href: "/punishments/ban"
  },
  {
    type: "mute",
    title: "Susturulmalar", 
    description: "Susturulan oyuncuları görüntüleyin",
    icon: MicOff,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    href: "/punishments/mute"
  },
  {
    type: "warning",
    title: "Uyarılar",
    description: "Uyarı alan oyuncuları görüntüleyin", 
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    href: "/punishments/warning"
  }
];

export default function PunishmentsPage() {
  const { website } = useContext(WebsiteContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [recentPunishments, setRecentPunishments] = useState<Punishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBans: 0,
    totalMutes: 0,
    totalWarnings: 0
  });

  const { getPunishments } = usePunishmentService();

  useEffect(() => {
    const fetchPunishments = async () => {
      try {
        setLoading(true);
        const response = await getPunishments({ limit: 6 });
        setRecentPunishments(response.punishments || []);
        
        // Calculate stats
        const punishments = response.punishments || [];
        const banCount = punishments.filter(p => p.punishmentType === 'BAN' || p.punishmentType === 'TEMP_BAN').length || 0;
        const muteCount = punishments.filter(p => p.punishmentType === 'MUTE' || p.punishmentType === 'TEMP_MUTE').length || 0;
        const warningCount = punishments.filter(p => p.punishmentType === 'WARNING' || p.punishmentType === 'TEMP_WARNING').length || 0;
        
        setStats({
          totalBans: banCount,
          totalMutes: muteCount,
          totalWarnings: warningCount
        });
      } catch (error) {
        console.error("Error fetching punishments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPunishments();
  }, []);

  if (loading) {
    return <Loading show={true} message="Cezalar yükleniyor..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Cezalar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sunucu cezalarını görüntüleyin ve yönetin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="text-gray-900 dark:text-white font-medium">Cezalar</span>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Toplam Yasaklama</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.totalBans}</p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Toplam Susturma</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.totalMutes}</p>
              </div>
              <MicOff className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Toplam Uyarı</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.totalWarnings}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Punishment Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {punishmentTypes.map((punishment) => {
          const IconComponent = punishment.icon;
          return (
            <Link key={punishment.type} href={punishment.href}>
              <Card className="group bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/80 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
                <CardHeader className="text-center pb-3">
                  <div className={`mx-auto w-16 h-16 rounded-full ${punishment.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${punishment.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {punishment.title}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {punishment.description}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Punishments */}
      {recentPunishments.length > 0 && (
        <Card className="bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/80 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Son Cezalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPunishments.slice(0, 5).map((punishment) => (
                <div key={punishment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar username={punishment.name} size={40} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{punishment.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{punishment.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={punishment.punishmentType.includes('BAN') ? 'destructive' : 
                              punishment.punishmentType.includes('MUTE') ? 'secondary' : 'outline'}
                    >
                      {punishment.punishmentType}
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTimeAgo(punishment.start)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link href="/punishments/ban">
                  Tüm Cezaları Görüntüle
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
