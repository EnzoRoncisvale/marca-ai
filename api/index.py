import sys
import os
import json
import urllib.parse
from http.server import BaseHTTPRequestHandler

# Adiciona o diretório raiz ao sys.path para importar db.py
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import db

MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf"
}

class handler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        response_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def _get_clean_path(self):
        raw_path = self.path or self.headers.get("x-forwarded-uri") or "/"
        parsed = urllib.parse.urlparse(raw_path)
        return parsed.path

    def _try_serve_static(self, path):
        clean = path.strip("/")
        if not clean or clean == "index.html":
            target_rel = "index.html"
        else:
            target_rel = clean

        candidates = [
            os.path.join(ROOT_DIR, "public", target_rel),
            os.path.join(ROOT_DIR, target_rel)
        ]

        for cand in candidates:
            if os.path.isfile(cand):
                ext = os.path.splitext(cand)[1].lower()
                content_type = MIME_TYPES.get(ext, "application/octet-stream")
                try:
                    with open(cand, "rb") as f:
                        data = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", content_type)
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
                    return True
                except Exception:
                    pass
        return False

    def do_GET(self):
        path = self._get_clean_path()

        # Primeiro: tenta servir arquivos estáticos públicos (/manifest.json, /service-worker.js, etc)
        if not path.startswith("/api/partidas") and not path == "/api":
            if self._try_serve_static(path):
                return

        # Rota de listagem de partidas
        if path == "/api/partidas" or path == "/api" or path.endswith("/partidas"):
            try:
                partidas = db.get_all_partidas()
                self._send_json(partidas)
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        # Fallback estático geral
        if self._try_serve_static(path):
            return

        self._send_json({"error": f"Endpoint GET {path} não encontrado"}, status=404)

    def do_POST(self):
        path = self._get_clean_path()
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode("utf-8")) if post_data else {}

        # Criar nova partida (/api/partidas)
        if path == "/api/partidas" or path == "/api" or path.endswith("/partidas"):
            try:
                p_id = db.create_partida(data)
                self._send_json({"success": True, "id": p_id}, status=201)
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        # Participar de partida (/api/partidas/<id>/participar)
        if "/participar" in path:
            parts = path.strip("/").split("/")
            try:
                idx = parts.index("partidas")
                partida_id = parts[idx + 1]
            except Exception:
                partida_id = parts[-2]
            user = data.get("user")
            as_waitlist = data.get("asWaitlist", False)
            try:
                ok, msg = db.join_partida(partida_id, user, as_waitlist)
                self._send_json({"success": ok, "message": msg}, status=200 if ok else 400)
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        # Sair de partida (/api/partidas/<id>/sair)
        if "/sair" in path:
            parts = path.strip("/").split("/")
            try:
                idx = parts.index("partidas")
                partida_id = parts[idx + 1]
            except Exception:
                partida_id = parts[-2]
            user_id = data.get("userId")
            try:
                ok, promoted = db.leave_partida(partida_id, user_id)
                self._send_json({"success": ok, "promotedUser": promoted}, status=200 if ok else 400)
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        # Gerenciar checklist de materiais (/api/partidas/<id>/checklist)
        if "/checklist" in path:
            parts = path.strip("/").split("/")
            try:
                idx = parts.index("partidas")
                partida_id = parts[idx + 1]
            except Exception:
                partida_id = parts[-2]
            action = data.get("action", "claim")
            item_id = data.get("itemId")
            user_id = data.get("userId")
            user_name = data.get("userName")
            custom_name = data.get("customName")
            try:
                ok, msg, items = db.update_checklist_item(partida_id, item_id, user_id, user_name, action, custom_name)
                self._send_json({"success": ok, "message": msg, "checklist": items}, status=200 if ok else 400)
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        self._send_json({"error": f"Endpoint POST {path} não encontrado"}, status=404)

    def do_DELETE(self):
        path = self._get_clean_path()
        if "/partidas/" in path:
            parts = path.strip("/").split("/")
            try:
                idx = parts.index("partidas")
                partida_id = parts[idx + 1]
            except Exception:
                partida_id = parts[-1]
            try:
                db.delete_partida(partida_id)
                self._send_json({"success": True, "message": "Partida removida"})
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        self._send_json({"error": f"Endpoint DELETE {path} não encontrado"}, status=404)
