const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
var sequelize = new Sequelize('imgsyngx'
    , 'imgsyngx', '9s6IzGmrC2msErMFuM_LM8hoNLasn8HO', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

//creating models
const Product = sequelize.define("Product", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
  });
  
  const Category = sequelize.define("Category", {
    category: Sequelize.STRING,
  });
  
  Product.belongsTo(Category, { foreignKey: "category" });
  
  //initializing modules
  module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
      sequelize
        .sync()
        .then(resolve("database synced"))
        .catch(reject("unable to sync the database"));
    });
  };
  
  //getAllproducts() function
  module.exports.getAllProducts = function () {
    return new Promise((resolve, reject) => {
      sequelize
        .sync()
        .then(resolve(Product.findAll()))
        .catch(reject("no results returned"));
    });
  };
  
  //function to add a new product
  module.exports.addProduct = (productData) => {
    return new Promise((resolve, reject) => {
      productData.published = productData.published ? true : false;
      for (var i in productData) {
        if (productData[i] == "") {
          productData[i] = null;
        }
      }
      Product.create(productData)
        .then(resolve(Product.findAll()))
        .catch(reject("unable to create product"));
    });
  };
  
  module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
      for (var y in categoryData) {
        if (categoryData[y] == "") {
          categoryData[y] = null;
        }
      }
      Category.create(categoryData)
        .then(resolve(Category.findAll()))
        .catch(reject("unable to create category"));
    });
  };
  
  //getPublishedProducts() function validates only published products
  module.exports.getPublishedProducts = function () {
    return new Promise((resolve, reject) => {
      Product.findAll({
        where: {
          published: true,
        },
      })
        .then(resolve(Product.findAll({ where: { published: true } })))
        .catch("no results returned");
    });
  };
  
  //getPublishedProductsByCategory() function validates only published products by category
  module.exports.getPublishedProductsByCategory = (category) => {
    return new Promise((resolve, reject) => {
      Product.findAll({
        where: {
          published: true,
        },
      })
        .then(resolve(Product.findAll({ where: { category: category } })))
        .catch("no results returned");
    });
  };
  
  //getCategories() function
  module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
      Category.findAll()
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  
  //get product by categories
  module.exports.getProductByCategory = (category) => {
    return new Promise((resolve, reject) => {
      Product.findAll({
        where: {
          category: category,
        },
      })
        .then((data) => resolve(data))
        .catch("no results returned");
    });
  };
  
  //get products by min date
  module.exports.getProductsByMinDate = (minDate) => {
    return new Promise((resolve, reject) => {
      const { gte } = Sequelize.Op;
      Product.findAll({
        where: {
          postDate: {
            [gte]: new Date(minDate),
          },
        },
      })
        .then((data) => resolve(data))
        .catch("no results returned");
    });
  };
  
  //function to get id
  module.exports.getProductById = (id) => {
    return new Promise((resolve, reject) => {
      Product.findAll({
        where: {
          id: id,
        },
      })
        .then(resolve(Product.findAll({ where: { id: id } })))
        .catch(reject("no results returned"));
    });
  };
  
  module.exports.deleteCategoryById = function (id) {
    return new Promise(function (resolve, reject) {
      Category.destroy({
        where: {
          id: id,
        },
      })
        .then(function () {
          resolve();
        })
        .catch((err) => {
          reject("was rejected");
        });
    });
  };
  
  module.exports.deleteProductById = (id) => {
    return new Promise(function (resolve, reject) {
      sequelize
        .sync()
        .then(() => {
          resolve(
            Product.destroy({
              where: { id: id },
            })
          );
        })
        .catch((err) => {
          reject();
        });
    });
  };