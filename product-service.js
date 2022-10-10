var fs = require("fs");


var products = {};
var categories = [];


module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    try {

      
      fs.readFile("./data/products.json", function (err, data) {
        if (err) throw err;
        products = JSON.parse(data);
      });
      fs.readFile("./data/categories.json", function (err, data) {
        if (err) throw err;
        categories = JSON.parse(data);
      });
    } catch (ex) {
      reject("unable to read file");
    }
    resolve("JSON file successfully read.");
  });
};


module.exports.getAllProducts = function () {
  var all_products = [];
  return new Promise(function (resolve, reject) {
    for (var i = 0; i < products.length; i++) {
      all_products.push(products[i]);
    }
    if (all_products.length == 0) {
      reject("no results returned");
    }
    resolve(all_products);
  });
};


module.exports.getPublishedProducts = function () {
  var published_products = [];

  return new Promise(function (resolve, reject) {
    for (var a = 0; a < products.length; a++) {
      if (products[a].published == true) {
        published_products.push(products[a]);
      }
    }
    if (published_products.length == 0) {
      reject("no results returned");
    }
    resolve(published_products);
  });
};


module.exports.getCategories = function () {
  var c_categories = [];
  return new Promise(function (resolve, reject) {
    if (products.length == 0) {
      reject("no data returned");
    } else {
      for (var v = 0; v < categories.length; v++) {
        c_categories.push(categories[v]);
      }
      if (c_categories.length == 0) {
        reject("no data returned");
      }
    }
    resolve(c_categories);
  });
};