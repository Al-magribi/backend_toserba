const APIfeatures = require("../utilities/apiFeatures");
const catchError = require("../middlewares/catchError");
const ErrorHandler = require("../utilities/ErrorHandler");
const Product = require("../models/product");
const cloudinary = require("cloudinary");

// Menambahkan produk baru => Admin
// Creating product
exports.addNewProduct = catchError(async (req, res) => {
  let gambar = [];
  if (typeof req.body.gambar === "string") {
    gambar.push(req.body.gambar);
  } else {
    gambar = req.body.gambar;
  }

  let imagesLink = [];
  for (let i = 0; i < gambar.length; i++) {
    const result = await cloudinary.v2.uploader.upload(gambar[i], {
      folder: "Products",
    });

    imagesLink.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.gambar = imagesLink;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// Mengupdate produk => Admin
// Updating product
exports.updateProduct = catchError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Produk tidak ditemukan", 404));
  }

  let gambar = [];
  if (typeof req.body.gambar === "string") {
    gambar.push(req.body.gambar);
  } else {
    gambar = req.body.gambar;
  }

  if (gambar !== undefined) {
    let imagesLink = [];

    for (let i = 0; i < gambar.length; i++) {
      const result = await cloudinary.v2.uploader.upload(gambar[i], {
        folder: "Products",
      });

      imagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.gambar = imagesLink;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// Menampilkan semua produk => Admin
// Get all products => Admin
exports.getAdminProduct = catchError(async (req, res) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

// Menghapus produk => Admin
// Deleting product
exports.deleteProduct = catchError(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
  }

  await product.remove();
  res.status(200).json({
    success: true,
    message: "Berhasil dihapus",
  });
});

// Menampilkan seluruh produk => Client
// Showing products
exports.getProducts = catchError(async (req, res, next) => {
  // menentukan produk yang tampil ber halaman
  const productPerPage = 10;
  const productsCount = await Product.countDocuments();

  // fitur search menggunakan keyword nama produk, diharapkan seluruh produk yang memiliki huruf yang
  // sama akan muncul
  // url /api/toserba/produk?ketword="nama_produk"
  const apiFeatures = new APIfeatures(Product.find(), req.query)
    .search()
    .filter();

  let products = await apiFeatures.query;
  let filteredProductsCount = products.length;

  apiFeatures.pagination(productPerPage);
  products = await apiFeatures.query.clone();

  res.status(200).json({
    success: true,
    productsCount,
    filteredProductsCount,
    productPerPage,
    products,
  });
});

// Menampilan produk berdasarkan ID => Client
// Showing products based on Id
exports.productById = catchError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.status(200).json({
      success: true,
      product,
    });
  } else {
    return next(new ErrorHandler("Produk tidak ditemukan", 404));
  }
});

// create review
exports.createReview = catchError(async (req, res, next) => {
  //deconstruct review
  const { rating, comment, productId } = req.body;

  //  review Object
  const review = {
    user: req.user._id,
    name: req.user.nama,
    rating: Number(rating),
    comment,
  };

  // cek produk
  const product = await Product.findById(productId);

  // cek sudah direview apa belum
  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        (review.comment = comment), (review.rating = rating);
      }
    });
  } else {
    product.reviews.push(review);
    product.jmlReviews = product.reviews.length;
  }

  product.rating =
    product.reviews.reduce((acc, item) => acc + item.rating, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get all product reviews
exports.getReviews = catchError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Product review
exports.deleteReview = catchError(async (req, res, next) => {
  //Mencari produk yang akan dihapus
  const product = await Product.findById(req.query.productId);

  // Mencari Review yang akan dihapus
  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  // jumlah review setalah hapus review
  const jmlReviews = reviews.length;

  // jumlah rating setelah review dihapus
  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  // update review setalah review dihapus
  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, jmlReviews },
    { new: true, runValidators: false }
  );

  res.status(200).json({
    success: true,
  });
});
