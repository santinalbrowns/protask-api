import jwt from "jsonwebtoken";

const privateKey: any = process.env.PRIVATE_KEY;
const publicKey: any = process.env.PUBLIC_KEY;


export const sign = (id: any) => {
    return jwt.sign({ id }, privateKey, { algorithm: 'RS256', expiresIn: '30d' });
}

export const verify = (token: string) => {
    return jwt.verify(token, publicKey);
}