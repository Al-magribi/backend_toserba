class APIfeatures {
  constructor(query, queryStr) {
    (this.query = query), (this.queryStr = queryStr);
  }
  search() {
    const keyword = this.queryStr.keyword
      ? {
          nama: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  //   algoritma untuk mencari produk berdasarkan kategori
  filter() {
    const queryCopy = { ...this.queryStr };

    // membuang query selain ketegori
    const removeFields = ["keyword", "limit", "page"];
    removeFields.forEach((el) => delete queryCopy[el]);

    // algoritma untuk mencari berdasarkan rentang harga
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  //algoritma produk tampil per halaman
  pagination(productPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = productPerPage * (currentPage - 1);

    this.query = this.query.limit(productPerPage).skip(skip);
    return this;
  }
}
module.exports = APIfeatures;
