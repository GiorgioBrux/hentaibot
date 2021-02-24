// @TODO: Sankaku oauth2

// eslint-disable-next-line no-unused-vars
const config = {
    client: {
        id: 'sankaku-web-app',
        secret: ''
    },
    auth: {
        tokenHost: 'https://login.sankakucomplex.com',
        tokenPath: '/auth/token'
    }
};

async function start() {
    try {
        console.log(`Connected successfully to sankaku!`);
        // eslint-disable-next-line no-undef
        const accessToken = await client.getToken(tokenParams, {
            json: true,
            redirectURI: 'https://beta.sankakucomplex.com/sso/callback'
        });
        return accessToken;
    } catch (e) {
        throw new Error(`Couldn't connect to sankaku: ${e}. Exiting...`);
    }
}

module.exports = { start };
