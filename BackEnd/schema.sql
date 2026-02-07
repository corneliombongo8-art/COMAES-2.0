CREATE DATABASE  IF NOT EXISTS `comaes_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `comaes_db`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: comaes_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `configuracoes_usuario`
--

DROP TABLE IF EXISTS `configuracoes_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracoes_usuario` (
  `usuario_id` int(11) NOT NULL,
  `preferencias` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferencias`)),
  `atualizado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`usuario_id`),
  CONSTRAINT `configuracoes_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conquistas`
--

DROP TABLE IF EXISTS `conquistas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conquistas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `criterios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`criterios`)),
  `url_icone` varchar(1024) DEFAULT NULL,
  `criado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conquistas_usuario`
--

DROP TABLE IF EXISTS `conquistas_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conquistas_usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `conquista_id` int(11) NOT NULL,
  `concedido_em` datetime DEFAULT NULL,
  `concedido_por` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conquistas_usuario_usuario_id_conquista_id` (`usuario_id`,`conquista_id`),
  KEY `conquistas_usuario_usuario_id` (`usuario_id`),
  KEY `conquista_id` (`conquista_id`),
  KEY `concedido_por` (`concedido_por`),
  CONSTRAINT `conquistas_usuario_ibfk_41` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conquistas_usuario_ibfk_42` FOREIGN KEY (`conquista_id`) REFERENCES `conquistas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conquistas_usuario_ibfk_43` FOREIGN KEY (`concedido_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `funcoes`
--

DROP TABLE IF EXISTS `funcoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `permissoes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissoes`)),
  `criado_em` datetime DEFAULT NULL,
  `atualizado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`),
  UNIQUE KEY `nome_2` (`nome`),
  UNIQUE KEY `nome_3` (`nome`),
  UNIQUE KEY `nome_4` (`nome`),
  UNIQUE KEY `nome_5` (`nome`),
  UNIQUE KEY `nome_6` (`nome`),
  UNIQUE KEY `nome_7` (`nome`),
  UNIQUE KEY `nome_8` (`nome`),
  UNIQUE KEY `nome_9` (`nome`),
  UNIQUE KEY `nome_10` (`nome`),
  UNIQUE KEY `nome_11` (`nome`),
  UNIQUE KEY `nome_12` (`nome`),
  UNIQUE KEY `nome_13` (`nome`),
  UNIQUE KEY `nome_14` (`nome`),
  UNIQUE KEY `nome_15` (`nome`),
  UNIQUE KEY `nome_16` (`nome`),
  UNIQUE KEY `nome_17` (`nome`),
  UNIQUE KEY `nome_18` (`nome`),
  UNIQUE KEY `nome_19` (`nome`),
  UNIQUE KEY `nome_20` (`nome`),
  UNIQUE KEY `nome_21` (`nome`),
  UNIQUE KEY `nome_22` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `noticias`
--

DROP TABLE IF EXISTS `noticias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `noticias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `resumo` text DEFAULT NULL,
  `conteudo` text NOT NULL,
  `autor_id` int(11) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `url_capa` varchar(1024) DEFAULT NULL,
  `publicado_em` datetime DEFAULT NULL,
  `publicado` tinyint(1) DEFAULT 0,
  `criado_em` datetime DEFAULT NULL,
  `atualizado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`),
  UNIQUE KEY `slug_3` (`slug`),
  UNIQUE KEY `slug_4` (`slug`),
  UNIQUE KEY `slug_5` (`slug`),
  UNIQUE KEY `slug_6` (`slug`),
  UNIQUE KEY `slug_7` (`slug`),
  UNIQUE KEY `slug_8` (`slug`),
  UNIQUE KEY `slug_9` (`slug`),
  UNIQUE KEY `slug_10` (`slug`),
  UNIQUE KEY `slug_11` (`slug`),
  UNIQUE KEY `slug_12` (`slug`),
  UNIQUE KEY `slug_13` (`slug`),
  UNIQUE KEY `slug_14` (`slug`),
  UNIQUE KEY `slug_15` (`slug`),
  UNIQUE KEY `slug_16` (`slug`),
  UNIQUE KEY `slug_17` (`slug`),
  UNIQUE KEY `slug_18` (`slug`),
  UNIQUE KEY `slug_19` (`slug`),
  UNIQUE KEY `slug_20` (`slug`),
  UNIQUE KEY `slug_21` (`slug`),
  UNIQUE KEY `slug_22` (`slug`),
  KEY `noticias_slug` (`slug`),
  KEY `noticias_autor_id` (`autor_id`),
  CONSTRAINT `noticias_ibfk_1` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notificacoes`
--

DROP TABLE IF EXISTS `notificacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `conteudo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`conteudo`)),
  `lido` tinyint(1) DEFAULT 0,
  `criado_em` datetime DEFAULT NULL,
  `lido_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notificacoes_usuario_id` (`usuario_id`),
  KEY `notificacoes_lido` (`lido`),
  CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `perguntas`
--

DROP TABLE IF EXISTS `perguntas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `perguntas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ordem_indice` int(11) NOT NULL,
  `tipo` enum('matematica','ingles','programacao','multipla_escolha','texto') NOT NULL,
  `texto_pergunta` text NOT NULL,
  `resposta_correta` enum('a','b','c','d') NOT NULL,
  `pontos` int(11) DEFAULT 1,
  `midia` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`midia`)),
  `criado_em` datetime DEFAULT NULL,
  `opcao_a` varchar(255) DEFAULT NULL,
  `opcao_b` varchar(255) DEFAULT NULL,
  `opcao_c` varchar(255) DEFAULT NULL,
  `opcao_d` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questoes_ingles`
--

DROP TABLE IF EXISTS `questoes_ingles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questoes_ingles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  `dificuldade` enum('facil','medio','dificil') NOT NULL,
  `torneio_id` int(11) NOT NULL,
  `resposta_correta` text NOT NULL,
  `opcoes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`opcoes`)),
  `pontos` int(11) DEFAULT 10,
  `midia` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`midia`)),
  `criado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `questoes_ingles_torneio_id` (`torneio_id`),
  CONSTRAINT `questoes_ingles_ibfk_1` FOREIGN KEY (`torneio_id`) REFERENCES `torneios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questoes_matematica`
