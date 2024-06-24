---
title: "HackTheBox : Walkie Hackie"
description: "Writeup du challenge HackTheBox Walkie Hackie"
date: "19-04-2024"
thumbnail: "/assets/img/thumbnail/talkie.gif"
---
Description du challenge : 
*Our agents got caught during a mission and found that the guards are using old walkie-talkies for their communication. The field team captured their transmissions. Can you interrupt their communication to help our agents escape from the guards?*

Pour ce chall, on nous fournit 4 transmissions audio au format `complex`. 
On a aussi accès à une instance web : 
![image](../../assets/img/writeups/walkie_hackie/walkie1.png)
  
On peut tester avec des valeurs randoms pour voir comment ça réagit mais rien de spécial se produit. 
Il faut surement y mettre un préambule spécifique ou je sais pas. Bref, allons voir de plus près les signaux avec [Universal Radio Hacker](https://github.com/jopohl/urh).
Donc, on ouvre nos 4 fichiers avec **URH**. Exemple avec le premier :
![image](../../assets/img/writeups/walkie_hackie/walkie3.png)
En affichant les données en **hexa**, on constate que les 4 signaux fournies suivent une même logique : 
```bash
Signal 1 : aaaaaaaa73214693a1ff14
Signal 2 : aaaaaaaa73214693a2ff84
Signal 3 : aaaaaaaa73214693b2ff24
Signal 4 : aaaaaaaa73214693b1ff57
```
Ça a l'air de matcher avec nos 3 paramètres, pour le signal 1, `aaaaaaaa` serait le **préambule**, `73214693` le **sync word** et `a1ff14` le payload. 
Je ressaie mais toujours rien. 

Par contre, on remarque que les payloads, suivent eux aussi une logique, avec 2 caractères **hexa**, `ff`, et 2 autres caractères **hexa**. 
On pourrait se créer une wordlist pour brute force tous les payloads possibles et voir si une page réagit différemment.
Créons d'abord une wordlist avec `crunch` : 
```bash
crunch 6 6 0123456789ABCDEF -t @@FF@@ -o pouet
```
Passons au bruteforce avec [ffuf](https://github.com/ffuf/ffuf). Mais d'abord, il nous faut récupérer le nom des paramètres pour la requête **POST**. Plusieurs possibilités, perso, j'utilise l'onglet **Network** présent sur n'importe quel navigateur en lançant une requête avec des paramètres au pif. On peut voir le nom de nos 3 paramètres, `pa`, `sw` et `pl`.
![image](../../assets/img/writeups/walkie_hackie/walkie2.png)
Bref, voici la commande pour le bruteforce, sans oublier le `Content-Type` si non, il ne se passera rien : 
```bash
ffuf -c -w pouet -u http://94.237.56.188:40252/transmit -X POST -d "pa=aaaaaaaa&sw=73214693&pl=FUZZ" -H "Content-Type: application/x-www-form-urlencoded"
```
On note la size d'une requête type qui fait **2831**, **CtrlC** puis on refait la même commande en y rajoutant le `-fs 2831` pour voir si une requête a une taille différente. 
On laisse mijoter et là, on voit que TOUS les **payload**s qui ont leur deuxième partie à **F9** ont une size différente.
```
<SNIP>
[Status: 200, Size: 2896, Words: 420, Lines: 134, Duration: 25ms]
    * W1: 9B
    * W2: F9

[Status: 200, Size: 2896, Words: 420, Lines: 134, Duration: 23ms]
    * W1: A7
    * W2: F9

[Status: 200, Size: 2896, Words: 420, Lines: 134, Duration: 25ms]
    * W1: BE
    * W2: F9
```
Reste plus qu'à rentrer les bonnes valeurs avec un payload qui finit par **F9** et obtient notre flag :)
On peut aussi faire un `curl` pour que ça fasse + hacker : 
```bash
curl -X POST http://94.237.56.188:40252/transmit -d 'pa=aaaaaaaa&sw=73214693&pl=a2fff9'
```