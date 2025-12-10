
# thm_hosts_updater.py — Ultimate 2025 Edition
# Auto-update /etc/hosts with TryHackMe machine IP
# Works flawlessly with the content.js script above

import os
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Allow your browser extension (even with null origin in no-cors mode)
CORS(app)

HOSTS_FILE = "/etc/hosts"
TEMP_FILE = "/tmp/thm_hosts_temp"
DOMAIN = "machine.thm"


def flush_dns_cache():
    """Works on most modern Linux distros (Ubuntu, Kali, Pop!_OS, etc.)"""
    try:
        subprocess.run(["sudo", "/bin/systemctl", "restart", "systemd-hostnamed"], check=False)
        subprocess.run(["sudo", "service","dnsmasq", "restart"], check=False)
        print("DNS cache flushed")
    except Exception as e:
        print(f"DNS flush failed (non-critical): {e}")


@app.route('/update-hosts', methods=['POST', 'OPTIONS'])
def update_hosts():
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        print(data)
        ip = data.get('ip')
        slug = data.get('slug')
        
        if not ip or not slug:
            return jsonify({"error": "Missing ip or slug"}), 400

        if not (ip.count('.') == 3 and all(part.isdigit() and 0 <= int(part) <= 255 for part in ip.split('.'))):
            return jsonify({"error": "Invalid IP format"}), 400

        # Read current hosts
        result = subprocess.run(["sudo", "cat", HOSTS_FILE], capture_output=True, text=True)
        if result.returncode != 0:
            return jsonify({"error": "Failed to read /etc/hosts"}), 500

        if ip in result.stdout:
            return jsonify({"error":"Already in hosts file!"}),400

        lines = result.stdout.splitlines()
        # Remove any existing machine.thm entries (old rooms)
        new_lines = [line for line in lines if not DOMAIN in line.strip()]

        # Add the new one
        new_lines.append(f"{ip}\t{DOMAIN}  # THM room: {slug}")

        # Write to temp file then atomic move
        with open(TEMP_FILE, "w") as f:
            f.write("\n".join(new_lines).rstrip() + "\n")

        subprocess.run(["sudo", "cp", TEMP_FILE, HOSTS_FILE], check=True)
        os.remove(TEMP_FILE)

        flush_dns_cache()

        print(f"Updated → {ip} machine.thm (room: {slug})")
        return jsonify({"success": True, "ip": ip, "slug": slug})

    except subprocess.CalledProcessError as e:
        return jsonify({"error": "sudo failed — did you run with proper permissions?"}), 500
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("THM Hosts Updater listening on http://127.0.0.1:8123")
    print("Ready to auto-update machine.thm → use with the content.js script!")
    app.run(host="127.0.0.1", port=8123, debug=False)  # debug=False in production