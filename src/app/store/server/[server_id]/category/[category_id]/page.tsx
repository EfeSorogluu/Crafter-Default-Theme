"use client";

import { Category } from "@/lib/types/category";
import { useCategoryService } from "@/lib/services/category.service";
import { TopBar } from "@/components/top-bar";
import Header from "@/components/header";
import { use, useContext, useEffect, useState } from "react";
import { WebsiteContext } from "@/lib/context/website.context";
import { Spinner } from "@/components/ui/spinner";
import { useProductService } from "@/lib/services/product.service";
import { Product } from "@/lib/types/product";
import ProductCard from "@/components/store/ProductCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ProductComparisonTable from "@/components/store/ProductComparisonTable";
import {
  Package2,
  Grid3X3,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NotFound from "@/components/not-found";
import ContentFooter from "@/components/store/ContentFooter";
import { 
  CategoryHeaderSkeleton, 
  ProductGridSkeleton 
} from "@/components/store/StoreSkeleton";
import { ProgressiveLoader, ProductCardSkeletonItem } from "@/components/store/ProgressiveLoader";
import { useCategoryPreload } from "@/components/store/StorePreloader";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category_id: string }>;
}) {
  const { category_id } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getCategory } = useCategoryService();
  const { getProductsByCategory } = useProductService();
  const { website } = useContext(WebsiteContext);
  const router = useRouter();
  
  // Preload category data
  useCategoryPreload(category_id);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryData = await getCategory(category_id);
        const productsData = await getProductsByCategory(categoryData.id);

        setCategory(categoryData);
        setProducts(productsData);
      } catch (error) {
        setError("Kategori bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [category_id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <CategoryHeaderSkeleton />
        
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                Ürünler
              </CardTitle>
            </div>
            <Separator />
          </CardHeader>
          <CardContent className="p-6">
            <ProductGridSkeleton count={12} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !category) {
    return (
      <NotFound
        error={error as string}
        header="Kategori Bulunamadı"
        navigateTo="/store"
        backToText="Mağazaya Geri Dön"
      />
    );
  }

  const totalProducts = products?.length || 0;

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/store")}
            className="mb-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mağazaya Dön
          </Button>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 border-purple-200 dark:border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Category Image */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-lg shadow-md flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${category.image}`}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Category Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {category.name}
                    </h1>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Bu kategorideki özel ürünleri keşfedin ve favori
                    eşyalarınızı bulun
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300"
                    >
                      <ShoppingBag className="h-3 w-3 mr-1" />
                      {totalProducts} Ürün
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                {category.type === 'single_products' ? 'Ürün Karşılaştırma' : 'Ürünler'}
              </CardTitle>
              {totalProducts > 0 && (
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {totalProducts} mevcut
                </Badge>
              )}
            </div>
            <Separator />
          </CardHeader>

          <CardContent className="p-6">
            {totalProducts === 0 ? (
              // Empty State
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Henüz ürün bulunmuyor
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Bu kategori için henüz ürün eklenmemiş. Lütfen daha sonra
                  tekrar kontrol edin.
                </p>
              </div>
            ) : category.type === 'single_products' ? (
              // Comparison Table for Single Products
              <ProductComparisonTable 
                category={category} 
                products={products || []} 
              />
            ) : (
              // Products Grid with Progressive Loading for Listed Products
              <ProgressiveLoader
                items={products || []}
                renderItem={(product: Product, index) => (
                  <ProductCard key={product.slug} item={product} />
                )}
                skeletonComponent={ProductCardSkeletonItem}
                itemsPerPage={8}
                initialItems={10}
              />
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        {totalProducts > 0 && (
          <ContentFooter
            header={`${category.name} Özel Koleksiyonu`}
            message="Bu kategoriye özel seçilmiş kaliteli ürünlerle oyun
                  deneyiminizi bir üst seviyeye taşıyın"
            color="purple"
          />
        )}
      </div>
    </>
  );
}
