---
title: "Writeup TheBlackSide : Porte de garage"
date: "06-02-2025"
description: "Writeup du challenge TheBlackSide Porte de garage"
thumbnail: "/assets/img/thumbnail/garages.webp"
---
Description du challenge : *Pendant votre test d'intrusion physique, vous remarquez une porte de garage à l'arrière de l'entreprise qui vous mandate. A l'aide de votre RTL-SDR, vous arrivez à enregistrer le signal d'ouverture de la porte. Il vous faut maintenant identifier la séquence de bits envoyée au récepteur de la porte pour pouvoir faire votre propre émetteur.*

Le challenge est disponible à [cette adresse](https://theblackside.fr/challenges/reseau/Porte-de-garage).

Ce challenge nous demande de retrouver la séquence en binaire envoyée au récepteur d'une porte de garage. Pour cela, on nous fournit un fichier `garage.wav`. 
Ouvrons-le avec le logiciel [Universal Radio Hacker](https://github.com/jopohl/urh)

![URH](../../assets/img/pages/writeups/garage/garage1.png)

Quand on ouvre un fichier avec **URH**, il essaie automatiquement de décoder le signal en trouvant lui même la modulation et d'autres paramètres. Spoiler : La détection automatique pour ce challenge est foireuse. Faisons-le manuellement, on comprendra bien mieux :) 
Pour commencer, il faut savoir de quelle type de modulation il s'agit. Pour des télécommandes de garage, c'est souvent une modulation de type [ASK](https://en.wikipedia.org/wiki/Amplitude-shift_keying) (**A**mplitude **S**hift **K**eying).
Avec ce type de modulation, qui est numérique, on utilise l'**amplitude** du signal porteur pour représenter les données, où différentes **amplitudes** représentent différents **bits**. Par exemple : 

![Schema ASK OOK](../../assets/img/pages/writeups/turnme/turnme3.svg) 
On peut voir sur **URH** que plusieurs patterns semblent se répeter, en zoomant sur l'une d'entre elles, on peut reconnaître visuellement qu'il s'agit bien d'**ASK** avec des salves et des temps de pauses qui ont une amplitude différente bien marquée.

![URH](../../assets/img/pages/writeups/garage/garage2.png)

