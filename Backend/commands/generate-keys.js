// This module will generate a public and private keypair and save to current directory

import crypto from "crypto";
import fs from "fs";
import path from "path";

function genKeyPair() {
  const keyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem"
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem"
    }
  });

  fs.writeFileSync(path.resolve("pub_key.pem"), keyPair.publicKey);

  fs.writeFileSync(path.resolve(priv_key.pem), keyPair.privateKey);
}

genKeyPair();