--

DROP TABLE IF EXISTS `questoes_matematica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questoes_matematica` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `dificuldade` enum('facil','medio','dificil') NOT NULL DEFAULT 'facil',
  `torneio_id` int(11) NOT NULL,
  `enunciado` text NOT NULL,
  `opcoes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`opcoes`)),
  `correta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`correta`)),
  `pontos` int(11) DEFAULT 1,
  `midia` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`midia`)),
  `criado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `questoes_matematica_torneio_id` (`torneio_id`),
  CONSTRAINT `questoes_matematica_ibfk_1` FOREIGN KEY (`torneio_id`) REFERENCES `torneios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questoes_programacao`
--

DROP TABLE IF EXISTS `questoes_programacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questoes_programacao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  `dificuldade` enum('facil','medio','dificil') NOT NULL,
  `torneio_id` int(11) NOT NULL,
  `resposta_correta` text NOT NULL,
  `opcoes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`opcoes`)),
  `pontos` int(11) DEFAULT 15,
  `midia` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`midia`)),
  `linguagem` varchar(50) DEFAULT NULL,
  `criado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `questoes_programacao_torneio_id` (`torneio_id`),
  CONSTRAINT `questoes_programacao_ibfk_1` FOREIGN KEY (`torneio_id`) REFERENCES `torneios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `redefinicoes_senha`
--

DROP TABLE IF EXISTS `redefinicoes_senha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `redefinicoes_senha` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `hash_token` varchar(255) NOT NULL,
  `expira_em` datetime NOT NULL,
  `usado_em` datetime DEFAULT NULL,
  `criado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `redefinicoes_senha_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tentativas_teste`
--

DROP TABLE IF EXISTS `tentativas_teste`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tentativas_teste` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `iniciado_em` datetime DEFAULT NULL,
  `concluido_em` datetime DEFAULT NULL,
  `respostas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`respostas`)),
  `pontuacao` decimal(10,2) DEFAULT NULL,
  `status` enum('em_progresso','concluida','cancelada') DEFAULT 'em_progresso',
  `duracao_segundos` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tentativas_teste_usuario_id_teste_id` (`usuario_id`),
  KEY `tentativas_teste_usuario_id` (`usuario_id`),
  CONSTRAINT `tentativas_teste_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tickets_suporte`
--

