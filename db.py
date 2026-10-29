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
    checklist TEXT DEFAULT '[]',
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

def get_default_checklist(category="futebol"):
    cat = (category or "").lower()
    if "futebol" in cat or "futsal" in cat or "society" in cat:
        return [
            {"id": "item-bola", "name": "Bola de Futebol Calibrada", "icon": "fa-futbol", "isEssential": True, "assignedTo": None, "assignedName": None},
            {"id": "item-coletes", "name": "Jogo de Coletes (2 cores)", "icon": "fa-shirt", "isEssential": True, "assignedTo": None, "assignedName": None},
            {"id": "item-bomba", "name": "Bomba de Ar e Bico", "icon": "fa-gauge-high", "isEssential": False, "assignedTo": None, "assignedName": None},
            {"id": "item-apito", "name": "Apito de Juiz / Cronômetro", "icon": "fa-stopwatch", "isEssential": False, "assignedTo": None, "assignedName": None}
        ]
    elif "basquete" in cat:
        return [
            {"id": "item-bola", "name": "Bola de Basquete Tam. 7", "icon": "fa-basketball", "isEssential": True, "assignedTo": None, "assignedName": None},
            {"id": "item-bomba", "name": "Bomba de Ar", "icon": "fa-gauge-high", "isEssential": False, "assignedTo": None, "assignedName": None},
            {"id": "item-coletes", "name": "Coletes de Time", "icon": "fa-shirt", "isEssential": False, "assignedTo": None, "assignedName": None}
        ]
    elif "volei" in cat or "beach" in cat:
        return [
            {"id": "item-bola", "name": "Bola Oficial de Vôlei", "icon": "fa-volleyball", "isEssential": True, "assignedTo": None, "assignedName": None},
            {"id": "item-bomba", "name": "Bomba de Ar", "icon": "fa-gauge-high", "isEssential": False, "assignedTo": None, "assignedName": None},
            {"id": "item-antenas", "name": "Antenas ou Fitas de Marcação", "icon": "fa-ruler-combined", "isEssential": False, "assignedTo": None, "assignedName": None}
        ]
    elif "tenis" in cat:
        return [
            {"id": "item-bolas", "name": "Tubo de Bolas Novas", "icon": "fa-baseball", "isEssential": True, "assignedTo": None, "assignedName": None},
            {"id": "item-raquete", "name": "Raquete Reserva", "icon": "fa-table-tennis-paddle-ball", "isEssential": False, "assignedTo": None, "assignedName": None}
        ]
    else:
        return [
            {"id": "item-bola", "name": "Bola / Equipamento Principal", "icon": "fa-trophy", "isEssential": True, "assignedTo": None, "assignedName": None},
            {"id": "item-coletes", "name": "Coletes / Fitas de Time", "icon": "fa-shirt", "isEssential": False, "assignedTo": None, "assignedName": None},
            {"id": "item-bomba", "name": "Bomba de Ar / Calibrador", "icon": "fa-gauge-high", "isEssential": False, "assignedTo": None, "assignedName": None}
        ]

def get_db_path():
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
    else:
        # Migração automática de colunas caso ainda não existam
        try:
            conn.execute("ALTER TABLE partidas ADD COLUMN checklist TEXT DEFAULT '[]'")
            conn.commit()
        except sqlite3.OperationalError:
            pass
            
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
        
        # Processar checklist
        raw_checklist = p_dict.get("checklist")
        try:
            p_dict["checklist"] = json.loads(raw_checklist) if raw_checklist else []
        except Exception:
            p_dict["checklist"] = []
            
        if not p_dict["checklist"]:
            p_dict["checklist"] = get_default_checklist(p_dict.get("category", "futebol"))
        
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
    
    category = data.get("category", "futebol")
    checklist_data = data.get("checklist")
    if not checklist_data:
        checklist_data = get_default_checklist(category)
    checklist_json = json.dumps(checklist_data, ensure_ascii=False) if isinstance(checklist_data, list) else str(checklist_data)

    cursor.execute("""
        INSERT INTO partidas (
            id, title, sport, category, date, time, venue, address,
            court_type, has_lighting, lat, lng, level, max_players,
            has_goalie_perk, organizer_id, checklist
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        p_id,
        data.get("title", "Pelada").strip() or "Partida",
        data.get("sport", "Futebol Society"),
        category,
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
        data.get("organizerId", "usr-01"),
        checklist_json
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

def update_checklist_item(partida_id, item_id, user_id, user_name, action, custom_name=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT checklist, category FROM partidas WHERE id = ?", (partida_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False, "Partida não encontrada", []
        
    try:
        items = json.loads(row["checklist"]) if row["checklist"] else []
    except Exception:
        items = []
        
    if not items:
        items = get_default_checklist(row["category"] or "futebol")
        
    if action == "claim":
        found = False
        for item in items:
            if item["id"] == item_id:
                item["assignedTo"] = user_id
                item["assignedName"] = user_name
                found = True
                break
        if not found:
            conn.close()
            return False, "Item não encontrado", items
            
    elif action == "release":
        for item in items:
            if item["id"] == item_id:
                item["assignedTo"] = None
                item["assignedName"] = None
                break
                
    elif action == "add":
        new_item = {
            "id": f"item-{int(os.times().elapsed * 1000)}",
            "name": custom_name or "Material Extra",
            "icon": "fa-box",
            "isEssential": False,
            "assignedTo": user_id if user_id else None,
            "assignedName": user_name if user_id else None
        }
        items.append(new_item)
        
    elif action == "remove":
        items = [it for it in items if it["id"] != item_id]
        
    cursor.execute("UPDATE partidas SET checklist = ? WHERE id = ?", (json.dumps(items, ensure_ascii=False), partida_id))
    conn.commit()
    conn.close()
    return True, "Checklist atualizado com sucesso", items

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
