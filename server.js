/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: manav Student ID:153341219 Date: 21 November 2022
 *
 *  Online (Cyclic) Link: https://splendid-yak-onesies.cyclic.app/
 *
 *******************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const upload = multer(); // no { storage: storage }
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");

cloudinary.config({
  cloud_name: 'dh5oo7rk5',
  api_key: '648259183232712',
  api_secret: 'W56RcbmRTC6csy7K-96z4lRZYUQc',
      secure: true,
  });

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    },
    },
  })
);
app.set("view engine", ".hbs");

//adding path tp product-service.js module to interact with it
var productSrv = require("./product-service");
const { get } = require("http");

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
  return new Promise(function (res, req) {
    productSrv
      .initialize()
      .then(function (data) {
        console.log(data);
      })
      .catch(function (err) {
        console.log(err);
      });
  });
}

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.use(express.static("public"));

//setting up a defualt route for local host
app.get("/", function (req, res) {
  res.render(path.join(__dirname + "/views/home.hbs"));
});

app.get("/home", function (req, res) {
  res.render(path.join(__dirname + "/views/home.hbs"));
});

app.get("/products/add", function (req, res) {
  productSrv
    .getCategories()
    .then((data) => res.render("addProduct", { categories: data }))
    .catch((err) => res.render("addProduct", { categories: [] }));
});

app.get("/categories/add", function (req, res) {
  res.render(path.join(__dirname + "/views/addCategory.hbs"));
});

//add image cloudinary code
app.post("/products/add", upload.single("featureImage"), function (req, res) {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }

  upload(req).then((uploaded) => {
    req.body.featureImage = uploaded.url;
  });
  productSrv.addProduct(req.body).then(() => {
    res.redirect("/demos"); //after done redirect to demos
  });
});

app.post("/categories/add", (req, res) => {
  productSrv.addCategory(req.body).then(() => {
    res.redirect("/categories");
  });
});

app.get("/categories/delete/:id", (req, res) => {
  productSrv
    .deleteCategoryById(req.params.id)
    .then(res.redirect("/categories"))
    .catch((err) =>
      res.status(500).send("Unable to Remove Category / Category not found")
    );
});

app.get("/demos/delete/:id", (req, res) => {
  productSrv
    .deleteProductById(req.params.id)
    .then(res.redirect("/demos"))
    .catch((err) =>
      res.status(500).send("Unable to Remove Product / Product not found")
    );
});

app.get("/product", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare an empty array to hold "product" objects
    let products = [];

    // if there's a "category" query, filter the returned products by the category
    if (req.query.category) {
      // Obtain the published "products" by category
      products = await productSrv.getPublishedProductsByCategory(
        req.query.category
      );
    } else {
      // Obtain the published "products"
      products = await productSrv.getPublishedProducts();
    }

    // sort the published products by the postDate
    products.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest product from the front of the list (element 0)
    let product = products[0];

    // store the "products" and "product" data in the viewData object (to be passed to the view)
    viewData.products = products;
    viewData.product = product;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await productSrv.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "product" view with all of the data (viewData)
  res.render("product", { data: viewData });
});

//product-id txt
app.get("/product/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare an empty array to hold "product" objects
    let products = [];

    // if there's a "category" query, filter the returned products by the category
    if (req.query.category) {
      // Obtain the published "products" by category
      products = await productSrv.getPublishedProductsByCategory(
        req.query.category
      );
    } else {
      // Obtain the published "products"
      products = await productSrv.getPublishedProducts();
    }

    // sort the published products by postDate
    products.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "products" and "product" data in the viewData object (to be passed to the view)
    viewData.products = products;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the product by "id"
    viewData.product = await productSrv.getProductById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await productSrv.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "product" view with all of the data (viewData)
  res.render("product", { data: viewData });
});

//route to products
app.get("/products", function (req, res) {
  productSrv
    .getPublishedProducts()
    .then(function (data) {
      res.render("product", { product: data });
    })
    .catch(function (err) {
      res.render({ message: err });
    });
});

app.get("/demos", (req, res) => {
  if (req.query.category) {
    productSrv
      .getProductByCategory(req.query.category)
      .then((data) => {
        res.render("demos", { products: data });
      })
      .catch((err) => {
        res.render("demos", { message: "no results" });
      });
  } else {
    productSrv
      .getAllProducts()
      .then((data) => {
        res.render("demos", { products: data });
      })
      .catch(function (err) {
        res.render("demos", { message: "no results" });
      });
  }
});
//route to categories
app.get("/categories", function (req, res) {
  if (req.query.category) {
    productSrv
      .getProductByCategory(req.query.category)
      .then((data) => {
        res.render("categories", { categories: data });
      })
      .catch((err) => {
        res.render("categories", { message: "no results" });
      });
  } else {
    productSrv
      .getCategories()
      .then(function (data) {
        res.render("categories", { categories: data });
      })
      .catch(function (err) {
        res.render("categories", { message: "no results" });
      });
  }
});

//product id return function
app.get("/product/:value", function (req, res) {
  productSrv
    .getProductById(req.params.value)
    .then(function (data) {
      res.render(data);
    })
    .catch(function (err) {
      res.render({ message: err });
    });
});

//if no route found show Page Not Found
app.use(function (req, res) {
  res.status(404).render(path.join(__dirname, "/views/404.hbs"));
});

app.use(express.urlencoded({ extended: true }));

app.listen(HTTP_PORT, onHttpStart);