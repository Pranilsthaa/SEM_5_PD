const articleModel = require('../model/articleModel')

async function postArticle(req, res) {
    const data = req.body;
    const file = req.file;
    try {
        let response = await articleModel.postArticle(data, file);
        if (response) {
            res.status(200).send('Article posted successfully');
        } else {
            res.status(404).send('Something went wrong');
        }
    } catch (err) {
        console.log(err);
    }
}

async function getArticles(req, res) {
    try {
        let response = await articleModel.getArticles();
        if (response) {
            res.status(200).send(response);
        } else {
            res.status(404).send('Something went wrong');
        }
    } catch (err) {
        console.log(err);
    }
}

async function getArticleById(req, res) {
    const { slug } = req.params;
    try {
        let response = await articleModel.getArticleById(slug);
        if (response) {
            res.status(200).send(response);
        } else {
            res.status(404).send('Something went wrong');
        }
    } catch (err) {
        console.log(err);
    }
}
async function searchArticle(req, res) {
    const { key } = req.query;
    try {
        let response = await articleModel.searchArticle(key);
        if (response) {
            res.status(200).send(response);
        } else {
            res.status(404).send('Something went wrong');
        }
    } catch (err) {
        console.log(err);
    }
}


module.exports = { postArticle, getArticles, getArticleById, searchArticle }