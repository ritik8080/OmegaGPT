import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/User.js';

// Helper function to find or create user
const findOrCreateUser = async (profile, providerIdField) => {
    try {
        let user = await User.findOne({ [providerIdField]: profile.id });
        if (user) return user;

        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@${providerIdField}.com`;
        
        user = await User.findOne({ email });
        if (user) {
            user[providerIdField] = profile.id;
            await user.save();
            return user;
        }

        user = await User.create({
            username: profile.displayName || profile.username || `${providerIdField}_user_${profile.id}`,
            email: email,
            [providerIdField]: profile.id
        });

        return user;
    } catch (error) {
        throw error;
    }
};

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await findOrCreateUser(profile, 'googleId');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_secret',
    callbackURL: '/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await findOrCreateUser(profile, 'githubId');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// LinkedIn Strategy
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'dummy_secret',
    callbackURL: '/api/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await findOrCreateUser(profile, 'linkedinId');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// Serialize/Deserialize
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
