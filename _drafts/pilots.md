---
title: "Écouter les communcations radio des pilotes d'avion"
date: "30-08-2024"
description: "Découvrez pourquoi les communications des pilotes d'avions utilisent la modulation d'amplitude et comment on peut les écouter ave cun récepteur SDR"
thumbnail: "/assets/img/thumbnail/pilots.webp"
---
# Comment les pilotes communiquent ?
## Modulation 
Les communications aéronautiques utilisent comme type de modulation, l'**AM**. J'en ai fais un cours juste [ici](../Basics/am.html) si ça ne te parles pas. Mais pourquoi ce type de modulation est utilisée alors que la majorité des communications radio utilisent la [FM](https://fr.wikipedia.org/wiki/Modulation_de_fréquence#:~:text=En%20modulation%20de%20fréquence%2C%20l,(atténuation%20et%20bruit%20importants).).
En effet, la **FM** possède une bien meilleure qualité de signal, mais, c'est plus complexe à mettre en oeuvre, le matériel nécessaire est de fait plus énergivore et plus lourd ce qui représente une belle contrainte dans l'aviation. Surtout que les communications servent à transporter uniquement de la voix donc un signal de meilleure qualité n'est qu'un luxe non nécessaire.
De plus, l'**AM** est bien plus robuste que la **FM**, ce qui permet au signal d'être plus résistant face aux obstacles comme les conditions méteos, les montagnes, les gros bâtiments et j'en passe. De fait, le signal peut porter sur de plus grandes distances. 
Sa résistance lui permet aussi d'être moins sujet aux interférences des composants électroniques et des autres signaux radio. 

## Polarisation
Les communications aéronautiques utilisent une **polarisation verticale**, il s'agit de la direction du champ électrique de notre **onde électromagnétique**. On fera un cours plus tard sur la polarisation mais en attenndant, [ce site](https://culturesciencesphysique.ens-lyon.fr/ressource/simu-polarisation.xml) explique très bien les différents types de polarisation. Comprenez juste qu'une onde polarisée **verticalement** devra être reçue par une antenne placée **veritcalement**. Autrement, on risque de perdre une bonne partie du signal.


## Fréquence
Peut-être avez-vous déjà vu le **spectre de répartition des fréquences** de l'[ANFR](https://www.anfr.fr).
![Spectre répartition fréquences ANFR](../../../assets/img/pages/radio/sdr/pilots/pilots1.webp)
Ouais, dur d'y voir sans l'ouvrir en grand, mais zoomons sur la partie qui nous intéresse, la bande allouée aux communications en aéronatique qui se situe dans les [VHF](https://fr.wikipedia.org/wiki/Très_haute_fréquence).
![Bande VHF ANFR](../../../assets/img/pages/radio/sdr/pilots/pilots2.webp)
On les retrouve entre **108** et **137MHz**. 
Super, on en sait déjà un peu plus sur leurs communications mais maintenant, il va falloir savoir quelle fréquence entre **108** et **137MHz** sont utilisées autour de nous afin de les écouter.


# Récupérer les bonnes informations
Il existe un super site **gratuit** permettant de nous afficher les fréquences utilisées pour l'aéronautique, le tout avec même une carte, il s'agit de [Openaip](https://www.openaip.net). On peut accéder à la map en cliquant [ici](https://www.openaip.net/map).
Dans mon cas, j'habite dans **Bordeaux** donc on va s'intéresser a l'aéroport de Bordeaux-Merignac **BOD** pour l'exemple.
![Openaip BOD](../../../assets/img/pages/radio/sdr/pilots/pilots3.png)
On peut voir sur le côté tout un tas de fréquences utilisées par l'aéroport dont nottament celle de la tour de contrôle indiqué par **TWR**. Donc déjà, sur la fréquence **118.300MHz**, on doit pouvoir écouter quelques trucs.
Bref, je vais pas faire un cours sur **Openaip** qui est très intuitif à utiliser, chacun récuperera les fréquences qui lui intéressent.

# Passons à l'écoute
Avec tout ce que l'on a vu, on peut enfin passer à l'écoute des communications aéronautiques. Dans les faits, avec **openaip**, vu qu'on connait les fréquences, on peut déjà avec un simple talkie walkie style **Baofeng** commencer l'écoute. Mais, on peut faire mieux avec la **SDR**.
