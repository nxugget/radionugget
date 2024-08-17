---
title: "Présentation du HackRF Portapack avec firmware Mayhem"
description: "Découvrez le bundle HackRF-Portapack H2 One d'Aliexpress et son firmware Mayhem pour l'émission et la réception radio définie par logiciel."
date: "21-05-2024"
thumbnail: "/assets/img/thumbnail/hackrf.webp"
---
Aujourd'hui, je vais vous présenter un kit HackRF que j'ai acheté sur [Aliexpress](https://fr.aliexpress.com/item/4000247041639.html?spm=a2g0o.order_list.order_list_main.4.4c3f5e5bxHkKxh&gatewayAdapt=glo2fra).
Voulant en apprendre plus sur les attaques radio, je voulais acquérir ce fameux **HackRF** mais c'est pas donné. On peut trouver sa version originale [ici](https://www.passion-radio.fr/emetteur-sdr/hackrf-sdr-75.html).
En revanche, il existe des versions custom qui se vendent bien moins chère sur **Aliexpress** et qui pour un débutant feront parfaitement l'affaire. 


#  C'est quoi le HackRF ? 
Le **HackRF** ou **HackRF One**, c'est pareil, a été inventé et fabriqué par la société [Great Scott Gadgets](https://greatscottgadgets.com/). 
C'est à la fois un émetteur et un récepteur [SDR](../SDR/sdr.html) qui possède une bande de fréquence super large de **1MHz** à **6GHz** (6000MHz). 
Donc on peut écouter et émettre sur tout pleins de fréquences, intercepter et rejouer de signaux, c'est plutôt pas mal. Il est **half-duplex**, ça veut dire qu'il ne peut pas **recevoir** et **transmettre** en même temps. 
Mais ⚠️**ATTENTION**⚠️, pour ce qui est d'**émettre**, c'est **illégal** sur la plupart des fréquences (En **France** comme ailleurs).  
Maintenant, à des fins éducatives et de manière **responsable**, il n'y a (**pour moi**) pas de soucis à émettre sur des fréquences non autorisées. Par **responsable**, j'entends par exemple de ne pas utiliser la fonction **Jamming** du **HackRF** qui permet donc de brouiller les signaux sur une fréquence choisie. Même si ça marche que sur de la **courte distance**, on sait jamais ce qui a autour. Bref, on verra tout ça plus tard :) 

#  Et le Portapack alors ? 
Ce qu'on appelle le **HackRF Portapack**, c'est un boitier avec un écran **LCD**, des touches pour se déplacer dans un menu, et surtout une batterie.  Ainsi, on peut se servir de son **HackRF** sans avoir besoin de le relier à un ordinateur ce qui le rend complètement autonome. Pour ce qui est du kit que je vous présente, le **firmware** utilisé pour faire tourner tous les tools sur le **HackRF Portapack** se nomme [Mayhem](https://github.com/portapack-mayhem/mayhem-firmware) (qui est un **fork** d'un ancien plus maintenu nommé [Havoc](https://github.com/furrtek/portapack-havoc/)).

#  Présentation du kit
J'ai pris le **Bundle 2** du lien que j'ai donné en intro. Ce dernier est composé d'un câble d'alimentation **Micro USB** qui fait **120cm**. 
On retrouve aussi **3 antennes** : 
- Une télescopique calibrée pour des fréquences de **40MHz** à **6GHz**.
- Une **Wi-Fi** pour le **2.4GHz** et **5GHz**.
- Une **antenne à fouet** (whip antenna) pour des fréquences de **700MHz** à **2700MHZ**. Ce type d'antenne a une base magnétique qui permet de la fixer sur des surfaces métalliques (comme des voitures). La partie en spirale s'appelle une **bobine de chargement** (coil). 

Et enfin, notre **HackRF Portapack** | **Un clic** sur le gros bouton pour l'allumer, 2 clics pour éteindre :)
![Ecran HackRF Portapack](../../../assets/img/pages/radio/hackrf/presentation/top.JPEG)
On ne va pas s'attarder sur le menu puisque que je ferais un article dédié pour tout ça. 
L'avant du boitier se présente comme ça : 
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

Et voilà, ça sera tout pour cette présentation, la suite sur les différentes fonctionnalités à venir :) 