DROP TABLE IF EXISTS `tickets_suporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets_suporte` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `assunto` varchar(255) NOT NULL,
  `mensagem` text NOT NULL,
  `status` enum('aberto','pendente','fechado') DEFAULT 'aberto',
  `prioridade` enum('baixa','media','alta') DEFAULT 'media',
  `atribuido_para` int(11) DEFAULT NULL,
  `criado_em` datetime DEFAULT NULL,
  `atualizado_em` datetime DEFAULT NULL,
  `fechado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tickets_suporte_usuario_id` (`usuario_id`),
  KEY `tickets_suporte_status` (`status`),
  KEY `atribuido_para` (`atribuido_para`),
  CONSTRAINT `tickets_suporte_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tickets_suporte_ibfk_2` FOREIGN KEY (`atribuido_para`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `torneios`
--

DROP TABLE IF EXISTS `torneios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `torneios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `regras` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`regras`)),
  `inicia_em` datetime DEFAULT NULL,
  `termina_em` datetime DEFAULT NULL,
  `maximo_participantes` int(11) DEFAULT NULL,
  `criado_por` int(11) NOT NULL,
  `status` enum('rascunho','agendado','ativo','finalizado','cancelado') DEFAULT 'rascunho',
  `publico` tinyint(1) DEFAULT 1,
  `criado_em` datetime DEFAULT NULL,
  `atualizado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`),
  UNIQUE KEY `slug_3` (`slug`),
  UNIQUE KEY `slug_4` (`slug`),
  UNIQUE KEY `slug_5` (`slug`),
  UNIQUE KEY `slug_6` (`slug`),
  UNIQUE KEY `slug_7` (`slug`),
  UNIQUE KEY `slug_8` (`slug`),
  UNIQUE KEY `slug_9` (`slug`),
  UNIQUE KEY `slug_10` (`slug`),
  UNIQUE KEY `slug_11` (`slug`),
  UNIQUE KEY `slug_12` (`slug`),
  UNIQUE KEY `slug_13` (`slug`),
  UNIQUE KEY `slug_14` (`slug`),
  UNIQUE KEY `slug_15` (`slug`),
  UNIQUE KEY `slug_16` (`slug`),
  UNIQUE KEY `slug_17` (`slug`),
  UNIQUE KEY `slug_18` (`slug`),
  UNIQUE KEY `slug_19` (`slug`),
  UNIQUE KEY `slug_20` (`slug`),
  UNIQUE KEY `slug_21` (`slug`),
  UNIQUE KEY `slug_22` (`slug`),
  KEY `torneios_slug` (`slug`),
  KEY `torneios_criado_por` (`criado_por`),
  CONSTRAINT `torneios_ibfk_1` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `nascimento` date NOT NULL,
  `sexo` enum('Masculino','Feminino') NOT NULL,
  `password` varchar(255) NOT NULL,
  `escola` varchar(255) DEFAULT NULL,
  `imagem` varchar(1024) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `funcao_id` int(11) DEFAULT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT 0,
  `biografia` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `telefone` (`telefone`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `telefone_2` (`telefone`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `telefone_3` (`telefone`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `telefone_4` (`telefone`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `telefone_5` (`telefone`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `telefone_6` (`telefone`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `telefone_7` (`telefone`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `telefone_8` (`telefone`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `telefone_9` (`telefone`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `telefone_10` (`telefone`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `telefone_11` (`telefone`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `telefone_12` (`telefone`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `telefone_13` (`telefone`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `telefone_14` (`telefone`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `telefone_15` (`telefone`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `telefone_16` (`telefone`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `telefone_17` (`telefone`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `telefone_18` (`telefone`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `telefone_19` (`telefone`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `telefone_20` (`telefone`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `telefone_21` (`telefone`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `telefone_22` (`telefone`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `telefone_23` (`telefone`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `telefone_24` (`telefone`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `telefone_25` (`telefone`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `telefone_26` (`telefone`),
  UNIQUE KEY `email_26` (`email`),
  KEY `funcao_id` (`funcao_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`funcao_id`) REFERENCES `funcoes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `participantes_torneios`
--

DROP TABLE IF EXISTS `participantes_torneios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participantes_torneios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `torneio_id` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  `entrou_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pendente', 'confirmado', 'removido', 'desclassificado') DEFAULT 'pendente',
  `pontuacao` DECIMAL(10, 2) DEFAULT 0.00,
  `posicao` INT DEFAULT NULL,
  `casos_resolvidos` INT DEFAULT 0,
  `disciplina_competida` ENUM('Matemática', 'Inglês', 'Programação') NOT NULL,
  `ultima_atividade` DATETIME DEFAULT NULL,
  `tempo_total` INT DEFAULT 0,
  `precisao` DECIMAL(5, 2) DEFAULT 0.00,
  `nivel_atual` ENUM('iniciante', 'intermediário', 'avançado', 'expert') DEFAULT 'iniciante',
  `conquistas` JSON DEFAULT NULL,
  `historico_pontuacao` JSON DEFAULT NULL,
  `metadados` JSON DEFAULT NULL,
  `criado_em` DATETIME NOT NULL,
  `atualizado_em` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participacao_disciplina` (`torneio_id`, `usuario_id`, `disciplina_competida`),
  KEY `idx_torneio` (`torneio_id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_pontuacao` (`pontuacao`),
  KEY `idx_posicao` (`posicao`),
  KEY `idx_status` (`status`),
  KEY `idx_disciplina` (`disciplina_competida`),
  CONSTRAINT `participantes_torneios_ibfk_1` FOREIGN KEY (`torneio_id`) REFERENCES `torneios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `participantes_torneios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-06 14:58:33
