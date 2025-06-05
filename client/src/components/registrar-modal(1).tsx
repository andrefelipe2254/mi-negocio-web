import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertProductSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/format";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Scan, User, Package, Settings } from "lucide-react";

type ProductFormData = z.infer<typeof insertProductSchema>;

interface RegistrarModalProps {
  onClose: () => void;
}

export default function RegistrarModal({ onClose }: RegistrarModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calculatedSalePrice, setCalculatedSalePrice] = useState("0");
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [enableStock, setEnableStock] = useState(false);
  const [enableBarcode, setEnableBarcode] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      purchasePrice: "",
      profitMargin: "20",
      barcode: "",
      buyerName: "",
      stock: 0,
      minStock: 0,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const res = await apiRequest("POST", "/api/products", data);
      return await res.json();
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Producto registrado",
        description: `${product.name} se ha registrado exitosamente`,
      });
      onClose();
    },
    onError: (error: any) => {
      const message = error.message || "Error al registrar el producto";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const watchedPurchasePrice = form.watch("purchasePrice");
  const watchedProfitMargin = form.watch("profitMargin");

  useEffect(() => {
    if (watchedPurchasePrice && !isNaN(parseFloat(watchedPurchasePrice))) {
      const price = parseFloat(watchedPurchasePrice);
      const margin = parseFloat(watchedProfitMargin || "20");
      if (price > 0) {
        const salePrice = price * (1 + margin / 100);
        setCalculatedSalePrice(formatCurrency(salePrice));
      } else {
        setCalculatedSalePrice("$0");
      }
    } else {
      setCalculatedSalePrice("$0");
    }
  }, [watchedPurchasePrice, watchedProfitMargin]);

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const handleNameChange = (value: string, onChange: (value: string) => void) => {
    onChange(value.toUpperCase());
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Plus className="h-5 w-5 text-green-500 mr-3" />
            Registrar Producto
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nombre del Producto <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="NOMBRE EN MAYÚSCULAS"
                        className="uppercase"
                        onChange={(e) => handleNameChange(e.target.value, field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {enableBarcode && (
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Scan className="h-4 w-4 mr-2" />
                        Código de Barras
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Escanear o escribir código"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Nombre del Comprador
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nombre de quien compra el producto"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            
            {/* Pricing Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Precios y Márgenes</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Precio de Compra <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">$</span>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            className="pl-8"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profitMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        % de Ganancia
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            min="0"
                            max="1000"
                            placeholder="20"
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-3 text-gray-500">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <Label className="text-sm font-medium text-green-800 mb-2 block">
                  Precio de Venta (Calculado)
                </Label>
                <div className="text-2xl font-bold text-green-700">
                  {calculatedSalePrice}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Incluye {watchedProfitMargin || "20"}% de ganancia
                </p>
              </div>
            </div>

            {enableStock && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Control de Inventario (Opcional)
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Inicial</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              placeholder="0"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Mínimo</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              placeholder="0"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Optional Features Toggle */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Configuraciones Opcionales
              </h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableBarcode"
                  checked={enableBarcode}
                  onCheckedChange={(checked) => setEnableBarcode(checked === true)}
                />
                <Label htmlFor="enableBarcode" className="text-sm">
                  Habilitar código de barras
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableStock"
                  checked={enableStock}
                  onCheckedChange={(checked) => setEnableStock(checked === true)}
                />
                <Label htmlFor="enableStock" className="text-sm">
                  Habilitar control de inventario
                </Label>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createProductMutation.isPending}
              >
                {createProductMutation.isPending ? (
                  "Registrando..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Registrar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
