const jwt = require('jsonwebtoken')

const verifyUser = (req, res, next) => {
    try {
        const token = req.headers.authorization
        const decoded = jwt.verify(token, 'pranil123')
        req.user = decoded
        next()
    }
    catch (e) {
        return res.status(401).json({ message: 'unauthorized' })
    }
}

module.exports = { verifyUser }