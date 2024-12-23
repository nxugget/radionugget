---
title: "Réception HRPT en bande L"
date: "21-12-2024"
description: "Découvrez comment recevoir les signaux HRPT des satellites sur la bande L à 1,7GHz"
thumbnail: "/assets/img/thumbnail/hrpt.webp"
---
Après s'être amusé avec les signaux [APT]({{ site.data.links.noaa }}) et [LRPT]({{ site.data.links.space.meteor }}) sur les fréquences `137MHz`, passons à l'étape supérieure en recevant d'autre signaux satellites utilisant un tout autre mode, le **HRPT**.
Plus dur à recevoir, ce mode nous permettra d'avoir les mêmes images qu'avant mais avec une résolution de `1km/pixel` au lieu des `4km/pixel` des précédents modes.

# Quels satellites ?
## NOAA POES 🇺🇸
Les américains [NOAA POES](https://fr.wikipedia.org/wiki/NOAA_POES) émettent en **HRPT** en utilisant une [modulation BPSK](https://fr.wikipedia.org/wiki/Phase-shift_keying#:~:text=Binary%20phase%2Dshift%20keying%20(BPSK),-Exemple%20de%20diagramme&text=BPSK%20est%20la%20forme%20la,trompe%20sur%20le%20symbole%20reçu.) et une **bande passante** de `2.5MHz`.

![NOAA HRPT Frequency](../../../assets/img/pages/space/satellite/hrpt/hrpt1.svg)
[NOAA 16](https://en.wikipedia.org/wiki/NOAA-16) et [NOAA 17](https://en.wikipedia.org/wiki/NOAA-17) ont été retiré du service, on a accès à **3 satellites** sachant que [NOAA 15](https://en.wikipedia.org/wiki/NOAA-15) a une puissance d'émission très faible. 

## Meteor-M 🇷🇺
Les russes [METEOR M2](./meteor.html) émettent aussi en utilisant une [modulation BPSK](https://fr.wikipedia.org/wiki/Phase-shift_keying#:~:text=Binary%20phase%2Dshift%20keying%20(BPSK),-Exemple%20de%20diagramme&text=BPSK%20est%20la%20forme%20la,trompe%20sur%20le%20symbole%20reçu.) et une **bande passante** de `2.5MHz`. 

![METEOR M2 HRPT Frequency](../../../assets/img/pages/space/satellite/hrpt/hrpt2.svg)
Leur signal est plus puissant avec des images possèdant une meilleure résolution de `5km/pixel`.

## FengYun 3 🇨🇳
Les chinois [Fengyun 3](https://fr.wikipedia.org/wiki/Feng-Yun#La_série_des_satellites_héliosynchrones_Feng-Yun_3) sont les meilleurs satellites météos. Ils émettent en utilisant une [modulation QPSK](https://fr.wikipedia.org/wiki/Phase-shift_keying) et une bande passante de `5MHz`. C'est d'ailleurs les seules à envoyer des images avec de "vraies" couleurs, donc les même que l'on voit avec nos yeux.
Seule un satellite de la série émet en [bande L](https://fr.wikipedia.org/wiki/Bande_L_(radio)), les autres émettent en [bande X](https://fr.wikipedia.org/wiki/Bande_X) et ne conviendront donc pas pour ce projet.

![FengYun 3 HRPT Frequency](../../../assets/img/pages/space/satellite/hrpt/hrpt3.svg)
Malheuresement, suite à un incident, le satellite n'émet plus qu'au dessus de l'**Asie**...

## Metop 🇪🇺
Les européens [Metop](https://fr.wikipedia.org/wiki/MetOp) émettent aussi en utilisant une [modulation QPSK](https://fr.wikipedia.org/wiki/Phase-shift_keying) mais avec une bande passante de `4.5MHz`. 
C'est les satellites les plus intéressants à recevoir de la liste avec de magnifiques images.

![Metop HRPT Frequency](../../../assets/img/pages/space/satellite/hrpt/hrpt4.svg)
Une plus belle image ne vient pas sans inconvénient. En effet, leur signal est plus faible et leur bande passante plus importante ne pourra pas être reçu entièrement avec des récepteurs [SDR]({{ site.data.links.sdr }}) classiques.
À noter que **Metop A** a été [désorbité en 2021](https://www.eumetsat.int/fr/desorbitation-reussie-pour-le-premier-satellite-meteorologique-europeen-en-orbite-polaire).

# Matériels nécessaires
## Antenne
En [bande L](https://fr.wikipedia.org/wiki/Bande_L_(radio)) à une fréquence de `1,7GHz`, les ondes radio sont beaucoup plus faibles que celles pour la réception **APT** et **LRPT** à `137Mhz`. On ne va donc pas pouvoir utiliser une antenne **omnidirectionelle** comme une [QFH]({{ site.data.links.qfh }}).
L'idéal est d'avoir une parabole avec une tête héliocidal. Au minimum, elle devra avoir un diamètre de `80cm`. En augmentant ce dernier, se sera plus facile de tracker le satellite à la main mais plus lourd à déplacer.
Pour ma part, je vais utiliser l'antenne que j'ai fabriqué dont vous retrouverez un guide prochainement.
[DIY dish antenna with helicoidal feed]()

## SDR 


# Réception en live
## Setup 
## SatDump
