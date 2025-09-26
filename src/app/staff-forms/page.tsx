"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useStaffFormService } from "@/lib/services/staff-form.service";
import { StaffForm } from "@/lib/types/staff-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/lib/context/auth.context";
import { FaClipboardList, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/widgets/auth-form").then(mod => ({ default: mod.AuthForm })), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
});

export default function StaffFormsListPage() {
  const router = useRouter();
  const { getForms } = useStaffFormService();
  const { isAuthenticated, isLoading } = React.useContext(AuthContext);
  const [forms, setForms] = useState<StaffForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/sign-in?return=/staff-forms");
      return;
    }
    if (!isAuthenticated) return;
    setLoading(true);
    getForms()
      .then((data) => setForms(data.filter(f => f.isActive)))
      .catch(() => setError("Başvuru formları yüklenemedi."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-6">
          <FaClipboardList className="mx-auto text-5xl text-blue-500 mb-2" />
          <h1 className="text-3xl font-bold text-center">Açık Pozisyonlar & Başvuru Formları</h1>
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
          <FaClipboardList className="mx-auto text-5xl text-blue-500 mb-2" />
          <h1 className="text-4xl font-extrabold mb-2">Açık Pozisyonlar</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-6">Yetkili olmak için başvuru yapabileceğiniz güncel pozisyonlar ve formlar aşağıda listelenmiştir.</p>
          <Button 
            onClick={() => router.push('/staff-forms/applications')} 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
          >
            <FaCheckCircle className="inline mr-2" />
            Mevcut Başvurularım
          </Button>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {forms.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <FaCheckCircle className="text-4xl text-green-500 mb-2" />
              <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-xl px-6 py-4 text-center font-semibold shadow">
                Şu anda başvuru yapılabilecek pozisyon yok.
              </div>
            </div>
          )}
          {forms.map((form) => (
            <Card key={form.id} className="shadow-lg border-2 border-blue-100 dark:border-blue-900 hover:scale-[1.025] transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <FaClipboardList className="inline text-lg" />
                  {form.title}
                </CardTitle>
                {form.description && <CardDescription className="text-gray-500 dark:text-gray-400">{form.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push(`/staff-forms/${form.slug}`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl shadow">
                  Başvuru Yap
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
