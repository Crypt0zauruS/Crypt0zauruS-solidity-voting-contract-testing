## **Ce test permet de vérifier le bon fonctionnement du contrat de vote.**

Il utilise la librairie **OpenZeppelin Test Helpers** pour faciliter l'écriture de tests unitaires.
Il utilise ègalement le plugin **eth-gas-reporter** pour générer un rapport sur les coûts de transaction.

Dans ce contrat de vote, les utilisateurs peuvent enregistrer des propositions, les votants peuvent ensuite voter pour une de ces propositions et, enfin, les votes sont comptabilisés pour déterminer la proposition gagnante.

## **Fonctions**

#### **Mocha**

- assert() : s'assure que l'état du contrat est exactement celui attendu.

#### **Chai**

- expect() : une fonction d'assertion de base fournie par la bibliothèque chai qui est utilisée pour vérifier les résultats attendus.

#### **OpenZeppelin Test Helpers**

- expectRevert() : vérifie si la transaction effectuée déclenche une réversion et s'assure que le message d'erreur correspond au message fourni.
- expectEvent() : vérifie si un événement a été émis lors de l'exécution de la fonction.
- BN : permet à javascript de gérer les uint de Solidity, qui sont codés en 256 bits.

## **Hooks**

- beforeEach() : La fonction beforeEach() est exécutée avant chaque test. Elle permet de factoriser le code redondants, lorsque c'est possible.
- describe() : La fonction describe() permet de regrouper des tests qui vérifient le comportement d'un ensemble de fonctions similaires.

## **Variables**

- Voting : le contrat à tester.
- owner, voter1, voter2, voter3, voter4 : les comptes Ganache utilisés pour le test.
- winningProposalID : stocke l'ID de la proposition gagnante.
- instance : instance du contrat Voting.

## **Tests**

Ils sont regroupés en 6 parties à l'aide du hook describe():

- #### **L'état initial du workflow**

Vérification du statut du workflow au début à l'index 0.
Émission de l'événement **WorkflowStatusChange** lorsque le owner commence l'enregistrement des propositions.
Vérification de l'ID de la proposition gagnante égal à 0 au début.

- #### **Les changements d'état du workflow**

Vérification du changement d'état du workflow lorsque le owner commence l'enregistrement des propositions.
Vérification du changement d'état du workflow lorsque le owner termine l'enregistrement des propositions.
Vérification du changement d'état du workflow lorsque le owner commence la session de vote.
Vérification du changement d'état du workflow lorsque le owner termine la session de vote.
Vérification du changement d'état du workflow lorsque le owner commence à compter les votes.

- #### **Le processus d'enregistrement des votants**

Vérifier que seul le owner peut enregistrer un votant.
Vérifier que l'on peut confirmer qu'un votant est enregistré après que le owner l'ait ajouté.
Vérifier qu'un utilisateur non autorisé ne peut pas vérifier les informations d'un votant.
Vérifier que l'événement **VoterRegistered** est émis après l'enregistrement d'un nouveau votant.
Vérifier que l'on ne peut pas enregistrer un votant qui est déjà enregistré.

- #### **Le processus d'enregistrement des propositions**

Vérifier que l'on ne peut pas ajouter une nouvelle proposition si la phase d'enregistrement des propositions n'a pas encore commencé.
Vérifier que la proposition 0 est la proposition Genesis.
Vérifier que l'on ne peut pas ajouter une nouvelle proposition si le caller n'est pas un votant enregistré.
Vérifier que l'on ne peut ajouter une nouvelle proposition vide.
Vérifier que l'on peut confirmer qu'une proposition a été enregistrée après qu'un votant l'a ajoutée.
Vérifier que l'événement **ProposalRegistered** est émis après l'enregistrement d'une nouvelle proposition.
Vérifier qu'un utilisateur non autorisé ne peut pas vérifier les informations d'une proposition.
Véifier que l'on ne peut plus ajouter de nouvelles propositions après que la phase d'enregistrement des propositions ait été terminée.

- #### **Le processus de vote**

Vérifier que le vote avant le début de la phase de vote échoue
Vérifier que le vote après le début de la phase de vote réussit
Vérifier que l'événement **Voted** est émis après un vote.
Vérifier que le vote par un votant non enregistré échoue
Vérifier que le vote après la fin de la phase de vote échoue
Vérifier que le vote pour une proposition non enregistrée échoue
Vérifier que le vote une deuxième fois échoue pour un même votant
Vérifier que le comptage des votes avant la fin de la phase de vote échoue
Vérifier que le comptage des votes par un utilisateur non owner échoue
Vérifier que l'Évènement **WorkflowStatusChange** est émis au comptage des votes.

- #### **Le processus de comptage des votes**

Vérifier que c'est la proposition gagnante qui est bien retournée.
Vérifier que c'est bien la première proposition a avoir été enregistrée qui est retournée en cas d'égalité.

## **Merci de votre attention**
