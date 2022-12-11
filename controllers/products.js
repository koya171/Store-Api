const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({price:{$gt : 100 }}).sort('name').select ('name price');
  res.status(200).json({ products, nbHits: products.length });
};
const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields,numericFilters } = req.query;
  const queryObject = {};

  if (featured) {
    queryObject.featured = featured == "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
    if(numericFilters){
     const operatermap ={
        '<':'$lt',
        '>':'$gt',
        '<=':'$lte',
        '>=':'$gte',
        '=':'$eq'
     }
 const regex=/\b(<|<=|>=|=|>)\b/g
  let filters=numericFilters.replace(regex,(match)=>`-${operatermap[match]}-`)
   const options=['price','rating'];
   filters=filters.split(',').forEach((item)=>{
    const [filed,operator,value]= item.split('-');
    if(options.includes(filed)){
       queryObject[filed]={[operator]:Number(value) };
    }
   })
  }
  let result = Product.find(queryObject);
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
    }
    if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  result=  result.skip(skip).limit(limit);
    const products = await result;
  res.status(200).json({ products, nbHits: products.length });
};
module.exports = { getAllProductsStatic, getAllProducts };
