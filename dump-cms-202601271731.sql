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
-- Table structure for table `categories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'test',NULL,'2026-01-22 02:22:03','2026-01-27 08:03:04','https://cdn-media.sforum.vn/storage/app/media/anh-dep-68.jpg'),(2,'test 2',NULL,'2026-01-27 08:03:14','2026-01-27 08:41:09','/uploads/categories/1769503269172.jpg'),(3,'sadasd',NULL,'2026-01-27 08:41:20','2026-01-27 08:41:20','/uploads/categories/1769503280936.png');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `type` enum('upload','link') DEFAULT 'upload',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
INSERT INTO `media` VALUES (1,'đâsd','/uploads/images/1769503646672.png','upload','2026-01-27 08:47:26','2026-01-27 08:47:26'),(2,'đâsd','https://cdn-media.sforum.vn/storage/app/media/anh-dep-68.jpg','link','2026-01-27 08:48:45','2026-01-27 08:48:45');
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

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
  `category_id` int DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `Posts_category_id_foreign_idx` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `posts_ibfk_10` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (2,0,'dasdasd',NULL,NULL,'{\"ROOT\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{\"background\":\"#18181b\",\"padding\":40,\"margin\":0,\"positioning\":\"flow\",\"width\":\"100%\",\"height\":\"100%\",\"flexDirection\":\"column\",\"justifyContent\":\"flex-start\",\"alignItems\":\"stretch\",\"gap\":0,\"borderRadius\":0},\"displayName\":\"Container\",\"custom\":{},\"hidden\":false,\"nodes\":[\"0bZvBQ79Rw\",\"ur3K7_guZH\",\"kJfASAOGuL\",\"-r8ZYX85xV\",\"bgseGj5lMQ\"],\"linkedNodes\":{}},\"0bZvBQ79Rw\":{\"type\":{\"resolvedName\":\"HeadingComponent\"},\"isCanvas\":false,\"props\":{\"text\":\"Heading\",\"level\":\"h2\",\"align\":\"left\",\"color\":\"#ffffff\"},\"displayName\":\"Heading\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"ur3K7_guZH\":{\"type\":{\"resolvedName\":\"ButtonComponent\"},\"isCanvas\":false,\"props\":{\"text\":\"Button\",\"color\":\"primary\",\"variant\":\"solid\",\"size\":\"md\",\"radius\":\"md\",\"fullWidth\":false},\"displayName\":\"Button\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"kJfASAOGuL\":{\"type\":{\"resolvedName\":\"TableComponent\"},\"isCanvas\":false,\"props\":{\"tableData\":[[\"Cell\",\"Cell\"],[\"Cell\",\"Cell\"]],\"border\":true},\"displayName\":\"Table\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"-r8ZYX85xV\":{\"type\":{\"resolvedName\":\"ShapeComponent\"},\"isCanvas\":false,\"props\":{\"shapeType\":\"rectangle\",\"width\":100,\"height\":100,\"backgroundColor\":\"#3f3f46\",\"borderColor\":\"transparent\",\"borderWidth\":0,\"radius\":0},\"displayName\":\"Shape\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"bgseGj5lMQ\":{\"type\":{\"resolvedName\":\"ShapeComponent\"},\"isCanvas\":false,\"props\":{\"shapeType\":\"rounded-rectangle\",\"width\":100,\"height\":100,\"backgroundColor\":\"#3f3f46\",\"borderColor\":\"transparent\",\"borderWidth\":0,\"radius\":20},\"displayName\":\"Shape\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}}}',3,1,NULL,NULL,1,1,'2026-01-22 07:09:42','2026-01-27 07:51:05',1,NULL),(3,0,'3424',NULL,NULL,'{\"ROOT\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{\"background\":\"#18181b\",\"padding\":40,\"margin\":0,\"positioning\":\"flow\",\"width\":\"100%\",\"height\":\"100%\",\"flexDirection\":\"column\",\"justifyContent\":\"flex-start\",\"alignItems\":\"stretch\",\"gap\":0,\"borderRadius\":0},\"displayName\":\"Container\",\"custom\":{},\"hidden\":false,\"nodes\":[\"5hV1qrZQwD\",\"lcVZ62Q5rg\"],\"linkedNodes\":{}},\"5hV1qrZQwD\":{\"type\":{\"resolvedName\":\"HeadingComponent\"},\"isCanvas\":false,\"props\":{\"text\":\"Headingđâsdasd\",\"level\":\"h2\",\"align\":\"left\",\"color\":\"#ffffff\"},\"displayName\":\"Heading\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"lcVZ62Q5rg\":{\"type\":{\"resolvedName\":\"VideoComponent\"},\"isCanvas\":false,\"props\":{\"videoId\":\"dQw4w9WgXcQ\",\"source\":\"youtube\",\"width\":\"100%\"},\"displayName\":\"Video\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}}}',11,1,NULL,NULL,1,NULL,'2026-01-22 07:12:57','2026-01-26 09:00:37',1,NULL),(4,0,'đâsdasd',NULL,NULL,'{\"ROOT\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{\"background\":\"#18181b\",\"padding\":40,\"margin\":0,\"positioning\":\"flow\",\"width\":\"100%\",\"height\":\"100%\",\"flexDirection\":\"column\",\"justifyContent\":\"flex-start\",\"alignItems\":\"stretch\",\"gap\":0,\"borderRadius\":0},\"displayName\":\"Container\",\"custom\":{},\"hidden\":false,\"nodes\":[\"7PX0x90OZn\",\"N62cMpz2mw\",\"LvmYJUXeyo\"],\"linkedNodes\":{}},\"7PX0x90OZn\":{\"type\":{\"resolvedName\":\"HeadingComponent\"},\"isCanvas\":false,\"props\":{\"text\":\"Heading\",\"level\":\"h2\",\"align\":\"left\",\"color\":\"#ffffff\"},\"displayName\":\"Heading\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"N62cMpz2mw\":{\"type\":{\"resolvedName\":\"ButtonComponent\"},\"isCanvas\":false,\"props\":{\"text\":\"Button\",\"color\":\"primary\",\"variant\":\"solid\",\"size\":\"md\",\"radius\":\"md\",\"fullWidth\":false},\"displayName\":\"Button\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"LvmYJUXeyo\":{\"type\":{\"resolvedName\":\"TableComponent\"},\"isCanvas\":false,\"props\":{\"tableData\":[[\"Cell\",\"Cell\"],[\"Cell\",\"Cell\"]],\"border\":true},\"displayName\":\"Table\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}}}',1,0,NULL,NULL,2,NULL,'2026-01-22 09:21:07','2026-01-23 09:49:45',1,NULL),(5,0,'mạnh test slug hihi',NULL,NULL,'{\"ROOT\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{\"background\":\"transparent\",\"padding\":40,\"margin\":0,\"positioning\":\"flow\",\"width\":\"100%\",\"height\":\"100%\",\"flexDirection\":\"column\",\"justifyContent\":\"flex-start\",\"alignItems\":\"flex-start\",\"gap\":10,\"borderRadius\":0,\"className\":\"min-h-full\"},\"displayName\":\"Container\",\"custom\":{},\"hidden\":false,\"nodes\":[\"gjkU2NDS7K\",\"YLRjOAc4eF\"],\"linkedNodes\":{}},\"gjkU2NDS7K\":{\"type\":{\"resolvedName\":\"HeadingComponent\"},\"isCanvas\":false,\"props\":{\"text\":\"Heading\",\"level\":\"h2\",\"align\":\"left\",\"color\":\"#ffffff\"},\"displayName\":\"Heading\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"YLRjOAc4eF\":{\"type\":{\"resolvedName\":\"HeadingComponent\"},\"isCanvas\":false,\"props\":{\"text\":\"Heading\",\"level\":\"h2\",\"align\":\"left\",\"color\":\"#ffffff\"},\"displayName\":\"Heading\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}}}',7,1,NULL,NULL,1,1,'2026-01-23 08:43:40','2026-01-26 09:01:07',1,'manh-test-slug-hihi');
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
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `fullName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `bio` text,
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$Y6dNYSevGhQvRkkCNhQWX.n1fOPUMnqTnUKuaYmF4ZRO8Xn9M2f9a','admin','2026-01-21 10:36:09','2026-01-21 10:36:09',NULL,NULL,NULL,NULL,NULL),(2,'user1','$2b$10$VgXqc5dbzGzVOjLRa8zjEeIIunn313AmZ5bPkJ1SWjtwD58.g9RUy','user','2026-01-22 02:28:52','2026-01-27 10:16:46','fasfasf','fasf@gmail.com','','',NULL);
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

-- Dump completed on 2026-01-27 17:31:55
