import sqlite3
import os
import json
import tempfile

SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "schema.sql")

SCHEMA_SQL = """
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
"""

def get_db_path():
    """
    Determina o caminho do arquivo SQLite.
    Se estiver rodando no ambiente Serverless da Vercel ou Lambda,
    usa o diretório /tmp (único com permissão de escrita).
    Localmente, salva no próprio diretório do projeto.
    """
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        return os.path.join(tempfile.gettempdir(), "marca_ai.db")
    
    if "MARCA_AI_DB" in os.environ:
        return os.environ["MARCA_AI_DB"]
        
    local_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "marca_ai.db")
    try:
        test_file = local_path + ".test_perm"
        with open(test_file, "w") as f:
            f.write("1")
        os.remove(test_file)
        return local_path
    except (OSError, IOError):
        return os.path.join(tempfile.gettempdir(), "marca_ai.db")

def get_connection():
    db_path = get_db_path()
    needs_init = not os.path.exists(db_path)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    
    if needs_init:
        try:
            conn.executescript(SCHEMA_SQL)
            conn.commit()
        except Exception as e:
            print("Erro ao inicializar schema SQLite:", e)
            
    return conn

def init_db():
    conn = get_connection()
    try:
        if os.path.exists(SCHEMA_FILE):
            with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
                conn.executescript(f.read())
        else:
            conn.executescript(SCHEMA_SQL)
    except Exception:
        conn.executescript(SCHEMA_SQL)
    conn.commit()
    conn.close()

def get_all_partidas():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM partidas ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    
    partidas = []
    for row in rows:
        p_dict = dict(row)
        p_id = p_dict["id"]
        
        # Buscar participantes
        cursor.execute("""
            SELECT user_id as id, user_name as name, user_role as role, is_organizer, is_waitlist
            FROM participantes
            WHERE partida_id = ?
            ORDER BY joined_at ASC
        """, (p_id,))
        parts = cursor.fetchall()
        
        players = []
        waitlist = []
        for pt in parts:
            pt_dict = {
                "id": pt["id"],
                "name": pt["name"],
                "role": pt["role"],
                "isOrganizer": bool(pt["is_organizer"])
            }
            if pt["is_waitlist"]:
                waitlist.append(pt_dict)
            else:
                players.append(pt_dict)
                
        p_dict["players"] = players
        p_dict["waitlist"] = waitlist
        p_dict["maxPlayers"] = p_dict["max_players"]
        p_dict["courtType"] = p_dict["court_type"]
        p_dict["hasLighting"] = bool(p_dict["has_lighting"])
        p_dict["hasGoaliePerk"] = bool(p_dict["has_goalie_perk"])
        p_dict["organizerId"] = p_dict["organizer_id"]
        
        partidas.append(p_dict)
        
    conn.close()
    return partidas

def create_partida(data):
    conn = get_connection()
    cursor = conn.cursor()
    
    p_id = data.get("id") or f"match-{int(os.times().elapsed * 1000)}"
    
    try:
        lat = float(data.get("lat")) if data.get("lat") is not None and str(data.get("lat")).strip() != "" else -15.7985
    except (ValueError, TypeError):
        lat = -15.7985

    try:
        lng = float(data.get("lng")) if data.get("lng") is not None and str(data.get("lng")).strip() != "" else -47.9045
    except (ValueError, TypeError):
        lng = -47.9045
    
    cursor.execute("""
        INSERT INTO partidas (
            id, title, sport, category, date, time, venue, address,
            court_type, has_lighting, lat, lng, level, max_players,
            has_goalie_perk, organizer_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        p_id,
        data.get("title", "Pelada").strip() or "Partida",
        data.get("sport", "Futebol Society"),
        data.get("category", "futebol"),
        data.get("date", "Hoje"),
        data.get("time", "19:30"),
        data.get("venue", "Quadra Pública").strip() or "Quadra Pública",
        (data.get("address") or data.get("venue") or "Brasília - DF").strip(),
        data.get("courtType", "Quadra Pública"),
        1 if data.get("hasLighting", True) else 0,
        lat,
        lng,
        data.get("level", "Casual / Resenha"),
        int(data.get("maxPlayers", 14)),
        1 if data.get("hasGoaliePerk", False) else 0,
        data.get("organizerId", "usr-01")
    ))
    
    # Inserir o criador como primeiro participante confirmado
    creator = data.get("creator") or {
        "id": data.get("organizerId", "usr-01"),
        "name": "Organizador",
        "role": "Organizador"
    }
    cursor.execute("""
        INSERT INTO participantes (partida_id, user_id, user_name, user_role, is_organizer, is_waitlist)
        VALUES (?, ?, ?, ?, 1, 0)
    """, (p_id, creator["id"], creator["name"], creator.get("role", "Jogador")))
    
    conn.commit()
    conn.close()
    return p_id

def join_partida(partida_id, user, as_waitlist=False):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id FROM participantes WHERE partida_id = ? AND user_id = ?
    """, (partida_id, user["id"]))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return False, "Usuário já participa desta partida."
        
    cursor.execute("""
        INSERT INTO participantes (partida_id, user_id, user_name, user_role, is_organizer, is_waitlist)
        VALUES (?, ?, ?, ?, 0, ?)
    """, (partida_id, user["id"], user["name"], user.get("role", "Jogador"), 1 if as_waitlist else 0))
    
    conn.commit()
    conn.close()
    return True, "Presença registrada!"

def leave_partida(partida_id, user_id):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT is_waitlist FROM participantes WHERE partida_id = ? AND user_id = ?
    """, (partida_id, user_id))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        return False, "Usuário não encontrado na partida."
        
    was_waitlist = row["is_waitlist"]
    
    cursor.execute("""
        DELETE FROM participantes WHERE partida_id = ? AND user_id = ?
    """, (partida_id, user_id))
    
    promoted_user = None
    if not was_waitlist:
        cursor.execute("""
            SELECT id, user_name FROM participantes
            WHERE partida_id = ? AND is_waitlist = 1
            ORDER BY joined_at ASC LIMIT 1
        """, (partida_id,))
        next_waitlist = cursor.fetchone()
        if next_waitlist:
            cursor.execute("""
                UPDATE participantes SET is_waitlist = 0 WHERE id = ?
            """, (next_waitlist["id"],))
            promoted_user = next_waitlist["user_name"]
            
    conn.commit()
    conn.close()
    return True, promoted_user

def delete_partida(partida_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM partidas WHERE id = ?", (partida_id,))
    cursor.execute("DELETE FROM participantes WHERE partida_id = ?", (partida_id,))
    conn.commit()
    conn.close()
    return True

if __name__ == "__main__":
    init_db()
    print("Banco de dados SQLite inicializado com sucesso em", get_db_path())
