const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { runQuery } = require('../connection');

async function adminLogin(req, res) {
    try {
        const { username, password } = req.body;
        const superAdminUsername = process.env.SUPER_ADMIN_USERNAME
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD

        // check env for superadmin credential
        if (username === superAdminUsername && password === superAdminPassword) {
            const token = jwt.sign({ id: 0, username: superAdminUsername, role: 'superadmin' }, 'aisolutionsecretkey')
            return res.status(200).send({ token: token, message: "Login successful", role: 'superadmin' });
        }

        // Fetch the user from the database
        const result = await runQuery('SELECT * FROM admin_credential WHERE username=?', [username]);
        if (result[0].role === 'terminated') {
            return res.status(401).send({ message: 'Account Terminated ! Contact SuperAdmin' });
        }
        if (result.length > 0) {
            const user = result[0];
            const hashPassword = user.password.toString();
            // Compare the provided password with the hashed password
            bcrypt.compare(password, hashPassword).then(function (result) {
                if (!result) {
                    return res.status(401).json({ message: 'Invalid username or password' });
                }
                // Generate a JWT token
                const token = jwt.sign({ id: user.id, username: user.name, role: user.role }, 'aisolutionsecretkey', { expiresIn: '1h' });
                return res.status(200).send({ token: token, message: "Login successful", role: user.role });
            });
        } else {
            return res.status(401).json({ message: 'User not found' });
        }
    }
    catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function createAdmin(req, res) {
    const { username, password, designation } = req.body;

    try {
        // Hash the password with bcrypt
        const saltRounds = 10; // adjust the salt rounds based on your security requirements
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save the admin credentials with the hashed password
        const result = await runQuery(
            'INSERT INTO admin_credential (username, password, designation) VALUES (?, ?, ?)',
            [username, hashedPassword, designation]
        );

        if (result) {
            return res.status(200).json({ message: "Admin Account Successfully Created" });
        } else {
            return res.status(401).json({ message: 'Something went wrong' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

async function getAdminAccounts(req, res) {
    try {
        const result = await runQuery('SELECT id, username, designation, role FROM admin_credential');
        if (result) {
            return res.status(200).send(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

async function terminateAdminAccount(req, res) {
    const { id } = req.body;
    try {
        const result = await runQuery('UPDATE admin_credential SET role=? where id=?', ['terminated', id]);
        if (result.affectedRows > 0) {
            return res.status(200).send({ message: 'Account Terminated' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

async function reactivateAdminAccount(req, res) {
    const { id } = req.body;
    try {
        const result = await runQuery('UPDATE admin_credential SET role=? where id=?', ['admin', id]);
        if (result.affectedRows > 0) {
            return res.status(200).send({ message: 'Account Reactivated' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { adminLogin, createAdmin, getAdminAccounts, terminateAdminAccount, reactivateAdminAccount }
