"use client";

import { useState, useContext } from "react";
import { AuthContext } from "@/lib/context/auth.context";
import { WebsiteContext } from "@/lib/context/website.context";
import { useUserService } from "@/lib/services/user.service";
import { giftService } from "@/lib/services/giftService";
import { User } from "@/lib/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  Gift,
  Search,
  Loader2,
  Send,
  X,
  Wallet,
  User as UserIcon,
} from "lucide-react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

export default function GiftClient() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { website } = useContext(WebsiteContext);
  const currency = website?.currency || "TRY";

  const { getUserById } = useUserService();
  const service = giftService();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Amount state
  const [amount, setAmount] = useState("");

  // UI state
  const [isSending, setIsSending] = useState(false);

  const handleSearchUser = async () => {
    if (!searchQuery.trim()) {
      withReactContent(Swal).fire({
        title: "Uyarı",
        text: "Lütfen bir kullanıcı adı girin.",
        icon: "warning",
        confirmButtonText: "Tamam",
      });
      return;
    }

    try {
      setIsSearching(true);
      const foundUser = await getUserById(searchQuery.trim());

      if (foundUser.id === user?.id) {
        withReactContent(Swal).fire({
          title: "Hata",
          text: "Kendinize hediye gönderemezsiniz.",
          icon: "error",
          confirmButtonText: "Tamam",
        });
        setSelectedUser(null);
        return;
      }

      setSelectedUser(foundUser);
      setSearchQuery("");
    } catch (err: any) {
      console.error("Failed to find user:", err);
      withReactContent(Swal).fire({
        title: "Kullanıcı Bulunamadı",
        text: "Aradığınız kullanıcı bulunamadı. Kullanıcı adını kontrol edin.",
        icon: "error",
        confirmButtonText: "Tamam",
      });
      setSelectedUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchUser();
    }
  };

  const handleSendGift = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      withReactContent(Swal).fire({
        title: "Giriş Gerekli",
        text: "Hediye göndermek için giriş yapmanız gerekiyor.",
        icon: "warning",
        confirmButtonText: "Tamam",
      });
      return;
    }

    if (!selectedUser) {
      withReactContent(Swal).fire({
        title: "Kullanıcı Seçin",
        text: "Lütfen hediye göndermek için bir kullanıcı seçin.",
        icon: "warning",
        confirmButtonText: "Tamam",
      });
      return;
    }

    if (selectedUser.id === user.id) {
      withReactContent(Swal).fire({
        title: "Hata",
        text: "Kendinize hediye gönderemezsiniz.",
        icon: "error",
        confirmButtonText: "Tamam",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      withReactContent(Swal).fire({
        title: "Geçersiz Tutar",
        text: "Lütfen geçerli bir tutar girin.",
        icon: "warning",
        confirmButtonText: "Tamam",
      });
      return;
    }

    if (user.balance < amountValue) {
      withReactContent(Swal).fire({
        title: "Yetersiz Bakiye",
        text: "Gönderilecek tutar mevcut bakiyenizden fazla.",
        icon: "error",
        confirmButtonText: "Tamam",
      });
      return;
    }

    try {
      setIsSending(true);

      const response = await service.sendGift("me", {
        targetUserId: selectedUser.id,
        amount: amountValue,
      });

      if (response.success) {
        withReactContent(Swal).fire({
          title: "Başarılı!",
          text: `${amountValue.toFixed(2)} ${currency} başarıyla ${
            selectedUser.username
          } kullanıcısına gönderildi!`,
          icon: "success",
          confirmButtonText: "Tamam",
          timer: 3000,
        });

        // Reset form
        setSelectedUser(null);
        setAmount("");

        // Reload user data to update balance
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        withReactContent(Swal).fire({
          title: "Hata!",
          text: response.message || "Hediye gönderilemedi.",
          icon: "error",
          confirmButtonText: "Tamam",
        });
      }
    } catch (err: any) {
      console.error("Failed to send gift:", err);
      withReactContent(Swal).fire({
        title: "Hata!",
        text:
          err?.response?.data?.message ||
          "Hediye gönderilirken bir hata oluştu.",
        icon: "error",
        confirmButtonText: "Tamam",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="shadow-lg">
          <CardContent className="p-12">
            <div className="text-center">
              <Gift className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                Giriş Gerekli
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Hediye göndermek için giriş yapmanız gerekiyor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="h-8 w-8 text-pink-600 dark:text-pink-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Hediye Gönder
          </h1>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 border-amber-200 dark:border-amber-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Mevcut Bakiye
                </p>
                <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  {user?.balance?.toFixed(2) || "0.00"} {currency}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-amber-500 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Send className="h-5 w-5" />
            Hediye İşlemi
          </CardTitle>
          <Separator />
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSendGift} className="space-y-6">
            {/* Search Section */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium">
                Kullanıcı Ara
              </Label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Kullanıcı adını yazın..."
                    className="pl-10 h-12"
                    disabled={isSending || isSearching}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSearchUser}
                  disabled={!searchQuery.trim() || isSending || isSearching}
                  className="h-12 px-6"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Aranıyor...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Ara
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Selected User Display */}
            {selectedUser && (
              <>
                <div className="space-y-2">
                  <Label className="text-base font-medium">Seçilen Kullanıcı</Label>
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-blue-200 dark:bg-blue-700 flex-shrink-0">
                          <Image
                            src={`https://mc-heads.net/avatar/${selectedUser.username}/64`}
                            alt={selectedUser.username}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold text-blue-800 dark:text-blue-200 truncate">
                            {selectedUser.username}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                            {selectedUser.email || "E-posta bilgisi yok"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedUser(null)}
                          className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-base font-medium">
                    Hediye Tutarı
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      disabled={isSending}
                      className="h-12 pr-16 text-lg font-semibold"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-base font-bold text-gray-400 pointer-events-none">
                      {currency}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gönderilebilir maksimum tutar:{" "}
                    <span className="font-semibold">
                      {user?.balance?.toFixed(2) || "0.00"} {currency}
                    </span>
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={
                    !selectedUser ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    isSending ||
                    (user?.balance || 0) < parseFloat(amount || "0")
                  }
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Hediye Gönder
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Empty State */}
            {!selectedUser && (
              <div className="text-center py-12">
                <UserIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Kullanıcı Seçilmedi
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Hediye göndermek için yukarıdaki arama kutusunu kullanarak bir
                  kullanıcı arayın.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="mt-6">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1">Hediye Gönderme Hakkında</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                  <li>Sadece kayıtlı kullanıcılara hediye gönderebilirsiniz</li>
                  <li>Gönderilen hediye anında alıcının hesabına yansır</li>
                  <li>İşlem sonrası bakiyeniz otomatik olarak güncellenir</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
