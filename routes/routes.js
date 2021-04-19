const { User, Message } = require('../models/models.js')
const jwt = require('jsonwebtoken')
const { Router } = require('express')
const router = Router()


router.get('/', async function (req, res){
    let messages = await Message.findAll({})
    let data = { messages }

    res.render('index.ejs', data)
})

router.get('/createUser', async function(req, res){
    res.render('createUser.ejs')
})

router.post('/createUser', async function(req, res){
    let { username, password } = req.body

    try {
        await User.create({
            username,
            password,
            role: "user"
        })  
    } catch (e) {
        console.log(e)
    }

    res.redirect('/login')
})

router.get('/login', function(req, res) {
    res.render('login')
})

//Error one lies here in this route: user is undefined
//Because user is defined Locally in the try function
router.post('/login', async function(req, res) {
    let {username, password} = req.body
    /*Error1: No line of code to look up the 'user' in the database
    to match the input username
    so that's why Couldn't Log In
     */
    let user = await User.findOne({ //Solution to Error1: define user globally
        where: {username}
    })
    
    // Define the if statement
    if (user && user.password === password) {
        let data = {
            username: username,
            role: user.role
        }

        try {
            /*let user = await User.findOne({ 
                where: {username}*/  
        let token = jwt.sign(data, "theSecret") //Solution to Error1: define the jwt under try and catch error
        res.cookie("token", token)
        res.redirect('/')

    }  catch (e) {
        console.log(e)
    }} 
     else {
        res.redirect('/error')
    }

   
   

    
})

router.get('/message', async function (req, res) {
    let token = req.cookies.token 

    if (token) {                                      // very bad, no verify, don't do this
        res.render('message')
    } else {
        res.render('login')
    }
})

router.post('/message', async function(req, res){
    let { token } = req.cookies
    let { content} = req.body
    

    if (token) {
        let payload = await jwt.verify(token, "theSecret")  
 
        let user = await User.findOne({
            where: {username: payload.username}
        })

        let msg = await Message.create({
            content,
            userId: user.id
        })

        res.redirect('/')
    } else {
        res.redirect('/login')
    }
})

//adding The  Route for LIKES
router.post('/like', async(req,res)=>{
    let {like} = req.body;

    let vote = await Message.create({
        like
    })
    res.redirect('/')

})

router.get('/error', function(req, res){
    res.render('error')
})

router.all('*', function(req, res){
    res.send('404 dude')
})

module.exports = router