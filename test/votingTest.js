const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

contract("Voting", (accounts) => {
  // variables
  const [owner, voter1, voter2, voter3, voter4] = accounts;
  let winningProposalID;
  let instance;

  beforeEach(async () => {
    // On crée une nouvelle instance du contrat avant chaque test
    instance = await Voting.new({ from: owner });
  });

  console.log(owner, voter1, voter2, voter3, voter4);

  // tests
  /******************************* Check des variables au commencement ************************************/
  describe("Voting variables at the beginning", () => {
    it("should have winningProposalID equal to 0", async () => {
      // On vérifie que winningProposalID est à 0
      // const winningProposalID = await instance.winningProposalID(); est moins optimisé en gas
      const winningProposalID = await instance.winningProposalID.call();
      expect(winningProposalID).to.be.bignumber.equal(new BN(0));
    });
  });

  /******************************* Check du Workflow au commencement ************************************/

  describe("Workflow status at beginning and event emission", () => {
    it("should be 0 at the beginning", async () => {
      // On vérifie que le statut du workflow est à 0
      const status = await instance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(new BN(0));
    });

    it("should emit a WorkflowStatusChange event after the owner starts the proposals registration", async () => {
      // On démarre la phase d'enregistrement des propositions
      // On vérifie que l'évènement WorkflowStatusChange est émis
      const { logs } = await instance.startProposalsRegistering({
        from: owner,
      });
      expectEvent.inLogs(logs, "WorkflowStatusChange", {
        previousStatus: new BN(0),
        newStatus: new BN(1),
      });
    });
  });

  /******************************* Check des changements d'état du Workflow ************************************/

  describe("Workflow status changes", () => {
    beforeEach(async () => {
      // On démarre la phase d'enregistrement des propositions
      await instance.startProposalsRegistering({ from: owner });
    });

    it("should be 1 after the owner starts the proposals registering phase", async () => {
      // On vérifie que le statut du workflow est à 1
      const status = await instance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(new BN(1));
    });

    it("should be 2 after the owner ends the proposals registering phase", async () => {
      // On termine la phase d'enregistrement des propositions
      await instance.endProposalsRegistering({ from: owner });
      // On vérifie que le statut du workflow est à 2
      const status = await instance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(new BN(2));
    });

    it("should be 3 after the owner starts the voting session", async () => {
      // On termine la phase d'enregistrement des propositions
      await instance.endProposalsRegistering({ from: owner });
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On vérifie que le statut du workflow est à 3
      const status = await instance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(new BN(3));
    });

    it("should be 4 after the owner ends the voting session", async () => {
      // On termine la phase d'enregistrement des propositions
      await instance.endProposalsRegistering({ from: owner });
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On termine la phase de vote
      await instance.endVotingSession({ from: owner });
      // On vérifie que le statut du workflow est à 4
      const status = await instance.workflowStatus();
      expect(status).to.be.bignumber.equal(new BN(4));
    });

    it("should be 5 after the owner starts to tally votes", async () => {
      // On termine la phase d'enregistrement des propositions
      await instance.endProposalsRegistering({ from: owner });
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On termine la phase de vote
      await instance.endVotingSession({ from: owner });
      // On démarre la phase de validation des propositions
      await instance.tallyVotes({ from: owner });
      // On vérifie que le statut du workflow est à 5
      const status = await instance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(new BN(5));
    });
  });

  /******************************* Check du processus d'enregistrement des votants ************************************/

  describe("Voters registration", () => {
    it("should not register a voter if the caller is not the owner", async () => {
      // On vérifie que l'enregistrement d'un votant par un utilisateur non autorisé échoue
      await expectRevert(
        instance.addVoter(voter1, { from: voter1 }),
        "Ownable: caller is not the owner"
      );
    });

    it("should register a new voter", async () => {
      // On véfifie que le statut du workflow est à 0
      const status = await instance.workflowStatus.call();
      expect(status).to.be.bignumber.equal(new BN(0));
      // On enregistre un nouveau votant
      // verification de l'évènement VoterRegistered
      const { logs } = await instance.addVoter(voter1, { from: owner });
      expectEvent.inLogs(logs, "VoterRegistered", { voterAddress: voter1 });
    });

    it("should not register a voter if the voter is already registered", async () => {
      // On enregistre voter1
      await instance.addVoter(voter1, { from: owner });
      // On vérifie que l'enregistrement d'un votant déjà enregistré échoue
      await expectRevert(
        instance.addVoter(voter1, { from: owner }),
        "Already registered"
      );
    });
  });

  /******************************* Check du processus d'enregistrement des propositions ************************************/

  describe("Proposals registration", () => {
    // On enregistre un nouveau votant avant chaque test
    beforeEach(async () => {
      await instance.addVoter(voter1, { from: owner });
    });

    it("should not add a new proposal if the proposal phase has not started yet", async () => {
      // On vérifie que l'ajout d'une proposition avant le début de la phase d'enregistrement échoue
      await expectRevert(
        instance.addProposal("Proposal 1", { from: voter1 }),
        "Proposals are not allowed yet"
      );
    });

    it("should add a new proposal", async () => {
      // On démarre la phase d'enregistrement des propositions
      await instance.startProposalsRegistering({ from: owner });
      // On vérifie que l'ajout d'une proposition après le début de la phase d'enregistrement réussit
      const { logs } = await instance.addProposal("Proposal 1", {
        from: voter1,
      });
      expectEvent.inLogs(logs, "ProposalRegistered");
    });

    it("should not add a new proposal if the proposal phase has ended", async () => {
      // On démarre la phase d'enregistrement des propositions
      await instance.startProposalsRegistering({ from: owner });
      // On ajoute une proposition
      await instance.addProposal("Proposal 1", { from: voter1 });
      // On termine la phase d'enregistrement des propositions
      await instance.endProposalsRegistering({ from: owner });
      // On vérifie que l'ajout d'une proposition après la fin de la phase d'enregistrement échoue
      await expectRevert(
        instance.addProposal("Proposal 2", { from: voter1 }),
        "Proposals are not allowed yet"
      );
    });
  });

  /******************************* Check de la phase de vote ************************************/

  describe("Voting session", () => {
    beforeEach(async () => {
      // On enregistre un nouveau votant
      await instance.addVoter(voter1, { from: owner });
      // On démarre la phase d'enregistrement des propositions
      await instance.startProposalsRegistering({ from: owner });
      // On ajoute une proposition
      await instance.addProposal("Proposal 1", { from: voter1 });
      // On termine la phase d'enregistrement des propositions
      await instance.endProposalsRegistering({ from: owner });
    });

    it("should not vote if the voting phase has not started yet", async () => {
      // On vérifie que le vote avant le début de la phase de vote échoue
      await expectRevert(
        instance.setVote(0, { from: voter1 }),
        "Voting session havent started yet"
      );
    });

    it("should succeed to vote", async () => {
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On vérifie que le vote après le début de la phase de vote réussit
      const { logs } = await instance.setVote(0, { from: voter1 });
      expectEvent.inLogs(logs, "Voted", {
        voter: voter1,
        proposalId: new BN(0),
      });
    });

    it("should not vote if the voter is not registered", async () => {
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On vérifie que le vote par un votant non enregistré échoue
      await expectRevert(
        instance.setVote(0, { from: voter2 }),
        "You're not a voter"
      );
    });

    it("should not vote if the voting phase has ended", async () => {
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On vote
      await instance.setVote(0, { from: voter1 });
      // On termine la phase de vote
      await instance.endVotingSession({ from: owner });
      // On vérifie que le vote après la fin de la phase de vote échoue
      await expectRevert(
        instance.setVote(0, { from: voter1 }),
        "Voting session havent started yet"
      );
    });

    it("should not vote if the proposal does not exist", async () => {
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On vérifie que le vote pour une proposal non enregistrée échoue
      await expectRevert(
        instance.setVote(2, { from: voter1 }),
        "Proposal not found"
      );
    });

    it("should not vote twice", async () => {
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On vote
      await instance.setVote(0, { from: voter1 });
      // On vérifie que le vote une deuxième fois échoue pour un même votant
      await expectRevert(
        instance.setVote(0, { from: voter1 }),
        "You have already voted"
      );
    });

    it("should not allow to tally votes if voting session is not ended", async () => {
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On vérifie que le comptage des votes avant la fin de la phase de vote échoue
      await expectRevert(
        instance.tallyVotes({ from: owner }),
        "Current status is not voting session ended"
      );
    });

    it("should not allow to tally votes if the caller is not the owner", async () => {
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On termine la phase de vote
      await instance.endVotingSession({ from: owner });
      // On vérifie que le comptage des votes par un utilisateur non autorisé échoue
      await expectRevert(
        instance.tallyVotes({ from: voter1 }),
        "Ownable: caller is not the owner"
      );
    });

    it("should emit WorkflowStatusChange event when tallying votes", async () => {
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On termine la phase de vote
      await instance.endVotingSession({ from: owner });
      // On vérifie que le comptage des votes émet un événement WorkflowStatusChange
      const { logs } = await instance.tallyVotes({ from: owner });
      expectEvent.inLogs(logs, "WorkflowStatusChange", {
        previousStatus: new BN(4),
        newStatus: new BN(5),
      });
    });
  });

  /******************************* Check des résultats de la phase de vote ************************************/

  describe("Winning proposal", () => {
    beforeEach(async () => {
      // On enregistre un nouveau votant
      await instance.addVoter(voter1, { from: owner });
      // On enregistre un nouveau votant
      await instance.addVoter(voter2, { from: owner });
      // On enregistre un nouveau votant
      await instance.addVoter(voter3, { from: owner });
      // On enregistre un nouveau votant
      await instance.addVoter(voter4, { from: owner });
      // On démarre la phase d'enregistrement des propositions
      await instance.startProposalsRegistering({ from: owner });
      // On ajoute une proposition
      await instance.addProposal("Proposal 1", { from: voter1 });
      // On ajoute une deuxième proposition
      await instance.addProposal("Proposal 2", { from: voter3 });
      // On ajoute une troisième proposition
      await instance.addProposal("Proposal 3", { from: voter1 });
      // On ajoute une quatrième proposition
      await instance.addProposal("Proposal 4", { from: voter4 });
      // On termine la phase d'enregistrement des propositions
      await instance.endProposalsRegistering({ from: owner });
      // On démarre la phase de vote
      await instance.startVotingSession({ from: owner });
      // On vote pour la première proposition
      await instance.setVote(0, { from: voter1 });
      // On vote pour la première proposition
      await instance.setVote(0, { from: voter2 });
      // On vote pour la deuxième proposition
      await instance.setVote(1, { from: voter3 });
    });

    it("should have correct winning proposal after tallied votes", async () => {
      // On vote pour la troisiéme proposition
      await instance.setVote(2, { from: voter4 });
      // On termine la phase de vote
      await instance.endVotingSession({ from: owner });
      // On vérifie que la première proposition est gagnante
      await instance.tallyVotes({ from: owner });
      winningProposalID = await instance.winningProposalID.call();
      assert.equal(winningProposalID, 0);
    });

    it("should have correct winning proposal with lowest Id after tallied votes with a tie", async () => {
      // On vote pour la deuxième proposition
      await instance.setVote(1, { from: voter4 });
      // On termine la phase de vote
      await instance.endVotingSession({ from: owner });
      // On vérifie que la première proposition est gagnante
      await instance.tallyVotes({ from: owner });
      winningProposalID = await instance.winningProposalID.call();
      assert.equal(winningProposalID, 0);
    });
  });
});
