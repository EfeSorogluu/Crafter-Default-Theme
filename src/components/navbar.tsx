"use client";

import Link from "next/link";
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Wallet,
  CoinsIcon,
  BoxIcon,
  UserIcon,
  ChevronDown,
  Bell,
  Settings,
  Wrench,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthContext } from "@/lib/context/auth.context";
import { useContext, useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { WebsiteContext } from "@/lib/context/website.context";
import { Avatar } from "./ui/avatar";
import { useCart } from "@/lib/context/cart.context";
import { Badge } from "./ui/badge";
import { Head } from "./ui/head";
import { IconRenderer } from "@/components/ui/icon-renderer";

const formatBalance = (balance: number | undefined): string => {
  if (balance === undefined || balance === null) return "0.00";
  return balance.toFixed(2);
};

export function Navbar() {
  const { isAuthenticated, user, signOut } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const { website } = useContext(WebsiteContext);
  const { cart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getLinkClassName = (path: string) => {
    const isActive =
      path === "/"
        ? pathname === "/"
        : pathname.startsWith(path) && path !== "/";
    return `relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
      isActive
        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
    }`;
  };

  const navigationItems = website?.theme.navbar;

  const userMenuItems = useMemo(() => {
    const baseItems = [
      { href: "/profile", icon: User, label: "Profilim" },
      { href: "/wallet", icon: Wallet, label: "Cüzdanım" },
      { href: "/chest", icon: BoxIcon, label: "Sandığım" },
      { href: "/gift", icon: Gift, label: "Hediye" },
      { href: "/settings", icon: Settings, label: "Ayarlar" },
    ];

    // Admin panel item'ını sadece yetkisi varsa ekle
    if (user?.role?.permissions?.length && user.role.permissions.length > 0) {
      return [...baseItems, { href: "/admin", icon: Wrench, label: "Yönetim Paneli" }];
    }

    return baseItems;
  }, [user?.role.permissions.length]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-all duration-300 ${
        isScrolled
          ? "shadow-sm border-gray-200/60 dark:border-gray-800/60"
          : "border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand - Sol */}
          <div className="flex items-center gap-8">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className={getLinkClassName(item.url)}
                >
                  <IconRenderer iconName={item.icon} className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Sağ taraf - Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell className="w-5 h-5" />
              {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-semibold bg-blue-600 text-white"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 py-1 h-auto rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Head
                      username={user?.username || "steve"}
                      size={32}
                      className="w-8 h-8 rounded-lg"
                    />
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.username}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <CoinsIcon className="w-3 h-3" />
                        {formatBalance(user?.balance)} {website?.currency}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CoinsIcon className="w-3 h-3" />
                        {formatBalance(user?.balance)} {website?.currency}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <DropdownMenuItem>
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </DropdownMenuItem>
                      </Link>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/sign-in">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button
                    size="sm"
                    className="text-sm bg-blue-600 hover:bg-blue-700"
                  >
                    Kayıt Ol
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 px-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Navigation */}
                    <nav className="flex-1 px-4 py-4">
                      <div className="space-y-2">
                        {navigationItems?.map((item) => (
                          <Link
                            key={item.url}
                            href={item.url}
                            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                              pathname === item.url
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <IconRenderer
                                iconName={item.icon}
                                className="w-5 h-5"
                              />
                              {item.label}
                            </div>
                          </Link>
                        ))}

                        <Link
                          href="/cart"
                          className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            pathname === "/cart"
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <ShoppingCart className="w-5 h-5" />
                              {totalItems > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600 text-white"
                                >
                                  {totalItems}
                                </Badge>
                              )}
                            </div>
                            Sepet
                          </div>
                        </Link>
                      </div>
                    </nav>

                    {/* Mobile User Section */}
                    <div className="px-4 py-4 border-t">
                      {isAuthenticated ? (
                        <div className="space-y-4">
                          {/* User Info */}
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Head
                              username={user?.username || "steve"}
                              size={40}
                              className="w-10 h-10 rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user?.username}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <CoinsIcon className="w-3 h-3" />
                                {formatBalance(user?.balance)}{" "}
                                {website?.currency}
                              </p>
                            </div>
                          </div>

                          {/* User Menu Items */}
                          <div className="space-y-1">
                            {userMenuItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link key={item.href} href={item.href}>
                                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          <Button
                            onClick={signOut}
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Çıkış Yap
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <UserIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Giriş Yapın
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Tüm özelliklerden faydalanın
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link href="/auth/sign-in" className="flex-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Giriş Yap
                              </Button>
                            </Link>
                            <Link href="/auth/sign-up" className="flex-1">
                              <Button
                                size="sm"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                Kayıt Ol
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
