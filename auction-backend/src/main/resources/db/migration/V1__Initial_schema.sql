CREATE TABLE users (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  social_type VARCHAR(255) NOT NULL,
  nickname VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  role VARCHAR(255) NOT NULL,
  email_verified TINYINT(1) DEFAULT 0,
  email_verification_token VARCHAR(255) DEFAULT NULL,
  email_verification_expiry DATETIME DEFAULT NULL,
  refresh_token TEXT DEFAULT NULL,
  refresh_token_expiry DATETIME DEFAULT NULL,
  last_login_at DATETIME DEFAULT NULL,
  last_login_ip VARCHAR(255) DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY username (username),
  UNIQUE KEY email (email),
  KEY idx_username (username),
  KEY idx_email (email),
  KEY idx_users_email_verification_token (email_verification_token),
  KEY idx_users_refresh_token (refresh_token(768)),
  KEY idx_users_email_verified (email_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auction (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT '신품',
  brand VARCHAR(100) DEFAULT NULL,
  image_url1 VARCHAR(500) DEFAULT NULL,
  image_url2 VARCHAR(500) DEFAULT NULL,
  image_url3 VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  start_price INT(11) NOT NULL,
  buy_now_price INT(11) DEFAULT NULL,
  bid_unit INT(11) NOT NULL DEFAULT 1000,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  min_bid_count INT(11) NOT NULL DEFAULT 1,
  auto_extend TINYINT(1) NOT NULL DEFAULT 0,
  shipping_fee VARCHAR(20) NOT NULL DEFAULT '무료',
  shipping_type VARCHAR(20) NOT NULL DEFAULT '택배',
  location VARCHAR(200) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  highest_bid INT(11) NOT NULL DEFAULT 0,
  is_closed TINYINT(1) NOT NULL DEFAULT 0,
  winner VARCHAR(100) DEFAULT NULL,
  view_count INT(11) NOT NULL DEFAULT 0,
  bid_count INT(11) NOT NULL DEFAULT 0,
  user_id BIGINT(20) NOT NULL DEFAULT 1,
  winner_id BIGINT(20) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_auction_category (category),
  KEY idx_auction_status (status),
  KEY idx_auction_brand (brand),
  KEY idx_auction_start_time (start_time),
  KEY idx_auction_end_time (end_time),
  KEY idx_auction_is_closed (is_closed),
  KEY idx_auction_created_at (created_at),
  KEY idx_auction_view_count (view_count),
  KEY idx_auction_bid_count (bid_count),
  KEY idx_auction_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE comments (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  auction_id BIGINT(20) NOT NULL,
  user_id BIGINT(20) DEFAULT NULL,
  author VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_auction_id (auction_id),
  KEY idx_created_at (created_at),
  CONSTRAINT comments_ibfk_1 FOREIGN KEY (auction_id) REFERENCES auction (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auto_bids (
  auction_id BIGINT(20) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  max_amount INT(11) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (auction_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE bids (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  auction_id BIGINT(20) NOT NULL,
  bidder VARCHAR(100) NOT NULL,
  bid_amount INT(11) NOT NULL,
  bid_time DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_auction_id (auction_id),
  KEY idx_bid_time (bid_time),
  KEY idx_bids_bidder (bidder),
  KEY idx_bids_bid_amount (bid_amount),
  CONSTRAINT bids_ibfk_1 FOREIGN KEY (auction_id) REFERENCES auction (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_rooms (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  auction_id BIGINT(20) NOT NULL,
  room_name VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_auction_id (auction_id),
  KEY idx_is_active (is_active),
  CONSTRAINT chat_rooms_ibfk_1 FOREIGN KEY (auction_id) REFERENCES auction (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_participants (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  room_id BIGINT(20) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_read_at DATETIME DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY unique_room_user (room_id, user_id),
  KEY idx_user_id (user_id),
  KEY idx_is_active (is_active),
  CONSTRAINT chat_participants_ibfk_1 FOREIGN KEY (room_id) REFERENCES chat_rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_messages (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  room_id BIGINT(20) NOT NULL,
  sender_id VARCHAR(100) NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_room_id (room_id),
  KEY idx_sender_id (sender_id),
  KEY idx_created_at (created_at),
  KEY idx_chat_messages_room_created (room_id, created_at),
  KEY idx_chat_messages_sender (sender_id, created_at),
  CONSTRAINT chat_messages_ibfk_1 FOREIGN KEY (room_id) REFERENCES chat_rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE event (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  is_important TINYINT(1) DEFAULT 0,
  views INT(11) DEFAULT 0,
  author VARCHAR(50) DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE faq (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  is_important TINYINT(1) DEFAULT 0,
  views INT(11) DEFAULT 0,
  author VARCHAR(50) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE favorites (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  auction_id BIGINT(20) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_auction (user_id, auction_id),
  KEY idx_favorites_user_id (user_id),
  KEY idx_favorites_auction_id (auction_id),
  KEY idx_favorites_created_at (created_at),
  CONSTRAINT favorites_ibfk_1 FOREIGN KEY (auction_id) REFERENCES auction (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE inquiry (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(50) DEFAULT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  answer TEXT DEFAULT NULL,
  answerer VARCHAR(50) DEFAULT NULL,
  answered_at DATETIME DEFAULT NULL,
  attachment_url VARCHAR(255) DEFAULT NULL,
  status VARCHAR(20) DEFAULT '대기',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE notice (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  is_important TINYINT(1) DEFAULT 0,
  views INT(11) DEFAULT 0,
  author VARCHAR(50) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE notifications (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(255) DEFAULT NULL,
  auction_id BIGINT(20) DEFAULT NULL,
  type VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read INT(11) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seller_id BIGINT(20) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY auction_id (auction_id),
  KEY idx_user_id (user_id),
  KEY idx_is_read (is_read),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE private_messages (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  auction_id BIGINT(20) DEFAULT NULL,
  sender_id VARCHAR(100) NOT NULL,
  receiver_id VARCHAR(100) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_auction_id (auction_id),
  KEY idx_sender_id (sender_id),
  KEY idx_receiver_id (receiver_id),
  KEY idx_is_read (is_read),
  KEY idx_created_at (created_at),
  KEY idx_private_messages_receiver_read (receiver_id, is_read),
  KEY idx_private_messages_sender (sender_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reports (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  auction_id BIGINT(20) NOT NULL,
  reporter VARCHAR(100) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE statistics (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  auction_id BIGINT(20) NOT NULL,
  view_count INT(11) NOT NULL DEFAULT 0,
  bid_count INT(11) NOT NULL DEFAULT 0,
  unique_bidders INT(11) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_auction_stat (auction_id),
  CONSTRAINT statistics_ibfk_1 FOREIGN KEY (auction_id) REFERENCES auction (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE login_history (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,
  user_id BIGINT(20) NOT NULL,
  login_at DATETIME NOT NULL,
  login_ip VARCHAR(255) DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  status VARCHAR(255) NOT NULL,
  failure_reason VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_login_history_user_id (user_id),
  KEY idx_login_history_login_at (login_at),
  KEY idx_login_history_status (status),
  CONSTRAINT login_history_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===== TRIGGERS =====
DELIMITER ;;
CREATE TRIGGER update_highest_bid_after_insert
AFTER INSERT ON bids
FOR EACH ROW
BEGIN
  UPDATE auction
  SET highest_bid = (
    SELECT MAX(bid_amount)
    FROM bids
    WHERE auction_id = NEW.auction_id
  )
  WHERE id = NEW.auction_id;
END;;
DELIMITER ;

-- ===== VIEWS =====
CREATE ALGORITHM=UNDEFINED
VIEW auction_stats AS
SELECT
  a.id AS id,
  a.title AS title,
  a.category AS category,
  a.start_price AS start_price,
  a.highest_bid AS highest_bid,
  a.buy_now_price AS buy_now_price,
  COUNT(b.id) AS total_bids,
  COUNT(DISTINCT b.bidder) AS unique_bidders,
  MAX(b.bid_amount) AS max_bid,
  MIN(b.bid_amount) AS min_bid,
  AVG(b.bid_amount) AS avg_bid
FROM auction a
LEFT JOIN bids b ON a.id = b.auction_id
GROUP BY a.id;

CREATE ALGORITHM=UNDEFINED
VIEW active_auctions AS
SELECT
  a.id,
  a.title,
  a.category,
  a.status,
  a.brand,
  a.image_url1,
  a.image_url2,
  a.image_url3,
  a.description,
  a.start_price,
  a.buy_now_price,
  a.bid_unit,
  a.start_time,
  a.end_time,
  a.min_bid_count,
  a.auto_extend,
  a.shipping_fee,
  a.shipping_type,
  a.location,
  a.created_at,
  a.updated_at,
  a.highest_bid,
  a.is_closed,
  a.winner,
  COUNT(b.id) AS bid_count,
  COUNT(DISTINCT b.bidder) AS unique_bidders
FROM auction a
LEFT JOIN bids b ON a.id = b.auction_id
WHERE a.is_closed = 0
  AND a.end_time > CURRENT_TIMESTAMP()
GROUP BY a.id
ORDER BY a.created_at DESC;