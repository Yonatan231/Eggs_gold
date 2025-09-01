-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-04-2025 a las 21:30:42
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mr_eggs_gold`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `ID_FACTURA` int(11) NOT NULL,
  `VENTAS_ID_VENTAS` int(11) NOT NULL,
  `PRODUCTOS_ID_PRODUCTOS` int(11) NOT NULL,
  `CANTIDAD_PRODUCTOS` int(11) NOT NULL,
  `PRECIO_UNITARIO_PRODUCTO` decimal(10,0) NOT NULL,
  `METODO_PAGO` enum('EFECTIVO','TRANSFERENCIA') NOT NULL,
  `SUBTOTAL` float NOT NULL,
  `IVA` float NOT NULL,
  `TOTAL` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `ID_INVENTARIO` int(11) NOT NULL,
  `PRODUCTOS_ID_PRODUCTOS` int(11) NOT NULL,
  `CANTIDAD_DISPONIBLE` int(11) NOT NULL,
  `UBICACION` varchar(120) NOT NULL,
  `FECHA_CADUCIDAD` date NOT NULL,
  `FECHA_ACTUALIZACION` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `ID_PEDIDOS` int(11) NOT NULL,
  `VENTAS_ID_VENTAS_CLIENTE` int(11) NOT NULL,
  `USUARIOS_ID_USUARIOS` int(11) NOT NULL,
  `DIRECCION` varchar(120) NOT NULL,
  `ESTADO` enum('RECHAZADO','APROBADO') NOT NULL,
  `FECHA_CREACION` datetime NOT NULL,
  `TOTAL` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `privilegios`
--

CREATE TABLE `privilegios` (
  `ID_PRIVILEGIOS` int(11) NOT NULL,
  `DESCRIPCION_PRIVILEGIO` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `ID_PRODUCTOS` int(11) NOT NULL,
  `NOMBRE` varchar(45) NOT NULL,
  `PRECIO` float NOT NULL,
  `CATEGORIA` enum('AAA','AA','A') NOT NULL,
  `DESCRIPCION` text NOT NULL,
  `ESTADO` enum('DISPONIBLE','DESCONTINUADO') NOT NULL,
  `CANTIDAD` varchar(255) DEFAULT NULL,
  `imagen` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`ID_PRODUCTOS`, `NOMBRE`, `PRECIO`, `CATEGORIA`, `DESCRIPCION`, `ESTADO`, `CANTIDAD`, `imagen`) VALUES
(12, 'huevos rojos', 20000, 'AAA', 'son huevos rojos full', 'DISPONIBLE', '2', 'huevos6.png'),
(13, 'huevos rojos', 20000, 'AAA', 'son huevos rojos full', 'DISPONIBLE', '2', 'huevos2.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `ID_ROLES` int(11) NOT NULL,
  `NOMBRE_ROL` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`ID_ROLES`, `NOMBRE_ROL`) VALUES
(1, 'Administrador'),
(2, 'Conductor'),
(3, 'Logística'),
(4, 'Inventario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rutas_completas`
--

