"use client";

import React, { useEffect, useCallback, useState, Suspense } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";

/**
 * AuthorizeStorePageContent
 * - Renders a form for the user to enter their store name and authorize the app.
 * - Handles error display if redirected back with a failure status.
 */
const AuthorizeStorePageContent: React.FC = () => {
  const searchParams = useSearchParams();
  // State for the store name input
  const [storeName, setStoreName] = useState("");
  // State to control error message visibility
  const [showError, setShowError] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [error, setError] = useState('');

  // Parse query params on mount to prefill storeName and show error if needed
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    const urlError = searchParams.get("error");
    const store = searchParams.get("storeName");
    
    if (store) {
      setStoreName(store);
    }

    if (urlStatus === "success") {
      setStatus('success');
    } else if (urlStatus === "fail") {
      setStatus('fail');
      setShowError(true);
      setError(urlError || 'Yetkilendirme başarısız oldu');
    }
  }, [searchParams]);

  // Handler for input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStoreName(e.target.value);
      if (showError) setShowError(false); // Hide error on user input
    },
    [showError]
  );

  // Handler for form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    try {
      // Demo modda direkt yönlendir
      console.log('Demo mode: redirecting to affiliate dashboard');
      window.location.href = '/affiliate';
    } catch (error) {
      console.error('Redirect error:', error);
      // Hata olsa bile yönlendir
      window.location.href = '/affiliate';
    }
  };

  return (
    <main className="min-h-[100vh] flex flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex items-center justify-center">
          <Image src="/logo.svg" alt="ikas Logo" width={192} height={48} priority className="h-auto w-[12rem] object-contain" />
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>İkas Mağazanızı Bağlayın</CardTitle>
            <CardDescription>Affiliate Tracker uygulamasını mağazanıza yetkilendirmek için mağaza adınızı girin.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} autoComplete="off">
            <CardContent className="space-y-2">
              {status === 'success' && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  <p className="font-medium">✅ Yetkilendirme Başarılı!</p>
                  <p className="text-sm mt-1">
                    Mağazanız başarıyla yetkilendirildi. İkas admin panelinden uygulamayı kullanabilirsiniz.
                  </p>
                </div>
              )}

              {status === 'fail' && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p className="font-medium">❌ Yetkilendirme Başarısız</p>
                  <p className="text-sm mt-1">{error}</p>
                  <p className="text-sm mt-2">
                    Lütfen mağaza adınızı kontrol edip tekrar deneyin.
                  </p>
                </div>
              )}

              <Label htmlFor="storeName">Mağaza Adı</Label>
              <Input
                id="storeName"
                name="storeName"
                value={storeName}
                onChange={handleInputChange}
                placeholder="örn: mystore"
                required
                autoFocus
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                aria-invalid={showError || undefined}
              />
              <p className="text-sm text-gray-600">
                Mağazanızın subdomain adını girin (mystore.myikas.com için &quot;mystore&quot;)
              </p>
              {showError && (
                <p className="text-sm text-destructive">Bir hata oluştu. Lütfen tekrar deneyin.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={!storeName.trim()} className="w-full">
                Mağazama Ekle
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
};

/**
 * AuthorizeStorePage with Suspense wrapper
 */
const AuthorizeStorePage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthorizeStorePageContent />
    </Suspense>
  );
};

export default AuthorizeStorePage;