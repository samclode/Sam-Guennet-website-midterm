import os
import re

# --- Config ---
root = "./"  # Mets ici le dossier racine de ton site
favicon_code = """
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
"""

# --- Parcourt tous les fichiers ---
for subdir, _, files in os.walk(root):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(subdir, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            # Vérifie si un des liens est déjà présent
            if any(tag in content for tag in [
                "apple-touch-icon", "favicon-32x32.png", "favicon-16x16.png", "site.webmanifest"
            ]):
                print(f"⏭️ Déjà présent : {path}")
                continue

            # Insère avant </head>
            new_content = re.sub(r"</head>", favicon_code + "\n</head>", content, flags=re.IGNORECASE)

            with open(path, "w", encoding="utf-8") as f:
                f.write(new_content)

            print(f"✅ Favicon ajouté dans : {path}")

print("🎉 Terminé !")
