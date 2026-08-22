#!/usr/bin/env python3
"""Servidor local estático. No hace falta para publicar: el sitio se sube tal cual."""

from __future__ import annotations

import argparse
import functools
import http.server
import os
import socketserver
import sys
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_PORT = 8080


class CourseHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
    }

    def guess_type(self, path):
        if path.endswith(".dc.html"):
            return "text/html; charset=utf-8"
        return super().guess_type(path)

    def log_message(self, format, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), format % args))

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description="Sirve El Código del Piano en local.")
    parser.add_argument("-p", "--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    handler = functools.partial(CourseHandler, directory=ROOT)
    try:
        httpd = socketserver.ThreadingTCPServer(("127.0.0.1", args.port), handler)
    except OSError as exc:
        sys.stderr.write("No se pudo abrir el puerto %s: %s\n" % (args.port, exc))
        sys.exit(1)

    httpd.allow_reuse_address = True
    url = "http://127.0.0.1:%s/" % args.port
    sys.stderr.write("Curso en %s\nCtrl+C para detener.\n" % url)

    if not args.no_browser:
        webbrowser.open(url)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        sys.stderr.write("\nServidor detenido.\n")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
