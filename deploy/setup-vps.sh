#!/usr/bin/env bash
# Alta de paola.robertobh.dev en el VPS (correr como root, UNA vez).
#
# Antes: crear en el DNS de robertobh.dev un registro A
#   paola  ->  178.156.248.110   (y AAAA si el VPS tiene IPv6 en el vhost principal)
# y esperar a que resuelva:  dig +short paola.robertobh.dev
#
# Uso:
#   scp deploy/setup-vps.sh deploy/nginx-paola.conf root@178.156.248.110:/root/
#   ssh root@178.156.248.110 'bash /root/setup-vps.sh'
set -euo pipefail

DOMAIN="paola.robertobh.dev"
ROOT="/var/www/paola"
CONF_SRC="${CONF_SRC:-/root/nginx-paola.conf}"
AVAIL="/etc/nginx/sites-available/paola.conf"
ENABLED="/etc/nginx/sites-enabled/paola.conf"

echo "→ Comprobando DNS de $DOMAIN"
if ! getent hosts "$DOMAIN" >/dev/null; then
  echo "✗ $DOMAIN todavía no resuelve. Crea el registro A y vuelve a correr." >&2
  exit 1
fi

mkdir -p "$ROOT"
[ -f "$ROOT/index.html" ] || echo '<!doctype html><title>paola</title>' > "$ROOT/index.html"

if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "→ Vhost temporal solo http para el reto de certbot"
  cat > "$AVAIL" <<NGX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    root $ROOT;
    location / { try_files \$uri \$uri/ =404; }
}
NGX
  ln -sf "$AVAIL" "$ENABLED"
  nginx -t && systemctl reload nginx
  echo "→ Emitiendo certificado"
  certbot certonly --nginx -d "$DOMAIN" --non-interactive --agree-tos --keep-until-expiring
fi

echo "→ Instalando vhost definitivo"
cp "$CONF_SRC" "$AVAIL"
ln -sf "$AVAIL" "$ENABLED"
nginx -t && systemctl reload nginx
chmod -R u=rwX,go=rX "$ROOT"

echo "✓ Listo. Sube el build:  scp -r dist/* root@178.156.248.110:$ROOT/"
echo "  o corre el workflow 'Deploy — VPS Hetzner' desde GitHub Actions."
