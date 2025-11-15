"use client";

import { useEffect, useState, useContext } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Wallet, CreditCard, Plus, TrendingUp, X } from "lucide-react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

import Loading from "@/components/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthContext } from "@/lib/context/auth.context";
import { WebsiteContext } from "@/lib/context/website.context";
import { usePaymentService } from "@/lib/services/payment.service";
import { PaymentProvider } from "@/lib/types/payment";

export default function BalancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventParam = searchParams.get("event");
  const paymentIdParam = searchParams.get("paymentId");
  const {
    user,
    isLoading: userIsLoading,
    isAuthenticated,
  } = useContext(AuthContext);
  const { website } = useContext(WebsiteContext);

  const { getPaymentProviders, initiatePayment, checkPayment } =
    usePaymentService();

  const [balance, setBalance] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState("");
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>(
    []
  );
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Payment Dialog State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentIframeHtml, setPaymentIframeHtml] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  // Fetch payment providers
  const fetchPaymentProviders = async () => {
    if (!user?.id) return;

    setIsLoadingProviders(true);
    try {
      const providers = await getPaymentProviders();
      // Filter active providers and sort by priority
      const activeProviders = providers
        .filter((provider) => provider.isActive)
        .sort((a, b) => a.priority - b.priority);

      setPaymentProviders(activeProviders);
    } catch (error) {
      withReactContent(Swal).fire({
        title: "Hata!",
        text: "Ödeme yöntemleri yüklenirken hata oluştu.",
        icon: "error",
        confirmButtonText: "Tamamdır.",
      });
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const checkPaymentFunc = async () => {
    if (!paymentIdParam || !eventParam || !website?.id) return;

    const check = await checkPayment({
      website_id: website.id,
      payment_id: paymentIdParam,
    });

    if (check.success) {
      switch (check.status) {
        case "COMPLETED":
          withReactContent(Swal).fire({
            title: "Ödeme İşlemi",
            text: "Ödeme işleminiz başarıyla tamamlanmıştır.",
            color: "success",
            confirmButtonText: "Tamamdır",
          });
          break;
        case "FAILED":
          withReactContent(Swal).fire({
            title: "Ödeme İşlemi",
            text: "Ödeme işleminiz tamamlanamamıştı.",
            color: "error",
            confirmButtonText: "Tamamdır",
          });
          break;
        case "PENDING":
          withReactContent(Swal).fire({
            title: "Ödeme İşlemi",
            text: "Ödemeniz şuanda işleniyor, lütfen bir süre bekleyiniz..",
            color: "info",
            confirmButtonText: "Tamamdır",
          });
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (userIsLoading) {
      return;
    }

    if (!userIsLoading && user === undefined) {
      router.push("/");
      return;
    }

    if (user) {
      setBalance(user.balance || 0);
      setIsInitialized(true);
      fetchPaymentProviders();

      if (eventParam) {
        checkPaymentFunc();
      }
    }
  }, [userIsLoading, isAuthenticated, user, router]);

  const handleTopUp = async () => {
    if (isProcessingPayment) return;

    try {
      setIsProcessingPayment(true);

      // Form validation
      if (!formData.firstName.trim()) {
        withReactContent(Swal).fire({
          title: "Boş alan bırakmayınız!",
          text: "Lütfen isminizi giriniz.",
          icon: "error",
          showConfirmButton: true,
          confirmButtonText: "Tamamdır.",
        });
        return;
      }

      if (!formData.lastName.trim()) {
        withReactContent(Swal).fire({
          title: "Boş alan bırakmayınız!",
          text: "Lütfen soyisminizi giriniz.",
          icon: "error",
          showConfirmButton: true,
          confirmButtonText: "Tamamdır.",
        });
        return;
      }

      if (!formData.phone.trim()) {
        withReactContent(Swal).fire({
          title: "Boş alan bırakmayınız!",
          text: "Lütfen telefon numaranızı giriniz.",
          icon: "error",
          showConfirmButton: true,
          confirmButtonText: "Tamamdır.",
        });
        return;
      }

      if (!formData.email.trim()) {
        withReactContent(Swal).fire({
          title: "Boş alan bırakmayınız!",
          text: "Lütfen e-mail adresinizi giriniz.",
          icon: "error",
          showConfirmButton: true,
          confirmButtonText: "Tamamdır.",
        });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        withReactContent(Swal).fire({
          title: "Geçersiz alan!",
          text: "Lütfen geçerli bir e-mail adresi giriniz.",
          icon: "error",
          showConfirmButton: true,
          confirmButtonText: "Tamamdır.",
        });
        return;
      }

      // Phone number validation (international format)
      const phoneRegex = /^\+?\d{8,20}$/;
      if (!phoneRegex.test(formData.phone)) {
        withReactContent(Swal).fire({
          title: "Geçersiz alan!",
          text: "Lütfen geçerli bir telefon numarası giriniz.",
          icon: "error",
          showConfirmButton: true,
          confirmButtonText: "Tamamdır.",
        });
        return;
      }

      if (!selectedAmount || parseFloat(selectedAmount) <= 0) {
        withReactContent(Swal).fire({
          title: "Boş alan bırakmayınız!",
          text: "Lütfen geçerli bir miktar giriniz.",
          icon: "error",
          showConfirmButton: true,
          confirmButtonText: "Tamamdır.",
        });
        return;
      }

      if (!selectedPaymentProvider) {
        withReactContent(Swal).fire({
          title: "Boş alan bırakmayınız!",
          text: "Lütfen ödeme yöntemi seçiniz.",
          icon: "error",
          showConfirmButton: true,
          confirmButtonText: "Tamamdır.",
        });
        return;
      }

      const selectedProvider = paymentProviders.find(
        (provider) => provider.id === selectedPaymentProvider
      );

      if (!selectedProvider) {
        withReactContent(Swal).fire({
          title: "Hata!",
          text: "Seçilen ödeme yöntemi bulunamadı.",
          icon: "error",
          showConfirmButton: true,
          confirmButtonText: "Tamamdır.",
        });
        return;
      }

      // Check amount limits
      const amount = parseFloat(selectedAmount);
      if (
        amount < selectedProvider.minAmount ||
        amount > selectedProvider.maxAmount
      ) {
        withReactContent(Swal).fire({
          title: "Geçersiz Miktar!",
          text: `Bu ödeme yöntemi için minimum ${selectedProvider.minAmount} TL, maksimum ${selectedProvider.maxAmount} TL yükleyebilirsiniz.`,
          icon: "error",
          showConfirmButton: true,
          confirmButtonText: "Tamamdır.",
        });
        return;
      }

      if (!website?.id) {
        withReactContent(Swal).fire({
          title: "Hata",
          text: "Website bilgisi yüklenemedi. Lütfen sayfayı yenileyin.",
          icon: "error",
          confirmButtonText: "Tamam",
        });
        return;
      }

      // Prepare payment data
      const paymentData = {
        websiteId: website.id,
        providerId: selectedPaymentProvider,
        amount: amount,
        currency: "TRY" as const,
        basket: [
          {
            name: `Bakiye Yükleme - ${amount} TL`,
            price: amount.toString(),
            quantity: 1,
          },
        ],
        user: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: "Türkiye", // Default address
        },
      };

      // Initiate payment
      const paymentResponse = await initiatePayment(paymentData);

      if (paymentResponse.success && paymentResponse.type === "iframe") {
        setPaymentIframeHtml(paymentResponse.iframeHtml);
        setPaymentId(paymentResponse.payment_id);
        setPaymentDialogOpen(true);
      } else {
        withReactContent(Swal).fire({
          title: "Ödeme Hatası!",
          text: "Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.",
          icon: "error",
          confirmButtonText: "Tamamdır.",
        });
      }
    } catch (error) {
      withReactContent(Swal).fire({
        title: "Hata!",
        text: "Ödeme işlemi başlatılırken bir hata oluştu. Lütfen tekrar deneyin.",
        icon: "error",
        confirmButtonText: "Tamamdır.",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setPaymentIframeHtml("");
    setPaymentId("");
  };

  // Loading state
  if (userIsLoading || !isInitialized) {
    return <Loading show={true} message="Bakiye bilgileri yükleniyor..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  // Authentication failed state
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Yetkilendirme kontrolü yapılıyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Cüzdanına Bakiye Yükle
            </h1>
          </div>

          {/* Current Balance Card */}
          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                    Mevcut Bakiye
                  </p>
                  <p className="text-4xl font-bold text-green-800 dark:text-green-200">
                    {balance} TL
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-500 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Amount Selection */}
          <Card className="shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Yükleme Miktarı
              </CardTitle>
              <Separator />
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Kullanıcı Bilgileri */}
                <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    Kullanıcı Bilgileri
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="first-name"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        İsim *
                      </Label>
                      <Input
                        id="first-name"
                        type="text"
                        placeholder="İsminizi girin..."
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="last-name"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Soyisim *
                      </Label>
                      <Input
                        id="last-name"
                        type="text"
                        placeholder="Soyisminizi girin..."
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="username"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Kullanıcı Adı
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={user?.username || "demo"}
                      disabled
                      className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Bu alan değiştirilemez
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      E-mail Adresi *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Telefon Numarası *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05xxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Miktar Seçimi */}
                <div>
                  <Label
                    htmlFor="custom-amount"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Yükleme Miktarı (TL) *
                  </Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Miktar girin..."
                    value={selectedAmount}
                    onChange={(e) => setSelectedAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3 block">
                    Hızlı Seçim
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {predefinedAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={
                          selectedAmount === amount.toString()
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setSelectedAmount(amount.toString())}
                        className="h-12 dark:bg-gray-900 dark:text-gray-100"
                      >
                        {amount} TL
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ödeme Yöntemi
              </CardTitle>
              <Separator />
            </CardHeader>

            <CardContent className="p-6">
              {isLoadingProviders ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Ödeme yöntemleri yükleniyor...
                    </p>
                  </div>
                </div>
              ) : paymentProviders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-300">
                    Aktif ödeme yöntemi bulunamadı.
                  </p>
                  <Button
                    onClick={fetchPaymentProviders}
                    variant="outline"
                    className="mt-2 dark:bg-gray-900 dark:text-gray-100"
                  >
                    Tekrar Dene
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPaymentProvider === provider.id
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedPaymentProvider(provider.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {provider.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              {provider.description}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Min: {provider.minAmount} TL - Max:{" "}
                              {provider.maxAmount} TL
                            </p>
                          </div>
                        </div>
                        {provider.provider === "Shipy" && (
                          <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                            25% Cashback
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleTopUp}
                className="w-full mt-6 h-12 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white"
                disabled={
                  !selectedAmount ||
                  !selectedPaymentProvider ||
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.phone ||
                  !formData.email ||
                  isProcessingPayment ||
                  paymentProviders.length === 0
                }
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    İşlem Başlatılıyor...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Bakiye Yükle
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Bilgi:</strong> Yüklediğiniz bakiye, sağlayıcının onayı
                sonrası hesabınıza yansır. Bazı ödeme yöntemleri ile yapılan
                ödemelerde ekstra avantajlar kazanabilirsiniz.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={handleClosePaymentDialog}>
        <DialogContent className="max-w-5xl max-h-[95vh] h-[90vh] p-0">
          <DialogHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Ödeme İşlemi</DialogTitle>
                <DialogDescription>
                  Ödeme işlemini tamamlamak için aşağıdaki formu doldurun.
                  {paymentId && (
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                      İşlem ID: {paymentId}
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 p-4 h-full overflow-hidden">
            {paymentIframeHtml && (
              <div
                className="w-full h-full"
                style={{
                  minHeight: "600px",
                }}
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
              #paytriframe {
                width: 100% !important;
                height: 100% !important;
                min-height: 600px !important;
                border: none !important;
              }
              .payment-iframe-container iframe {
                width: 100% !important;
                height: 100% !important;
                min-height: 600px !important;
              }
            `
                  }}
                />
                <div
                  className="payment-iframe-container w-full h-full"
                  dangerouslySetInnerHTML={{ __html: paymentIframeHtml }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
