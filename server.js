/*********************************************************************************
 *  WEB322 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: manav Student ID:153341219 Date: 02 October,2022
 *
 *  Online (Cyclic) Link: 
 *
 ********************************************************************************/
 var express = require("express");
 var app = express();
 var path = require("path");
 
 
 var data = require("./product-service");
 
 var HTTP_PORT = process.env.PORT || 8080;
 
 function onHttpStart() {
   console.log("Express http server listening on: " + HTTP_PORT);
   return new Promise(function (res, req) {
     data
       .initialize()
       .then(function (data) {
         console.log(data);
       })
       .catch(function (err) {
         console.log(err);
       });
   });
 }
 app.use(express.static("public"));
 
 
 app.get("/", function (req, res) {
   res.sendFile(path.join(__dirname + "/views/index.html"));
 });
 
 
 app.get("/products", function (req, res) {
   data
     .getPublishedProducts()
     .then(function (data) {
       res.json(data);
     })
     .catch(function (err) {
       res.json({ message: err });
     });
 });
 

 app.get("/demos", function (req, res) {
   data
     .getAllProducts()
     .then(function (data) {
       res.json(data);
     })
     .catch(function (err) {
       res.json({ message: err });
     });
 });
 

 app.get("/categories", function (req, res) {
   data
     .getCategories()
     .then(function (data) {
       res.json(data);
     })
     .catch(function (err) {
       res.json({ message: err });
     });
 });
 

 app.use(function (req, res) {
   res.status(404).sendFile(path.join(__dirname, "/views/error.html"));
 });
 
 app.listen(HTTP_PORT, onHttpStart)