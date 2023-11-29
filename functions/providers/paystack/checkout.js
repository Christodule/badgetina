
const admin = require("firebase-admin");
const templateLib = require("./template");
const addToWallet = require("../../common").addToWallet;
const UpdateBooking = require("../../common/sharedFunctions").UpdateBooking;
const config = require("../../config.json").paymentMethods.paystack;

const PAYSTACK_PUBLIC_KEY = config.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = config.PAYSTACK_SECRET_KEY;

const paystack = require("paystack")(PAYSTACK_SECRET_KEY);

module.exports.render_checkout = function(request, response) {
  const allowed = ["GHS", "NGN", "ZAR"];

  const order_id = request.body.order_id;
  const email = request.body.email;
  const amount = request.body.amount;
  const currency = allowed.includes(request.body.currency) ? request.body.currency : "NGN";

  response.send(templateLib.getTemplate(
      PAYSTACK_PUBLIC_KEY,
      order_id,
      email,
      amount,
      currency,
  ));
};

module.exports.process_checkout = function(request, response) {
  paystack.transaction.verify(request.query.reference, (error, body) => {
    if (error) {
      response.redirect("/cancel");
      return;
    }
    if (body.status) {
      const data = body.data;
      if (data.status === "success") {
        const order_id = data.metadata.order_id;
        const transaction_id = data.reference;
        const amount = parseFloat(data.amount/100);
        admin.database().ref("bookings").child(order_id).once("value", (snapshot) => {
          if (snapshot.val()) {
            const bookingData = snapshot.val();
            UpdateBooking(bookingData, order_id, transaction_id, "paystack");
            response.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
          } else {
            if (order_id.startsWith("wallet")) {
              addToWallet(order_id.substr(7, order_id.length - 12), amount, order_id, transaction_id);
              response.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
            } else {
              response.redirect("/cancel");
            }
          }
        });
      } else {
        response.redirect("/cancel");
      }
    } else {
      response.redirect("/cancel");
    }
  });
};
