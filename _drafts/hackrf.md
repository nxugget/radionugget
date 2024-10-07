---
title: "Présentation du HackRF Portapack"
description: "Découvrez le HackRF-Portapack H2 One d'Aliexpress et son firmware Mayhem pour la SDR."
date: "21-05-2024"
thumbnail: "/assets/img/thumbnail/hackrf.webp"
---
Aujourd'hui, je vais vous présenter un kit custom **HackRF** que je me suis procuré sur **Aliexpress**.
On peut trouver la version originale du **HackRF** [juste ici](https://www.passion-radio.fr/emetteur-sdr/hackrf-sdr-75.html).
Pour des raisons budgétaires, je voulais tester ses versions custom qui se vendent bien moins chère sur **Aliexpress** et qui pour le moment, feront parfaitement l'affaire. 

#  C'est quoi le HackRF ? 
Le **HackRF** ou **HackRF One**, a été inventé et fabriqué par la société [Great Scott Gadgets](https://greatscottgadgets.com/). 
C'est à la fois un émetteur et un récepteur [SDR](../SDR/sdr.html) qui possède une bande de fréquence super large de `1MHz` à `6GHz` (6000MHz). 
Donc on peut écouter et émettre sur tout pleins de fréquences, intercepter et rejouer des signaux. Il est **half-duplex**, ça veut dire qu'il ne peut pas **recevoir** et **transmettre** en même temps. 
Mais ⚠️**ATTENTION**⚠️, pour ce qui est d'**émettre**, c'est **illégal** sur la plupart des fréquences (En **France** comme ailleurs).  
Maintenant, le **HackRF** a une puissance d'émission faible, ce qui ne devrait pas poser de soucis. Il vaut quand même mieux de se renseigner sur ce qui a autour de soit pour être sur de pas faire de bêtises.

# Portapack 
Ce qu'on appelle le **HackRF Portapack**, c'est un boitier avec un écran **LCD**, des touches pour se déplacer dans un menu, et surtout une batterie.  Ainsi, on peut se servir de son **HackRF** sans avoir besoin de le relier à un ordinateur ce qui le rend complètement autonome. Pour ce qui est du kit que je vous présente, le **firmware** utilisé pour faire tourner tous les tools sur le **HackRF Portapack** se nomme [Mayhem](https://github.com/portapack-mayhem/mayhem-firmware) (qui est un **fork** d'un ancien plus maintenu nommé [Havoc](https://github.com/furrtek/portapack-havoc/)).

#  Présentation 
Voilà notre **HackRF Portapack** :

![Ecran HackRF Portapack](../../../assets/img/pages/radio/hackrf/presentation/top.JPEG)
L'avant du boitier se présente ainsi :

![Panneau avant HackRF Portapack](../../../assets/img/pages/radio/hackrf/presentation/front.JPEG)
On y retrouve : 
- Un endroit où y mettre une carte **MicroSD** (Il n'y en a pas de fourni dans le kit mais c'est important d'en mettre une pour accéder à + de fonctionnalités).
- Un bouton **reset** qui permet comme son nom l'indique de **reset**. 
- Un bouton **DFU** (**D**evice **F**irmware **U**pgrade) qui permet de modifier des trucs en cas de soucis. 
- Des **LEDs 3v3, 1V8, RF** qui allumées signifient juste que le **HackRF** est alimenté.
- Une **LED USB** qui allumée, signifie que le **HackRF** est bien branché en **USB** à un **PC**.
- Une **LED RX** qui allumée veut dire que le **HackRF** est en train de **recevoir** des signaux. 
- Une **LED TX** qui allumée veut dire que le **HackRF** est en train de **transmettre** des signaux. 
- Enfin, **ANT** (**Ant**enna), un connecteur de type **SMA femelle** pour y connecter notre antenne.

Pour ce qui est de l'arrière du boitier : 

![Panneau arrière HackRF Portapack](../../../assets/img/pages/radio/hackrf/presentation/back.JPEG)
On a : 
- Le port **USB** pour connecter le **HackRF** à un **PC** et le recharger aussi.
- Un port **HEADSET** pour y brancher un casque audio. (Pas essayé si ça marche avec un micro)
- Deux ports **SMA femelle** qui en tant que débutant ne risque pas de nous servir. Ils servent à la synchronisation d'horloge : 
  - Un **CLKIN** (Clock Input) pour recevoir et se synchroniser avec une horloge externe
  - Un **CLKOUT** (Clock Output) pour fournir son propre signal d'horloge à d'autres appareils

# Premier pas
Avant de commencer, si vous avez un modèle différent du mien, identifier bien quel type de **PortaPack** vous avez grâce à [ce site ](https://github.com/portapack-mayhem/mayhem-firmware/wiki/PortaPack-Versions). Ça pourrait avoir un impact sur la manière dont vous le mettrez à jour. 
⚠️ Avant de l'allumer, mettez votre antenne, c'est pas bon du tout de la mettre ou de la changer quand le **HackRF** est **allumé**, ça risque de l'endommager.
Bref, pour l'allumer, un clic sur le gros bouton, 2 clics pour l'éteindre.
Normalement, le **HackRF** arrive flashé avec le dernier **firmware** mais vous pouvez quand même le faire manuellement en vous rendant sur le site [hackrf.app](https://hackrf.app/). Branchez votre **HackRF**, le site devrait le reconnaître et tout en bas, vous avez le bouton `Manage Firmware`.

![HackRF App](../../../assets/img/pages/radio/hackrf/presentation/hackrfapp.png)
Vous avez la possibilité de choisir la dernière version la plus stable, la version beta ou même un autre firmware custom.
À noter que depuis ce site, vous allez pouvoir aussi gérer les fichiers de votre **HackRF** et même le contrôler.

Voilà. À présent, vous pouvez commencer à vous amuser avec votre **HackRF Portapack** :)