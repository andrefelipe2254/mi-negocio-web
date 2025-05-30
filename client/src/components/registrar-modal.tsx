import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertProductSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save } from "lucide-react";

type ProductFormData = z.infer<typeof insertProductSchema>;

interface RegistrarModalProps {
  onClose: () => void;
}

export default function RegistrarModal({ onClose }: RegistrarModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calculatedSalePrice, setCalculatedSalePrice] = useState("0.00");

  const form = useForm<ProductFormData>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      purchasePrice: "",
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

  useEffect(() => {
    if (watchedPurchasePrice && !isNaN(parseFloat(watchedPurchasePrice))) {
      const price = parseFloat(watchedPurchasePrice);
      if (price > 0) {
        setCalculatedSalePrice((price * 1.2).toFixed(2));
      } else {
        setCalculatedSalePrice("0.00");
      }
    } else {
      setCalculatedSalePrice("0.00");
    }
  }, [watchedPurchasePrice]);

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
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Precio de Venta (Calculado)
              </Label>
              <div className="text-lg font-semibold text-green-600">
                ${calculatedSalePrice}
              </div>
              <p className="text-xs text-gray-500 mt-1">Incluye 20% de ganancia</p>
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
