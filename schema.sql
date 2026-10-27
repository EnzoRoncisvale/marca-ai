-- Schema do Banco de Dados SQLite do Marca Aí!

CREATE TABLE IF NOT EXISTS partidas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    sport TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    address TEXT,
    court_type TEXT DEFAULT 'Quadra Pública',
    has_lighting INTEGER DEFAULT 1,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    level TEXT DEFAULT 'Casual / Resenha',
    max_players INTEGER NOT NULL DEFAULT 14,
    has_goalie_perk INTEGER DEFAULT 0,
    organizer_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partida_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    is_organizer INTEGER DEFAULT 0,
    is_waitlist INTEGER DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_participantes_partida ON participantes(partida_id);
