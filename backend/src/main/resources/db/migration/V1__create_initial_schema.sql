-- Members (users)
CREATE TABLE members (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    membership_id VARCHAR(50) NOT NULL UNIQUE,
    role        VARCHAR(20)  NOT NULL DEFAULT 'MEMBER',
    borrowing_limit INT       NOT NULL DEFAULT 5,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_members_email       ON members(email);
CREATE INDEX idx_members_membership_id ON members(membership_id);

-- Books
CREATE TABLE books (
    id               BIGSERIAL PRIMARY KEY,
    isbn             VARCHAR(20)  NOT NULL UNIQUE,
    title            VARCHAR(500) NOT NULL,
    author           VARCHAR(300) NOT NULL,
    category         VARCHAR(100) NOT NULL DEFAULT 'General',
    publisher        VARCHAR(200),
    published_year   INT,
    total_copies     INT          NOT NULL DEFAULT 1,
    available_copies INT          NOT NULL DEFAULT 1,
    cover_url        VARCHAR(1000),
    description      TEXT,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_isbn     ON books(isbn);
CREATE INDEX idx_books_title    ON books(title);
CREATE INDEX idx_books_author   ON books(author);
CREATE INDEX idx_books_category ON books(category);

-- Loans
CREATE TABLE loans (
    id           BIGSERIAL PRIMARY KEY,
    book_id      BIGINT    NOT NULL REFERENCES books(id),
    member_id    BIGINT    NOT NULL REFERENCES members(id),
    borrowed_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    due_date     TIMESTAMP NOT NULL,
    returned_at  TIMESTAMP,
    fine_amount  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    fine_paid    BOOLEAN   NOT NULL DEFAULT FALSE,
    status       VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX idx_loans_book_id   ON loans(book_id);
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_status    ON loans(status);

-- Reservations
CREATE TABLE reservations (
    id          BIGSERIAL PRIMARY KEY,
    book_id     BIGINT    NOT NULL REFERENCES books(id),
    member_id   BIGINT    NOT NULL REFERENCES members(id),
    reserved_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notified_at TIMESTAMP
);

CREATE INDEX idx_reservations_book_id   ON reservations(book_id);
CREATE INDEX idx_reservations_member_id ON reservations(member_id);
CREATE INDEX idx_reservations_status    ON reservations(status);
