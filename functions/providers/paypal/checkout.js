const request = require("request");
const templateLib = require("./template");
const admin = require("firebase-admin");
const addToWallet = require("../../common").addToWallet;
const UpdateBooking = require("../../common/sharedFunctions").UpdateBooking;
const config = require("../../config.json").paymentMethods.paypal;

const paypal_client_id = config.paypal_client_id;
const paypal_secret = config.paypal_secret;
const paypal_endpoint = config.testing? "https://api-m.sandbox.paypal.com": "https://api-m.paypal.com";

module.exports.render_checkout = function(request, response) {
  const order_id = request.body.order_id;
  const amount = request.body.amount;
  const currency = request.body.currency;
  const refr = request.get("Referrer");
  const server_url = refr ? ((refr.includes("bookings") || refr.includes("userwallet"))? refr.substring(0, refr.length - (refr.includes("bookings")?8:10)) : refr) : request.protocol + "://" + request.get("host") + "/";
  response.send(templateLib.getTemplate(server_url, paypal_client_id, order_id, amount, currency));
};

module.exports.process_checkout = function(req, res) {
  const options = {
    "method": "GET",
    "url": paypal_endpoint + "/v2/checkout/orders/" + req.query.id,
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from(paypal_client_id + ":" + paypal_secret).toString("base64"),
    },
  };
  request(options, (error, response) => {
    if (error) {
      res.redirect("/cancel");
    }
    if (response.body.length > 1) {
      const data = JSON.parse(response.body);
      if (data.status==="COMPLETED") {
        const order_id = req.query.order_id;
        const transaction_id = req.query.id;
        const amount = req.query.amount;
        admin.database().ref("bookings").child(order_id).once("value", (snapshot) => {
          if (snapshot.val()) {
            const bookingData = snapshot.val();
            UpdateBooking(bookingData, order_id, transaction_id, "paypal");
            res.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
          } else {
            if (order_id.startsWith("wallet")) {
              addToWallet(order_id.substr(7, order_id.length - 12), amount, order_id, transaction_id);
              res.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
            } else {
              res.redirect("/cancel");
            }
          }
        });
      } else {
        res.redirect("/cancel");
      }
    } else {
      res.redirect("/cancel");
    }
  });
};
