export const endpoints = {
    auth: {
        login: "/auth/login",
        me: "/auth/me",
    },
    clientes: "/clientes",
    vehiculos: "/vehiculos",
    productos: "/productos",
    historialPrecios: (productoId) => `/productos/${productoId}/historial-precios`,
    otes: "/otes",
    otesDetalle: (ordenId) => `/otes/${ordenId}/detalle`,
    otesConfirmar: (ordenId) => `/otes/${ordenId}/confirmar`,
    otesListaFacturar: (ordenId) => `/otes/${ordenId}/marcar-lista-para-facturar`,
    facturas: "/facturas",
    citas: "/citas",
    usuarios: "/usuarios",
    roles: "/roles",
    reportes: {
        ventas: "/reportes/ventas-mensuales.csv",
        inventario: "/reportes/movimientos-inventario.csv",
        tecnicos: "/reportes/rendimiento-tecnicos.csv",
        cartera: "/reportes/estado-cartera.csv",
    },
};
