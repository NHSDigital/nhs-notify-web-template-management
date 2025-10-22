export type FixtureData = {
    users: Record<string, {
        email: string;
        password: string;
        userId: string;
    };
    templateIds: Record<string, Record<string, string>>;
};
