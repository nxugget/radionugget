---
title: "Écoute des satellites russes METEOR-M"
date: "01-09-2024"
description: "Apprenez à écouter les satellites russes METEOR-M afin de récupérer leur images avec le même matériel utilisé pour récupérer les images des satellites NOAA"
thumbnail: "/assets/img/thumbnail/meteor.webp"
---
Les satellites américains **NOAA** que l'on a vu durant [mon premier projet](../../Projects/NOAA.html) sont un peu le `Hello World` de tout projet en programmation. Mais, il existe d'autres satellites très simillaires, qui produisent de meilleures images avec plus ou au moins le même matériel que pour les **NOAA**, ce sont les satellites russes **METEOR**. 

# Qui sont les METEOR ?
Les **METEOR** sont des satellites météorologiques soviétiques, puis russes. Depuis **1964**, **70** modèles ont été lancé. Pour cet article, on va s'intéresser uniquement au dernier, ceux de la série **METEOR-M** dont voici l'historique :

![METEOR-M](../../../assets/img/pages/space/satellite/meteor/meteor2.svg)

Comme leurs homologues NOAA, la série de satellites **METEOR-M** se situent à une altitude d'environ **800km** et possède une orbite **polaire** et plus précisément **héliosynchrone**. Ainsi, ils font constamment face au **Soleil**. Plus d'infos sur les types d'orbites [juste ici](./type-orbits.html).

![Orbite polaire](../../../assets/img/pages/space/satellite/type-orbits/type-orbits6.svg)
L'orbite **héliosynchrone** va leur permettre de passer par les mêmes endroits à la même [heure solaire](https://fr.wikipedia.org/wiki/Temps_solaire) **2 fois par jour**. 
La principale différence avec les **NOAA** est leur mode de transmission qui se nomme [LRPT](https://www.sigidwiki.com/wiki/Low_Rate_Picture_Transmission_(LRPT)). Pour les **NOAA**, c'était le mode [APT](https://www.sigidwiki.com/wiki/Automatic_Picture_Transmission_(APT)).
Pour cet article, 2 **METEOR-M** vont nous intéresser :

![METEOR-M N2 satellite](../../../assets/img/pages/space/satellite/meteor/meteor1.svg)
A noter que le **METEOR M2-4** est toujours en phase de test. Du coup, sa fréquence varie des fois entre **137.1** et **137.9MHz** et pareil pour le [débit de symbole](https://fr.wikipedia.org/wiki/Rapidit%C3%A9_de_modulation) qui varie entre **72** et **80Kbit/s**. 
Pour vérifier, on peut utiliser [ce site](https://usradioguy.com/meteor-satellite/) qui permet de savoir l'état actuel du **satellite**. Voici l'état actuel le **02/09/2024** : 
![METEOR M2 status](../../../assets/img/pages/space/satellite/meteor/meteor3.png)

# Comment on les écoute

# Place à la démo
On va utiliser [SatDump](./satdump.html) pour récupérer les signaux satellites. On clique en haut sur l'onglet `Recorder`.
Depuis l'onglet `Tracking`, on peut voir que dans **10 minutes** le satellite **METEOR M2-3** va passer.

Super, à présent, dans la section `Device`, on a juste à sélectionner notre récepteur **SDR** et choisir un **gain**, dans mon cas, **40**.
Puis dans l'onglet `Processing`, on sélectionnes **METEOR M2-x LRPT 72k**. On peut aussi cocher la case **DC Blocking**.

⚠️ Une fois le satellite passé, on clique depuis la section `Processing` sur le bouton **Stop** et uniquement après, on peut arrêter l'écoute avec le bouton **Stop** de l'onglet **Device**. Attention de ne pas inverser cet ordre car ça risque de perdre l'enregistrement que vous venez de faire.

# Traitement de l'image
Une fois l'écoute terminée, après quelques instants, on peut décaler sur l'onglet `Viewer` pour voir nos images et leur faire du post-traitement.