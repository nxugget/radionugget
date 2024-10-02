---
title: "Évaluer les performances de son antenne"
description: "Apprenez à évaluer la puissance des systèmes radio en utilisant les notions de décibels, de gain, et autres concepts clés pour comparer les performances des antennes."
date: "29-05-2024"
thumbnail: "/assets/img/thumbnail/power.webp"
---
Après avoir vu [comment choisir son antenne](./antennes.html), il est temps d'être en mesure d'évaluer leur performances. Que ce soit pour les comparer entre elles ou même tester si celle que l'on a construite est efficace, il existe plusieurs valeurs à bien comprendre. 

#  Les décibels 
Avant tout, les [décibels](https://fr.wikipedia.org/wiki/Décibel) (**dB**). Ce sont une unité **logarithmique** utilisée pour exprimer le rapport entre deux grandeurs de **même nature**.
**Logarithmique**, ça veut en gros dire que la valeur est exprimée en fonction de l'ordre de grandeur. Donc, au lieu d'utiliser des **multiplications**, on va utiliser des **additions** ce qui simplifie grandement la vie. Par exemple, si une puissance fait `x2`, ça correspond à une augmentation de `+3dB` (Le `3dB` vient de cette [formule](https://fr.wikipedia.org/wiki/Décibel#Définition)). Si une puissance fais `x4`, ça fera `+6dB`.
Voici un tableau intéressant à retenir où l'on comprends mieux :

![Tableau decibel](../../../assets/img/pages/radio/radio_basics/power/power1.svg)

Au final, les **décibels**, ça permet surtout de simplifier la représentation de gros écarts de puissance.

#  Le gain
Le gain, pour une antenne, ça permet de mesurer sa capacité à concentrer l'énergie dans une direction particulière par rapport à l'antenne **isotrope**. Il s'agit d'une antenne théorique qui **n'existe pas** réellement, qui rayonne de manière **uniforme** dans **toutes** les directions autour d'elle. 
Pour voir un gain, on utilise des **diagrammes de rayonnement** qui montrent comment une antenne rayonne autour d'elle. 
Sur l'image du dessous, en orange, on a notre antenne **isotrope** théorique qui a son diagramme de rayonnement constitué d'un seul cercle. Son gain est de **0** et nous sert de référence.
On a une deuxième antenne, en violet, un **doublet demi-onde** (un **dipôle** par exemple) qui lui favorise son rayonnement dans **2** directions. Ainsi, on voit que ce dernier rayonne plus loin que l'antenne **isotrope**. Ce surplus est ce qu'on appelle le **gain**.
![Schema gain](../../../assets/img/pages/radio/radio_basics/power/power2.svg)
Le gain d'une antenne **doublet** est donc de `2,15dB`. D'ailleurs, lui aussi sert aussi de référence. Ainsi, on parlera de `dBi` qu'on on prend comme référence l'antenne **i**sotrope. Et on parlera de `dBd` qu'on on aura pour référence l'antenne **d**oublet. 
