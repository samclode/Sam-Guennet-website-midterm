import os
from bs4 import BeautifulSoup

# Demander les infos
folder = r"C:\Users\samgu\Documents\ARCHI L3\S2\coding\Sam Guennet website midterm"
new_title = input("Entrez le nouveau titre à appliquer à toutes les pages : ")

# Remplacement
for root, _, files in os.walk(folder):
    for filename in files:
        if filename.endswith(".html"):
            path = os.path.join(root, filename)
            with open(path, "r", encoding="utf-8") as f:
                soup = BeautifulSoup(f, "html.parser")

            # Remplacer ou ajouter <title>
            if soup.title:
                soup.title.string = new_title
            else:
                new_title_tag = soup.new_tag("title")
                new_title_tag.string = new_title
                if soup.head:
                    soup.head.insert(0, new_title_tag)
                else:
                    new_head = soup.new_tag("head")
                    new_head.append(new_title_tag)
                    soup.html.insert(0, new_head)

            with open(path, "w", encoding="utf-8") as f:
                f.write(str(soup))

print("\n✅ Tous les titres ont été mis à jour avec succès.")
