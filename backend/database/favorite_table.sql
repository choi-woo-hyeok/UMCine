-- synchronize: false인 기존 MySQL DB에서 최초 1회 실행하세요.
-- member 테이블의 member_id 타입이 BIGINT가 아니라면 해당 타입에 맞춰 수정해야 합니다.
CREATE TABLE IF NOT EXISTS favorite (
  favorite_id INT NOT NULL AUTO_INCREMENT,
  member_id BIGINT NOT NULL,
  movie_id BIGINT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (favorite_id),
  CONSTRAINT uk_favorite_member_movie UNIQUE (member_id, movie_id),
  CONSTRAINT fk_favorite_member FOREIGN KEY (member_id) REFERENCES member(member_id)
);
-- 실제 BaseTimeEntity 및 Member의 컬럼명/자료형과 반드시 맞추세요.
