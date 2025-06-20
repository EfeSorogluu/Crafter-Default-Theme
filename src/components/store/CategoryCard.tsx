import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  ArrowRight,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";

export default function CategoryCard({
  category,
}: {
  category: { id: string; name: string; image: string; productCount?: number; isNew?: boolean };
}) {
  const router = useRouter();
  const pathname = usePathname();

  if (!category || !category.id || !category.name) {
    return null;
  }

  const handleClick = () => {
    router.push(`${pathname}/category/${category.id}`);
  };

  return (
    <Card 
      onClick={handleClick}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer border-2 border-gray-200 hover:border-purple-300 bg-gradient-to-br from-white to-gray-50"
    >
      <CardContent className="p-0">
        {/* Header with Badges */}
        <div className="relative">
          {/* New Category Badge */}
          {category.isNew && (
            <div className="absolute top-3 left-3 z-10">
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-pink-500 to-violet-500 text-white animate-pulse"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Yeni
              </Badge>
            </div>
          )}

          {/* Product Count Badge */}
          {category.productCount !== undefined && (
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="outline" className="bg-white/90 text-gray-700 border-gray-300">
                <Package className="h-3 w-3 mr-1" />
                {category.productCount} ürün
              </Badge>
            </div>
          )}

          {/* Category Image */}
          <div className="flex justify-center items-center h-48 p-6 bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
            {category.image ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${category.image}`}
                alt={category.name}
                className="max-w-full max-h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500 rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="h-12 w-12 mb-2" />
                <span className="text-sm">Resim Yok</span>
              </div>
            )}
            
            {/* Floating elements animation */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="absolute bottom-6 left-8 w-1 h-1 bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>

        {/* Category Info */}
        <div className="p-4 bg-white border-t relative">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors flex-1">
              {category.name}
            </h3>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300 ml-2" />
          </div>
          
          {/* Category description placeholder */}
          <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
            Kategoriye göz atın
          </p>
          
          {/* Animated underline */}
          <div className="mt-2 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        
        {/* Corner decoration */}
        <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-purple-100 group-hover:border-b-purple-200 transition-colors duration-300"></div>
      </CardContent>
    </Card>
  );
}