const jwtConfig = {
    secret: process.env.SECRET_JWT,
    options: {
        expiresIn: "24h"
    }
}

export default jwtConfig;