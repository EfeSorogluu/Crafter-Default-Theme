"use client";

import React, { useContext, useEffect, useState } from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { AuthContext } from "@/lib/context/auth.context";
import { usePunishmentService } from "@/lib/services/punishment.service";
import { Punishment } from "@/lib/types/punishment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { 
  Search, 
  ArrowUpDown, 
  ArrowDown, 
  ArrowUp, 
  Ban, 
  MicOff, 
  AlertTriangle,
  Clock,
  User,
  Shield
} from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/loading";
import { formatTimeAgo } from "@/lib/utils";


const punishmentTypeMap: Record<string, { title: string; description: string; color: string }> = {
  ban: {
    title: "Yasaklamalar",
    description: "Sunucudan yasaklanan oyuncuları görüntüleyin",
    color: "text-pink-500"
  },
  mute: {
    title: "Susturulmalar",
    description: "Susturulan oyuncuları görüntüleyin", 
    color: "text-purple-500"
  },
  warning: {
    title: "Uyarılar",
    description: "Uyarı alan oyuncuları görüntüleyin",
    color: "text-yellow-500"
  }
};

function formatDate(dateInput: string): string {
  let date: Date;
  
  // Check if it's a timestamp (numeric string) or ISO date string
  if (/^\d+$/.test(dateInput)) {
    // It's a timestamp
    date = new Date(parseInt(dateInput));
  } else {
    // It's an ISO date string
    date = new Date(dateInput);
  }
  
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(start: string, end: string): string {
  if (end === '-1') {
    return 'Kalıcı';
  }
  
  let startDate: Date;
  let endDate: Date;
  
  // Check if start is a timestamp (numeric string) or ISO date string
  if (/^\d+$/.test(start)) {
    startDate = new Date(parseInt(start));
  } else {
    startDate = new Date(start);
  }
  
  // Check if end is a timestamp (numeric string) or ISO date string
  if (/^\d+$/.test(end)) {
    endDate = new Date(parseInt(end));
  } else {
    endDate = new Date(end);
  }
  
  const diffMs = endDate.getTime() - startDate.getTime();
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} gün`;
  } else if (hours > 0) {
    return `${hours} saat`;
  } else {
    return `${minutes} dakika`;
  }
}

export default function PunishmentTypePage({ 
  params 
}: { 
  params: Promise<{ punishment_type: string }> 
}) {
  const { website } = useContext(WebsiteContext);
  const { isAuthenticated } = useContext(AuthContext);
  
  const [punishmentType, setPunishmentType] = useState<string>("");
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const { getPunishmentsByType, searchPunishments } = usePunishmentService();

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setPunishmentType(resolvedParams.punishment_type);
    };
    resolveParams();
  }, [params]);

  if (!punishmentType || !punishmentTypeMap[punishmentType]) {
    if (punishmentType && !punishmentTypeMap[punishmentType]) {
      notFound();
    }
    return <Loading show={true} message="Sayfa yükleniyor..." />;
  }

  const typeInfo = punishmentTypeMap[punishmentType];

  useEffect(() => {
    const fetchPunishments = async () => {
      try {
        setLoading(true);
        let response;
        
        if (searchQuery.trim()) {
          response = await searchPunishments({
            query: searchQuery,
            type: punishmentType.toUpperCase(),
            page: currentPage,
            limit: 10
          });
        } else {
          response = await getPunishmentsByType(
            punishmentType.toUpperCase(),
            currentPage,
            10
          );
        }
        
        setPunishments(response.punishments || []);
        setPagination(response.pagination || {
          page: currentPage,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        });
      } catch (error) {
        console.error("Error fetching punishments:", error);
        setPunishments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPunishments();
  }, [punishmentType, currentPage, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

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
              {typeInfo.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {typeInfo.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {punishmentType === 'ban' && <Ban className="w-8 h-8 text-red-500" />}
            {punishmentType === 'mute' && <MicOff className="w-8 h-8 text-purple-500" />}
            {punishmentType === 'warning' && <AlertTriangle className="w-8 h-8 text-yellow-500" />}
          </div>
        </div>
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/punishments" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Cezalar
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{typeInfo.title}</span>
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Oyuncu adı ara..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">
            Ara
          </Button>
        </form>
      </div>

      {/* Punishments List */}
      <Card className="bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/80 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {typeInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {punishments.length > 0 ? (
            <div className="space-y-4">
              {punishments.map((punishment) => (
                <div key={punishment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar username={punishment.name} size={48} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{punishment.name}</h3>
                        <Badge 
                          variant={punishment.punishmentType.includes('BAN') ? 'destructive' : 
                                  punishment.punishmentType.includes('MUTE') ? 'secondary' : 'outline'}
                        >
                          {punishment.punishmentType}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {punishment.reason === 'none' ? 'Sebep belirtilmemiş' : punishment.reason}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{punishment.operator}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(punishment.start)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{formatDuration(punishment.start, punishment.end)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Henüz {typeInfo.title.toLowerCase()} bulunmuyor
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Bu kategoride henüz ceza kaydı bulunmuyor.
              </p>
            </div>
          )}
          
          {punishments.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {pagination.total} kayıttan {((pagination.page - 1) * pagination.limit) + 1} ila {Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!pagination.hasPrev}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium">
                  {pagination.page} / {pagination.totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!pagination.hasNext}
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