CREATE TABLE `rutas_completas` (
  `ID_RUTAS_COMPLETADAS` int(11) NOT NULL,
  `VENTAS_ID_VENTAS` int(11) NOT NULL,
  `VEHICULOS_ID_VEHICULOS` int(11) NOT NULL,
  `FECHA` datetime NOT NULL,
  `DISTANCIA` float NOT NULL,
  `DURACION` time NOT NULL,
  `TARIFA_KM` float NOT NULL,
  `TOTAL` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temporal_pedidos`
--

CREATE TABLE `temporal_pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `confirmado` tinyint(1) DEFAULT 0,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `temporal_pedidos`
--

INSERT INTO `temporal_pedidos` (`id`, `usuario_id`, `producto_id`, `cantidad`, `confirmado`, `fecha`) VALUES
(16, 1, 1, 1, 0, '2025-04-04 21:05:50'),
(17, 1, 1, 1, 0, '2025-04-04 21:05:54'),
(18, 1, 1, 1, 0, '2025-04-04 21:05:57'),
(19, 1, 1, 1, 0, '2025-04-04 21:06:09'),
(20, 1, 1, 1, 0, '2025-04-04 21:06:56'),
(21, 1, 1, 1, 0, '2025-04-04 21:07:56'),
(22, 1, 1, 1, 0, '2025-04-04 21:08:14'),
(23, 1, 1, 1, 0, '2025-04-04 21:08:17'),
(24, 1, 1, 1, 0, '2025-04-04 21:11:11'),
(25, 1, 1, 1, 0, '2025-04-04 21:18:06'),
(26, 1, 1, 1, 0, '2025-04-04 21:31:57'),
(27, 1, 1, 1, 0, '2025-04-04 21:40:56'),
(28, 1, 1, 1, 0, '2025-04-04 21:41:05'),
(29, 1, 1, 1, 0, '2025-04-04 21:42:42'),
(30, 1, 1, 1, 0, '2025-04-04 21:47:10'),
(31, 1, 1, 1, 0, '2025-04-04 21:47:10'),
(32, 1, 1, 1, 0, '2025-04-04 22:18:39'),
(33, 1, 1, 1, 0, '2025-04-04 22:18:39'),
(34, 1, 1, 1, 0, '2025-04-04 22:19:17'),
(35, 1, 1, 1, 0, '2025-04-04 22:19:17'),
(36, 1, 12, 1, 0, '2025-04-04 22:46:57'),
(37, 1, 12, 1, 0, '2025-04-04 22:48:43'),
(38, 1, 12, 1, 0, '2025-04-04 22:49:50'),
(39, 1, 12, 1, 0, '2025-04-04 23:02:58'),
(40, 1, 12, 1, 0, '2025-04-04 23:05:58'),
(41, 1, 12, 1, 0, '2025-04-04 23:30:07'),
(42, 1, 12, 1, 0, '2025-04-04 23:30:19'),
(43, 1, 12, 1, 0, '2025-04-04 23:30:32'),
(44, 1, 12, 1, 0, '2025-04-07 19:20:00'),
(45, 1, 13, 1, 0, '2025-04-07 19:20:28');

--
-- Disparadores `temporal_pedidos`
--
DELIMITER $$
CREATE TRIGGER `tr_confirmar_pedido` AFTER UPDATE ON `temporal_pedidos` FOR EACH ROW BEGIN
  IF NEW.confirmado = 1 AND OLD.confirmado = 0 THEN
    -- Insertar en la tabla pedidos
    INSERT INTO pedidos (USUARIOS_ID_USUARIOS, VENTAS_ID_VENTAS_CLIENTE, DIRECCION, ESTADO, FECHA_CREACION, TOTAL)
    VALUES (NEW.usuario_id, 1, 'Dirección de prueba', 'Pendiente', NOW(), 15000);

    -- Asegurar que se elimina el pedido de la tabla temporal
    DELETE FROM temporal_pedidos WHERE usuario_id = NEW.usuario_id;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `ID_USUARIOS` int(11) NOT NULL,
  `ROLES_ID_ROLES` int(11) NOT NULL,
  `VEHICULOS_ID_VEHICULOS` int(11) NOT NULL,
  `RUTAS_COMPLETADAS_ID_RUTAS_COMPLETADAS` int(11) NOT NULL,
  `NOMBRE` varchar(45) NOT NULL,
  `APELLIDO` varchar(45) NOT NULL,
  `DIRECCION_USUARIO` varchar(120) NOT NULL,
  `TIPO_DOCUMENTO` enum('CC','CED') NOT NULL,
  `NUM_DOCUMENTO` varchar(20) NOT NULL,
  `TELEFONO` varchar(20) NOT NULL,
  `ESTADO` enum('ACTIVO','INACTIVO') NOT NULL,
  `CORREO` varchar(45) NOT NULL,
  `PASSWORD` varchar(120) NOT NULL,
  `FECHA_REGISTRO` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`ID_USUARIOS`, `ROLES_ID_ROLES`, `VEHICULOS_ID_VEHICULOS`, `RUTAS_COMPLETADAS_ID_RUTAS_COMPLETADAS`, `NOMBRE`, `APELLIDO`, `DIRECCION_USUARIO`, `TIPO_DOCUMENTO`, `NUM_DOCUMENTO`, `TELEFONO`, `ESTADO`, `CORREO`, `PASSWORD`, `FECHA_REGISTRO`) VALUES
