import { getMockConnection } from "../backend/networking/__tests__/mockClient";

// this is horrible

const main = {
  get: () => ({
    connect: async (metadata: string) => {
      return await getMockConnection(metadata);
    },
  }),
};

export default main;
