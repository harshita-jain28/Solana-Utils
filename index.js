const solanaWeb3 = require("@solana/web3.js");
const bip39 = require("bip39");
const ed = require("ed25519-hd-key");
const nacl = require("tweetnacl");
const splToken = require("@solana/spl-token");

rpcUrl = "https://api.devnet.solana.com";
connection = new solanaWeb3.Connection(rpcUrl, "confirmed");
console.log("conn to cluster estabilished", rpcUrl);

var from, to;
const mnemonic =
  "total equip hello turtle chef man rubber lucky kick prefer dumb wear";
let path = "m/44'/501'/0'/1'";

const SOLANA_DEVNET_USDC_PUBKEY =
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

const createDerivedKeys = async (mnemonic, path) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const derivedSeed = ed.derivePath(path, seed.toString("hex")).key;
  const account = nacl.sign.keyPair.fromSeed(derivedSeed);
  from = solanaWeb3.Keypair.fromSecretKey(account.secretKey);

  console.log(from.publicKey.toBase58());
};

const makeTrasaction = async (from, to, val) => {
  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: val,
    })
  );
  const signature = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from]
  );
  console.log("Signature", signature);
};

const makeUSDCTransaction = async (from, to, usdc_amount) => {
  var USDC_pubkey = new solanaWeb3.PublicKey(SOLANA_DEVNET_USDC_PUBKEY);
  const { TOKEN_PROGRAM_ID } = splToken;
  const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
    connection,
    from,
    USDC_pubkey,
    from.publicKey
  );

  const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
    connection,
    from,
    USDC_pubkey,
    to.publicKey
  );

  var transaction = new solanaWeb3.Transaction().add(
    splToken.createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      from.publicKey,
      usdc_amount,
      [],
      TOKEN_PROGRAM_ID
    )
  );
  var signature = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from]
  );
  console.log(signature);
};

createDerivedKeys(mnemonic, path);
to = solanaWeb3.Keypair.generate();
console.log(to.publicKey.toBase58());
// makeTrasaction(from, to, solanaWeb3.LAMPORTS_PER_SOL / 100);
makeUSDCTransaction(from, to, 1);
