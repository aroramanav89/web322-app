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
var Product=sequelize.define('Product',{
    body:Sequelize.TEXT,
    title:Sequelize.STRING,
    postDate:Sequelize.DATE,
    featureImage:Sequelize.STRING,
    published:Sequelize.BOOLEAN
});

var Category=sequelize.define('Category',{
    category:Sequelize.STRING
})



module.exports.getAllProducts =()=> {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(resolve(Product.findAll()))
        .catch(reject('no results returned'))
    })
};

module.exports.getProductsByCategory = (category)=>{
    return new Promise((resolve, reject) => {
       Product.findAll({
        where:{
            category:category
        }
       })
       .then(data=>resolve(data))
       .catch(err=>reject(err))
    })
};

module.exports.getProductsByMinDate = (minDateStr)=> {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Product.findAll({
            where: {
        postDate: {
            [gte]: new Date(minDateStr)
            }
            }
        })
        .then(data=>resolve(data))
        .catch(err=>reject(err))
    })
};
//model realtionship
Product.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = () => {
    return new Promise((resolve,reject) => {
        sequelize.sync()
        .then(resolve('database synced'))
        .catch(reject('unable to sync the database'));
    })
};
module.exports.getProductById = (id)=>{
    return new Promise((resolve, reject) => {
        Product.findAll({
            where:{
                id:id
            }
        })
        .then(data=>resolve(data[0]))///check for error
        .catch(err=>reject(err))
    })
};

module.exports.addProduct = (productData)=>{
    return new Promise((resolve, reject) => {
        productData.published = (productData.published) ? true : false;
        for(var i in productData){
            if(productData[i]==""){productData[i]=null;}
        }
        postDate:new Date();// check for error

        Product.create(productData)
        .then(resolve(Product.findAll()))
        .catch(reject('unable to create product'))
    })
};



module.exports.getPublishedProductsByCategory= (category)=>{
    return new Promise((resolve, reject) => {
        Product.findAll({
            where:{
                published:true,
                category:category
            }
        })
        .then(data=>resolve(data))
        .catch(err=>reject(err))
    })
};

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then(data=>resolve(data))
        .catch(err=>reject(err))
    })
};
module.exports.getPublishedProducts = ()=>{
  return new Promise((resolve, reject) => {
      Product.findAll({
          where:{
              published:true
          }
      })
      .then(data=>resolve(data))
      .catch(err=>reject(err))
  })
};
module.exports.addCategory = (categoryData)=>{
    return new Promise((resolve, reject) => {
        categoryData.published = (categoryData.published) ? true : false;
        for(var i in categoryData){
            if(categoryData[i]==""){categoryData[i]=null;}
        }
        postDate:new Date();// check for error

        Category.create(categoryData)
        .then(resolve(Category.findAll()))
        .catch(reject('unable to create category'))
    })
};

module.exports.deleteCategoryById=(id)=>{
    return new Promise((resolve,reject)=>{
        Category.destroy({
            where:{
                id:id
            }
        })
        .then(resolve())
        .catch(err=>reject(err))
    })
};

module.exports.deleteProductById=(id)=>{
    return new Promise((resolve,reject)=>{
        Product.destroy({
            where:{
                id:id
            }
        })
        .then(resolve())
        .catch(err=>reject(err))
    })
}