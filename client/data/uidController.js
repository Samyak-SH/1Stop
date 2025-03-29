import * as SecureStore from "expo-secure-store";

export const storeUID = async (uid) => {
  await SecureStore.setItemAsync("userUID", uid);
};

export const getUID = async () => {
  return await SecureStore.getItemAsync("userUID");
};
export const removeUID = async () => {
  await SecureStore.deleteItemAsync("userUID");
};
