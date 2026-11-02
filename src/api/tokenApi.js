import {
  apiRequest,
} from "./client";


export async function getMyTokenSummary() {
  const response =
    await apiRequest(
      "/tokens/me"
    );


  const data =
    response?.data ??
    response ??
    {};


  return {
    balance:
      Number(
        data?.balance ??
        0
      ),

    tokenPriceInr:
      Number(
        data?.tokenPriceInr ??
        0
      ),

    currency:
      data?.currency ||
      "INR",

    selfPurchaseEnabled:
      Boolean(
        data
          ?.selfPurchaseEnabled
      ),

    contactEmail:
      data?.contactEmail ||
      null,
  };
}