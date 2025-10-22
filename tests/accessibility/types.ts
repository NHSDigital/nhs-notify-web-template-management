export type FixtureData = {
  users: Record<
    string,
    {
      email: string;
      password: string;
      userId: string;
      clientId: string;
    }
  >;
  templateIds: Record<string, Record<string, string>>;
};
