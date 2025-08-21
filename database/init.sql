PRAGMA foreign_keys = ON;

-- Accounts (merged user + account)
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    balance_cents INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Cards
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    card_number TEXT NOT NULL,
    last4_digits TEXT NOT NULL,
    token TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    card_id INTEGER,
    amount_cents INTEGER NOT NULL,
    merchant TEXT NOT NULL,
    mcc TEXT NOT NULL,
    is_approved INTEGER NOT NULL,
    rejection_reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE SET NULL
);

-- seed
INSERT OR IGNORE INTO accounts (id, email, name, balance_cents) VALUES
(1, 'debug@user.com', 'Debug User', 100000);

INSERT OR IGNORE INTO cards (id, account_id, card_number, last4_digits, token, is_active) VALUES
(1, 1, '4111111111110001', '0001', 'debug_token_0001', 1);

INSERT OR IGNORE INTO transactions (id, account_id, card_id, amount_cents, merchant, mcc, is_approved, rejection_reason) VALUES
(1, 1, 1, 2500, 'Pharmacy', '5912', 1, NULL),
(2, 1, 1, 5000, 'Electronics', '5732', 0, 'Non-qualified expense');
