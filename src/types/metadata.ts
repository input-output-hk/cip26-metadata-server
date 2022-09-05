export interface Metadata {
  /**
   * The subject, a namespace for multiple metadata entries, typically a hash digest.
   */
  subject: string;
  /**
   * A CBOR-serialized phase-1 monetary policy, used as a pre-image to produce a policyId.
   */
  policy?: string;
  /**
   * A hashing algorithm identifier and a base16-enocoded bytestring, such that the bytestring is the preimage of the metadata subject under that hash function.
   */
  preimage?: {
    /**
     * A hashing algorithm identifier. The length of the digest is given by the subject.
     */
    alg?: 'sha1' | 'sha' | 'sha3' | 'blake2b' | 'blake2s' | 'keccak' | 'md5';
    /**
     * The actual preimage.
     */
    msg?: string;
    [k: string]: unknown;
  };
  /**
   * A human-readable name for the metadata subject, suitable for use in an interface or in running text.
   */
  name?: string;
  /**
   * A longer description of the metadata subject, suitable for use when inspecting the metadata subject itself.
   */
  description?: string;
  /**
   * A short identifier for the metadata subject, suitable to show in listings or tiles.
   */
  ticker?: string;
  /**
   * When the metadata subject refers to a monetary policy, refers to the number of decimals of the currency.
   */
  decimals?: number;
  /**
   * A universal resource identifier pointing to additional information about the metadata subject.
   */
  url?: string;
  /**
   * A `image/png` object which is 64KB in size at most.
   */
  logo?: string;

  [k: string]: Entry | unknown;
}

export interface Entry {
  value: unknown;
  sequenceNumber: number;
  signatures: Signature[];
}

export interface Signature {
  /**
   * An Ed25519 Public key, verifying the companion signature.
   */
  publicKey: string;
  /**
   * A signed attestation.
   */
  signature: string;
}
