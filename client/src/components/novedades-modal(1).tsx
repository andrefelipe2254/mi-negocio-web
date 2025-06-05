import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { insertBusinessNewsSchema, BusinessNews } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Newspaper, Plus, Clock, Trash2, Info } from "lucide-react";

type NewsFormData = z.infer<typeof insertBusinessNewsSchema>;

interface NovedadesModalProps {
  onClose: () => void;
}

export default function NovedadesModal({ onClose }: NovedadesModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NewsFormData>({
    resolver: zodResolver(insertBusinessNewsSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const { data: newsList = [] } = useQuery<BusinessNews[]>({
    queryKey: ["/api/business-news"],
  });

  const createNewsMutation = useMutation({
    mutationFn: async (data: NewsFormData) => {
      const res = await apiRequest("POST", "/api/business-news", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Novedad agregada",
        description: "La novedad se ha registrado exitosamente",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al agregar la novedad",
        variant: "destructive",
      });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/business-news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Novedad eliminada",
        description: "La novedad se ha eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la novedad",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewsFormData) => {
    createNewsMutation.mutate(data);
  };

  const handleDeleteNews = (id: number) => {
    deleteNewsMutation.mutate(id);
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `Expira en ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Expira en ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMs > 0) {
      return "Expira hoy";
    } else {
      return "Expirado";
    }
  };

  const formatRelativeTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return "Hace un momento";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Newspaper className="h-5 w-5 text-orange-500 mr-3" />
            Novedades del Negocio
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add New News Form */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nueva Novedad</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Título de la novedad"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Describe la novedad del negocio..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-orange-500 hover:bg-orange-600"
                      disabled={createNewsMutation.isPending}
                    >
                      {createNewsMutation.isPending ? (
                        "Agregando..."
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Novedad
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* News List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Novedades Recientes</h3>
            
            {newsList.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay novedades registradas</p>
                </CardContent>
              </Card>
            ) : (
              newsList.map((item) => (
                <Card key={item.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-md font-semibold text-gray-900">{item.title}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className={
                          formatTimeRemaining(item.expiresAt).includes("hoy") ||
                          formatTimeRemaining(item.expiresAt).includes("Expirado")
                            ? "text-orange-600"
                            : ""
                        }>
                          {formatTimeRemaining(item.expiresAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{item.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatRelativeTime(item.createdAt)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteNews(item.id)}
                        disabled={deleteNewsMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            <div className="text-center text-sm text-gray-500 py-4 flex items-center justify-center">
              <Info className="h-4 w-4 mr-1" />
              Las novedades se eliminan automáticamente después de 3 días
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
