const pool = require('./db');
const router = require('express').Router();
const bcrypt = require('bcrypt');

//create a user
router.post('/register', async(req, res) => {
    try {
        const {email, name, password, age, school} = req.body;
        if(password.length > 5 && email && name) {

            //encrypt the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const  newUser = await pool.query('INSERT INTO Users (name, password, email, age, school) VALUES($1, $2, $3, $4, $5) RETURNING *', [name, hashedPassword, email, age, school]);

            res.json(newUser.rows[0]);
        } else {
            res.status(500).send('Password is too weak')
        }

    } catch (error) {
        res.status(500).send(error.message);
    }
});

// log in
router.post('/login', async(req, res) => {
    try {
        const {email, password} = req.body;

        const user = await pool.query('SELECT * FROM Users WHERE email=$1', [email]);
        
        if(user.rows.length === 0) {
            res.status(500).send('Incorrect email or password.');
        }
        const encryptedPassword = user.rows[0].password;

        const checkPassword = bcrypt.compareSync(password, encryptedPassword);

        if(checkPassword) {
            res.json(user.rows[0]);
        } else {
            res.status(500).send('Incorrect email or password.');
        }


    } catch (error) {
        res.status(500).send(error.message);
    }
});


//get user by id
router.get('/user/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const user = await pool.query('SELECT * FROM Users WHERE id=$1', [id]);

        res.json(user);

    } catch (error) {
        console.log(error.message);
    }
});

// delete a user AND THEIR BOOKS/COMMENTS
// router.delete('/user/delete/:id', async(req, res) => {

//     try {
//         const {id} = req.params;
//         const user = pool.query('DELETE FROM User WHERE id=$1', [id]);
//         res.json('Account Deleted');

//     } catch (error) {
//         console.log(error.message);
//     }
// })

module.exports = router;