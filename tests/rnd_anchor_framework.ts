import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RndAnchorFramework } from "../target/types/rnd_anchor_framework";

function shortKey(key: anchor.web3.PublicKey) {
  return key.toString().slice(0, 8);
} // Shorten public key for easier logging.

describe("rnd_anchor_framework", () => {
  
  const provider = anchor.AnchorProvider.env(); // Configure the provider.
  anchor.setProvider(anchor.AnchorProvider.env()); // Configure the provider.
  const program = anchor.workspace.RndAnchorFramework as Program<RndAnchorFramework>;

  async function generateKeyPair() {
    const keypair = anchor.web3.Keypair.generate(); // Generate a new keypair.
    await provider.connection.requestAirdrop(keypair.publicKey, 2e9); // Request airdrop for the keypair.
    console.log("Generated keypair and airdropped 2 SOL", shortKey(keypair.publicKey));
    await new Promise((resolve) => setTimeout(resolve, 3 * 1000)); // Wait for airdrop to complete.
    return keypair;
  }

  async function derivePda(color: string, pubkey: anchor.web3.PublicKey) { // Derive a PDA.
    let [pda, _] = await anchor.web3.PublicKey.findProgramAddressSync( // Derive the PDA.
      [], // Seed.
      program.programId // Program ID.
    );
    return pda; // Return the PDA. 
  }

  async function createLedgerAccount(
    color: string, 
    pda: anchor.web3.PublicKey,
    wallet: anchor.web3.Keypair) {
      await program.methods.createLedger(color)
    } 

  async function modifyLedger(
    color: string,
    newBalance: number,
    wallet: anchor.web3.Keypair
  ) { 
    console.log("-------------------------------------------------------------------------");
    let data;
    let pda = await derivePda(color, wallet.publicKey);

    console.log("Checking if account ${shortKey(pda)} exists for color ${color}...");
    try {
      console.log("It does exist!");
      data = await program.account.ledger.fetch(pda);
    } catch (e) {

      console.log("It does not exist! Creating account...");
      await createLedgerAccount(color, pda, wallet);
      data = await program.account.ledger.fetch(pda);
    };

    console.log("Success.");
    console.log("Data:");
    console.log("Color: ${data.color} | Balance: ${data.balance}");
    console.log("Modifying balance of ${data.color} from ${data.balance} to ${newBalance}...");

    await program.methods.modifyLedger(newBalance)
    .accounts({
      ledgerAccount: pda,
      wallet: wallet.publicKey,
    })
    .signers([wallet])
    .rpc();
  }

  it("Is initialized!", async () => {

    const testKeypair1 = await generateKeyPair();
    await modifyLedger("red", 2, testKeypair1);
    await modifyLedger("red", 4, testKeypair1);
    await modifyLedger("blue", 2, testKeypair1);

    const testKeypair2 = await generateKeyPair();
    await modifyLedger("red", 3, testKeypair2);
    await modifyLedger("green", 3, testKeypair2);
  });
});