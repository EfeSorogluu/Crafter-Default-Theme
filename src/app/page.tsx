"use client";

import { AuthContext } from "@/lib/context/auth.context";
import { useContext, useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { useServerService } from "@/lib/services/server.service";
import { useStatisticsService } from "@/lib/services/statistics.service";
import { IPublicWebsiteStatistics } from "@/lib/types/statistics";
import { Server } from "@/lib/types/server";
import { formatTimeAgo } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { useWebsitePostsService } from "@/lib/services/posts.service";
import LatestPostCard from "@/components/LatestPostCard";
import InnovativeSignups from "@/components/widgets/InnovativeSignups";

// Lazy load heavy components
const InnovativeCarousel = dynamic(
  () => import("@/components/ui/innovative-carousel").then(mod => ({ default: mod.InnovativeCarousel })),
  {
    ssr: false,
    loading: () => <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
  }
);

const SlideContent = dynamic(
  () => import("@/components/ui/innovative-carousel").then(mod => ({ default: mod.SlideContent })),
  { ssr: false }
);

const AuthForm = dynamic(
  () => import("@/components/widgets/auth-form").then(mod => ({ default: mod.AuthForm })),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
  }
);

const DiscordWidget = dynamic(
  () => import("@/components/widgets/discord-widget"),
  {
    ssr: false,
    loading: () => <div className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
  }
);

// UI ve Widget Component'leri
import Widget from "@/components/widgets/widget";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FaShoppingCart, FaCrown, FaGift, FaUserPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Badge } from "@/components/ui/badge";

// Boş liste durumunda gösterilecek component
const EmptyList = ({ message }: { message: string }) => (
  <p className="text-center text-xs text-gray-500 dark:text-gray-400 p-4">
    {message}
  </p>
);

// Yükleniyor durumunda gösterilecek widget iskeleti
const WidgetSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <Widget>
    <Widget.Header>
      <Skeleton className="h-5 w-3/5" />
    </Widget.Header>
    <Widget.Body>
      <div className="space-y-3 p-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-2 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </Widget.Body>
  </Widget>
);

// Memoized statistics components
const TopCreditLoaders = ({ loaders }: { loaders: any[] }) => (
  <ul className="space-y-1">
    {loaders.map((loader, index) => (
      <li
        key={loader.id}
        className="flex items-center p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-gray-700/40"
      >
        <span className="w-8 text-center text-lg font-bold text-gray-500 dark:text-gray-400">
          #{index + 1}
        </span>
        <Avatar
          username={loader.username}
          size={32}
          className="mx-2"
        />
        <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {loader.username}
        </p>
        <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
          {loader.totalAmount.toFixed(2)} ₺
        </span>
      </li>
    ))}
  </ul>
);

const LatestPayments = ({ payments }: { payments: any[] }) => (
  <ul className="space-y-1">
    {payments.map((payment) => (
      <li
        key={payment.id}
        className="flex items-center p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-gray-700/40"
      >
        <Avatar
          username={payment.username}
          size={32}
          className="mr-3"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {payment.username}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {formatTimeAgo(payment.timestamp)}
          </p>
        </div>
        <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
          {payment.amount.toFixed(2)} ₺
        </span>
      </li>
    ))}
  </ul>
);

const LatestPurchases = ({ purchases }: { purchases: any[] }) => (
  <ul className="space-y-1">
    {purchases.map((purchase) => (
      <li
        key={purchase.id}
        className="flex items-center p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-gray-700/40"
      >
        <Avatar
          username={purchase.username}
          size={32}
          className="mr-3"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {purchase.username}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <Badge className="bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-blue-400/20 text-blue-700 dark:text-cyan-200 font-semibold shadow-[0_4px_32px_0_rgba(34,211,238,0.12)] scale-105 border-0">{purchase.productName}</Badge> ürününü satın aldı!
          </p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {formatTimeAgo(purchase.timestamp)}
        </span>
      </li>
    ))}
  </ul>
);

const LatestSignups = ({ signups }: { signups: any[] }) => (
  <ul className="space-y-1">
    {signups.map((signup) => (
      <li
        key={signup.id}
        className="flex items-center p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-gray-700/40"
      >
        <Avatar
          username={signup.username}
          size={32}
          className="mr-3"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {signup.username}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Aramıza katıldı
          </p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {formatTimeAgo(signup.timestamp)}
        </span>
      </li>
    ))}
  </ul>
);

