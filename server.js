if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const PORT = 9999
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const initPassport = require('./passport')
const { render } = require('ejs')


initPassport(
    passport, 
    email => User.findOne({email}),
    id => User.findById(id)
)


app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(flash())
app.use(session(
    {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false

    }
))

mongoose.connect(process.env.url, {
    useUnifiedTopology: true
})
.then(() => console.log('Database Connected...'))
.catch((err) => console.error('MongoDB connection error:', err))



// model and Schemas
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required:true,
        unique: true,
    },
    password: {
        type: String,
        required:true,
    },
    totalDistance: {
        type: Number,
        default: 0
    }
}) 

const workoutSchema = new mongoose.Schema({
    
    pace: {
        type: Number,
        required: true
    },
    distance: {
        type: Number,
        required: true
    }, 
    date: {
        type: Date,
        default: Date.now()
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
})

const RaceSchema = new mongoose.Schema({

    date: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})


const Race = mongoose.model('Race', RaceSchema)
const Workout = mongoose.model('Workout', workoutSchema)
const User = mongoose.model('User', userSchema)

module.exports = {User, Workout, Race}

// Auth

app.use(passport.initialize())
app.use(passport.session())


// render index.ejs / Dashboard
app.get('/', checkAuth, async (req,res) => {
    try {

        res.render('index.ejs', {
            name: req.user.name,
            totalDistance: req.user.totalDistance
        })
    }catch (err) {
        console.error('Error displaying expenses:', err)
        res.status(500).send('Error fetching expenses');
    }
})



// login routes

app.get('/login', checkNotAuth, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuth, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// Register post Request and render


app.get('/register', checkNotAuth, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuth, async (req, res) => {
    
    const {name, email, password} = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.redirect('/login')
        }
        
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        
        const newUser = new User ({
            name,
            email,
            password: hashedPassword
        });
        
        await newUser.save()
        
        res.redirect('/login');
    } catch (err) {
        console.error(error)
    }
})


// check Auth function 

function checkAuth(req,res, next){
    if(req.isAuthenticated()){
        return next()
    }
    
    res.redirect('/login')
}

function checkNotAuth(req,res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    
    next()
}

//Dashboard routes 

// GET Routes

app.get('/links/add', checkAuth, async (req,res) => {
    res.render('links/add.ejs', )
})

app.get('/links/viewWorkout', checkAuth, async (req,res) => {


    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
    // Finds all Expenses with tied to the users ID  

    const recentWorkouts = await Workout.find({userId: req.user._id})
    .sort( {date: -1})


    res.render('links/viewWorkout.ejs', {
        recentWorkouts
    } )
})

app.get('/links/pastRaces',checkAuth, async (req,res) => {
    const pastRaces = await Race.find({userId: req.user._id})
    .sort({date: -1})

    res.render('links/pastRaces.ejs',{
        pastRaces: pastRaces
    })
})

app.get('/links/addRace',checkAuth, async (req,res) => {
    res.render('links/addRace.ejs')
})

// POST Routes


// saving Workout to the DB
app.post('/add', checkAuth, async (req, res) => {
    const {pace, distance} = req.body
    
    
    // making workout object form the Workout model
    const newWorkout = new Workout({
        pace,
        distance,
        userId: req.user._id
    });

    // adding form data to mongoDB
    try {
        await newWorkout.save();
        res.redirect('/')

        await  User.findByIdAndUpdate(
            req.user._id,
            {$inc: { totalDistance: distance}}
        )

    } catch (err) {
        console.error(err);
        res.redirect('/')
    }

})

app.post('/addRace', checkAuth, async (req, res) => {
    const {date, name ,event, time} = req.body

    // making race object form the Workout model
    const newRace = new Race({
        date,
        name,
        event,
        time,
        userId: req.user._id
    })


    // adding to database
    try {
        await newRace.save();
        res.redirect('/')
    } catch (err) {
        console.error(err);
        res.redirect('/')
    }
})

// Logout route

app.post('/logout', (req, res) => {
    
    // destroy the session 
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout failed! please try again...')
        }
    })

    res.redirect('/login')
})

// Delete request

app.delete('/race/delete/:id', checkAuth, async (req, res) => {
    
    try {
        await Race.findByIdAndDelete(req.params.id)
        res.status(200).send('Deleted Successfully')
    } catch (error) {
        res.status(500).send('Server request failed, Error Deleting')
    }
    
})

app.delete('/workout/delete/:id', checkAuth, async (req, res) => {
    
    try {
        await Workout.findByIdAndDelete(req.params.id)
        res.status(200).send('Deleted Successfully')
    } catch (error) {
        res.status(500).send('Server request failed, Error Deleting')
    }
    
})


app.post('/logout', (req, res) => {
    
    // destroy the session 
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout failed! please try again...')
        }
    })

    res.redirect('/login')
})




app.listen(PORT, () => {
    console.log(`BIG TONKA SERVER LIVE! http://localhost:${PORT}`)
})

