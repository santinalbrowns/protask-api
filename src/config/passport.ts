import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import User from "../models/User";

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.PUBLIC_KEY
};

module.exports = (passport: any) => {
    passport.use(new Strategy(options, (payload, done) => {
        User.findById(payload.id)
            .then(user => {
                if (user) {

                    // Assing user to a new object
                    const data = {
                        id: user._id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email
                    }

                    return done(null, data);
                }

                return done(null, false);
            })
            .catch(err => console.log(err))
    }))
}


