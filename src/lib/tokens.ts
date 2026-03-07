let access_token: string | null = null;

export const tokenStore = {
    get: () => access_token,
    set: (token: string) => {access_token = token;},
    clear: () => {access_token = null},
};