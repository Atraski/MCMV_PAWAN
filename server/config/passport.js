const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Configure Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find or create user
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Check if user exists with same email
            if (profile.emails && profile.emails[0]) {
              user = await User.findOne({ email: profile.emails[0].value });
              if (user) {
                user.googleId = profile.id;
                await user.save();
              }
            }

            // Create new user if still not found
            if (!user) {
              user = new User({
                name: profile.displayName || profile.name?.givenName || 'User',
                email: profile.emails?.[0]?.value || '',
                googleId: profile.id,
                profilePicture: profile.photos?.[0]?.value || '',
                isEmailVerified: true,
              });
              await user.save();
            }
          }

          return done(null, { profile, user });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth configured');
} else {
  console.log('⚠️  Google OAuth not configured (credentials not provided)');
}

// Serialize user for session
passport.serializeUser((data, done) => {
  done(null, data.user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;


