const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser =  (email, password, done) => {
      console.log(email)  
      console.log(password)
      getUserByEmail(email).then(async (currentUser) => {
        console.log(currentUser)
        try{
          const match = await bcrypt.compare(password, currentUser.password);
          if (match) {
            return done(null, currentUser)
          } else {
            return done(null, false, {message: 'Password incorrect'})
          }
        } catch (e) {
            return done(e)
        }
        
        // if (currentUser == null) {
        //     return done(null, false, { message: 'No user with that email'} )
        // }
        // if (password === currentUser.password) {
        //     return done(null, currentUser)
        // } else {
        //     return done(null, false, {message: 'Password incorrect'})
        // }
      })

   
    }
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))  
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
      return done(null, getUserById(id))
    })
  }

  module.exports = initialize
