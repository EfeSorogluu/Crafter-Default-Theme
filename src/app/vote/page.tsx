"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useVoteService } from "@/lib/services/vote.service";
import { VoteProvider } from "@/lib/types/vote";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/lib/context/auth.context";
import { FaVoteYea, FaCheckCircle, FaExclamationCircle, FaClock } from "react-icons/fa";
import Image from "next/image";
import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/widgets/auth-form").then(mod => ({ default: mod.AuthForm })), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
});

export default function VotePage() {
  const router = useRouter();
  const { getProviders } = useVoteService();
  const { isAuthenticated, isLoading, user } = React.useContext(AuthContext);
  const [providers, setProviders] = useState<VoteProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kullanıcının oy kullanabilir durumunu kontrol et
  const canVote = () => {
    if (!user?.nextVoteAt) return true;
    return new Date() > new Date(user.nextVoteAt);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/sign-in?return=/vote");
      return;
    }
    if (!isAuthenticated) return;

    setLoading(true);
    getProviders()
      .then((data) => setProviders(data.filter(p => p.isActive)))
      .catch(() => setError("Vote provider'ları yüklenemedi."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router]);

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

  if (error) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <FaExclamationCircle className="text-5xl text-red-500 mb-2" />
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl px-6 py-4 text-center font-semibold shadow mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <FaVoteYea className="mx-auto text-5xl text-blue-500 mb-2" />
          <h1 className="text-4xl font-extrabold mb-2">Oy Ver</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Sunucumuza oy vererek bize destek olabilirsiniz. Aşağıdaki platformlardan birini seçin.
          </p>
          
          {/* Vote Status */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto mb-6">
            <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
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
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : providers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <FaExclamationCircle className="text-4xl text-yellow-500 mb-2" />
              <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-xl px-6 py-4 text-center font-semibold shadow">
                Şu anda aktif vote provider bulunmuyor.
              </div>
            </div>
          ) : (
            providers.map((provider) => {
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
                <Card key={provider.id} className="shadow-lg border-2 border-blue-100 dark:border-blue-900 hover:scale-[1.025] transition-transform">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={`${provider.type} logo`}
                          width={32}
                          height={32}
                          className="rounded-lg"
                        />
                      ) : (
                        <FaVoteYea className="inline text-lg" />
                      )}
                      {provider.type === 'serversmc' ? 'ServersMC' : provider.type}
                    </CardTitle>
                    <CardDescription>
                      {provider.type === 'serversmc' 
                        ? 'ServersMC platformu üzerinden oy verin' 
                        : `${provider.type} platformu üzerinden oy verin`
                      }
                    </CardDescription>
                  </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => router.push(`/vote/${provider.id}`)} 
                    className={`w-full font-semibold py-2 rounded-xl shadow ${
                      canVote() 
                        ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105' 
                        : 'bg-gray-400 cursor-not-allowed text-white'
                    }`}
                    disabled={!canVote()}
                  >
                    {canVote() ? (
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
                </CardContent>
              </Card>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
