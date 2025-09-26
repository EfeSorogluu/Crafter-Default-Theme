"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useVoteService } from "@/lib/services/vote.service";
import { VoteProvider } from "@/lib/types/vote";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/lib/context/auth.context";
import { FaVoteYea, FaCheckCircle, FaExclamationCircle, FaClock, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/widgets/auth-form").then(mod => ({ default: mod.AuthForm })), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
});

export default function VoteProviderPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = params.provider_id as string;
  const { sendVote, getProvider } = useVoteService();
  const { isAuthenticated, isLoading, user } = React.useContext(AuthContext);
  const [provider, setProvider] = useState<VoteProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Kullanıcının oy kullanabilir durumunu kontrol et
  const canVote = () => {
    if (!user?.nextVoteAt) return true;
    return new Date() > new Date(user.nextVoteAt);
  };

  // Kalan süreyi hesapla
  const getTimeUntilNextVote = () => {
    if (!user?.nextVoteAt) return null;
    const nextVoteDate = new Date(user.nextVoteAt);
    const now = new Date();
    const diff = nextVoteDate.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/sign-in?return=/vote");
      return;
    }
    if (!isAuthenticated) return;

    setLoading(true);
    getProvider(providerId)
      .then((data) => {
        if (!data.isActive) {
          setError("Bu vote provider aktif değil.");
          return;
        }
        setProvider(data);
      })
      .catch(() => setError("Vote provider bulunamadı."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router, providerId]);

  const handleVote = async () => {
    if (!canVote()) {
      setError("Henüz oy veremezsiniz. Lütfen bekleyin.");
      return;
    }

    setVoting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendVote(providerId);
      if (result.status) {
        setSuccess(result.message);
        // Sayfayı yenile ki kullanıcının nextVoteAt bilgisi güncellensin
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Oy gönderilirken bir hata oluştu.");
    } finally {
      setVoting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-6">
          <FaVoteYea className="mx-auto text-5xl text-blue-500 mb-2" />
          <h1 className="text-3xl font-bold text-center">Oy Ver</h1>
        </div>
        <Suspense fallback={<div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />}>
          <AuthForm asWidget={true} />
        </Suspense>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Yükleniyor...</p>
      </div>
    );
  }

  if (error && !provider) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <FaExclamationCircle className="text-5xl text-red-500 mb-2" />
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl px-6 py-4 text-center font-semibold shadow mb-4">
          {error}
        </div>
        <Button onClick={() => router.push('/vote')} className="bg-blue-600 hover:bg-blue-700 text-white">
          <FaArrowLeft className="inline mr-2" />
          Geri Dön
        </Button>
      </div>
    );
  }

  if (!provider) return null;

  // Provider logo URL'sini belirle
  const getProviderLogo = (type: string) => {
    switch (type) {
      case 'serversmc':
        return '/images/vote-providers/smc.webp';
      default:
        return null;
    }
  };

  const logoUrl = provider.logo || getProviderLogo(provider.type);

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${provider.type} logo`}
                width={80}
                height={80}
                className="mx-auto mb-4 rounded-xl"
              />
            ) : (
              <FaVoteYea className="mx-auto text-5xl text-blue-500 mb-4" />
            )}
            <h1 className="text-4xl font-extrabold mb-2">Oy Ver</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {provider.type === 'serversmc' ? 'ServersMC' : provider.type} üzerinden oy verin
            </p>
          </div>

          <Card className="shadow-lg border-2 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={`${provider.type} logo`}
                    width={24}
                    height={24}
                    className="rounded"
                  />
                ) : (
                  <FaVoteYea className="inline text-lg" />
                )}
                {provider.type === 'serversmc' ? 'ServersMC' : provider.type}
              </CardTitle>
              <CardDescription>
                Bu platform üzerinden sunucumuza oy verebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vote Status */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {canVote() ? (
                    <>
                      <FaCheckCircle className="text-green-500" />
                      Oy Verebilirsiniz
                    </>
                  ) : (
                    <>
                      <FaClock className="text-yellow-500" />
                      Bekleme Süresi
                    </>
                  )}
                </h3>
                {!canVote() && user?.nextVoteAt && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sonraki oy: {new Date(user.nextVoteAt).toLocaleString('tr-TR')}
                  </p>
                )}
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg px-4 py-3 text-center font-semibold">
                  {success}
                </div>
              )}

              {error && (
                <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-center font-semibold">
                  {error}
                </div>
              )}

              {/* Vote Button */}
              <Button
                onClick={handleVote}
                disabled={!canVote() || voting}
                className={`w-full font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 ${
                  canVote() && !voting
                    ? 'bg-green-600 hover:bg-green-700 hover:scale-105 text-white'
                    : 'bg-gray-400 cursor-not-allowed text-white'
                }`}
              >
                {voting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Oy Gönderiliyor...
                  </>
                ) : canVote() ? (
                  <>
                    <FaVoteYea className="inline mr-2" />
                    Oy Ver
                  </>
                ) : (
                  <>
                    <FaClock className="inline mr-2" />
                    Bekleme Süresinde
                  </>
                )}
              </Button>

              {/* Back Button */}
              <Button
                onClick={() => router.push('/vote')}
                variant="outline"
                className="w-full"
              >
                <FaArrowLeft className="inline mr-2" />
                Geri Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
