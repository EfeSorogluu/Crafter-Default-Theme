"use client";

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/lib/context/auth.context";
import { WebsiteContext } from "@/lib/context/website.context";
import { useUserService } from "@/lib/services/user.service";
import { giftService } from "@/lib/services/giftService";
import { useChestService } from "@/lib/services/chest.service";
import { User } from "@/lib/types/user";
import { ChestItem } from "@/lib/types/chest";
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
  CheckCircle,
  Box,
} from "lucide-react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

export default function GiftClient() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { website } = useContext(WebsiteContext);
  const currency = website?.currency || "TRY";

  const { getUserById } = useUserService();
  const service = giftService();
  const { getChestItems } = useChestService();

  // Gift type state
  const [giftType, setGiftType] = useState<"balance" | "item">("balance");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Amount state (for balance gifts)
  const [amount, setAmount] = useState("");

  // Chest items state (for item gifts)
  const [chestItems, setChestItems] = useState<ChestItem[]>([]);
  const [selectedChestItem, setSelectedChestItem] = useState<ChestItem | null>(null);
  const [isLoadingChestItems, setIsLoadingChestItems] = useState(false);

  // UI state
  const [isSending, setIsSending] = useState(false);

  // Load chest items when gift type changes to "item"
  useEffect(() => {
    if (giftType === "item" && isAuthenticated && user) {
      const loadChestItems = async () => {
        try {
          setIsLoadingChestItems(true);
          const items = await getChestItems(user.id);
          // Filter only unused items
          setChestItems(items.filter(item => !item.used));
        } catch (err) {
          console.error("Failed to load chest items:", err);
          setChestItems([]);
        } finally {
          setIsLoadingChestItems(false);
        }
      };
      loadChestItems();
    } else {
      setChestItems([]);
      setSelectedChestItem(null);
    }
  }, [giftType, isAuthenticated, user]);

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

    // Validate based on gift type
    if (giftType === "balance") {
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
    } else if (giftType === "item") {
      if (!selectedChestItem) {
        withReactContent(Swal).fire({
          title: "Item Seçin",
          text: "Lütfen göndermek için bir item seçin.",
          icon: "warning",
          confirmButtonText: "Tamam",
        });
        return;
      }
    }

    try {
      setIsSending(true);

      if (giftType === "balance") {
        const amountValue = parseFloat(amount);
        const response = await service.sendBalanceGift("me", {
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
      } else if (giftType === "item" && selectedChestItem && website) {
        const response = await service.sendChestItemGift(
          website.id,
          user.id,
          selectedUser.id,
          selectedChestItem.id
        );

        if (response.success) {
          withReactContent(Swal).fire({
            title: "Başarılı!",
            text: `${selectedChestItem.product.name} başarıyla ${
              selectedUser.username
            } kullanıcısına gönderildi!`,
            icon: "success",
            confirmButtonText: "Tamam",
            timer: 3000,
          });

          // Reset form
          setSelectedUser(null);
          setSelectedChestItem(null);

          // Reload chest items
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
            {/* Gift Type Selection */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Hediye Türü</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={giftType === "balance" ? "default" : "outline"}
                  onClick={() => {
                    setGiftType("balance");
                    setSelectedChestItem(null);
                  }}
                  className="h-14 text-base font-semibold"
                  disabled={isSending}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Kredi Gönder
                </Button>
                <Button
                  type="button"
                  variant={giftType === "item" ? "default" : "outline"}
                  onClick={() => {
                    setGiftType("item");
                    setAmount("");
                  }}
                  className="h-14 text-base font-semibold"
                  disabled={isSending}
                >
                  <Box className="w-5 h-5 mr-2" />
                  Item Gönder
                </Button>
              </div>
            </div>

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

            {/* Chest Items Selection (only for item gifts) */}
            {giftType === "item" && (
              <div className="space-y-2">
                <Label className="text-base font-medium">Item Seçin</Label>
                {isLoadingChestItems ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : chestItems.length === 0 ? (
                  <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <Box className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Sandığınızda kullanılabilir item yok.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {chestItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedChestItem(item)}
                        className={`relative rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                          selectedChestItem?.id === item.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                        }`}
                        disabled={isSending}
                      >
                        {selectedChestItem?.id === item.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-3xl">
                            🎁
                          </div>
                          <p className="font-semibold text-sm text-center line-clamp-2">
                            {item.product.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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

                {/* Amount Input (only for balance gifts) */}
                {giftType === "balance" && (
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
                )}

                {/* Selected Item Display (only for item gifts) */}
                {giftType === "item" && selectedChestItem && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Seçili Item</Label>
                    <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-green-200 dark:bg-green-700 flex items-center justify-center text-3xl">
                            🎁
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-green-800 dark:text-green-200 truncate">
                              {selectedChestItem.product.name}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Sandık İtemi
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={
                    !selectedUser ||
                    isSending ||
                    (giftType === "balance" &&
                      (!amount ||
                        parseFloat(amount) <= 0 ||
                        (user?.balance || 0) < parseFloat(amount || "0"))) ||
                    (giftType === "item" && !selectedChestItem)
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
                  <li>Kredi veya sandık itemlerini hediye olarak gönderebilirsiniz</li>
                  <li>Gönderilen hediye anında alıcının hesabına yansır</li>
                  <li>Item hediyesi için sandığınızda kullanılmamış item olmalıdır</li>
                  <li>İşlem sonrası bakiyeniz veya item listeniz otomatik güncellenir</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
