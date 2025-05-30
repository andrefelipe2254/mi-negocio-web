import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Search } from "lucide-react";

interface PrecioVentaModalProps {
  onClose: () => void;
}

export default function PrecioVentaModal({ onClose }: PrecioVentaModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: suggestions = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/search", { q: searchQuery }],
    enabled: searchQuery.length > 0,
  });

  useEffect(() => {
    setShowSuggestions(searchQuery.length > 0 && suggestions.length > 0);
  }, [searchQuery, suggestions]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value.toUpperCase());
    setSelectedProduct(null);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowSuggestions(false);
  };

  const calculateProfit = (salePrice: string, purchasePrice: string) => {
    const sale = parseFloat(salePrice);
    const purchase = parseFloat(purchasePrice);
    return (sale - purchase).toFixed(2);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Calculator className="h-5 w-5 text-primary mr-3" />
            Consultar Precio de Venta
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="searchProduct" className="text-sm font-medium text-gray-700 mb-2 block">
              Buscar Producto
            </Label>
            <div className="relative">
              <Input
                id="searchProduct"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="ESCRIBA EL NOMBRE EN MAYÚSCULAS"
                className="uppercase pr-10"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Product Suggestions Dropdown */}
            {showSuggestions && (
              <Card className="mt-2 absolute z-10 w-full max-h-40 overflow-y-auto">
                <CardContent className="p-0">
                  {suggestions.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Precio compra: ${product.purchasePrice}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Product Details Card */}
          {selectedProduct && (
            <Card className="bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedProduct.name}
                  </h3>
                  <Badge className="bg-primary/10 text-primary">
                    Producto encontrado
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Precio de Compra</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${selectedProduct.purchasePrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Precio de Venta</p>
                    <p className="text-xl font-bold text-green-600">
                      ${selectedProduct.salePrice}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-md">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ganancia (20%)</span>
                    <span className="font-semibold text-green-600">
                      ${calculateProfit(selectedProduct.salePrice, selectedProduct.purchasePrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={onClose}
              variant="outline"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