(8, 4, 1, 2, 'jose', 'alvarez', 'manzana B casa 37', 'CC', '3126204261', '3126204260', 'ACTIVO', 'alvizyonatan@gmail.com', '$2y$10$T/4EIj0odbsWhjOxWFFwNe2cnebWjXqc8qtsh2pSfvPMPaw/3CNuG', '2025-03-27'),
(9, 4, 1, 2, 'ferney', 'alzate alvis', 'manzana B casa 37', 'CC', '3126204261', '3126204260', 'ACTIVO', 'alvizyonatan@gmail.com', '$2y$10$dI72GggHXY6TVcQ7RKAOj.12OJ/eNmFsOh0Dikw8tzMdrtWvtdqaC', '2025-03-27'),
(10, 4, 1, 2, 'ferney', 'alzate alvis', 'manzana B casa 37', 'CC', '3126204261', '3126204260', 'ACTIVO', 'alvizyonatan@gmail.com', '$2y$10$sgdZ8SCyql2BXzpM58Z9Y.3U7cLyrwXCXmxTlXwxL4v5GLGkMzbyu', '2025-03-28'),
(11, 4, 2, 4, 'yonatan      ', 'alviz', 'manzana B casa 37', 'CC', '1110503615', '3126204260', 'ACTIVO', 'alvizyonatan@gmail.com', '$2y$10$OVonNpAlVn/VpwXBKYI6CukS62OdfjSrT0tBFGTNW8wuF4rBOaVXq', '2025-03-28'),
(12, 4, 2, 4, 'miguel', 'alvarez', 'calle100', 'CC', '3243225554', '3124555676', 'INACTIVO', 'alvizyonatan@gmail.com', '$2y$10$J5xe5UQunf5/nS0bETshaObmHxDF8dcLRUNCF4ASfB3peAKN.NDia', '2025-03-31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_has_privilegios`
--

CREATE TABLE `usuarios_has_privilegios` (
  `ID_PRIVILEGIOS_USUARIOS` int(11) NOT NULL,
  `USUARIOS_ID_USUARIOS` int(11) NOT NULL,
  `PRIVILEGIOS_ID_PRIVILEGIOS` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `ID_VEHICULOS` int(11) NOT NULL,
  `PLACA` varchar(20) NOT NULL,
  `COLOR` varchar(45) NOT NULL,
  `ESTADO` enum('ACTIVO','INACTIVO') NOT NULL,
  `MODELO` varchar(55) NOT NULL,
  `MARCA` varchar(45) NOT NULL,
  `CAPACIDAD_CARGA` float NOT NULL,
  `KILOMETRAJE` float NOT NULL,
  `FECHA_REGISTRO` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `ID_VENTAS` int(11) NOT NULL,
  `USUARIOS_ID_USUARIOS(CLIENTE)` int(11) NOT NULL,
  `VEHICULOS_ID_VEHICULOS` int(11) NOT NULL,
  `FECHA` datetime NOT NULL,
  `METODO_PAGO` enum('TRANSFERENCIA','EFECTIVO') NOT NULL,
  `ESTADO` enum('CANSELADA','PENDIENTE') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`ID_FACTURA`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`ID_INVENTARIO`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`ID_PEDIDOS`);

--
-- Indices de la tabla `privilegios`
--
ALTER TABLE `privilegios`
  ADD PRIMARY KEY (`ID_PRIVILEGIOS`);

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
-- Indices de la tabla `rutas_completas`
--
ALTER TABLE `rutas_completas`
  ADD PRIMARY KEY (`ID_RUTAS_COMPLETADAS`);

--
-- Indices de la tabla `temporal_pedidos`
--
ALTER TABLE `temporal_pedidos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`ID_USUARIOS`);

--
-- Indices de la tabla `usuarios_has_privilegios`
--
ALTER TABLE `usuarios_has_privilegios`
  ADD PRIMARY KEY (`ID_PRIVILEGIOS_USUARIOS`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`ID_VEHICULOS`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`ID_VENTAS`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `ID_FACTURA` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `ID_INVENTARIO` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `ID_PEDIDOS` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `privilegios`
--
ALTER TABLE `privilegios`
  MODIFY `ID_PRIVILEGIOS` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `ID_PRODUCTOS` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `ID_ROLES` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `rutas_completas`
--
ALTER TABLE `rutas_completas`
  MODIFY `ID_RUTAS_COMPLETADAS` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `temporal_pedidos`
--
ALTER TABLE `temporal_pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `ID_USUARIOS` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `usuarios_has_privilegios`
--
ALTER TABLE `usuarios_has_privilegios`
  MODIFY `ID_PRIVILEGIOS_USUARIOS` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `ID_VEHICULOS` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `ID_VENTAS` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
