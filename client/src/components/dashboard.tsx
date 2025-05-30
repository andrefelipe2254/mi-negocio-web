import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Warehouse, 
  Plus, 
  Calculator, 
  Newspaper, 
  List, 
  User, 
  LogOut, 
  ArrowRight,
  CircleDot
} from "lucide-react";
import RegistrarModal from "./registrar-modal";
import PrecioVentaModal from "./precio-venta-modal";
import NovedadesModal from "./novedades-modal";
import InventarioModal from "./inventario-modal";

interface DashboardStats {
  totalProducts: number;
  activeNews: number;
  lastUpdate: string;
}

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const openModal = (modalName: string) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const formatLastUpdate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "hace un momento";
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffMins < 1440) return `hace ${Math.floor(diffMins / 60)} h`;
    return `hace ${Math.floor(diffMins / 1440)} d`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center mr-3">
                <Warehouse className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Sistema de Inventario</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <CircleDot className="h-3 w-3 text-green-500 mr-2" />
                <span>Conectado</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-4 w-4 mr-2" />
                <span>{user?.username}</span>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* REGISTRAR Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => openModal("registrar")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">REGISTRAR</h3>
              <p className="text-gray-600 text-sm mb-4">Agregar nuevos productos al inventario</p>
              <div className="text-xs text-gray-500">
                {stats?.totalProducts || 0} productos registrados
              </div>
            </CardContent>
          </Card>

          {/* PRECIO VENTA Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => openModal("precio-venta")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-primary-foreground" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">PRECIO VENTA</h3>
              <p className="text-gray-600 text-sm mb-4">Consultar precios de venta (20% ganancia)</p>
              <div className="text-xs text-gray-500">
                Margen de ganancia: 20%
              </div>
            </CardContent>
          </Card>

          {/* NOVEDADES Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => openModal("novedades")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Newspaper className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">NOVEDADES</h3>
              <p className="text-gray-600 text-sm mb-4">Registrar novedades del negocio</p>
              <div className="text-xs text-gray-500">
                {stats?.activeNews || 0} novedades activas
              </div>
            </CardContent>
          </Card>

          {/* INVENTARIO Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => openModal("inventario")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <List className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">INVENTARIO</h3>
              <p className="text-gray-600 text-sm mb-4">Ver y gestionar todos los productos</p>
              <div className="text-xs text-gray-500">
                Última actualización: {stats?.lastUpdate ? formatLastUpdate(stats.lastUpdate) : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Bienvenido al Sistema</h2>
            </div>
            
            <div className="text-center py-8">
              <Warehouse className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sistema de Inventario Empresarial
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Utiliza las opciones del panel para gestionar productos, consultar precios, 
                registrar novedades y administrar tu inventario completo.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">Gestión en tiempo real</Badge>
                <Badge variant="secondary">Cálculo automático</Badge>
                <Badge variant="secondary">Búsqueda inteligente</Badge>
                <Badge variant="secondary">Respaldo seguro</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      {activeModal === "registrar" && (
        <RegistrarModal onClose={closeModal} />
      )}
      {activeModal === "precio-venta" && (
        <PrecioVentaModal onClose={closeModal} />
      )}
      {activeModal === "novedades" && (
        <NovedadesModal onClose={closeModal} />
      )}
      {activeModal === "inventario" && (
        <InventarioModal onClose={closeModal} />
      )}
    </div>
  );
}
