---
title: "Détecter la présence de galaxies avec la SDR"
date: "02-03-2025"
description: "Découvrez comment détecter la raie d'hydrogène (raie de 21cm) avec la SDR (Software Defined Radio)"
thumbnail: "/assets/img/thumbnail/hydrogen.webp"
---
Avec un simple récepteur [SDR]({{ site.data.links.noaa }}), il est possible de détecter une fréquence naturelle émise par un gaz présent en abondance dans l'espace, l'**hydrogène**. Ce signal est connu sous le nom de **raie d'hydrogène** et nous allons apprendre à l'*observer*

# Qu'est ce que la raie d'hydrogène
Entre les étoiles des galaxies se trouve un **gaz interstellaire** principalement composé d'**hydrogène**, d'**hélium** et d'autres trucs. L'hydrogène existe sous différentes formes mais ce qui nous intéresse ici est l'**hydrogène neutre**. Ce dernier émet naturellement une onde radio à une fréquence très précise de `1420.40575MHz`. Ce signal est appellé **raie de l'hydrogène** ou encore **raie à 21cm** (en référence à sa longueur d'onde).

Tout cela est dû à un phénomène particulier au sein de l'atome d'**hydrogène**. En effet, ce dernier est composé d'un [proton](https://fr.wikipedia.org/wiki/Proton) en son **centre** et d'UN SEUL [électron](https://fr.wikipedia.org/wiki/%C3%89lectron) qui lui tourne autour. Ces deux particlues ont une propriété intrinsèque qu'on appelle le [spin](https://fr.wikipedia.org/wiki/Spin) qu'on peut voir comme le *sens* de la particule. Lorsque leur **spin** est dans le même sens, alors l'**atome** est dans un étatlégèrement plus énergétique, donc **moins stable**.

![Spin hydrogen](../../../assets/img/pages/space/radioastronomie/hydrogen/hydrogen1.svg)

Un électron préfère toujours être dans l'état plus stable, donc un beau jour, de manière complètement aléatoire, il finit par changer de **spin** tout seul comme un grand. Mais attention, ce changement est vraiment très rare et peut prendre des **millions d'années** pour un seul **atome**. Forte heuresement pour nous, il y a tellement d'**hydrogène** dans l'espace que ce phénomène se produit en continu. Mais bref, c'est ce changement de sens qui libère de l'énergie et docn un signal !

![Spin-flip hydrogen](../../../assets/img/pages/space/radioastronomie/hydrogen/hydrogen2.svg)

Bien que très faible, ce signal traverse l'espace sur de longues distances ce qui nous permet de le capter depuis **La Terre**. En analysant cette fréquence, les astronomes peuvent ainsi détecter les nuages d'hydrogène dans notre galaxie et en apprendre plus sur sa structure et son mouvement.

# Comment détecter cette raie 
## Matériel
Dans un premier temps, il va nous falloir une antenne faite pour la fréquence `1420MHz`. Comme le signal est faible, on va utiliser une parabole à laquelle on viendra ajouter un [filtre LNA](https://www.amazon.fr/dp/B07XPV9RX2) qui va grandement nous aider. Sans ce dernier, avec une antenne faite main, il peut-être très dificilie de détecter la raie d'hydrogène.


## Logiciel
