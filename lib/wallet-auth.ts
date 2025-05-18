import { ethers } from "ethers";

// Message to sign for authentication
export const getAuthMessage = (voterCode: string) => {
  return `Sign this message to verify your identity for VotelySign voting platform. Voter code: ${voterCode}. This signature will not trigger any blockchain transaction or cost gas fees.`;
};

// Verify wallet signature
export const verifyWalletSignature = (
  message: string,
  signature: string,
  address: string
): boolean => {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

// Get wallet information for different providers
export const getWalletInfo = async (provider: any) => {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const address = await signer.getAddress();
    const chainId = (await ethersProvider.getNetwork()).chainId;

    return {
      address,
      chainId,
      signer,
    };
  } catch (error) {
    console.error("Error getting wallet info:", error);
    throw error;
  }
};

// Sign message with wallet
export const signWithWallet = async (
  provider: any,
  message: string
): Promise<string> => {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    return await signer.signMessage(message);
  } catch (error) {
    console.error("Wallet signing error:", error);
    throw error;
  }
};
