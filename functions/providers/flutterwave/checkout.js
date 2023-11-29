const request = require("request");
const templateLib = require("./template");
const admin = require("firebase-admin");
const addToWallet = require("../../common").addToWallet;
const UpdateBooking = require("../../common/sharedFunctions").UpdateBooking;
const config = require("../../config.json").paymentMethods.flutterwave;

const FLUTTERWAVE_PUBLIC_KEY = config.FLUTTERWAVE_PUBLIC_KEY;
const FLUTTERWAVE_SECRET_KEY = config.FLUTTERWAVE_SECRET_KEY;

module.exports.render_checkout = function(request, response) {
  const payData = {
    amount: request.body.amount,
    payment_options: "mobilemoneyghana",
    order_id: request.body.order_id,
    email: request.body.email,
    currency: request.body.currency,
  };

  const refr = request.get("Referrer");
  const server_url = refr ? ((refr.includes("bookings") || refr.includes("userwallet"))? refr.substring(0, refr.length - (refr.includes("bookings")?8:10)) : refr) : request.protocol + "://" + request.get("host") + "/";

  response.send(templateLib.getTemplate(payData, server_url, FLUTTERWAVE_PUBLIC_KEY));
};

module.exports.process_checkout = function(req, res) {
  const options = {
    "method": "GET",
    "url": `https://api.flutterwave.com/v3/transactions/${req.query.transaction_id}/verify`,
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    },
  };
  request(options, (error, response) => {
    const txData = JSON.parse(response.body);
    if (txData.status === "success") {
      const order_id = txData.data.tx_ref;
      const transaction_id = txData.data.id;
      const amount = txData.data.amount;
      admin.database().ref("bookings").child(order_id).once("value", (snapshot) => {
        if (snapshot.val()) {
          const bookingData = snapshot.val();
          UpdateBooking(bookingData, order_id, transaction_id, "flutterwave");
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
  });
};
