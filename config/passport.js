const GoogleStrategy = require('passport-google-oauth20').Strategy
const sequelize = require('sequelize');
const User = require('../models/User');
require('dotenv').config();

// catch passport - passed in from server
module.exports = function(passport) {
    passport.use(new GoogleStrategy(
        {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }
        // findone based on email address instead of userid
        // https://www.googleapis.com/discovery/v1/apis/oauth2/v2/rest?fields=auth(oauth2(scopes))
        try{
            let user = await User.findOne({googleId: profile.id})
            if(user){
                done(null, user)
            } else {
                user = await User.create(newUser)
                done(null, user)
            }
        }catch(err){
            console.error(err);
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    
    passport.deserializeUser((id, done) => {
        User.findById(id,(err, user) => 
            done(err, user))
    })
}