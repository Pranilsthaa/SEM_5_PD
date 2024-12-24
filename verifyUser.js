const jwt = require('jsonwebtoken')

const verifyUser = (req, res, next) => {
    try {
        const token = req.headers.authorization
        const decoded = jwt.verify(token, 'aisolutionsecretkey')
        req.user = decoded
        next()
    }
    catch (e) {
        return res.status(401).json({ message: 'unauthorized' })
    }
}

const verifySuperAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization
        const decoded = jwt.verify(token, 'aisolutionsecretkey')
        req.user = decoded
        if (decoded.role == 'superadmin') {
            return next()
        }
        res.status(401).send({ message: 'unauthorized' })
    }
    catch (e) {
        return res.status(401).json({ message: 'unauthorized' })
    }
}

module.exports = { verifyUser, verifySuperAdmin }