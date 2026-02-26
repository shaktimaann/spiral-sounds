import validator from 'validator';
import { getDBConnection } from '../db/db.js'
import bcrypt from 'bcryptjs';


export async function registerUser(req,res){
    const regex = /^[a-zA-Z0-9_-]{1,20}$/
    let { name, email, username, password } = req.body
    if (name && email && username && password){
        name = name.trim()
        email = email.replace(/\s/g, '')
        username = username.replace(/\s/g, '')
        password = password.replace(/\s/g, '')
        if(!regex.test(username)){
            console.log('error')
            return res.status(400).json({ error: 'Username must be 1–20 characters, using letters, numbers, _ or -.' })
        }
        if(!validator.isEmail(email)){
            console.log('error')
            return res.status(400).json({ error: 'Not a valid email' })

        }

        try{
            const db = await getDBConnection()
            const existing =  await db.get(`SELECT id FROM users 
WHERE email = ? OR username = ?
LIMIT 1;`,[email,username])

if (existing){

    return res.status(400).json({ error: 'Email or username already in use.' })

}

const hashedPassword = await bcrypt.hash(password,10)

const result = await db.run(`INSERT INTO users (name,email, username, password)
VALUES (?, ?, ?, ?);`,[name,email,username,hashedPassword])

req.session.userId = result.lastID

res.status(201).json({message:'user registered successfully'})


        }catch (err) {

    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' })

  }

    }else{
        console.log("all fields")
        res.status(400).json({ error: 'All fields are required' })
    }

}



export async function loginUser(req, res) {

    let {username,password} = req.body

    if(!(username&&password)){
       return res.status(400).json({ error: 'All fields are required' })
    }

    username = username.trim()


  try {
    const db = await getDBConnection()

    const user = await db.get('SELECT * FROM users WHERE username = ?', [username])
    if(!user){
        return res.status(401).json({ error: 'Invalid credentials'})
    }

    const isValid = await bcrypt.compare(password,user.password)


    if(!isValid){
        console.log('wrong pass')
        return res.status(401).json({ error: 'Invalid credentials'})


    }

    req.session.userId = user.id
    res.json({ message: 'Logged in' })



  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
}


export async function logoutUser(req,res){
    req.session.destroy(()=>{
        return res.json({ message: 'Logged out' })

    })

}