from fastapi import APIRouter

from app.api.v1 import auth, citas, clientes, facturas, historial_precios, otes, productos, reportes, roles, usuarios, vehiculos

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(clientes.router, prefix="/clientes", tags=["Clientes"])
api_router.include_router(vehiculos.router, prefix="/vehiculos", tags=["Vehiculos"])
api_router.include_router(productos.router, prefix="/productos", tags=["Productos"])
api_router.include_router(historial_precios.router, prefix="/productos", tags=["HistorialPrecios"])
api_router.include_router(otes.router, prefix="/otes", tags=["OrdenesTrabajo"])
api_router.include_router(facturas.router, prefix="/facturas", tags=["Facturas"])
api_router.include_router(citas.router, prefix="/citas", tags=["Citas"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(reportes.router, prefix="/reportes", tags=["Reportes"])
