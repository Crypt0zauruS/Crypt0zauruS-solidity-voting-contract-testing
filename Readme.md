**Ce test permet de vérifier le bon fonctionnement du contrat de vote.**
Il utilise la librairie OpenZeppelin Test Helpers pour faciliter l'écriture de tests unitaires.

Dans ce contrat de vote, les utilisateurs peuvent enregistrer des propositions, les votants peuvent ensuite voter pour une de ces propositions et, enfin, les votes sont comptabilisés pour déterminer la proposition gagnante.

**Fonctions**

- expect() : une fonction d'assertion de base fournie par la bibliothèque chai qui est utilisée pour vérifier les résultats attendus.
- expectRevert() : vérifie si la transaction effectuée déclenche une réversion et s'assure que le message d'erreur correspond au message fourni.
- assert() : s'assure que l'état du contrat est exactement celui attendu.
  expectEvent() : vérifie si un événement a été émis lors de l'exécution de la fonction.
- BN : Aide javascript à gérer les nombres entiers de grande taille, comme les uint de solidity.
- beforeEach() : La fonction beforeEach() est exécutée avant chaque test. Elle permet de factoriser le code redondants, lorsque c'est possible.
- describe() : La fonction describe() permet de regrouper des tests qui vérifient le comportement d'un ensemble de fonctions similaires.

**Variables**

Voting : le contrat à tester.
owner, voter1, voter2, voter3, voter4 : les comptes Ganache utilisés pour le test.
winningProposalID : stocke l'ID de la proposition gagnante.
instance : instance du contrat Voting.

**Tests**

Ils sont regroupés en 6 parties :

- L'état initial du workflow
- Les changements d'état du workflow
- Le processus d'enregistrement des votants
- Le processus d'enregistrement des propositions
- Le processus de vote
- Le processus de comptage des votes
