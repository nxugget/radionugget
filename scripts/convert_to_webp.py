import os
from PIL import Image
from pathlib import Path

def convert_to_webp(source_path, quality=80, delete_original=True):
    """
    Convertit une image en format WebP et supprime l'original si demandé
    
    Args:
        source_path: Chemin vers l'image source
        quality: Qualité de compression WebP (0-100)
        delete_original: Si True, supprime l'image originale après conversion
    """
    destination_path = str(Path(source_path).with_suffix('.webp'))
    
    try:
        image = Image.open(source_path)
        
        # Préserver la transparence si présente
        if image.mode in ("RGBA", "LA"):
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")
            
        # Sauvegarder en format WebP
        image.save(destination_path, format="WebP", quality=quality)
        
        print(f"Converti: {source_path} -> {destination_path}")
        
        # Fermer l'image pour éviter les problèmes lors de la suppression
        image.close()
        
        # Supprimer l'original si demandé
        if delete_original:
            os.remove(source_path)
            print(f"Supprimé: {source_path}")
            
        return destination_path
    
    except Exception as e:
        print(f"Erreur lors de la conversion de {source_path}: {e}")
        return None

def batch_convert_to_webp(source_dir, quality=80, delete_originals=True):
    """
    Convertit tous les JPG, JPEG et PNG d'un répertoire en WebP
    
    Args:
        source_dir: Répertoire contenant les images à convertir
        quality: Qualité de compression WebP (0-100)
        delete_originals: Si True, supprime les images originales après conversion
    """
    # Extensions d'images à chercher
    image_extensions = ['.jpg', '.jpeg', '.png']
    
    # S'assurer que le répertoire existe
    if not os.path.exists(source_dir):
        print(f"Le répertoire {source_dir} n'existe pas!")
        return
    
    # Compter les images converties
    converted_count = 0
    
    # Parcourir tous les fichiers du répertoire
    for root, _, files in os.walk(source_dir):
        for file in files:
            file_path = os.path.join(root, file)
            file_extension = Path(file_path).suffix.lower()
            
            # Vérifier si le fichier est une image à convertir
            if file_extension in image_extensions:
                if convert_to_webp(file_path, quality, delete_originals):
                    converted_count += 1
    
    print(f"\nConversion terminée! {converted_count} images converties en WebP.")

if __name__ == "__main__":
    # Chemin vers le répertoire contenant les images
    blog_images_path = os.path.join("public", "images", "blog")
    
    # Chemin absolu basé sur le répertoire actuel
    current_dir = os.getcwd()
    full_path = os.path.join(current_dir, blog_images_path)
    
    print(f"Conversion des images du répertoire: {full_path}")
    
    # Niveau de qualité WebP (0-100)
    quality_level = 80
    
    # Confirmation avant suppression
    confirmation = input("Ce script va supprimer les fichiers originaux après conversion. Continuer? (y/n): ")
    if confirmation.lower() != 'y':
        print("Opération annulée.")
        exit()
    
    # Lancer la conversion avec suppression des originaux
    batch_convert_to_webp(full_path, quality_level, delete_originals=True)