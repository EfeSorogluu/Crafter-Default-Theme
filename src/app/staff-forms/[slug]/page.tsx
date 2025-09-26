"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStaffFormService } from "@/lib/services/staff-form.service";
import { StaffForm, StaffFormInput } from "@/lib/types/staff-form";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AuthContext } from "@/lib/context/auth.context";
import { FaClipboardList, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/widgets/auth-form").then(mod => ({ default: mod.AuthForm })), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
});

export default function StaffFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { getForm, submitFormApplication } = useStaffFormService();
  const { user, isLoading, isAuthenticated } = React.useContext(AuthContext);

  const [form, setForm] = useState<StaffForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Auth kontrolü ve redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/auth/sign-in?return=/staff-forms/${slug}`);
    }
  }, [isLoading, isAuthenticated, router, slug]);

  // Formu slug ile bul (artık doğrudan getForm(slug) ile)
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setError(null);
    setForm(null);
    setSuccess(false);
    getForm(slug)
      .then((found) => {
        setForm(found);
        // Varsayılan değerleri ayarla
        const initial: Record<string, string> = {};
        found.inputs.forEach((input) => {
          initial[input.name] = "";
        });
        setFormValues(initial);
      })
      .catch(() => setError("Başvuru formu bulunamadı veya yüklenirken bir hata oluştu."))
  }, [slug, isAuthenticated, user, isLoading]);

  // Form alanı değişikliği
  const handleChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      // Yeni API: values: [{inputId, value}]
      const values = form.inputs.map((input) => ({
        inputId: input.name, // veya input.index, backend'e göre
        value: formValues[input.name] || "",
      }));
      await submitFormApplication(form.id, values);
      setSuccess(true);
    } catch (err) {
      setError("Başvuru gönderilirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-6">
          <FaClipboardList className="mx-auto text-5xl text-blue-500 mb-2" />
          <h1 className="text-3xl font-bold text-center">Başvuru Formu</h1>
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
        <Button variant="outline" onClick={() => router.push("/staff-forms")}>Tüm Başvuru Formları</Button>
      </div>
    );
  }
  if (!form) return null;

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-xl">
        <Card className="shadow-lg border-2 border-blue-100 dark:border-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <FaClipboardList className="inline text-lg" />
              {form.title}
            </CardTitle>
            {form.description && <CardDescription className="text-gray-500 dark:text-gray-400 mt-2">{form.description}</CardDescription>}
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="flex flex-col gap-8 sm:gap-10 py-8">
              {form.inputs.length === 0 && <div>Form alanı tanımlanmamış.</div>}
              <div className="flex flex-col gap-6">
                {form.inputs.map((input) => (
                  <div key={input.name} className="flex flex-col gap-2">
                    <Label htmlFor={input.name} className="font-semibold mb-1">{input.name}</Label>
                    {input.type === "select" ? (
                      <Select
                        value={formValues[input.name]}
                        onValueChange={(v) => handleChange(input.name, v)}
                      >
                        <SelectTrigger id={input.name}>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {(input as any).options?.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          )) || <SelectItem value="">Seçenek yok</SelectItem>}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={input.name}
                        type={input.type || "text"}
                        value={formValues[input.name]}
                        onChange={(e) => handleChange(input.name, e.target.value)}
                        required
                        className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                  </div>
                ))}
              </div>
              {success && (
                <div className="flex flex-col items-center gap-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-xl px-6 py-6 text-center font-semibold shadow mt-2">
                  <FaCheckCircle className="text-2xl mb-1" />
                  <span>Başvurunuz başarıyla gönderildi!</span>
                  <Button
                    variant="outline"
                    className="mt-2 border-green-700 dark:border-green-300 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                    onClick={() => router.push("/staff-forms/applications")}
                  >
                    Başvurularıma Git
                  </Button>
                </div>
              )}
              {error && <div className="text-red-500 font-medium mt-2">{error}</div>}
            </CardContent>
            <CardFooter className="pt-0">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow text-lg disabled:opacity-60" disabled={submitting || success}>
                {submitting ? "Gönderiliyor..." : success ? "Başarıyla Gönderildi" : "Başvur"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>
    </main>
  );
}
