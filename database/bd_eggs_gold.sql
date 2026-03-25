-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2025 a las 18:40:52
-- Versión del servidor: 8.0.44
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_eggs_gold`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `confirmado` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `ID_DETALLE` int NOT NULL,
  `ID_PEDIDO` int NOT NULL,
  `ID_PRODUCTO` int NOT NULL,
  `CANTIDAD` int NOT NULL,
  `PRECIO_UNITARIO` decimal(10,2) NOT NULL,
  `TOTAL` decimal(10,2) GENERATED ALWAYS AS ((`CANTIDAD` * `PRECIO_UNITARIO`)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrada_stock`
--

CREATE TABLE `entrada_stock` (
  `id` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `proveedor` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('PENDIENTE','APROBADO') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDIENTE',
  `id_logistica` int DEFAULT NULL,
  `observacion` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `ID_FACTURA` int NOT NULL,
  `NUMERO_FACTURA` int NOT NULL,
  `ID_PEDIDO` int NOT NULL,
  `METODO_PAGO` enum('VISA','NEQUI') COLLATE utf8mb4_unicode_ci NOT NULL,
  `TOTAL_PAGADO` decimal(10,2) NOT NULL,
  `FECHA_PAGO` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `ID_INVENTARIO` int NOT NULL,
  `PRODUCTOS_ID` int NOT NULL,
  `CANTIDAD_DISPONIBLE` int NOT NULL,
  `UBICACION` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FECHA_CADUCIDAD` date NOT NULL,
  `FECHA_ACTUALIZACION` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `novedades`
--

CREATE TABLE `novedades` (
  `ID_NOVEDAD` int NOT NULL,
  `ID_USUARIO` int NOT NULL,
  `ID_PEDIDO` int NOT NULL,
  `TIPO_NOVEDAD` enum('PEDIDO_INCOMPLETO','PEDIDO_EN_MAL_ESTADO','CANTIDAD_DE_UN_PRODUCTO_INCOMPLETA','FALTA_DE_UN_PRODUCTO','RETRASO_INESPERADO','CLIENTE_NO_ESTABA','OTRO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `DESCRIPCION` text COLLATE utf8mb4_unicode_ci,
  `IMAGEN` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ESTADO` enum('PENDIENTE','RESUELTO') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDIENTE',
  `FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `FECHA_RESOLUCION` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `ID_PEDIDOS` int NOT NULL,
  `ID_CLIENTE` int NOT NULL,
  `ID_LOGISTICA` int DEFAULT NULL,
  `ID_CONDUCTOR` int DEFAULT NULL,
  `DIRECCION` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DETALLE_CLIENTE` text COLLATE utf8mb4_unicode_ci,
  `OBSERVACION_CONDUCTOR` text COLLATE utf8mb4_unicode_ci,
  `ESTADO` enum('PENDIENTE','EN_ALISTAMIENTO','LISTO','ASIGNADO','EN_CAMINO','ENTREGADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `METODO_PAGO` enum('VISA','NEQUI') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `FECHA_ENTREGA` datetime DEFAULT NULL,
  `CANTIDAD_TOTAL` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `privilegios`
--

CREATE TABLE `privilegios` (
  `ID_PRIVILEGIOS` int NOT NULL,
  `DESCRIPCION_PRIVILEGIO` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `privilegios_usuario`
--

CREATE TABLE `privilegios_usuario` (
  `ID_PRIVILEGIOS_USUARIOS` int NOT NULL,
  `USUARIOS_ID_USUARIOS` int NOT NULL,
  `PRIVILEGIOS_ID_PRIVILEGIOS` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `ID_PRODUCTOS` int NOT NULL,
  `NOMBRE` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CATEGORIA` enum('AAA','AA','A') COLLATE utf8mb4_unicode_ci NOT NULL,
  `DESCRIPCION` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ESTADO` enum('DISPONIBLE','DESCONTINUADO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `ID_ROLES` int NOT NULL,
  `NOMBRE_ROL` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`ID_ROLES`, `NOMBRE_ROL`) VALUES
(1, 'administrador'),
(2, 'logistica'),
(3, 'conductor'),
(4, 'cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `ID_USUARIOS` int NOT NULL,
  `ROL_ID` int NOT NULL,
  `NOMBRE` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `APELLIDO` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DIRECCION_USUARIO` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TIPO_DOCUMENTO` enum('CC','CED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `NUM_DOCUMENTO` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TELEFONO` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `EDAD` int NOT NULL,
  `ESTADO` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `CORREO` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PASSWORD` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FECHA_REGISTRO` date NOT NULL,
  `FOTO_PANEL` text COLLATE utf8mb4_unicode_ci,
  `tipo_usuario` varchar(31) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_recuperacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_expiracion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`ID_USUARIOS`, `ROL_ID`, `NOMBRE`, `APELLIDO`, `DIRECCION_USUARIO`, `TIPO_DOCUMENTO`, `NUM_DOCUMENTO`, `TELEFONO`, `EDAD`, `ESTADO`, `CORREO`, `PASSWORD`, `FECHA_REGISTRO`, `FOTO_PANEL`, `tipo_usuario`, `token_recuperacion`, `token_expiracion`) VALUES
(186, 1, 'Admin', 'Principal', 'Oficina central', 'CC', '123456789', '0000000000', 30, 'ACTIVO', 'admin@tuapp.com', '1234', '2025-12-02', NULL, 'Admin', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_has_privilegios`
--

CREATE TABLE `usuarios_has_privilegios` (
  `ID_PRIVILEGIOS_USUARIOS` int NOT NULL,
  `PRIVILEGIOS_ID_PRIVILEGIOS` int NOT NULL,
  `USUARIOS_ID_USUARIOS` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `ID_VEHICULOS` int NOT NULL,
  `PLACA` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `COLOR` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ESTADO` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `MODELO` varchar(55) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MARCA` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CAPACIDAD_CARGA` float NOT NULL,
  `KILOMETRAJE` float NOT NULL,
  `FECHA_REGISTRO` date NOT NULL,
  `id_usuario` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`ID_DETALLE`),
  ADD KEY `ID_PEDIDO` (`ID_PEDIDO`),
  ADD KEY `ID_PRODUCTO` (`ID_PRODUCTO`);

--
-- Indices de la tabla `entrada_stock`
--
ALTER TABLE `entrada_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_logistica` (`id_logistica`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`ID_FACTURA`),
  ADD UNIQUE KEY `NUMERO_FACTURA` (`NUMERO_FACTURA`),
  ADD KEY `fk_factura_pedido_1` (`ID_PEDIDO`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`ID_INVENTARIO`),
  ADD KEY `PRODUCTOS_ID_PRODUCTOS` (`PRODUCTOS_ID`);

--
-- Indices de la tabla `novedades`
--
ALTER TABLE `novedades`
  ADD PRIMARY KEY (`ID_NOVEDAD`),
  ADD KEY `fk_novedad_usuario` (`ID_USUARIO`),
  ADD KEY `fk_novedad_pedido` (`ID_PEDIDO`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`ID_PEDIDOS`),
  ADD KEY `ID_CLIENTE` (`ID_CLIENTE`),
  ADD KEY `ID_LOGISTICA` (`ID_LOGISTICA`),
  ADD KEY `ID_CONDUCTOR` (`ID_CONDUCTOR`);

--
-- Indices de la tabla `privilegios`
--
ALTER TABLE `privilegios`
  ADD PRIMARY KEY (`ID_PRIVILEGIOS`);

--
-- Indices de la tabla `privilegios_usuario`
--
ALTER TABLE `privilegios_usuario`
  ADD PRIMARY KEY (`ID_PRIVILEGIOS_USUARIOS`),
  ADD KEY `USUARIOS_ID_USUARIOS` (`USUARIOS_ID_USUARIOS`),
  ADD KEY `PRIVILEGIOS_ID_PRIVILEGIOS` (`PRIVILEGIOS_ID_PRIVILEGIOS`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`ID_PRODUCTOS`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`ID_ROLES`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`ID_USUARIOS`),
  ADD KEY `ROLES_ID_ROLES` (`ROL_ID`);

--
-- Indices de la tabla `usuarios_has_privilegios`
--
ALTER TABLE `usuarios_has_privilegios`
  ADD PRIMARY KEY (`ID_PRIVILEGIOS_USUARIOS`),
  ADD KEY `FK4h3ayl39iv4l6othxdfwp3s82` (`PRIVILEGIOS_ID_PRIVILEGIOS`),
  ADD KEY `FKp2bpd62t6lyamrn6fp0nb457c` (`USUARIOS_ID_USUARIOS`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`ID_VEHICULOS`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=171;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `ID_DETALLE` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT de la tabla `entrada_stock`
--
ALTER TABLE `entrada_stock`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `ID_FACTURA` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `ID_INVENTARIO` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT de la tabla `novedades`
--
ALTER TABLE `novedades`
  MODIFY `ID_NOVEDAD` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `ID_PEDIDOS` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT de la tabla `privilegios`
--
ALTER TABLE `privilegios`
  MODIFY `ID_PRIVILEGIOS` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `privilegios_usuario`
--
ALTER TABLE `privilegios_usuario`
  MODIFY `ID_PRIVILEGIOS_USUARIOS` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `ID_PRODUCTOS` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `ID_ROLES` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `ID_USUARIOS` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=187;

--
-- AUTO_INCREMENT de la tabla `usuarios_has_privilegios`
--
ALTER TABLE `usuarios_has_privilegios`
  MODIFY `ID_PRIVILEGIOS_USUARIOS` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `ID_VEHICULOS` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`ID_USUARIOS`),
  ADD CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`ID_PRODUCTOS`);

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`ID_PEDIDO`) REFERENCES `pedidos` (`ID_PEDIDOS`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`ID_PRODUCTO`) REFERENCES `productos` (`ID_PRODUCTOS`);

--
-- Filtros para la tabla `entrada_stock`
--
ALTER TABLE `entrada_stock`
  ADD CONSTRAINT `entrada_stock_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`ID_PRODUCTOS`),
  ADD CONSTRAINT `entrada_stock_ibfk_2` FOREIGN KEY (`id_logistica`) REFERENCES `usuarios` (`ID_USUARIOS`);

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `fk_factura_pedido_1` FOREIGN KEY (`ID_PEDIDO`) REFERENCES `pedidos` (`ID_PEDIDOS`);

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`PRODUCTOS_ID`) REFERENCES `productos` (`ID_PRODUCTOS`);

--
-- Filtros para la tabla `novedades`
--
ALTER TABLE `novedades`
  ADD CONSTRAINT `fk_novedad_pedido` FOREIGN KEY (`ID_PEDIDO`) REFERENCES `pedidos` (`ID_PEDIDOS`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_novedad_usuario` FOREIGN KEY (`ID_USUARIO`) REFERENCES `usuarios` (`ID_USUARIOS`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`ID_CLIENTE`) REFERENCES `usuarios` (`ID_USUARIOS`),
  ADD CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`ID_LOGISTICA`) REFERENCES `usuarios` (`ID_USUARIOS`),
  ADD CONSTRAINT `pedidos_ibfk_3` FOREIGN KEY (`ID_CONDUCTOR`) REFERENCES `usuarios` (`ID_USUARIOS`);

--
-- Filtros para la tabla `privilegios_usuario`
--
ALTER TABLE `privilegios_usuario`
  ADD CONSTRAINT `privilegios_usuario_ibfk_1` FOREIGN KEY (`USUARIOS_ID_USUARIOS`) REFERENCES `usuarios` (`ID_USUARIOS`),
  ADD CONSTRAINT `privilegios_usuario_ibfk_2` FOREIGN KEY (`PRIVILEGIOS_ID_PRIVILEGIOS`) REFERENCES `privilegios` (`ID_PRIVILEGIOS`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`ROL_ID`) REFERENCES `roles` (`ID_ROLES`);

--
-- Filtros para la tabla `usuarios_has_privilegios`
--
ALTER TABLE `usuarios_has_privilegios`
  ADD CONSTRAINT `FK4h3ayl39iv4l6othxdfwp3s82` FOREIGN KEY (`PRIVILEGIOS_ID_PRIVILEGIOS`) REFERENCES `privilegios` (`ID_PRIVILEGIOS`),
  ADD CONSTRAINT `FKp2bpd62t6lyamrn6fp0nb457c` FOREIGN KEY (`USUARIOS_ID_USUARIOS`) REFERENCES `usuarios` (`ID_USUARIOS`);

--
-- Filtros para la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`ID_USUARIOS`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