export default function Home() {
  const { isAuthenticated } = useContext(AuthContext);
  const { website } = useContext(WebsiteContext);
  const { getServers } = useServerService();
  const { getStatistics } = useStatisticsService();
  const { getPosts } = useWebsitePostsService(website?.id);
  const [server, setServer] = useState<Server | null>(null);
  const [statistics, setStatistics] = useState<IPublicWebsiteStatistics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [latestPosts, setLatestPosts] = useState<any[] | null>(null);
  const [isPostsLoading, setIsPostsLoading] = useState(true);

  // Memoized carousel items
  const carouselItems = useMemo(() =>
    website?.sliders?.map((slider) => ({
      id: slider.id,
      content: (
        <SlideContent
          image={`${process.env.NEXT_PUBLIC_BACKEND_URL}${slider.image}`}
          title={slider.text}
          description={slider.description}
          buttonText={slider.buttonText}
          buttonLink={slider.route}
        />
      ),
    })) || [], [website?.sliders]
  );

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    // Website ID yüklenene kadar bekle
    if (!website?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      const [servers, stats] = await Promise.all([
        getServers(),
        getStatistics()
      ]);

      setServer(servers.find((server) => server.port === 25565) || servers[0]);
      setStatistics(stats);
    } catch (err) {
      withReactContent(Swal).fire({
        title: "Hata!",
        text: "İstatistikler yüklenirken bir hata oluştu.",
        icon: "error",
        confirmButtonText: "Tamamdır.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [website?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Son gönderileri çek
    const fetchPosts = async () => {
      if (!website?.id) return; // id yoksa fetch etme
      try {
        const res = await getPosts({ websiteId: website.id, params: { limit: 5, sortBy: 'createdAt', sortOrder: 'desc', status: 'published' } });

        setLatestPosts(res.data);
      } catch {
        setLatestPosts([]);
      } finally {
        setIsPostsLoading(false);
      }
    };
    fetchPosts();
  }, [website?.id]);

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 pb-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-12 items-start">
          <div
            className={`${!isAuthenticated ? "lg:col-span-8" : "lg:col-span-9"
              } space-y-4 sm:space-y-6 order-2 lg:order-1`}
          >
            {carouselItems.length > 0 && (
              <Suspense fallback={<div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />}>
                <InnovativeCarousel
                  items={carouselItems}
                  autoplay={true}
                  autoplayDelay={5000}
                  showProgress={true}
                  height="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
                />
              </Suspense>
            )}
            {/* Son Gönderiler - Carousel altı yatay kartlar */}
            <div className="mt-6 space-y-4">
              {isPostsLoading ? (
                <WidgetSkeleton lines={2} />
              ) : latestPosts && latestPosts.length > 0 ? (
                [...latestPosts].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
                  .map((post) => (
                    <LatestPostCard key={post.id} post={post} />
                  ))
              ) : (
                <EmptyList message="Henüz gönderi yok." />
              )}
            </div>
          </div>

          <div
            className={`${!isAuthenticated ? "lg:col-span-4" : "lg:col-span-3"
              } space-y-4 sm:space-y-6 order-1 lg:order-2`}
          >
            {!isAuthenticated && (
              <div className="relative z-10">
                <Suspense fallback={<div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />}>
                  <AuthForm asWidget={true} />
                </Suspense>
              </div>
            )}

            {isLoading ? (
              <>
                <WidgetSkeleton lines={5} />
                <WidgetSkeleton lines={3} />
              </>
            ) : statistics ? (
              <>
                {/* En Cömertler Widget */}
                <Widget>
                  <Widget.Header>
                    <FaCrown className="inline mr-2 text-yellow-400" />
                    En Cömertler
                  </Widget.Header>
                  <Widget.Body>
                    {statistics.topCreditLoaders &&
                      statistics.topCreditLoaders.length > 0 ? (
                      <TopCreditLoaders loaders={statistics.topCreditLoaders} />
                    ) : (
                      <EmptyList message="Henüz kimse kredi yüklemedi." />
                    )}
                  </Widget.Body>
                </Widget>

                {/* Son Kredi Yüklemeleri Widget */}
                <Widget>
                  <Widget.Header>
                    <FaGift className="inline mr-2 text-green-500" />
                    Son Kredi Yüklemeleri
                  </Widget.Header>
                  <Widget.Body>
                    {statistics.latest.payments &&
                      statistics.latest.payments.length > 0 ? (
                      <LatestPayments payments={statistics.latest.payments} />
                    ) : (
                      <EmptyList message="Son zamanlarda kredi yüklenmedi." />
                    )}
                  </Widget.Body>
                </Widget>

                <Widget>
                  <Widget.Header>
                    <FaShoppingCart className="inline mr-2 text-blue-500" />
                    Son Alışverişler
                  </Widget.Header>
                  <Widget.Body>
                    {statistics.latest.purchases &&
                      statistics.latest.purchases.length > 0 ? (
                      <LatestPurchases purchases={statistics.latest.purchases} />
                    ) : (
                      <EmptyList message="Son zamanlarda alışveriş yapılmadı." />
                    )}
                  </Widget.Body>
                </Widget>
              </>
            ) : (
              <EmptyList message="İstatistikler yüklenemedi." />
            )}

            {website?.discord && (
              <div className="">
                <Suspense fallback={<div className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />}>
                  <DiscordWidget guild_id={website?.discord.guild_id ?? ""} />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
