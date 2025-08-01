const { connection, runQuery } = require("../connection");

async function postArticle(data, file) {
  const { author, title, description, slug } = data;
  const { filename } = file;

  const eventQuery =
    "INSERT INTO article (title, description, article_image, author, slug) VALUES (?, ?, ?, ?, ?)";
  try {
    const result = await runQuery(eventQuery, [
      title,
      description,
      filename,
      author,
      slug,
    ]);
    return result;
  } catch (err) {
    throw err;
  }
}

async function getArticles() {
  const eventQuery = "SELECT * FROM article";
  try {
    const result = await runQuery(eventQuery);
    return result;
  } catch (err) {
    throw err;
  }
}

async function getArticleById(slug) {
  const eventQuery = "SELECT * FROM article where slug = ?";
  try {
    const result = await runQuery(eventQuery, [slug]);
    return result;
  } catch (err) {
    throw err;
  }
}

async function searchArticle(key) {
  const searchKey = `%${key}%`;
  const eventQuery = "SELECT title, slug FROM article WHERE slug LIKE ?";
  try {
    const result = await runQuery(eventQuery, [searchKey]);
    return result;
  } catch (err) {
    throw err;
  }
}

const getTotalArticle = async () => {
  const eventQuery = "SELECT COUNT(*) AS total FROM article";
  try {
    const result = await runQuery(eventQuery);
    return result;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  postArticle,
  getArticles,
  getArticleById,
  searchArticle,
  getTotalArticle,
};
