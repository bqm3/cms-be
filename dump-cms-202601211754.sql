-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: cms
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `posts`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sequence_number` int NOT NULL DEFAULT '0',
  `title` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `post_title` varchar(255) DEFAULT NULL,
  `content` text,
  `view_count` int DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '0',
  `category_name` varchar(255) DEFAULT NULL,
  `topic_name` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `posts_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `posts_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,0,'','/uploads/1768992229265.png',NULL,'{\"ROOT\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{\"background\":\"#18181b\",\"padding\":40,\"margin\":0,\"positioning\":\"flow\",\"width\":\"100%\",\"height\":\"100%\",\"flexDirection\":\"column\",\"justifyContent\":\"flex-start\",\"alignItems\":\"stretch\",\"gap\":0,\"borderRadius\":0},\"displayName\":\"Container\",\"custom\":{},\"hidden\":false,\"nodes\":[\"SjE18bfY5k\",\"v1-KIH4Xfc\",\"wwjtsSlDC1\",\"VFkXDODqoq\",\"D5ZcwOqFuC\"],\"linkedNodes\":{}},\"WdvLXa5bp5\":{\"type\":\"div\",\"isCanvas\":false,\"props\":{\"className\":\"h-[200px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl text-zinc-600\",\"children\":\"Start building your website by dragging components here\"},\"displayName\":\"div\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"SjE18bfY5k\":{\"type\":{\"resolvedName\":\"HeadingComponent\"},\"isCanvas\":false,\"props\":{\"text\":\"Heading\",\"level\":\"h2\",\"align\":\"left\",\"color\":\"#ffffff\"},\"displayName\":\"Heading\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"v1-KIH4Xfc\":{\"type\":{\"resolvedName\":\"HeadingComponent\"},\"isCanvas\":false,\"props\":{\"text\":\"Heading\",\"level\":\"h2\",\"align\":\"left\",\"color\":\"#ffffff\"},\"displayName\":\"Heading\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"VFkXDODqoq\":{\"type\":{\"resolvedName\":\"HeadingComponent\"},\"isCanvas\":false,\"props\":{\"text\":\"Heading\",\"level\":\"h2\",\"align\":\"left\",\"color\":\"#ffffff\"},\"displayName\":\"Heading\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"D5ZcwOqFuC\":{\"type\":{\"resolvedName\":\"TableComponent\"},\"isCanvas\":false,\"props\":{\"tableData\":[[\"Cellđasadas\",\"Cellđâsdasdasd\"],[\"Cell\",\"Cell\"]],\"border\":true},\"displayName\":\"Table\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"wwjtsSlDC1\":{\"type\":{\"resolvedName\":\"VideoComponent\"},\"isCanvas\":false,\"props\":{\"videoId\":\"dQw4w9WgXcQ\",\"source\":\"youtube\",\"width\":\"100%\"},\"displayName\":\"Video\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}}}',15,0,'đasadas',NULL,1,1,'2026-01-21 10:43:49','2026-01-21 10:46:45');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$Y6dNYSevGhQvRkkCNhQWX.n1fOPUMnqTnUKuaYmF4ZRO8Xn9M2f9a','admin','2026-01-21 10:36:09','2026-01-21 10:36:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'cms'
--

--
-- Dumping routines for database 'cms'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-21 17:54:31
