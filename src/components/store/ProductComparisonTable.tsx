"use client";

import { Category } from "@/lib/types/category";
import { Product } from "@/lib/types/product";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Check, X, Info, ShoppingCart } from "lucide-react";
import { useContext } from "react";
import { useCart } from "@/lib/context/cart.context";
import { WebsiteContext } from "@/lib/context/website.context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface ProductComparisonTableProps {
  category: Category;
  products: Product[];
}

export default function ProductComparisonTable({ 
  category, 
  products 
}: ProductComparisonTableProps) {
  const { addToCart } = useCart();
  const { website } = useContext(WebsiteContext);

  if (!category.addons || category.addons.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Bu kategoride karşılaştırma özelliği bulunmamaktadır.
        </p>
      </Card>
    );
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product.id);
  };

  const formatPrice = (price: number) => {
    const currencySymbols: Record<string, string> = {
      TRY: "₺",
      USD: "$",
      EUR: "€",
    };
    const symbol = currencySymbols[website?.currency || "TRY"] || "₺";
    return `${price.toFixed(2)}${symbol}`;
  };

  const getFeatureValue = (
    product: Product, 
    addonId: string, 
    featureId: string
  ): { included: boolean; customValue?: string | null } => {
    if (!product.selectedAddons) return { included: false };
    
    const addon = product.selectedAddons.find(a => a.addonId === addonId);
    if (!addon) return { included: false };
    
    const feature = addon.features.find(f => f.featureId === featureId);
    if (!feature) return { included: false };
    
    return {
      included: feature.included === true,
      customValue: feature.customValue
    };
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Ürün Başlıkları - Resim, İsim, Açıklama */}
        <div 
          className="grid gap-4 mb-6" 
          style={{ gridTemplateColumns: `250px repeat(${products.length}, 1fr)` }}
        >
          {/* Boş köşe */}
          <div className="p-4"></div>
          
          {/* Ürün kartları */}
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="border-2 border-purple-200 dark:border-purple-700 rounded-xl p-4 flex flex-col items-center gap-3 bg-white dark:bg-gray-800"
            >
              {/* Ürün Resmi */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                {product.image ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${product.image}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Ürün İsmi */}
              <h3 className="font-bold text-lg text-center line-clamp-2 text-gray-900 dark:text-gray-100">
                {product.name}
              </h3>
              
              {/* Ürün Açıklaması */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center line-clamp-3">
                {product.description}
              </p>
              
              {/* Fiyat */}
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatPrice(product.price)}
              </div>
              
              {/* Sepete Ekle Butonu */}
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Stokta Yok" : "Sepete Ekle"}
              </Button>
            </Card>
          ))}
        </div>

        {/* Özellikler Tablosu */}
        <Card className="border-2 border-purple-200 dark:border-purple-700 rounded-xl overflow-hidden">
          {category.addons.map((addon, addonIndex) => (
            <div key={addon.id}>
              {/* Addon Başlığı */}
              <div className="bg-purple-100 dark:bg-purple-900 border-b border-purple-200 dark:border-purple-700 p-4">
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {addon.title}
                </h4>
              </div>
              
              {/* Özellikler */}
              {addon.features.map((feature, featureIndex) => (
                <div
                  key={feature.id}
                  className={`grid gap-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    featureIndex === addon.features.length - 1 && 
                    addonIndex === category.addons!.length - 1 
                      ? 'border-b-0' 
                      : ''
                  }`}
                  style={{ gridTemplateColumns: `250px repeat(${products.length}, 1fr)` }}
                >
                  {/* Özellik İsmi ve Info */}
                  <div className="p-4 flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {feature.title}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                          <Info className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p>{feature.info}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* Her ürün için bu özelliğin durumu */}
                  {products.map((product) => {
                    const featureValue = getFeatureValue(product, addon.id, feature.id);
                    return (
                      <div 
                        key={product.id} 
                        className="p-4 flex items-center justify-center"
                      >
                        {featureValue.included ? (
                          featureValue.customValue ? (
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {featureValue.customValue}
                            </span>
                          ) : (
                            <Check className="w-6 h-6 text-green-500" strokeWidth={3} />
                          )
                        ) : (
                          <X className="w-6 h-6 text-red-500" strokeWidth={3} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
