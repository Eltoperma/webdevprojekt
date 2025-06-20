// Simple hash function using built-in Web Crypto API
async function simpleHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Secret key for additional security (in production, this should be more complex)
const SECRET_KEY = "math-game-secret-2024";

export interface EncryptedData {
  data: string;
  hash: string;
}

export async function encryptData(data: any): Promise<EncryptedData> {
  const jsonString = JSON.stringify(data);
  const dataWithSecret = jsonString + SECRET_KEY;
  const hash = await simpleHash(dataWithSecret);

  return {
    data: jsonString,
    hash: hash,
  };
}

export async function decryptData(
  encryptedData: EncryptedData
): Promise<any | null> {
  try {
    const dataWithSecret = encryptedData.data + SECRET_KEY;
    const expectedHash = await simpleHash(dataWithSecret);

    if (encryptedData.hash !== expectedHash) {
      console.warn("Data integrity check failed - possible tampering detected");
      return null;
    }

    return JSON.parse(encryptedData.data);
  } catch (error) {
    console.error("Failed to decrypt data:", error);
    return null;
  }
}
