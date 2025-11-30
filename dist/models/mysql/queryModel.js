import con from "../config/database.js";

export default queryModel = (query, callback) => {
  con.query(query, function (err, result) {
    callback(err, result);
  });
};
